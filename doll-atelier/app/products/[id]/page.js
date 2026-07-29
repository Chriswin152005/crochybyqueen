import { redirect } from "next/navigation";

export default function ProductPage({ params }) {
  redirect(`/?product=${params.id}`);
}
