import { z } from "zod";
import { MAX_QTY_PER_LINE } from "./cart";
import { ORDER_STATUSES } from "./types";

export const createOrderSchema = z.object({
  table: z.string().trim().min(1).max(10),
  lines: z
    .array(z.object({ itemId: z.string().min(1).max(64), qty: z.number().int().min(1).max(MAX_QTY_PER_LINE) }))
    .min(1)
    .max(50),
});

export const updateStatusSchema = z.object({ status: z.enum(ORDER_STATUSES) });
