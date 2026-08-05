"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MobileCartLink() {
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
    window.addEventListener("storage", updateCount);
    
    return () => {
      window.removeEventListener("cart-updated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  return (
    <Link href="/cart" className="mobile-cart-btn" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40 }}>
      <span style={{ fontSize: 20 }}>🛒</span>
      {count > 0 && (
        <span style={{
          position: "absolute",
          top: 2,
          right: 2,
          background: "var(--brand-purple)",
          color: "#ffffff",
          fontSize: 9,
          fontWeight: 700,
          padding: "1px 5px",
          borderRadius: "50%",
          minWidth: 16,
          height: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: "1"
        }}>
          {count}
        </span>
      )}
    </Link>
  );
}
