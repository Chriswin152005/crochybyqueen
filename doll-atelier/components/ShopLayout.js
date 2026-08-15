import Link from "next/link";
import Sidebar from "./Sidebar";
import MobileCartLink from "./MobileCartLink";
import { getSessionUser } from "@/lib/auth";

export default function ShopLayout({ children, activePage, threeColumns = true, hasSelection = false }) {
  const user = getSessionUser();
  const isOwner = user && user.role === "OWNER";
  const layoutClass = threeColumns ? "shop-layout" : "shop-layout-two-columns";
  return (
    <div className={`${layoutClass} ${hasSelection ? "has-selection" : ""}`}>
      {/* Mobile Menu Toggle Checkbox */}
      <input type="checkbox" id="menu-toggle" className="menu-toggle-checkbox" style={{ display: "none" }} />
      
      {/* Mobile Top Header */}
      <header className="mobile-top-header">
        <label htmlFor="menu-toggle" className="menu-burger-btn">
          ☰
        </label>
        <Link href="/" className="mobile-brand">
          <img src="/logo.jpg" alt="Crochi by Queen Logo" className="mobile-logo" />
          <span>CROCHI BY QUEEN</span>
        </Link>
        {!isOwner && <MobileCartLink />}
      </header>

      {/* Mobile Menu Backdrop */}
      <label htmlFor="menu-toggle" className="menu-backdrop"></label>

      <Sidebar activePage={activePage} />
      {children}
    </div>
  );
}
