import Link from "next/link";
import ShopLayout from "@/components/ShopLayout";
import VideoPlayer from "./[id]/VideoPlayer";
import UnlockButton from "./UnlockButton";
import { formatRupees } from "@/components/ProductCard";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export default async function LearnPage({ searchParams }) {
  const user = getSessionUser();
  const videos = await db.video.findMany({ orderBy: { createdAt: "desc" } });

  let ownedIds = new Set();
  if (user) {
    const access = await db.videoAccess.findMany({ where: { userId: user.id } });
    ownedIds = new Set(access.map((a) => a.videoId));
  }

  const searchQuery = searchParams.q || "";
  const activeCategory = searchParams.category || "All";

  let filteredVideos = videos;
  if (searchQuery) {
    filteredVideos = filteredVideos.filter(v =>
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (activeCategory !== "All") {
    filteredVideos = filteredVideos.filter(v => {
      const desc = v.description.toLowerCase();
      const title = v.title.toLowerCase();
      if (activeCategory === "Sewing") return desc.includes("sew") || title.includes("sew") || desc.includes("stitch") || title.includes("stitch");
      if (activeCategory === "Stuffing") return desc.includes("stuff") || title.includes("stuff") || desc.includes("fill") || title.includes("fill");
      if (activeCategory === "Detailing") return desc.includes("detail") || title.includes("detail") || desc.includes("face") || title.includes("face") || desc.includes("hair") || title.includes("hair");
      if (activeCategory === "Pattern Cut") return desc.includes("cut") || title.includes("cut") || desc.includes("pattern") || title.includes("pattern");
      return true;
    });
  }

  const selectedId = searchParams.video;
  const selectedVideo = videos.find(v => v.id === selectedId) || filteredVideos[0];
  const categories = ["All", "Pattern Cut", "Sewing", "Stuffing", "Detailing"];

  return (
    <ShopLayout activePage="videos" threeColumns={true}>
      {/* Center column: video catalog */}
      <div className="center-pane">
        {/* Search */}
        <form action="/learn" method="GET" className="search-container">
          <span style={{ color: "var(--text-soft)" }}>🔍</span>
          <input name="q" defaultValue={searchQuery} placeholder="Search workshop videos..." className="search-input" />
          {activeCategory !== "All" && <input type="hidden" name="category" value={activeCategory} />}
        </form>

        {/* Categories */}
        <div className="categories-container">
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Categories</h2>
          <div className="categories-grid">
            {categories.map((cat) => {
              let url = `/learn?category=${encodeURIComponent(cat)}`;
              if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;
              const isActive = activeCategory === cat;
              return (
                <Link key={cat} href={url} className={`category-pill ${isActive ? "active" : ""}`} scroll={false}>
                  {cat}
                </Link>
              );
            })}
          </div>
        </div>

        <hr className="stitch-divider" />

        <section style={{ paddingBottom: 40 }}>
          <h2 style={{ fontSize: 18, marginBottom: 20 }}>Workshop Videos</h2>

          {filteredVideos.length === 0 ? (
            <p style={{ color: "var(--text-soft)" }}>
              No videos found matching the criteria.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 20,
              }}
            >
              {filteredVideos.map((v) => {
                const isSelected = selectedVideo && v.id === selectedVideo.id;
                const isOwned = ownedIds.has(v.id);
                
                // Build link URL retaining filters
                let linkUrl = `/learn?video=${v.id}`;
                if (activeCategory !== "All") linkUrl += `&category=${encodeURIComponent(activeCategory)}`;
                if (searchQuery) linkUrl += `&q=${encodeURIComponent(searchQuery)}`;

                return (
                  <Link
                    key={v.id}
                    href={linkUrl}
                    className={`card ${isSelected ? "selected" : ""}`}
                    style={{ display: "block", overflow: "hidden" }}
                    scroll={false}
                  >
                    <div
                      style={{
                        aspectRatio: "16 / 9",
                        background: `var(--bg-app) url(${v.thumbnailUrl}) center/cover`,
                        position: "relative",
                      }}
                    >
                      {!isOwned && (
                        <span className="locked-badge" style={{ position: "absolute", top: 10, left: 10 }}>
                          🔒 Locked
                        </span>
                      )}
                    </div>
                    <div style={{ padding: "14px" }}>
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)" }}>{v.title}</h3>
                      <p style={{ fontSize: 12, color: "var(--text-soft)", marginTop: 4, minHeight: 32, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {v.description}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                        <span className="mono" style={{ fontSize: 13, color: "var(--brand-purple)", fontWeight: 600 }}>
                          {formatRupees(v.priceInPaise)}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--brand-purple)", fontWeight: 600 }}>
                          {isOwned ? "Owned" : "Unlock 🔑"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Right column: video player details */}
      <div className="details-pane">
        {selectedVideo ? (
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{selectedVideo.title}</h1>
            
            {/* Video Player or Locked Banner */}
            <div style={{ marginBottom: 24 }}>
              {ownedIds.has(selectedVideo.id) ? (
                <VideoPlayer videoId={selectedVideo.id} />
              ) : (
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    borderRadius: "var(--radius-md)",
                    background: `var(--bg-app) url(${selectedVideo.thumbnailUrl}) center/cover`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    position: "relative",
                    boxShadow: "var(--shadow-subtle)",
                  }}
                >
                  {/* Overlay */}
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.4)", borderRadius: "var(--radius-md)" }} />
                  <span style={{ fontSize: 40, zIndex: 1, marginBottom: 10 }}>🔒</span>
                  <span style={{ fontSize: 14, fontWeight: 600, zIndex: 1 }}>Unlock this workshop video to stream</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
              <span className="category-pill active" style={{ padding: "4px 10px", fontSize: 11, borderRadius: 12 }}>Workshop</span>
              <span className="category-pill" style={{ padding: "4px 10px", fontSize: 11, borderRadius: 12 }}>Video</span>
              <span className="category-pill" style={{ padding: "4px 10px", fontSize: 11, borderRadius: 12 }}>Stitch-by-Stitch</span>
            </div>

            <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--brand-purple)", marginBottom: 16 }}>
              {formatRupees(selectedVideo.priceInPaise)}
            </div>

            <p style={{ color: "var(--text-soft)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              {selectedVideo.description}
            </p>

            {!ownedIds.has(selectedVideo.id) && (
              <>
                <hr className="stitch-divider" style={{ margin: "24px 0" }} />
                <h3 style={{ fontSize: 16, marginBottom: 14 }}>Access this Video</h3>
                <UnlockButton videoId={selectedVideo.id} owned={false} loggedIn={!!user} />
              </>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--text-soft)", textAlign: "center" }}>
            <span style={{ fontSize: 48, marginBottom: 16 }}>🎥</span>
            <p>Select a video from the list to watch or unlock.</p>
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
