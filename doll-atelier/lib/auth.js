const bcrypt = require("bcryptjs");
const { cookies } = require("next/headers");
const { COOKIE_NAME, readSessionCookieValue } = require("./session");

async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// Reads the logged-in user (if any) from the request cookie.
// Returns { id, name, email, role } or null.
function getSessionUser() {
  const cookieStore = cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  return readSessionCookieValue(raw);
}

function requireRole(role) {
  const user = getSessionUser();
  if (!user || user.role !== role) return null;
  return user;
}

module.exports = { hashPassword, verifyPassword, getSessionUser, requireRole };
