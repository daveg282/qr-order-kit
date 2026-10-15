import { findMenuItem } from "./menu";
import type { CartLine, MenuItem, OrderLine, Santim } from "./types";

export const MAX_QTY_PER_LINE = 20;

export class PricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PricingError";
  }
}

/** Adds qty of an item, merging with an existing line and capping at MAX_QTY_PER_LINE. Pure: returns a new cart. */
export function addToCart(cart: CartLine[], itemId: string, qty = 1): CartLine[] {
  if (!Number.isInteger(qty) || qty < 1) throw new RangeError("qty must be a positive integer");
  const existing = cart.find((line) => line.itemId === itemId);
  if (!existing) return [...cart, { itemId, qty: Math.min(qty, MAX_QTY_PER_LINE) }];
  return cart.map((line) =>
    line.itemId === itemId ? { ...line, qty: Math.min(line.qty + qty, MAX_QTY_PER_LINE) } : line,
  );
}

/** Sets a line's quantity; 0 or less removes the line. */
export function setQty(cart: CartLine[], itemId: string, qty: number): CartLine[] {
  if (qty <= 0) return cart.filter((line) => line.itemId !== itemId);
  return cart.map((line) =>
    line.itemId === itemId ? { ...line, qty: Math.min(Math.floor(qty), MAX_QTY_PER_LINE) } : line,
  );
}

/**
 * Prices a cart against the current menu on the server side, so a client can never set its own prices.
 * Rejects unknown or unavailable items.
 */
export function priceCart(cart: CartLine[], menu: MenuItem[]): { lines: OrderLine[]; totalSantim: Santim } {
  if (cart.length === 0) throw new PricingError("Cart is empty");
  const lines = cart.map((line) => {
    const item = findMenuItem(menu, line.itemId);
    if (!item) throw new PricingError(`Unknown item: ${line.itemId}`);
    if (!item.available) throw new PricingError(`${item.name} is not available right now`);
    return { itemId: item.id, name: item.name, qty: line.qty, unitPriceSantim: item.priceSantim };
  });
  const totalSantim = lines.reduce((sum, line) => sum + line.qty * line.unitPriceSantim, 0);
  return { lines, totalSantim };
}
