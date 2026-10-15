import { NextResponse } from "next/server";
import { PricingError } from "@/lib/cart";
import { createOrderSchema } from "@/lib/schema";
import { orderStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ orders: orderStore.list() });
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const order = orderStore.create(parsed.data);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof PricingError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    throw error;
  }
}
