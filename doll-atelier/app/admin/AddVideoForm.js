"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddVideoForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressNote, setProgressNote] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!thumbnail || !videoFile) {
      setError("Add both a thumbnail image and the video file.");
      return;
    }
    setLoading(true);

    setProgressNote("Uploading thumbnail…");
    const thumbData = new FormData();
    thumbData.append("file", thumbnail);
    thumbData.append("kind", "photo");
    const thumbRes = await fetch("/api/upload", { method: "POST", body: thumbData });
    const thumbJson = await thumbRes.json();
    if (!thumbRes.ok) {
      setLoading(false);
      setError(thumbJson.error || "Thumbnail upload failed.");
      return;
    }

    setProgressNote("Uploading video — this can take a while for longer files…");
    const videoData = new FormData();
    videoData.append("file", videoFile);
    videoData.append("kind", "video");
    const videoRes = await fetch("/api/upload", { method: "POST", body: videoData });
    const videoJson = await videoRes.json();
    if (!videoRes.ok) {
      setLoading(false);
      setError(videoJson.error || "Video upload failed.");
      return;
    }

    setProgressNote("Saving…");
    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        priceInPaise: Math.round(Number(price) * 100),
        thumbnailUrl: thumbJson.url,
        sourcePath: videoJson.storedPath,
      }),
    });
    setLoading(false);
    setProgressNote("");

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      return;
    }

    setTitle("");
    setDescription("");
    setPrice("");
    setThumbnail(null);
    setVideoFile(null);
    e.target.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: 20 }}>
      <div className="form-row-two-columns">
        <div className="field">
          <label>Video title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="field">
          <label>Price to unlock (₹)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
      </div>
      <div className="field">
        <label>Description</label>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="form-row-two-columns">
        <div className="field">
          <label>Thumbnail image</label>
          <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files[0])} required />
        </div>
        <div className="field">
          <label>Video file (.mp4)</label>
          <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} required />
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}
      {progressNote && <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>{progressNote}</p>}

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Uploading…" : "Add workshop video"}
      </button>
    </form>
  );
}
