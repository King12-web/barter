import {
  collection, addDoc, doc, updateDoc, query, where, getDocs, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase.js";

export async function proposeTrade(proposer, receiver, offeredSkill, requestedSkill, terms) {
  if (!proposer.uid || !receiver.uid) {
    return { ok: false, message: "Missing account information — try refreshing the page." };
  }
  try {
    const tradeDoc = {
      proposerUid: proposer.uid, proposerName: proposer.name, proposerWhatsapp: proposer.whatsapp,
      receiverUid: receiver.uid, receiverName: receiver.name, receiverWhatsapp: receiver.whatsapp,
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
   Self-write-only rating aggregation. Firestore rules only allow
   writing YOUR OWN profile — see the long comment this originally
   shipped with — so each person recalculates their own average
   whenever their own session loads, never someone else's.
   ============================================================ */
export async function recalcMyRating(uid) {
  try {
    const asProposer = query(collection(db, "trades"), where("proposerUid", "==", uid));
    const asReceiver = query(collection(db, "trades"), where("receiverUid", "==", uid));
    const [proposerSnap, receiverSnap] = await Promise.all([getDocs(asProposer), getDocs(asReceiver)]);

    let completedCount = 0;
    let ratingsReceived = [];

    proposerSnap.forEach((d) => {
      const data = d.data();
      if (data.status === "completed") {
        completedCount++;
        if (data.receiverRating != null) ratingsReceived.push(data.receiverRating);
      }
    });
    receiverSnap.forEach((d) => {
      const data = d.data();
      if (data.status === "completed") {
        completedCount++;
        if (data.proposerRating != null) ratingsReceived.push(data.proposerRating);
      }
    });

    let avgRating = null;
    if (ratingsReceived.length > 0) {
      const sum = ratingsReceived.reduce((a, b) => a + b, 0);
      avgRating = Math.round((sum / ratingsReceived.length) * 10) / 10;
    }

    await updateDoc(doc(db, "profiles", uid), { rating: avgRating, trades: completedCount });
    return { ok: true };
  } catch (error) {
    console.error("Failed to recalculate rating:", error);
    return { ok: false };
  }
}