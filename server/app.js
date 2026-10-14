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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

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

// Anything under /api that isn't one of the three routes above —
// explicit 404 instead of falling through to Express's default
// HTML error page, which would leak stack-trace-style details.
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

export default app;