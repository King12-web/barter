// ============================================================
// One-off migration: moves contact details off public documents.
// ------------------------------------------------------------
//  1. profiles/{uid}: copies email/whatsapp into
//     profiles/{uid}/private/contact, then deletes them from the
//     public profile.
//  2. trades/{id}: deletes proposerWhatsapp/receiverWhatsapp.
//
// Preview only (changes nothing):
//   node --env-file=.env.local scripts/migrate-contacts.js
// Make the changes:
//   node --env-file=.env.local scripts/migrate-contacts.js --apply
//
// Safe to run more than once. Prints counts only, never anyone's
// contact details.
// ============================================================
import admin from "../server/lib/firebaseAdmin.js";

const apply = process.argv.includes("--apply");
const db = admin.firestore();
const { FieldValue } = admin.firestore;

async function migrateProfiles() {
  const snap = await db.collection("profiles").get();
  let changed = 0;

  for (const profileDoc of snap.docs) {
    const data = profileDoc.data();
    const fields = ["email", "whatsapp"].filter((f) => f in data);
    if (fields.length === 0) continue;
    changed++;
    if (!apply) continue;

    const contactRef = profileDoc.ref.collection("private").doc("contact");
    /* One transaction per person: the copy and the delete both
       happen, or neither does. */
    await db.runTransaction(async (tx) => {
      const [fresh, contact] = await Promise.all([tx.get(profileDoc.ref), tx.get(contactRef)]);
      const copy = {};
      const remove = {};
      for (const field of ["email", "whatsapp"]) {
        if (!(field in fresh.data())) continue;
        remove[field] = FieldValue.delete();
        /* A value already saved privately is newer: keep it. */
        if (!contact.data()?.[field]) copy[field] = fresh.data()[field];
      }
      if (Object.keys(remove).length === 0) return;
      if (Object.keys(copy).length > 0) tx.set(contactRef, copy, { merge: true });
      tx.update(profileDoc.ref, remove);
    });
  }

  console.log(`Profiles: ${snap.size} total, ${changed} ${apply ? "migrated" : "need migrating"}`);
}

async function cleanTrades() {
  const snap = await db.collection("trades").get();
  let changed = 0;

  for (const tradeDoc of snap.docs) {
    const data = tradeDoc.data();
    const remove = {};
    for (const field of ["proposerWhatsapp", "receiverWhatsapp"]) {
      if (field in data) remove[field] = FieldValue.delete();
    }
    if (Object.keys(remove).length === 0) continue;
    changed++;
    if (apply) await tradeDoc.ref.update(remove);
  }

  console.log(`Trades: ${snap.size} total, ${changed} ${apply ? "cleaned" : "need cleaning"}`);
}

console.log(apply ? "Applying changes..." : "Preview only. Add --apply to make changes.");
await migrateProfiles();
await cleanTrades();
