import Link from "next/link";
import ShopLayout from "@/components/ShopLayout";
import AddToCart from "@/components/AddToCart";
import { formatRupees } from "@/components/ProductCard";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export default async function HomePage({ searchParams }) {
  const products = await db.product.findMany({ orderBy: { createdAt: "desc" } });
  
  const searchQuery = searchParams.q || "";
  const activeCategory = searchParams.category || "All";
  
  let filteredProducts = products;
  if (searchQuery) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  if (activeCategory !== "All") {
    filteredProducts = filteredProducts.filter(p => {
      const desc = p.description.toLowerCase();
      const name = p.name.toLowerCase();
      if (activeCategory === "Plush Dolls") return desc.includes("plush") || name.includes("plush");
      if (activeCategory === "Miniature") return desc.includes("mini") || name.includes("mini") || desc.includes("small") || name.includes("small");
      if (activeCategory === "Knit Dolls") return desc.includes("knit") || name.includes("knit") || desc.includes("thread") || name.includes("thread") || desc.includes("crochet") || name.includes("crochet");
      if (activeCategory === "Sewing Kits") return desc.includes("kit") || name.includes("kit") || desc.includes("set") || name.includes("set");
      return true;
    });
  }

  const selectedId = searchParams.product;
  const selectedProduct = products.find(p => p.id === selectedId) || filteredProducts[0];
  
  const user = getSessionUser();
  const categories = ["All", "Plush Dolls", "Miniature", "Knit Dolls", "Sewing Kits"];

  return (
    <ShopLayout activePage="dolls" threeColumns={true}>
      {/* Center column: product list */}
      <div className="center-pane">
        {/* Search */}
        <form action="/" method="GET" className="search-container">
          <span style={{ color: "var(--text-soft)" }}>🔍</span>
          <input name="q" defaultValue={searchQuery} placeholder="Search dolls..." className="search-input" />
          {activeCategory !== "All" && <input type="hidden" name="category" value={activeCategory} />}
        </form>

        {/* Categories */}
        <div className="categories-container">
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Categories</h2>
          <div className="categories-grid">
            {categories.map((cat) => {
              let url = `/?category=${encodeURIComponent(cat)}`;
              if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;
              const isActive = activeCategory === cat;
              return (
                <Link key={cat} href={url} className={`category-pill ${isActive ? "active" : ""}`} scroll={false}>
                  {cat}
                </Link>
              );
            })}
          </div>
        </div>

        <hr className="stitch-divider" />

        {/* Product grid */}
        <section style={{ paddingBottom: 40 }}>
          <h2 style={{ fontSize: 18, marginBottom: 20 }}>Current Collection</h2>

          {filteredProducts.length === 0 ? (
            <p style={{ color: "var(--text-soft)" }}>
              No dolls found matching the criteria.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 20,
              }}
            >
              {filteredProducts.map((p) => {
                const isSelected = selectedProduct && p.id === selectedProduct.id;
                
                // Build link URL retaining filters
                let linkUrl = `/?product=${p.id}`;
                if (activeCategory !== "All") linkUrl += `&category=${encodeURIComponent(activeCategory)}`;
                if (searchQuery) linkUrl += `&q=${encodeURIComponent(searchQuery)}`;

                return (
                  <Link
                    key={p.id}
                    href={linkUrl}
                    className={`card ${isSelected ? "selected" : ""}`}
                    style={{ display: "block", overflow: "hidden" }}
                    scroll={false}
                  >
                    <div
                      style={{
                        aspectRatio: "1 / 1",
                        background: `var(--bg-app) url(${p.photoUrl}) center/cover`,
                      }}
                    />
                    <div style={{ padding: "14px" }}>
                      <div className="label" style={{ marginBottom: 4 }}>
                        {p.stock > 0 ? `${p.stock} available` : "Made to order"}
                      </div>
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)" }}>{p.name}</h3>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 8 }}>
                        <span className="mono" style={{ fontSize: 13, color: "var(--brand-purple)", fontWeight: 600 }}>
                          {formatRupees(p.priceInPaise)}
                        </span>
                        <div className="rating-stars">
                          <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Right column: details panel */}
      <div className="details-pane">
        {selectedProduct ? (
          <div>
            <div
              style={{
                width: "100%",
                aspectRatio: "1.2 / 1",
                borderRadius: "var(--radius-md)",
                background: `var(--bg-app) url(${selectedProduct.photoUrl}) center/cover`,
                marginBottom: 24,
                boxShadow: "var(--shadow-subtle)",
              }}
            />
            
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{selectedProduct.name}</h1>
            
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div className="rating-stars" style={{ fontSize: 14 }}>
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <span style={{ fontSize: 12, color: "var(--text-soft)" }}>(3,091 reviews)</span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
              <span className="category-pill active" style={{ padding: "4px 10px", fontSize: 11, borderRadius: 12 }}>Doll</span>
              <span className="category-pill" style={{ padding: "4px 10px", fontSize: 11, borderRadius: 12 }}>Crochet</span>
              <span className="category-pill" style={{ padding: "4px 10px", fontSize: 11, borderRadius: 12 }}>Premium</span>
            </div>

            <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--brand-purple)", marginBottom: 20 }}>
              {formatRupees(selectedProduct.priceInPaise)}
            </div>

            <p style={{ color: "var(--text-soft)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              {selectedProduct.description}
            </p>

            <hr className="stitch-divider" style={{ margin: "24px 0" }} />

            <h3 style={{ fontSize: 16, marginBottom: 14 }}>Purchase options</h3>
            <AddToCart product={selectedProduct} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--text-soft)", textAlign: "center" }}>
            <span style={{ fontSize: 48, marginBottom: 16 }}>🧸</span>
            <p>Select a doll from the collection to view details and place an order.</p>
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
