import { NextResponse } from "next/server";
import { InvalidTransitionError, OrderNotFoundError } from "@/lib/orders";
import { updateStatusSchema } from "@/lib/schema";
import { orderStore } from "@/lib/store";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);
  const parsed = updateStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const order = orderStore.updateStatus(id, parsed.data.status);
    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof OrderNotFoundError) return NextResponse.json({ error: error.message }, { status: 404 });
    if (error instanceof InvalidTransitionError) return NextResponse.json({ error: error.message }, { status: 409 });
    throw error;
  }
}
