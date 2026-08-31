import admin from "firebase-admin";

/* ============================================================
   Simple cooldown, backed by Firestore (already set up, no new
   infrastructure needed). Prevents someone from spamming a real
   registered email with repeated reset/verification requests —
   each one would trigger a genuine SES send, so without this,
   the endpoint could be used to email-bomb a real student or
   burn through SES quota/cost.

   Checked BEFORE touching Firebase Admin or SES at all, and
   applied identically whether the email belongs to a real
   account or not — so the rate-limit response itself never
   leaks whether an account exists, only "you already asked
   recently," which is safe to reveal either way.

   Admin SDK bypasses Firestore security rules entirely (rules
   only apply to client-side calls with a user's auth token), so
   no rule changes are needed for this new collection.
   ============================================================ */
export async function checkRateLimit(key, cooldownSeconds = 60) {
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
}