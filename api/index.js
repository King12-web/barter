// ============================================================
// Vercel entry point — the ONLY file left in /api.
// ------------------------------------------------------------
// vercel.json rewrites every /api/* request to this file, which
// hands it to the Express app; the app does the real routing
// using the original path. A "[...path].js" filename is not
// enough: outside Next.js, Vercel only matched ONE path segment
// with it, so /api/trade-contact/:id and /api/ratings/recalculate
// returned 404.
// ============================================================
import app from "../server/app.js";

export default app;