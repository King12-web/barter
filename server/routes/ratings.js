// ============================================================
// Recalculates the signed-in user's rating and trade count.
// ------------------------------------------------------------
// This runs on the server so that firestore.rules can forbid the
// browser from writing `rating` or `trades` at all.
// ============================================================
import { Router } from "express";
import admin from "../lib/firebaseAdmin.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

function isValidStars(value) {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

router.post("/recalculate", requireAuth, async (req, res) => {
  try {
    const db = admin.firestore();
    const uid = req.firebaseUid;
    const [asProposer, asReceiver] = await Promise.all([
      db.collection("trades").where("proposerUid", "==", uid).get(),
      db.collection("trades").where("receiverUid", "==", uid).get(),
    ]);

    let completedCount = 0;
    const ratingsReceived = [];

    /* My rating is the one the OTHER side left on the trade. */
    function tally(snap, theirRatingField) {
      snap.forEach((d) => {
        const data = d.data();
        if (data.status !== "completed" || data.proposerUid === data.receiverUid) return;
        completedCount++;
        if (isValidStars(data[theirRatingField])) ratingsReceived.push(data[theirRatingField]);
      });
    }
    tally(asProposer, "receiverRating");
    tally(asReceiver, "proposerRating");

    let rating = null;
    if (ratingsReceived.length > 0) {
      const sum = ratingsReceived.reduce((a, b) => a + b, 0);
      rating = Math.round((sum / ratingsReceived.length) * 10) / 10;
    }

    await db.collection("profiles").doc(uid).update({ rating, trades: completedCount });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Recalculating rating failed:", error);
    return res.status(500).json({ ok: false, message: "Couldn't update your rating." });
  }
});

export default router;
