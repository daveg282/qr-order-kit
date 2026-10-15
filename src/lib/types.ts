/** Money is stored as integer santim (1 ETB = 100 santim) to avoid floating-point errors. */
export type Santim = number;

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  priceSantim: Santim;
  available: boolean;
}

export interface CartLine {
  itemId: string;
  qty: number;
}

export interface OrderLine {
  itemId: string;
  name: string;
  qty: number;
  unitPriceSantim: Santim;
}

export const ORDER_STATUSES = ["new", "preparing", "ready", "served", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Order {
  id: string;
  table: string;
  lines: OrderLine[];
  totalSantim: Santim;
  status: OrderStatus;
  createdAt: string;
}
