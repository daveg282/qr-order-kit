"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { addToCart, setQty } from "@/lib/cart";
import { MENU, findMenuItem, formatEtb } from "@/lib/menu";
import type { CartLine } from "@/lib/types";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; total: number } | { kind: "error"; message: string };

export function GuestMenu() {
  // The QR code on each table encodes ?table=<number>.
  const table = useSearchParams().get("table") ?? "1";
  const [cart, setCart] = useState<CartLine[]>([]);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const categories = useMemo(() => [...new Set(MENU.map((item) => item.category))], []);
  const estimate = cart.reduce((sum, line) => sum + line.qty * (findMenuItem(MENU, line.itemId)?.priceSantim ?? 0), 0);
  const count = cart.reduce((sum, line) => sum + line.qty, 0);

  async function placeOrder() {
    setStatus({ kind: "sending" });
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, lines: cart }),
    });
    const data = await res.json();
    if (!res.ok) return setStatus({ kind: "error", message: data.error ?? "Could not place order" });
    setCart([]);
    setStatus({ kind: "sent", total: data.order.totalSantim });
  }

  return (
    <>
      <h1>Menu</h1>
      <p className="muted">Table {table} · order here, no need to wave anyone down.</p>

      {categories.map((category) => (
        <section key={category}>
          <h2>{category}</h2>
          <div className="grid">
            {MENU.filter((item) => item.category === category).map((item) => (
              <div className="card" key={item.id}>
                <div className="row">
                  <strong>{item.name}</strong>
                  {!item.available && <span className="tag off">Sold out</span>}
                </div>
                <div className="row" style={{ marginTop: 10 }}>
                  <span className="muted">{formatEtb(item.priceSantim)}</span>
                  <button disabled={!item.available} onClick={() => setCart((c) => addToCart(c, item.id))}>
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="cart">
        <div className="cart-inner">
          {cart.map((line) => (
            <div className="row" key={line.itemId}>
              <span>{findMenuItem(MENU, line.itemId)?.name}</span>
              <span className="row">
                <button className="ghost" onClick={() => setCart((c) => setQty(c, line.itemId, line.qty - 1))}>−</button>
                {line.qty}
                <button className="ghost" onClick={() => setCart((c) => setQty(c, line.itemId, line.qty + 1))}>+</button>
              </span>
            </div>
          ))}
          <div className="row" style={{ marginTop: 8 }}>
            <span>
              {count} item{count === 1 ? "" : "s"} · <strong>{formatEtb(estimate)}</strong>
            </span>
            <button disabled={count === 0 || status.kind === "sending"} onClick={placeOrder}>
              {status.kind === "sending" ? "Sending…" : "Place order"}
            </button>
          </div>
          {status.kind === "sent" && <p className="success">Order sent to the kitchen · {formatEtb(status.total)}</p>}
          {status.kind === "error" && <p className="error">{status.message}</p>}
        </div>
      </div>
    </>
  );
}
