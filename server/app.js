// ============================================================
// The consolidated Express app.
// ------------------------------------------------------------
// This replaces four separate Vercel serverless functions
// (send-welcome-email, send-welcome-email-merged,
// send-verification-email-v2, send-reset-email) with one app
// and three routes. Exported as a plain Express app rather than
// something already wired to listen() — api/[...path].js (the
// actual Vercel entry point) hands every /api/* request to this
// app; nothing here needs to know it's running on Vercel.
//
// SECURITY: only POST with a JSON body reaches the route
// handlers — express.json() with a size cap guards against an
// oversized body being used to tie up a function instance before
// any of our own validation even runs.
// ============================================================
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import emailRoutes from "./routes/email.js";
import savedListingsRoutes from "./routes/savedListings.js";
import tradeContactRoutes from "./routes/tradeContact.js";
import ratingRoutes from "./routes/ratings.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Vercel sits in front of this app; trusting one proxy hop makes
// req.ip the caller's address, which the rate limiter relies on.
app.set("trust proxy", 1);

// EJS as the view engine. The three email routes render their
// HTML with ejs.renderFile() directly (lib/emailTemplates.js),
// since an email body isn't an HTTP response — but declaring the
// engine and views folder here is what makes this an Express+EJS
// app rather than "a file that happens to call the ejs package,"
// and it means any future route that DOES want res.render(...)
// for a real page just works with no extra setup.
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json({ limit: "10kb" }));
app.use("/api", emailRoutes);
app.use("/api/saved-listings", savedListingsRoutes);
app.use("/api/trade-contact", tradeContactRoutes);
app.use("/api/ratings", ratingRoutes);

// Anything under /api that isn't one of the routes above —
// explicit 404 instead of falling through to Express's default
// HTML error page, which would leak stack-trace-style details.
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Last resort (malformed JSON, unexpected throws): a generic JSON
// error, never Express's default page with a stack trace.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status >= 400 && error.status < 500 ? error.status : 500;
  if (status === 500) console.error("Unhandled API error:", error);
  res.status(status).json({ ok: false, message: status === 500 ? "Something went wrong" : "Bad request" });
});

export default app;