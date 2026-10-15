import type { MenuItem } from "./types";

/** Demo menu. In production this comes from the database and staff toggle availability live. */
export const MENU: MenuItem[] = [
  { id: "burger-classic", name: "Classic Burger", category: "Burgers", priceSantim: 45000, available: true },
  { id: "burger-chicken", name: "Crispy Chicken Burger", category: "Burgers", priceSantim: 42000, available: true },
  { id: "chicken-3pc", name: "Fried Chicken (3 pc)", category: "Chicken", priceSantim: 52000, available: true },
  { id: "chicken-wings", name: "Spicy Wings (6 pc)", category: "Chicken", priceSantim: 48000, available: false },
  { id: "fries", name: "Fries", category: "Sides", priceSantim: 15000, available: true },
  { id: "salad", name: "House Salad", category: "Sides", priceSantim: 18000, available: true },
  { id: "juice-mango", name: "Fresh Mango Juice", category: "Drinks", priceSantim: 12000, available: true },
  { id: "macchiato", name: "Macchiato", category: "Drinks", priceSantim: 6000, available: true },
];

export function findMenuItem(menu: MenuItem[], id: string): MenuItem | undefined {
  return menu.find((item) => item.id === id);
}

export function formatEtb(santim: number): string {
  return `${(santim / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;
}
