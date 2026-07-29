"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ endpoint, id, label = "Delete" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete(e) {
    e.stopPropagation();
    e.preventDefault();

    setLoading(true);
    const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    setLoading(false);

    if (res.ok) {
      setConfirming(false);
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Failed to delete.");
    }
  }

  if (confirming) {
    return (
      <div 
        style={{ display: "flex", gap: 6, alignItems: "center" }} 
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >
        <span style={{ fontSize: 12, color: "var(--text-soft)", fontWeight: 500 }}>Sure?</span>
        <button
          onClick={handleDelete}
          className="btn"
          style={{
            padding: "4px 10px",
            fontSize: "11px",
            color: "#ffffff",
            background: "#c92a2a",
            borderColor: "#c92a2a",
            cursor: "pointer",
            borderRadius: "4px"
          }}
          disabled={loading}
        >
          {loading ? "Deleting..." : "Yes"}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setConfirming(false);
          }}
          className="btn btn-ghost"
          style={{
            padding: "4px 10px",
            fontSize: "11px",
            color: "var(--text-main)",
            borderColor: "var(--line)",
            cursor: "pointer",
            background: "rgba(0, 0, 0, 0.02)",
            borderRadius: "4px"
          }}
          disabled={loading}
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setConfirming(true);
      }}
      className="btn btn-ghost"
      style={{
        padding: "6px 12px",
        fontSize: "12px",
        color: "#c92a2a",
        borderColor: "#fccfcf",
        background: "rgba(201, 42, 42, 0.04)",
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      Delete {label}
    </button>
  );
}
