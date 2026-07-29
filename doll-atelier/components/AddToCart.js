"use client";

import { useState } from "react";
import Link from "next/link";

export default function AddToCart({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    try {
      const cart = JSON.parse(localStorage.getItem("crochi_cart") || "[]");
      const existing = cart.find((item) => item.productId === product.id);

      const qty = Math.max(1, Number(quantity) || 1);
      if (existing) {
        existing.quantity += qty;
      } else {
        cart.push({ productId: product.id, quantity: qty });
      }

      localStorage.setItem("crochi_cart", JSON.stringify(cart));
      
      // Dispatch a custom event to notify CartNavLink of the update
      window.dispatchEvent(new Event("cart-updated"));

      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <div className="field">
        <label>Quantity</label>
        <input
          type="number"
          min={1}
          max={product.stock || 5}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          style={{ width: "100%", maxWidth: 100 }}
        />
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 18 }}>
        <button onClick={handleAddToCart} className="btn btn-primary" style={{ padding: "10px 20px" }}>
          🧸 Add to Cart
        </button>
        {added && (
          <span style={{ fontSize: 13, color: "var(--brand-purple)", fontWeight: 600 }}>
            Added to cart!
          </span>
        )}
      </div>
    </div>
  );
}
