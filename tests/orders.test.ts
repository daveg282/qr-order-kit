import { describe, expect, it } from "vitest";
import { MENU } from "@/lib/menu";
import { InvalidTransitionError, OrderNotFoundError, canTransition, createOrderStore } from "@/lib/orders";
import { createOrderSchema } from "@/lib/schema";

const fixedNow = () => new Date("2026-10-15T12:00:00Z");

describe("order workflow", () => {
  it("follows new → preparing → ready → served", () => {
    const store = createOrderStore(MENU, fixedNow);
    const order = store.create({ table: "4", lines: [{ itemId: "fries", qty: 2 }] });
    expect(order.status).toBe("new");
    expect(order.totalSantim).toBe(30000);

    store.updateStatus(order.id, "preparing");
    store.updateStatus(order.id, "ready");
    expect(store.updateStatus(order.id, "served").status).toBe("served");
  });

  it("blocks skipping steps", () => {
    const store = createOrderStore(MENU, fixedNow);
    const order = store.create({ table: "1", lines: [{ itemId: "fries", qty: 1 }] });
    expect(() => store.updateStatus(order.id, "served")).toThrow(InvalidTransitionError);
  });

  it("does not allow cancelling a served order", () => {
    expect(canTransition("served", "cancelled")).toBe(false);
    expect(canTransition("preparing", "cancelled")).toBe(true);
  });

  it("errors on an unknown order", () => {
    const store = createOrderStore(MENU, fixedNow);
    expect(() => store.updateStatus("missing", "preparing")).toThrow(OrderNotFoundError);
  });

  it("lists orders oldest first", () => {
    let t = 0;
    const store = createOrderStore(MENU, () => new Date(Date.UTC(2026, 9, 15, 12, 0, t++)));
    const first = store.create({ table: "1", lines: [{ itemId: "fries", qty: 1 }] });
    const second = store.create({ table: "2", lines: [{ itemId: "salad", qty: 1 }] });
    expect(store.list().map((o) => o.id)).toEqual([first.id, second.id]);
  });
});

describe("createOrderSchema", () => {
  it("rejects a client-supplied price field by ignoring it", () => {
    const parsed = createOrderSchema.parse({ table: "3", lines: [{ itemId: "fries", qty: 1, price: 1 }] });
    expect(parsed.lines[0]).toEqual({ itemId: "fries", qty: 1 });
  });

  it("rejects bad quantities", () => {
    expect(createOrderSchema.safeParse({ table: "3", lines: [{ itemId: "fries", qty: 0 }] }).success).toBe(false);
  });
});
