"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupees } from "@/components/ProductCard";
import DeleteButton from "@/components/DeleteButton";

const STATUSES = ["PLACED", "CONFIRMED", "DISPATCHED", "OUT_FOR_DELIVERY", "DELIVERED"];

function StatusLabel(s) {
  return s
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export default function OrdersTable({ orders }) {
  if (orders.length === 0) {
    return <p style={{ color: "var(--ink-soft)" }}>No orders yet.</p>;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {orders.map((order) => (
        <OrderRow key={order.id} order={order} />
      ))}
    </div>
  );
}

function OrderRow({ order }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);

  async function handleChange(e) {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setSaving(true);
    await fetch(`/api/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
      <div>
        <div className="mono" style={{ fontSize: 13, color: "var(--ink-soft)" }}>{order.id}</div>
        <div style={{ fontWeight: 600 }}>{order.customer.name} · {order.customer.email}</div>
        <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>
          {order.items.map((it) => `${it.product.name} ×${it.quantity}`).join(", ")}
        </div>
        
        {/* Shipping Details */}
        <div style={{ 
          fontSize: 13, 
          marginTop: 10, 
          padding: "8px 12px", 
          background: "var(--bg-app)", 
          borderRadius: "var(--radius-sm)", 
          borderLeft: "3px solid var(--brand-purple)" 
        }}>
          <div style={{ marginBottom: 2 }}><strong>Recipient:</strong> {order.shippingName}</div>
          <div style={{ marginBottom: 2 }}><strong>Address:</strong> {order.shippingAddr}</div>
          <div><strong>Phone:</strong> {order.shippingPhone}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span className="mono">{formatRupees(order.totalInPaise)}</span>
        <select value={status} onChange={handleChange} disabled={saving} style={{ padding: "8px 10px", borderRadius: 4, border: "1px solid var(--line)", marginRight: 8 }}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{StatusLabel(s)}</option>
          ))}
        </select>
        <DeleteButton endpoint="/api/orders" id={order.id} label="Order" />
      </div>
    </div>
  );
}
