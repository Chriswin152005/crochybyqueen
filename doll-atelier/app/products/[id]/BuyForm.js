"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BuyForm({ product, loggedIn }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [shippingName, setShippingName] = useState("");
  const [shippingAddr, setShippingAddr] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!loggedIn) {
    return (
      <div>
        <p style={{ marginBottom: 14, color: "var(--ink-soft)" }}>
          Log in to order this doll — you'll get a tracking page for it too.
        </p>
        <a href="/login" className="btn btn-primary">Log in to buy</a>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // PAYMENT INTEGRATION NOTE: this is where you'd open the Razorpay
    // checkout modal (Razorpay's client SDK) and only call /api/orders
    // after it reports a successful payment. Right now it goes straight
    // through so you can test the rest of the flow (tracking, admin, etc).
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        quantity,
        shippingName,
        shippingAddr,
        shippingPhone,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    router.push("/account");
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>Quantity</label>
        <input
          type="number"
          min={1}
          max={product.stock || 5}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>
      <div className="field">
        <label>Full name</label>
        <input value={shippingName} onChange={(e) => setShippingName(e.target.value)} required />
      </div>
      <div className="field">
        <label>Delivery address</label>
        <textarea rows={3} value={shippingAddr} onChange={(e) => setShippingAddr(e.target.value)} required />
      </div>
      <div className="field">
        <label>Phone number</label>
        <input value={shippingPhone} onChange={(e) => setShippingPhone(e.target.value)} required />
      </div>

      {error && <p className="error-text">{error}</p>}

      <button type="submit" className="btn btn-thread btn-block" disabled={loading}>
        {loading ? "Placing order…" : "Place order"}
      </button>
    </form>
  );
}
