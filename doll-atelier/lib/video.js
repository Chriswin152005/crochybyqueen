const crypto = require("crypto");

/**
 * THIS IS THE FILE TO REPLACE WHEN YOU GO LIVE.
 *
 * Right now, videos are served from /private-videos on this same server, and
 * this function generates a short-lived signed token so a video URL can't be
 * copy-pasted and reused forever or shared publicly.
 *
 * For production, swap this to call Cloudflare Stream or Mux instead:
 *   - Upload the source video to Cloudflare Stream / Mux once (owner upload flow).
 *   - Store the returned asset/video ID in Video.sourcePath instead of a local path.
 *   - Here, instead of building a local signed URL, call their API to mint a
 *     signed playback token (Cloudflare: "signed URLs", Mux: "signed playback ID").
 *   - Return that token/URL from this same function so nothing else in the
 *     app (the player page, the access-check route) needs to change.
 *
 * Either way, the video file itself is never served from a public, guessable
 * URL, and the token expires — which is what stops link-sharing/downloading.
 */

const SECRET = process.env.SESSION_SECRET || "dev-secret-change-me-in-production";
const TOKEN_LIFETIME_SECONDS = 60 * 10; // 10 minutes — plenty for one viewing session

function generateSignedPlaybackUrl(videoId, userId) {
  const expires = Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS;
  const toSign = `${videoId}:${userId}:${expires}`;
  const sig = crypto.createHmac("sha256", SECRET).update(toSign).digest("hex");
  return `/api/videos/${videoId}/stream-file?expires=${expires}&sig=${sig}&uid=${userId}`;
}

function verifyPlaybackToken(videoId, userId, expires, sig) {
  if (!expires || !sig) return false;
  if (Math.floor(Date.now() / 1000) > Number(expires)) return false; // expired
  const toSign = `${videoId}:${userId}:${expires}`;
  const expected = crypto.createHmac("sha256", SECRET).update(toSign).digest("hex");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  return sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
}

module.exports = { generateSignedPlaybackUrl, verifyPlaybackToken, TOKEN_LIFETIME_SECONDS };
