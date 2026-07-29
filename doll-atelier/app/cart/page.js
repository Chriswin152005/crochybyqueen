import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import ShopLayout from "@/components/ShopLayout";
import CartView from "./CartView";

export default async function CartPage() {
  const user = getSessionUser();
  const products = await db.product.findMany();

  return (
    <ShopLayout activePage="cart" threeColumns={true}>
      <CartView products={products} loggedIn={!!user} />
    </ShopLayout>
  );
}
