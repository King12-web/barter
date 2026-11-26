import {
  collection, addDoc, doc, updateDoc, query, where, getDocs, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase.js";
import { authHeader } from "./authHeader.js";

export async function proposeTrade(proposer, receiver, offeredSkill, requestedSkill, terms) {
  if (!proposer.uid || !receiver.uid) {
    return { ok: false, message: "Missing account information — try refreshing the page." };
  }
  try {
    const tradeDoc = {
      /* No proposerWhatsapp/receiverWhatsapp here anymore — those
         used to be copied onto this document at proposal time,
         which meant both parties could read each other's contact
         info immediately via the Firestore SDK, before anyone
         accepted anything. getTradeContact() below replaces this,
         fetched through a backend check that enforces status ===
         "accepted" before returning anything. */
      proposerUid: proposer.uid, proposerName: proposer.name,
      proposerPhoto: proposer.photoURL || null,
      receiverUid: receiver.uid, receiverName: receiver.name,
      receiverPhoto: receiver.photoURL || null,
      offeredSkill, requestedSkill, terms: terms || "",
      status: "pending", proposerRating: null, receiverRating: null,
      createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, "trades"), tradeDoc);
    return { ok: true, data: { id: ref.id, ...tradeDoc } };
  } catch (error) {
    console.error("proposeTrade failed:", error.code, error.message);
    const message = error.code === "permission-denied"
      ? "You don't have permission to propose this trade right now. If you were recently verified or your suspension just lifted, try again in a moment."
      : "Something went wrong sending that proposal. (" + error.code + ")";
    return { ok: false, message };
  }
}

export async function getMyTrades(uid) {
  try {
    const asProposer = query(collection(db, "trades"), where("proposerUid", "==", uid));
    const asReceiver = query(collection(db, "trades"), where("receiverUid", "==", uid));
    const [proposerSnap, receiverSnap] = await Promise.all([getDocs(asProposer), getDocs(asReceiver)]);

    let trades = [];
    proposerSnap.forEach((d) => trades.push({ id: d.id, ...d.data() }));
    receiverSnap.forEach((d) => trades.push({ id: d.id, ...d.data() }));

    /* newest first; createdAt may briefly be null right after
       creation (server timestamp hasn't round-tripped yet) */
    trades.sort((a, b) => {
      const aTime = a.createdAt ? a.createdAt.toMillis() : Date.now();
      const bTime = b.createdAt ? b.createdAt.toMillis() : Date.now();
      return bTime - aTime;
    });

    return { ok: true, data: trades };
  } catch (error) {
    return { ok: false, message: "Something went wrong loading your trades." };
  }
}

async function setStatus(tradeId, status) {
  try {
    await updateDoc(doc(db, "trades", tradeId), { status, updatedAt: serverTimestamp() });
    return { ok: true };
  } catch (error) {
    const message = error.code === "permission-denied"
      ? "You don't have permission to do that yet. If you just verified your email, try again in a moment."
      : "Something went wrong updating that trade. (" + error.code + ")";
    return { ok: false, message };
  }
}

export function acceptTrade(tradeId) { return setStatus(tradeId, "accepted"); }
export function declineTrade(tradeId) { return setStatus(tradeId, "declined"); }
export function completeTrade(tradeId) { return setStatus(tradeId, "completed"); }

export async function rateTrade(tradeId, raterRole, stars) {
  try {
    const field = raterRole === "proposer" ? "proposerRating" : "receiverRating";
    await updateDoc(doc(db, "trades", tradeId), { [field]: stars, updatedAt: serverTimestamp() });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: "Something went wrong saving that rating." };
  }
}

/* ============================================================
   Fetches the OTHER party's contact info for an accepted trade,
   through the Express backend (server/routes/tradeContact.js) —
   never read directly from Firestore, since that's exactly the
   path that used to leak this early. Returns null on any failure
   (trade not accepted yet, not your trade, network issue, etc.)
   rather than throwing, since callers just want "show the button
   or don't."
   ============================================================ */
export async function getTradeContact(tradeId) {
  try {
    const response = await fetch(`/api/trade-contact/${encodeURIComponent(tradeId)}`, {
      headers: await authHeader(),
    });
    const data = await response.json();
    return data.ok ? { whatsapp: data.whatsapp } : null;
  } catch (error) {
    return null;
  }
}

/* ============================================================
   Asks the server to recalculate MY rating and trade count
   (server/routes/ratings.js). The browser never writes those
   fields itself, so they can't be faked.
   ============================================================ */
export async function recalcMyRating() {
  try {
    const response = await fetch("/api/ratings/recalculate", {
      method: "POST",
      headers: await authHeader(),
    });
    const data = await response.json();
    return { ok: data.ok === true };
  } catch (error) {
    console.error("Failed to recalculate rating:", error);
    return { ok: false };
  }
}
