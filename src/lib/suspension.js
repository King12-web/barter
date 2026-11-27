import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase.js";

/* ============================================================
   Is the signed-in user suspended right now? Read fresh from
   Firestore each time, since the cached profile may predate the
   suspension.

   This only drives the on-screen notice. The real block is in the
   Firestore rules, which refuse to create or accept a trade while
   suspendedUntil is in the future — so if this read fails, it is
   safe to return null and let the rules decide.
   ============================================================ */
export async function getMySuspension() {
  if (auth.currentUser === null) return null;
  try {
    const snap = await getDoc(doc(db, "profiles", auth.currentUser.uid));
    const data = snap.data();
    const until = data?.suspendedUntil?.toDate();
    if (!until || until <= new Date()) return null;
    return { until, reason: data.suspensionReason || "" };
  } catch (error) {
    console.error("Suspension check failed:", error);
    return null;
  }
}
