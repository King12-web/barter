// ============================================================
// Vercel entry point — the ONLY file left in /api.
// ------------------------------------------------------------
// The bracket filename is Vercel's catch-all convention: this one
// file now matches every /api/* request (send-welcome-email,
// send-verification-email, send-reset-email, and any future
// email route) and hands it to the Express app, which does the
// real routing internally. This is what makes the four old
// per-endpoint function files disappear — not a config flag, an
// actual file you can delete.
// ============================================================
import app from "../server/app.js";

export default app;