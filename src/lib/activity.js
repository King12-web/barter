import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";

export async function logActivity(uid, message) {
  try {
    await addDoc(collection(db, "activity"), { uid, message, createdAt: serverTimestamp() });
    return { ok: true };
  } catch (error) {
    /* Non-fatal by design: a failed log entry should never block
       the action that triggered it. */
    console.error("Activity log failed:", error);
    return { ok: false };
  }
}

export async function getMyActivity(uid) {
  try {
    const q = query(collection(db, "activity"), where("uid", "==", uid));
    const snap = await getDocs(q);
    let items = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));
    return { ok: true, data: items };
  } catch (error) {
    return { ok: false, message: "Something went wrong loading your activity." };
  }
}