// ============================================================
// Firestore-backed rate limiting.
// ------------------------------------------------------------
// The read and write happen inside one transaction, so a burst of
// parallel requests can't all slip past the same check. Keys are
// hashed, so any email or IP address is a safe document ID.
//
// If the check itself fails, the request is refused: these routes
// cost money to run and affect sender reputation.
// ============================================================
import { createHash } from "node:crypto";
import admin from "./firebaseAdmin.js";

export async function checkRateLimit(key, { max, windowSeconds }) {
  const db = admin.firestore();
  const id = createHash("sha256").update(key).digest("hex");
  const ref = db.collection("rateLimits").doc(id);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = Date.now();
    const data = snap.exists ? snap.data() : null;
    const inWindow = data !== null && now - data.windowStart < windowSeconds * 1000;
    const count = inWindow ? data.count : 0;

    if (count >= max) return false;

    tx.set(ref, { windowStart: inWindow ? data.windowStart : now, count: count + 1 });
    return true;
  });
}

// ============================================================
// Express middleware wrapper around checkRateLimit.
// ------------------------------------------------------------
// `key` picks what is being limited (an IP, a user, an email).
// With quiet: true a limited request gets a plain
// 200 { skipped: true }, so the response reveals nothing about
// whether an address is being tracked.
// ============================================================
export function rateLimited({ prefix, key, max, windowSeconds, quiet = false }) {
  return async function (req, res, next) {
    let allowed;
    try {
      allowed = await checkRateLimit(prefix + ":" + key(req), { max, windowSeconds });
    } catch (error) {
      console.error("Rate-limit check failed:", error);
      return res.status(503).json({ ok: false, message: "Service busy. Try again shortly." });
    }

    if (allowed) return next();

    console.warn(prefix + " rate limit reached");
    if (quiet) return res.status(200).json({ ok: true, skipped: true });
    return res.status(429).json({ ok: false, message: "Too many requests. Try again later." });
  };
}
