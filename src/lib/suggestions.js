import { collection, addDoc, query, orderBy, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";

export async function submitSuggestion(uid, name, text) {
  try {
    await addDoc(collection(db, "suggestions"), {
      uid,
      name,
      text,
      status: "new",
      createdAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: "Something went wrong submitting your suggestion." };
  }
}

export async function getAllSuggestions() {
  try {
    const q = query(collection(db, "suggestions"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    let suggestions = [];
    snap.forEach((d) => suggestions.push({ id: d.id, ...d.data() }));
    return { ok: true, data: suggestions };
  } catch (error) {
    return { ok: false, message: "Something went wrong loading suggestions." };
  }
}

export async function markSuggestionReviewed(suggestionId) {
  try {
    await updateDoc(doc(db, "suggestions", suggestionId), { status: "reviewed" });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: "Something went wrong updating that suggestion." };
  }
}