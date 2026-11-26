// ============================================================
// Verifies the caller is a real, logged-in Firebase user.
// ------------------------------------------------------------
// The frontend sends the user's Firebase ID token in the
// Authorization header as "Bearer <token>". We verify it with
// Firebase Admin (the same admin SDK already used for the email
// routes) rather than trusting any uid the client might claim to
// be — without this, anyone could POST { firebaseUid: "someone
// else's uid" } and bookmark listings as a different user.
// ============================================================
import admin from "../lib/firebaseAdmin.js";

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing or malformed Authorization header" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.firebaseUid = decoded.uid;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}