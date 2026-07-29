const crypto = require("crypto");

const SECRET = process.env.SESSION_SECRET || "dev-secret-change-me-in-production";
const COOKIE_NAME = "atelier_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

function sign(payloadB64) {
  return crypto.createHmac("sha256", SECRET).update(payloadB64).digest("hex");
}

// Turns a user object into a signed cookie string: base64(json).hmacHex
function createSessionCookieValue(data) {
  const payloadB64 = Buffer.from(JSON.stringify(data)).toString("base64url");
  const sig = sign(payloadB64);
  return `${payloadB64}.${sig}`;
}

// Verifies a cookie string and returns the decoded session data, or null if invalid/tampered
function readSessionCookieValue(cookieValue) {
  if (!cookieValue) return null;
  const [payloadB64, sig] = cookieValue.split(".");
  if (!payloadB64 || !sig) return null;
  const expected = sign(payloadB64);
  // timing-safe compare
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

module.exports = { COOKIE_NAME, MAX_AGE_SECONDS, createSessionCookieValue, readSessionCookieValue };
