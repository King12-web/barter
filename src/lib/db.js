import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";

/* ============================================================
   Contact details (email, whatsapp) live in a SEPARATE document,
   profiles/{uid}/private/contact, instead of on the main profile
   document — not as a style choice, but because Firestore
   security rules can only grant or deny access to a whole
   document, never individual fields within it. The board needs
   to broadly read profiles/{uid} (names, skills, ratings), so
   anything physically stored in that same document is exposed to
   everyone who can read it. Keeping contact info in its own
   document, with its own stricter rule, is the only way to keep
   it actually private while still letting the board work.
   ============================================================ */
const CONTACT_FIELDS = ["email", "whatsapp"];

function splitProfile(profile) {
  const pub = { ...profile };
  const contact = {};
  for (const field of CONTACT_FIELDS) {
    if (field in pub) {
      contact[field] = pub[field];
      delete pub[field];
    }
  }
  return { pub, contact };
}

export async function getProfile(uid) {
  try {
    const [publicSnap, contactSnap] = await Promise.all([
      getDoc(doc(db, "profiles", uid)),
      getDoc(doc(db, "profiles", uid, "private", "contact")),
    ]);
    if (publicSnap.exists() === false) return { ok: true, data: null };

    /* Merged back together here so every existing caller
       (Join.jsx, Profile.jsx, etc.) keeps working with one flat
       object exactly as before — they don't need to know the
       data is split across two documents under the hood. Only
       call this for the signed-in user's OWN uid: the rules deny
       anyone else's contact doc, which makes the whole call fail. */
    return { ok: true, data: { ...publicSnap.data(), ...contactSnap.data() } };
  } catch (error) {
    return { ok: false, message: "Something went wrong loading your profile." };
  }
}

export async function saveProfile(uid, profile) {
  try {
    const { pub, contact } = splitProfile(profile);
    const writes = [setDoc(doc(db, "profiles", uid), pub, { merge: true })];
    if (Object.keys(contact).length > 0) {
      writes.push(setDoc(doc(db, "profiles", uid, "private", "contact"), contact, { merge: true }));
    }
    await Promise.all(writes);
    return { ok: true, data: profile };
  } catch (error) {
    return { ok: false, message: "Something went wrong saving your profile." };
  }
}

/* getProfilesByInstitution and getAllProfiles only ever read the
   profiles/{uid} documents, which no longer contain
   email/whatsapp once scripts/migrate-contacts.js has run. */
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