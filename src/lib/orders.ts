import { randomUUID } from "node:crypto";
import { priceCart } from "./cart";
import type { CartLine, MenuItem, Order, OrderStatus } from "./types";

/** Allowed kitchen workflow. Anything else is rejected. */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  new: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["served"],
  served: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export class OrderNotFoundError extends Error {}
export class InvalidTransitionError extends Error {}

export interface OrderStore {
  create(input: { table: string; lines: CartLine[] }): Order;
  list(): Order[];
  updateStatus(id: string, status: OrderStatus): Order;
}

/** In-memory store behind an interface, so it can be swapped for MySQL/Postgres without touching routes. */
export function createOrderStore(menu: MenuItem[], now: () => Date = () => new Date()): OrderStore {
  const orders = new Map<string, Order>();

  return {
    create({ table, lines }) {
      const priced = priceCart(lines, menu);
      const order: Order = {
        id: randomUUID(),
        table,
        lines: priced.lines,
        totalSantim: priced.totalSantim,
        status: "new",
        createdAt: now().toISOString(),
      };
      orders.set(order.id, order);
      return order;
    },

    list() {
      return [...orders.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },

    updateStatus(id, status) {
      const order = orders.get(id);
      if (!order) throw new OrderNotFoundError(`Order ${id} not found`);
      if (!canTransition(order.status, status)) {
        throw new InvalidTransitionError(`Cannot move order from ${order.status} to ${status}`);
      }
      const updated = { ...order, status };
      orders.set(id, updated);
      return updated;
    },
  };
}
