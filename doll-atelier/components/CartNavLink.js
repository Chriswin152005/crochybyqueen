"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CartNavLink({ active }) {
  const [count, setCount] = useState(0);

  function updateCount() {
    try {
      const cart = JSON.parse(localStorage.getItem("crochi_cart") || "[]");
      const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCount(totalQty);
    } catch {
      setCount(0);
    }
  }

  useEffect(() => {
    updateCount();
    window.addEventListener("cart-updated", updateCount);
    // Also listen to storage events to sync across tabs
    window.addEventListener("storage", updateCount);
    
    return () => {
      window.removeEventListener("cart-updated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  return (
    <Link href="/cart" className={`nav-item ${active ? "active" : ""}`}>
      <span style={{ fontSize: 16 }}>🛒</span>
      <span>Cart</span>
      {count > 0 && (
        <span style={{
          background: "var(--brand-purple)",
          color: "#ffffff",
          fontSize: 10,
          fontWeight: 700,
          padding: "2px 7px",
          borderRadius: "10px",
          marginLeft: "auto",
          display: "inline-block",
          lineHeight: "1.2"
        }}>
          {count}
        </span>
      )}
    </Link>
  );
}
