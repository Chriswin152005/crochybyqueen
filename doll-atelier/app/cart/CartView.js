"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupees } from "@/components/ProductCard";

export default function CartView({ products, loggedIn }) {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [shippingName, setShippingName] = useState("");
  const [shippingAddr, setShippingAddr] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  function loadCart() {
    try {
      const items = JSON.parse(localStorage.getItem("crochi_cart") || "[]");
      setCart(items);
    } catch {
      setCart([]);
    }
  }

  function updateQuantity(productId, delta) {
    const updated = cart.map((item) => {
      if (item.productId === productId) {
        const qty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: qty };
      }
      return item;
    });
    saveCart(updated);
  }

  function removeItem(productId) {
    const updated = cart.filter((item) => item.productId !== productId);
    saveCart(updated);
  }

  function saveCart(updatedCart) {
    localStorage.setItem("crochi_cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
    window.dispatchEvent(new Event("cart-updated"));
  }

  // Look up full product objects and merge quantity
  const cartItems = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return {
        ...product,
        quantity: item.quantity,
      };
    })
    .filter(Boolean);

  const subtotal = cartItems.reduce((sum, item) => sum + item.priceInPaise * item.quantity, 0);

  async function handleCheckout(e) {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setError("");
    setLoading(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartItems.map((item) => ({ productId: item.id, quantity: item.quantity })),
        shippingName,
        shippingAddr,
        shippingPhone,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to place order.");
      return;
    }

    // Clear cart
    localStorage.removeItem("crochi_cart");
    window.dispatchEvent(new Event("cart-updated"));

    // Redirect to orders
    router.push("/account");
  }

  return (
    <>
      {/* Center column: cart items */}
      <div className={`center-pane ${showCheckout ? "hidden-mobile" : ""}`}>
        <h1 style={{ fontSize: 24, marginBottom: 6 }}>Shopping Cart</h1>
        <p style={{ color: "var(--text-soft)", marginBottom: 28 }}>Review your selected items and adjust quantities before placing order.</p>

        <hr className="stitch-divider" />

        {cartItems.length === 0 ? (
          <div style={{ padding: "40px 0", color: "var(--text-soft)" }}>
            <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>🛒</span>
            <p>Your cart is empty.</p>
            <a href="/" className="btn btn-primary" style={{ marginTop: 14 }}>
              Browse Dolls Collection
            </a>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="card"
                style={{
                  display: "flex",
                  gap: 16,
                  padding: 16,
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "var(--radius-sm)",
                      background: `var(--bg-app) url(${item.photoUrl}) center/cover`,
                    }}
                  />
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600 }}>{item.name}</h3>
                    <div className="mono" style={{ fontSize: 13, color: "var(--text-soft)", marginTop: 4 }}>
                      {formatRupees(item.priceInPaise)} each
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  {/* Quantity selector */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="btn btn-ghost"
                      style={{ padding: "4px 8px", minWidth: 28, height: 28, fontSize: 12 }}
                    >
                      -
                    </button>
                    <span className="mono" style={{ fontSize: 14, fontWeight: 600, width: 24, textAlign: "center" }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="btn btn-ghost"
                      style={{ padding: "4px 8px", minWidth: 28, height: 28, fontSize: 12 }}
                    >
                      +
                    </button>
                  </div>

                  {/* Item Total */}
                  <span className="mono" style={{ fontSize: 14, fontWeight: 700, width: 80, textAlign: "right" }}>
                    {formatRupees(item.priceInPaise * item.quantity)}
                  </span>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="btn btn-ghost"
                    style={{
                      padding: "6px 12px",
                      fontSize: 12,
                      color: "#c92a2a",
                      borderColor: "#fccfcf",
                      background: "rgba(201, 42, 42, 0.02)",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, padding: "0 16px" }}>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 14, color: "var(--text-soft)", marginRight: 16 }}>Subtotal</span>
                <span className="mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--brand-purple)" }}>
                  {formatRupees(subtotal)}
                </span>
              </div>
            </div>

            {/* Mobile Proceed Button */}
            <div className="mobile-only" style={{ marginTop: 24, padding: "0 16px" }}>
              <button
                onClick={() => setShowCheckout(true)}
                className="btn btn-primary btn-block"
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right column: checkout shipping panel */}
      <div className={`details-pane ${!showCheckout ? "hidden-mobile" : "show-mobile-full"}`}>
        {/* Mobile Back Button */}
        {cartItems.length > 0 && (
          <div className="mobile-only" style={{ marginBottom: 20 }}>
            <button
              onClick={() => setShowCheckout(false)}
              className="btn btn-ghost"
              style={{ width: "100%", justifyContent: "flex-start", gap: 8 }}
            >
              ← Back to Cart
            </button>
          </div>
        )}

        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Checkout</h2>

        {cartItems.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--text-soft)", textAlign: "center" }}>
            <span>🛒</span>
            <p style={{ fontSize: 13, marginTop: 8 }}>Add dolls to your cart to fill in shipping details.</p>
          </div>
        ) : !loggedIn ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, textAlign: "center", padding: "0 10px" }}>
            <span style={{ fontSize: 32, marginBottom: 12 }}>🔒</span>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Log in Required</h3>
            <p style={{ fontSize: 13, color: "var(--text-soft)", marginBottom: 20 }}>
              You need to log in or create an account to checkout and track your order.
            </p>
            <a href="/login" className="btn btn-primary btn-block">
              Log in to checkout
            </a>
          </div>
        ) : (
          <form onSubmit={handleCheckout} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <p style={{ color: "var(--text-soft)", fontSize: 13, marginBottom: 20 }}>Please enter the shipping details for order fulfillment.</p>

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

            {error && <p className="error-text" style={{ marginBottom: 14 }}>{error}</p>}

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: "auto" }} disabled={loading}>
              {loading ? "Placing order..." : "Place Order"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
