const { db } = require("./db");
const { supabase } = require("./supabase");

const TOKEN_LIFETIME_SECONDS = 60 * 10; // 10 minutes

async function generateSignedPlaybackUrl(videoId, userId) {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  // 1. Fetch the video to get its sourcePath (which is the filename in Supabase Storage)
  const video = await db.video.findUnique({
    where: { id: videoId },
    select: { sourcePath: true },
  });

  if (!video) {
    throw new Error("Video not found.");
  }

  // 2. Generate a signed URL from the Supabase Storage private 'videos' bucket
  const { data, error } = await supabase.storage
    .from("videos")
    .createSignedUrl(video.sourcePath, TOKEN_LIFETIME_SECONDS);

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

// Kept for backward compatibility. Supabase handles its own validation on access.
function verifyPlaybackToken(videoId, userId, expires, sig) {
  return true;
}

module.exports = { generateSignedPlaybackUrl, verifyPlaybackToken, TOKEN_LIFETIME_SECONDS };
