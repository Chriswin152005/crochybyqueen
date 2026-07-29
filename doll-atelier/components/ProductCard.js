import Link from "next/link";

export function formatRupees(paise) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export default function ProductCard({ product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="card"
      style={{ display: "block", overflow: "hidden", textDecoration: "none" }}
    >
      <div
        style={{
          aspectRatio: "1 / 1",
          background: `var(--paper-deep) url(${product.photoUrl}) center/cover`,
        }}
      />
      <div style={{ padding: "16px 18px 18px" }}>
        <div className="label" style={{ marginBottom: 6 }}>
          {product.stock > 0 ? "In the workshop" : "Made to order"}
        </div>
        <h3 style={{ fontSize: 19 }}>{product.name}</h3>
        <div className="mono" style={{ marginTop: 8, fontSize: 15 }}>
          {formatRupees(product.priceInPaise)}
        </div>
      </div>
    </Link>
  );
}
