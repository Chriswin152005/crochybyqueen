import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import CartNavLink from "@/components/CartNavLink";

export default function Sidebar({ activePage }) {
  const user = getSessionUser();

  const initials = user ? user.name.split(" ").map(n => n[0]).join("").toUpperCase() : "G";

  return (
    <aside className="sidebar">
      <div>
        {/* Logo/Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <img src="/logo.jpg" alt="Crochi by Queen Logo" style={{ width: 42, height: 42, borderRadius: "50%", border: "2px solid var(--line)" }} />
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--brand-purple)" }}>CROCHI BY QUEEN</span>
        </div>

        {/* Profile Card */}
        <div className="profile-card" style={{ marginBottom: 32 }}>
          <div className="profile-avatar">{initials}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-main)" }}>{user ? user.name : "Guest"}</div>
            <div style={{ fontSize: 12, color: "var(--text-soft)" }}>
              {user ? (user.role === "OWNER" ? "Store Owner" : "Customer") : "Not logged in"}
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="nav-list">
          <Link href="/" className={`nav-item ${activePage === "dolls" ? "active" : ""}`}>
            <span style={{ fontSize: 16 }}>🧸</span>
            <span>Dolls Collection</span>
          </Link>
          <CartNavLink active={activePage === "cart"} />
          <Link href="/learn" className={`nav-item ${activePage === "videos" ? "active" : ""}`}>
            <span style={{ fontSize: 16 }}>🎥</span>
            <span>Workshop Videos</span>
          </Link>

          {user && user.role === "CUSTOMER" && (
            <Link href="/account" className={`nav-item ${activePage === "orders" ? "active" : ""}`}>
              <span style={{ fontSize: 16 }}>📦</span>
              <span>My Orders</span>
            </Link>
          )}

          {user && user.role === "OWNER" && (
            <Link href="/admin" className={`nav-item ${activePage === "admin" ? "active" : ""}`}>
              <span style={{ fontSize: 16 }}>⚙️</span>
              <span>Owner Dashboard</span>
            </Link>
          )}

          {!user && (
            <Link href="/login" className={`nav-item ${activePage === "login" ? "active" : ""}`}>
              <span style={{ fontSize: 16 }}>🔑</span>
              <span>Log in</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Bottom actions */}
      {user && (
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="btn btn-ghost btn-block" style={{ gap: 8 }}>
            <span>🚪</span>
            <span>Log out</span>
          </button>
        </form>
      )}
    </aside>
  );
}
