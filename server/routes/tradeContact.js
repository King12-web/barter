// ============================================================
// Reveals the OTHER party's contact info for a single trade —
// but only once that trade is accepted, and only to the two
// people actually on it. Uses Firebase Admin, which bypasses
// firestore.rules entirely — the real access check happens here,
// in code, the same trust model as the email-sending routes.
// ============================================================
import { Router } from "express";
import admin from "../lib/firebaseAdmin.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();
const db = admin.firestore();

router.get("/:tradeId", requireAuth, async (req, res) => {
  try {
    const tradeSnap = await db.collection("trades").doc(req.params.tradeId).get();
    if (tradeSnap.exists === false) {
      return res.status(404).json({ ok: false, message: "Trade not found" });
    }

    const trade = tradeSnap.data();
    const { proposerUid, receiverUid, status } = trade;

    const isParty = req.firebaseUid === proposerUid || req.firebaseUid === receiverUid;
    if (isParty === false) {
      return res.status(403).json({ ok: false, message: "Not your trade" });
    }
    if (status !== "accepted") {
      return res.status(403).json({ ok: false, message: "Trade isn't accepted yet" });
    }

    const otherUid = req.firebaseUid === proposerUid ? receiverUid : proposerUid;
    const contactSnap = await db
      .collection("profiles")
      .doc(otherUid)
      .collection("private")
      .doc("contact")
      .get();

    if (contactSnap.exists === false) {
      return res.status(200).json({ ok: true, whatsapp: null });
    }

    const contact = contactSnap.data();
    return res.status(200).json({ ok: true, whatsapp: contact.whatsapp || null });
  } catch (error) {
    console.error("Fetching trade contact failed:", error);
    return res.status(500).json({ ok: false, message: "Couldn't load contact details." });
  }
});

export default router;