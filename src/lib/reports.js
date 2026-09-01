import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";

export async function submitReport(reporterUid, reportedUid, reportedName, tradeId, reason, details) {
  try {
    await addDoc(collection(db, "reports"), {
      reporterUid,
      reportedUid,
      reportedName,
      tradeId,
      reason,
      details: details || "",
      status: "open",
      createdAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: "Something went wrong submitting your report." };
  }
}