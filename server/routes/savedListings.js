// ============================================================
// Saved/bookmarked listings — backed by MongoDB, separate from
// everything else in this app (which lives in Firestore).
// ------------------------------------------------------------
// Every route here requires requireAuth, so firebaseUid always
// comes from a verified token, never from the request body.
// ============================================================
import { Router } from "express";
import { connectToDatabase } from "../lib/mongodb.js";
import SavedListing from "../models/SavedListing.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.use(requireAuth);

const MAX_SAVED = 500;
const GENERIC_ERROR = "Something went wrong. Try again shortly.";

/* Listing IDs are profile uids: short strings. */
function isValidListingId(id) {
  return typeof id === "string" && id.length > 0 && id.length <= 128;
}

/* ---- POST /api/saved-listings ----
   Body: { listingId }. Bookmarking the same listing twice is a
   harmless no-op, not an error — the unique index on the model
   throws code 11000 (duplicate key) in that case, which we just
   swallow and still return success. */
router.post("/", async (req, res) => {
  const { listingId } = req.body || {};
  if (!isValidListingId(listingId)) {
    return res.status(400).json({ error: "Missing or invalid listingId" });
  }

  try {
    await connectToDatabase();
    const savedCount = await SavedListing.countDocuments({ firebaseUid: req.firebaseUid });
    if (savedCount >= MAX_SAVED) {
      return res.status(400).json({ ok: false, message: "Saved list is full" });
    }
    await SavedListing.create({ firebaseUid: req.firebaseUid, listingId });
    return res.status(200).json({ ok: true });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ ok: true });
    }
    console.error("Saving listing failed:", error);
    return res.status(500).json({ ok: false, message: GENERIC_ERROR });
  }
});

/* ---- GET /api/saved-listings ----
   Returns this user's saved listing IDs, newest first. */
router.get("/", async (req, res) => {
  try {
    await connectToDatabase();
    const saved = await SavedListing.find({ firebaseUid: req.firebaseUid })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ ok: true, listingIds: saved.map((s) => s.listingId) });
  } catch (error) {
    console.error("Fetching saved listings failed:", error);
    return res.status(500).json({ ok: false, message: GENERIC_ERROR });
  }
});

/* ---- DELETE /api/saved-listings/:listingId ----
   Un-bookmarking something that was never saved is also a
   harmless no-op — deleteOne matching nothing isn't an error. */
router.delete("/:listingId", async (req, res) => {
  try {
    await connectToDatabase();
    await SavedListing.deleteOne({
      firebaseUid: req.firebaseUid,
      listingId: req.params.listingId,
    });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Removing saved listing failed:", error);
    return res.status(500).json({ ok: false, message: GENERIC_ERROR });
  }
});

export default router;