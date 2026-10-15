import { MENU } from "./menu";
import { createOrderStore, type OrderStore } from "./orders";

// Keep one store across hot reloads in development.
const globalForStore = globalThis as unknown as { orderStore?: OrderStore };

export const orderStore: OrderStore = globalForStore.orderStore ?? createOrderStore(MENU);
globalForStore.orderStore = orderStore;
