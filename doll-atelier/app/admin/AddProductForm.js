"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState(1);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!photo) {
      setError("Add a photo of the doll.");
      return;
    }
    setLoading(true);

    const uploadData = new FormData();
    uploadData.append("file", photo);
    uploadData.append("kind", "photo");
    const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
    const uploadJson = await uploadRes.json();
    if (!uploadRes.ok) {
      setLoading(false);
      setError(uploadJson.error || "Photo upload failed.");
      return;
    }

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        priceInPaise: Math.round(Number(price) * 100),
        photoUrl: uploadJson.url,
        stock,
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      return;
    }

    setName("");
    setDescription("");
    setPrice("");
    setStock(1);
    setPhoto(null);
    e.target.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="field">
          <label>Doll name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label>Price (₹)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
      </div>
      <div className="field">
        <label>Description</label>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="field">
          <label>Stock</label>
          <input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} />
        </div>
        <div className="field">
          <label>Photo</label>
          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} required />
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Adding…" : "Add doll to the collection"}
      </button>
    </form>
  );
}
