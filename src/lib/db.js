import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";

export async function getProfile(uid) {
  try {
    const snap = await getDoc(doc(db, "profiles", uid));
    if (snap.exists() === false) return { ok: true, data: null };
    return { ok: true, data: snap.data() };
  } catch (error) {
    return { ok: false, message: "Something went wrong loading your profile." };
  }
}

export async function saveProfile(uid, profile) {
  try {
    await setDoc(doc(db, "profiles", uid), profile, { merge: true });
    return { ok: true, data: profile };
  } catch (error) {
    return { ok: false, message: "Something went wrong saving your profile." };
  }
}

export async function getProfilesByInstitution(institutionName) {
  try {
    const q = query(collection(db, "profiles"), where("institution", "==", institutionName));
    const snap = await getDocs(q);
    let people = [];
    snap.forEach((d) => people.push({ uid: d.id, ...d.data() }));
    return { ok: true, data: people };
  } catch (error) {
    return { ok: false, message: "Something went wrong loading the board." };
  }
}

export async function getAllProfiles() {
  try {
    const snap = await getDocs(collection(db, "profiles"));
    let people = [];
    snap.forEach((d) => people.push({ uid: d.id, ...d.data() }));
    return { ok: true, data: people };
  } catch (error) {
    return { ok: false, message: "Something went wrong loading the board." };
  }
}