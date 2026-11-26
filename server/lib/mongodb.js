// ============================================================
// MongoDB connection, cached across invocations.
// ------------------------------------------------------------
// On Vercel, each serverless function instance can be reused for
// several requests before it's recycled — but a fresh import of
// this module (e.g. a cold start) runs this file from scratch. If
// we called mongoose.connect() directly in a route handler, every
// request could open a brand-new connection, and MongoDB Atlas
// has a hard cap on how many of those it allows at once. Caching
// the promise on `global` means every request on a warm instance
// reuses the SAME in-flight or already-open connection instead of
// opening a new one.
// ============================================================
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable");
}

let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: "campus-barter",
    }).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    /* Forget the failed attempt so the next request retries
       instead of reusing a rejected promise forever. */
    cached.promise = null;
    throw error;
  }
  return cached.conn;
}