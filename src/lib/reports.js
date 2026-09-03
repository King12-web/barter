import { collection, addDoc, query, orderBy, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
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

/* Admin-only in practice — Firestore rules deny this read for
   anyone whose own profile isn't flagged isAdmin, so a non-admin
   calling this just gets a permission error, not real data. */
export async function getAllReports() {
  try {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    let reports = [];
    snap.forEach((d) => reports.push({ id: d.id, ...d.data() }));
    return { ok: true, data: reports };
  } catch (error) {
    return { ok: false, message: "Something went wrong loading reports." };
  }
}

export async function markReportReviewed(reportId) {
  try {
    await updateDoc(doc(db, "reports", reportId), { status: "reviewed" });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: "Something went wrong updating that report." };
  }
}