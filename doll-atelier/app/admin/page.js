import Link from "next/link";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddProductForm from "./AddProductForm";
import AddVideoForm from "./AddVideoForm";
import OrdersTable from "./OrdersTable";
import { formatRupees } from "@/components/ProductCard";
import ShopLayout from "@/components/ShopLayout";
import DeleteButton from "@/components/DeleteButton";

export default async function AdminPage({ searchParams }) {
  const user = getSessionUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "OWNER") redirect("/admin/login");

  const activeTab = searchParams.tab || "dolls";

  const [products, videos, orders] = await Promise.all([
    db.product.findMany({ orderBy: { createdAt: "desc" } }),
    db.video.findMany({ orderBy: { createdAt: "desc" } }),
    db.order.findMany({
      include: { items: { include: { product: true } }, customer: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const hasSelection = searchParams.action === "add";

  return (
    <ShopLayout activePage="admin" threeColumns={true} hasSelection={hasSelection}>
      {/* Center column: lists */}
      <div className="center-pane">
        <h1 style={{ fontSize: 24, marginBottom: 6 }}>Owner Dashboard</h1>
        <p style={{ color: "var(--text-soft)", marginBottom: 24 }}>Manage your hand-stitched inventory, tutorials, and customer orders.</p>

        {/* Tab switcher */}
        <div className="categories-grid" style={{ marginBottom: 28 }}>
          <Link href="/admin?tab=dolls" className={`category-pill ${activeTab === "dolls" ? "active" : ""}`} scroll={false}>
            🧸 Doll Listings ({products.length})
          </Link>
          <Link href="/admin?tab=videos" className={`category-pill ${activeTab === "videos" ? "active" : ""}`} scroll={false}>
            🎥 Workshop Videos ({videos.length})
          </Link>
          <Link href="/admin?tab=orders" className={`category-pill ${activeTab === "orders" ? "active" : ""}`} scroll={false}>
            📦 Orders ({orders.length})
          </Link>
        </div>

        <hr className="stitch-divider" />

        {/* Dynamic Lists */}
        {activeTab === "dolls" && (
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontSize: 18, margin: 0 }}>Doll Listings</h2>
              <Link href="/admin?tab=dolls&action=add" className="btn btn-primary mobile-only-inline-flex" style={{ padding: "8px 16px", fontSize: 13 }}>
                + Add Doll
              </Link>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {products.length === 0 ? (
                <p style={{ color: "var(--text-soft)" }}>No dolls listed yet. Use the form on the right to list one.</p>
              ) : (
                products.map((p) => (
                  <div key={p.id} className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 48, height: 48, borderRadius: "var(--radius-sm)", background: `var(--bg-app) url(${p.photoUrl}) center/cover` }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div className="mono" style={{ fontSize: 13, color: "var(--text-soft)" }}>{formatRupees(p.priceInPaise)} · stock {p.stock}</div>
                      </div>
                    </div>
                    <DeleteButton endpoint="/api/products" id={p.id} label="Doll" />
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === "videos" && (
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontSize: 18, margin: 0 }}>Workshop Videos</h2>
              <Link href="/admin?tab=videos&action=add" className="btn btn-primary mobile-only-inline-flex" style={{ padding: "8px 16px", fontSize: 13 }}>
                + Add Video
              </Link>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {videos.length === 0 ? (
                <p style={{ color: "var(--text-soft)" }}>No videos uploaded yet. Use the form on the right to add one.</p>
              ) : (
                videos.map((v) => (
                  <div key={v.id} className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 64, height: 40, borderRadius: "var(--radius-sm)", background: `var(--bg-app) url(${v.thumbnailUrl}) center/cover` }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{v.title}</div>
                        <div className="mono" style={{ fontSize: 13, color: "var(--text-soft)" }}>{formatRupees(v.priceInPaise)}</div>
                      </div>
                    </div>
                    <DeleteButton endpoint="/api/videos" id={v.id} label="Video" />
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === "orders" && (
          <section>
            {/* Mobile-only stats overview */}
            <div className="mobile-only" style={{ marginBottom: 20 }}>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ gridColumn: "span 2" }}>
                  <div style={{ fontSize: 12, color: "var(--text-soft)", marginBottom: 4 }}>Total Revenue</div>
                  <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--brand-purple)" }}>
                    {formatRupees(orders.reduce((sum, o) => sum + o.totalInPaise, 0))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-soft)" }}>Total Orders</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{orders.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-soft)" }}>Pending</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{orders.filter(o => o.status !== "DELIVERED").length}</div>
                </div>
              </div>
            </div>

            <h2 style={{ fontSize: 18, marginBottom: 18 }}>Customer Orders</h2>
            <OrdersTable orders={orders} />
          </section>
        )}
      </div>

      {/* Right column: active tab creation form or summary */}
      <div className="details-pane">
        {activeTab === "dolls" && (
          <div>
            {/* Mobile Back Button */}
            <div className="mobile-only" style={{ marginBottom: 20 }}>
              <Link href="/admin?tab=dolls" className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start", gap: 8 }}>
                ← Back to Listings
              </Link>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Add New Doll</h2>
            <p style={{ color: "var(--text-soft)", fontSize: 13, marginBottom: 24 }}>List a new doll listing to the collection shop.</p>
            <AddProductForm />
          </div>
        )}

        {activeTab === "videos" && (
          <div>
            {/* Mobile Back Button */}
            <div className="mobile-only" style={{ marginBottom: 20 }}>
              <Link href="/admin?tab=videos" className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start", gap: 8 }}>
                ← Back to Listings
              </Link>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Add Workshop Video</h2>
            <p style={{ color: "var(--text-soft)", fontSize: 13, marginBottom: 24 }}>Upload a new video for gated workshop learning.</p>
            <AddVideoForm />
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Orders Overview</h2>
            <div style={{ background: "var(--bg-app)", borderRadius: "var(--radius-md)", padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: "var(--text-soft)", marginBottom: 8 }}>Total Revenue</div>
              <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: "var(--brand-purple)" }}>
                {formatRupees(orders.reduce((sum, o) => sum + o.totalInPaise, 0))}
              </div>
            </div>
            
            <div style={{ display: "grid", gap: 10, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-soft)" }}>Total Orders placed</span>
                <strong>{orders.length}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-soft)" }}>Delivered orders</span>
                <strong>{orders.filter(o => o.status === "DELIVERED").length}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-soft)" }}>Pending fulfillment</span>
                <strong>{orders.filter(o => o.status !== "DELIVERED").length}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
