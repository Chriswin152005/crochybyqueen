import Sidebar from "./Sidebar";

export default function ShopLayout({ children, activePage, threeColumns = true }) {
  const layoutClass = threeColumns ? "shop-layout" : "shop-layout-two-columns";
  return (
    <div className={layoutClass}>
      <Sidebar activePage={activePage} />
      {children}
    </div>
  );
}
