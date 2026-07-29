"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UnlockButton({ videoId, owned, loggedIn }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (owned) {
    return (
      <Link href={`/learn?video=${videoId}`} className="btn btn-primary" style={{ padding: "9px 16px", fontSize: 14 }}>
        Watch
      </Link>
    );
  }

  if (!loggedIn) {
    return (
      <a href="/login" className="btn btn-ghost" style={{ padding: "9px 16px", fontSize: 14 }}>
        Log in to unlock
      </a>
    );
  }

  async function handleUnlock() {
    setLoading(true);
    await fetch(`/api/videos/${videoId}/purchase`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={handleUnlock} className="btn btn-thread" style={{ padding: "9px 16px", fontSize: 14 }} disabled={loading}>
      {loading ? "Unlocking…" : "Unlock"}
    </button>
  );
}
