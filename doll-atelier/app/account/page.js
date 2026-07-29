import Link from "next/link";
import ShopLayout from "@/components/ShopLayout";
import SeamTracker from "@/components/SeamTracker";
import { formatRupees } from "@/components/ProductCard";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AccountPage({ searchParams }) {
  const user = getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "OWNER") redirect("/admin");

  const orders = await db.order.findMany({
    where: { customerId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  const selectedId = searchParams.order;
  const selectedOrder = orders.find(o => o.id === selectedId) || orders[0];

  return (
    <ShopLayout activePage="orders" threeColumns={true}>
      {/* Center column: orders list */}
      <div className="center-pane">
        <h1 style={{ fontSize: 24, marginBottom: 6 }}>Your Orders</h1>
        <p style={{ color: "var(--text-soft)", marginBottom: 28 }}>Hi {user.name}, view and track your workbench orders here.</p>

        <hr className="stitch-divider" />

        {orders.length === 0 ? (
          <p style={{ color: "var(--text-soft)" }}>
            No orders placed yet. <Link href="/" style={{ color: "var(--brand-purple)", fontWeight: 600 }}>Explore dolls collection</Link>
          </p>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {orders.map((order) => {
              const isSelected = selectedOrder && order.id === selectedOrder.id;
              return (
                <Link
                  key={order.id}
                  href={`/account?order=${order.id}`}
                  className={`card ${isSelected ? "selected" : ""}`}
                  style={{ display: "block", padding: 20 }}
                  scroll={false}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                    <div>
                      <div className="label">Order ID</div>
                      <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{order.id}</div>
                    </div>
                    <span className="mono" style={{ fontSize: 14, color: "var(--brand-purple)", fontWeight: 600 }}>
                      {formatRupees(order.totalInPaise)}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: 13, color: "var(--text-soft)" }}>
                    {order.items.length} doll{order.items.length > 1 ? "s" : ""} · status: <strong style={{ textTransform: "lowercase", color: "var(--text-main)" }}>{order.status}</strong>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Right column: active order tracking detail */}
      <div className="details-pane">
        {selectedOrder ? (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Order Details</h2>
            <div className="mono" style={{ fontSize: 13, color: "var(--text-soft)", marginBottom: 24 }}>#{selectedOrder.id}</div>
            
            {/* Tracking progress */}
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Tracking Status</h3>
            <SeamTracker status={selectedOrder.status} />

            <hr className="stitch-divider" style={{ margin: "24px 0" }} />

            {/* Order items */}
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Items ordered</h3>
            <div style={{ background: "var(--bg-app)", borderRadius: "var(--radius-md)", padding: 16, marginBottom: 24 }}>
              {selectedOrder.items.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10 }}>
                  <span style={{ color: "var(--text-soft)" }}>{item.product.name} × {item.quantity}</span>
                  <span className="mono">{formatRupees(item.priceInPaise * item.quantity)}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px dashed var(--line)", marginTop: 12, paddingTop: 12, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 14 }}>
                <span>Total</span>
                <span className="mono" style={{ color: "var(--brand-purple)" }}>{formatRupees(selectedOrder.totalInPaise)}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Shipping Address</h3>
            <div style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.6 }}>
              <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{selectedOrder.shippingName}</div>
              <div>{selectedOrder.shippingAddr}</div>
              <div style={{ marginTop: 4 }}>📞 {selectedOrder.shippingPhone}</div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--text-soft)", textAlign: "center" }}>
            <span style={{ fontSize: 48, marginBottom: 16 }}>📦</span>
            <p>Select an order from the list to view live tracking details and status logs.</p>
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
