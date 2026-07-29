"use client";

import { useEffect, useRef, useState } from "react";

export default function VideoPlayer({ videoId }) {
  const [src, setSrc] = useState(null);
  const [error, setError] = useState("");
  const videoRef = useRef(null);

  async function loadSignedUrl() {
    const res = await fetch(`/api/videos/${videoId}/stream`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Couldn't load this video.");
      return;
    }
    setSrc(data.url);
  }

  useEffect(() => {
    loadSignedUrl();
    // The playback token is only valid for 10 minutes. Refresh it a little
    // before that so a long tutorial doesn't cut out mid-watch. The browser
    // keeps its playback position since we only swap the query string.
    const interval = setInterval(loadSignedUrl, 8 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  if (error) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--ink-soft)" }}>
        {error}
      </div>
    );
  }

  return (
    <div className="card" style={{ overflow: "hidden", background: "#000" }}>
      {src && (
        <video
          ref={videoRef}
          src={src}
          controls
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          style={{ width: "100%", display: "block", aspectRatio: "16 / 9" }}
        />
      )}
    </div>
  );
}
