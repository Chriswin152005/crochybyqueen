import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export default function Header() {
  const user = getSessionUser();

  return (
    <header className="site-header">
      <div className="container">
        <nav>
          <Link href="/" className="logo">
            Hand &amp; Thread
          </Link>
          <div className="nav-links">
            <Link href="/">Dolls</Link>
            <Link href="/learn">Workshop videos</Link>
            {!user && <Link href="/login">Log in</Link>}
            {user && user.role === "CUSTOMER" && <Link href="/account">My orders</Link>}
            {user && user.role === "OWNER" && <Link href="/admin">Owner dashboard</Link>}
            {user && (
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="btn btn-ghost" style={{ padding: "8px 14px" }}>
                  Log out
                </button>
              </form>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
