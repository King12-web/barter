import {
  collection, addDoc, query, where, orderBy, getDocs, doc, updateDoc, setDoc, serverTimestamp, Timestamp,
} from "firebase/firestore";
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

/* ============================================================
   One admin action, three real effects — deliberately bundled
   together so an admin can't accidentally do one without the
   others:
     1. Sets suspendedUntil on the person's profile (enforced
        server-side by Firestore rules — the real block).
     2. Writes an activity entry explaining why, which flows
        straight into their Notifications page automatically
        (that page already merges trades + activity into one feed).
     3. Marks every OPEN report against this person as reviewed,
        since taking action addresses what those reports flagged.
   ============================================================ */
export async function suspendUser(uid, reason, allOpenReportIds) {
  try {
    const suspendedUntil = Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await setDoc(doc(db, "profiles", uid), {
      suspendedUntil,
      suspensionReason: reason,
    }, { merge: true });

    await addDoc(collection(db, "activity"), {
      uid,
      message: `Your account has been suspended for one week due to: "${reason}". You won't be able to propose or accept trades until the suspension lifts. Contact us if you think this is a mistake.`,
      createdAt: serverTimestamp(),
    });

    await Promise.all(
      allOpenReportIds.map((reportId) => updateDoc(doc(db, "reports", reportId), { status: "reviewed" }))
    );

    return { ok: true };
  } catch (error) {
    return { ok: false, message: "Something went wrong suspending this user." };
  }
}