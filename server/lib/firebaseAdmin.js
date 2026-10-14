// ============================================================
// Shared firebase-admin instance.
// ------------------------------------------------------------
// SECURITY: previously each serverless function (welcome,
// verification, reset) ran its own `if (!admin.apps.length)
// initializeApp(...)` guard. That's not wrong, but it means the
// same service-account credentials get parsed and a new Admin
// SDK instance gets constructed independently in up to three
// cold starts instead of one shared module. Centralizing it
// here means there's exactly one place that touches
// FIREBASE_PRIVATE_KEY — one place to audit, one place to
// rotate the key, no risk of a fourth route being added later
// that copies the init block slightly wrong.
// ============================================================
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export default admin;