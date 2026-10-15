import { describe, expect, it } from "vitest";
import { MAX_QTY_PER_LINE, PricingError, addToCart, priceCart, setQty } from "@/lib/cart";
import { MENU, formatEtb } from "@/lib/menu";

describe("addToCart", () => {
  it("adds a new line", () => {
    expect(addToCart([], "fries")).toEqual([{ itemId: "fries", qty: 1 }]);
  });

  it("merges quantities for the same item", () => {
    expect(addToCart([{ itemId: "fries", qty: 2 }], "fries", 3)).toEqual([{ itemId: "fries", qty: 5 }]);
  });

  it("caps a line at the max quantity", () => {
    expect(addToCart([{ itemId: "fries", qty: 19 }], "fries", 5)[0]?.qty).toBe(MAX_QTY_PER_LINE);
  });

  it("rejects non-positive quantities", () => {
    expect(() => addToCart([], "fries", 0)).toThrow(RangeError);
  });

  it("does not mutate the original cart", () => {
    const cart = [{ itemId: "fries", qty: 1 }];
    addToCart(cart, "fries");
    expect(cart[0]?.qty).toBe(1);
  });
});

describe("setQty", () => {
  it("removes the line at zero", () => {
    expect(setQty([{ itemId: "fries", qty: 1 }], "fries", 0)).toEqual([]);
  });
});

describe("priceCart", () => {
  it("prices from the menu, never from the client", () => {
    const { lines, totalSantim } = priceCart(
      [
        { itemId: "burger-classic", qty: 2 },
        { itemId: "fries", qty: 1 },
      ],
      MENU,
    );
    expect(lines).toHaveLength(2);
    expect(totalSantim).toBe(2 * 45000 + 15000);
  });

  it("rejects unavailable items", () => {
    expect(() => priceCart([{ itemId: "chicken-wings", qty: 1 }], MENU)).toThrow(/not available/);
  });

  it("rejects unknown items", () => {
    expect(() => priceCart([{ itemId: "nope", qty: 1 }], MENU)).toThrow(PricingError);
  });

  it("rejects an empty cart", () => {
    expect(() => priceCart([], MENU)).toThrow(/empty/);
  });
});

describe("formatEtb", () => {
  it("formats santim as ETB", () => {
    expect(formatEtb(105000)).toBe("1,050.00 ETB");
  });
});
