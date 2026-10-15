import { NextResponse } from "next/server";
import { MENU } from "@/lib/menu";

export function GET() {
  return NextResponse.json({ items: MENU });
}
