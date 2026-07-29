import { redirect } from "next/navigation";

export default function VideoDetailPage({ params }) {
  redirect(`/learn?video=${params.id}`);
}
