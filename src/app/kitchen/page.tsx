"use client";

import { useCallback, useEffect, useState } from "react";
import { formatEtb } from "@/lib/menu";
import type { Order, OrderStatus } from "@/lib/types";

const COLUMNS: { status: OrderStatus; label: string; next?: OrderStatus; action?: string }[] = [
  { status: "new", label: "New", next: "preparing", action: "Start" },
  { status: "preparing", label: "Preparing", next: "ready", action: "Ready" },
  { status: "ready", label: "Ready", next: "served", action: "Served" },
];

const POLL_MS = 3000;

export default function KitchenBoard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      setOrders((await res.json()).orders);
      setError(null);
    } catch {
      setError("Lost connection — retrying…");
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  async function move(id: string, status: OrderStatus) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) setError((await res.json()).error);
    await load();
  }

  return (
    <main>
      <h1>Kitchen board</h1>
      <p className="muted">Updates every {POLL_MS / 1000}s.</p>
      {error && <p className="error">{error}</p>}
      <div className="board">
        {COLUMNS.map((col) => (
          <section className="card" key={col.status}>
            <h2>
              {col.label} ({orders.filter((o) => o.status === col.status).length})
            </h2>
            {orders
              .filter((o) => o.status === col.status)
              .map((order) => (
                <div className="card" key={order.id} style={{ marginBottom: 8 }}>
                  <div className="row">
                    <strong>Table {order.table}</strong>
                    <span className="muted">{new Date(order.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <ul>
                    {order.lines.map((line) => (
                      <li key={line.itemId}>
                        {line.qty} × {line.name}
                      </li>
                    ))}
                  </ul>
                  <div className="row">
                    <span className="muted">{formatEtb(order.totalSantim)}</span>
                    {col.next && <button onClick={() => move(order.id, col.next!)}>{col.action}</button>}
                  </div>
                </div>
              ))}
          </section>
        ))}
      </div>
    </main>
  );
}
