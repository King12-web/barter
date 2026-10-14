// ============================================================
// Unchanged from the original rateLimit.js — moved, not rewritten.
// ------------------------------------------------------------
// Firestore-backed cooldown. Checked BEFORE touching Admin SDK
// user-lookup or SES at all, and applied identically whether the
// email belongs to a real account or not, so the rate-limit
// response itself never leaks account existence — only "you
// already asked recently," which is safe to reveal either way.
// ============================================================
import admin from "./firebaseAdmin.js";

export async function checkRateLimit(key, cooldownSeconds = 60) {
  try {
    const db = admin.firestore();
    const ref = db.collection("rateLimits").doc(key);
    const snap = await ref.get();

    if (snap.exists) {
      const lastSentMs = snap.data().lastSentAt ? snap.data().lastSentAt.toMillis() : 0;
      const elapsedMs = Date.now() - lastSentMs;
      if (elapsedMs < cooldownSeconds * 1000) {
        const waitSeconds = Math.ceil((cooldownSeconds * 1000 - elapsedMs) / 1000);
        return { allowed: false, waitSeconds };
      }
    }

    await ref.set({ lastSentAt: admin.firestore.FieldValue.serverTimestamp() });
    return { allowed: true };
  } catch (error) {
    /* Fail OPEN, same fail-soft convention db.js/activity.js/trades.js
       already use for non-critical infra failures: a Firestore hiccup
       on the rate-limit check itself should not be able to block
       welcome/verification/reset emails from going out at all. The
       cooldown this protects against is a cost/spam guard, not a
       security boundary — losing it for the length of an outage is a
       smaller problem than account recovery being unreachable during
       one. Every consolidated route still shares the same email
       provider's own throttling/limits as a second line of defense. */
    console.error("Rate-limit check failed, allowing through:", error);
    return { allowed: true };
  }
}

// ============================================================
// Express middleware wrapper around checkRateLimit.
// ------------------------------------------------------------
// Every route now gets the same quiet-skip behavior: a rate
// limited request gets a plain 200 { skipped: true } instead of
// a 429 with a wait time, so a caller can never tell from the
// response alone whether an email is being actively tracked.
// ============================================================
export function rateLimited(keyPrefix, cooldownSeconds = 60) {
  return async function (req, res, next) {
    // toEmail is guaranteed present by requireFields("toEmail", ...),
    // which every route puts ahead of this middleware in its chain.
    const { toEmail } = req.body;
    const result = await checkRateLimit(keyPrefix + ":" + toEmail.toLowerCase(), cooldownSeconds);
    if (result.allowed === false) {
      console.error(keyPrefix + " rate-limited for", toEmail);
      return res.status(200).json({ ok: true, skipped: true });
    }
    next();
  };
}