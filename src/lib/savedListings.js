import { auth } from "../firebase.js";
import { onAuthStateChanged } from "firebase/auth";

/* auth.currentUser can briefly be null right after a page reload,
   even when the user is genuinely still signed in — Firebase just
   hasn't finished restoring the session yet. Rather than assume
   it's ready, this waits for the FIRST auth state Firebase reports
   (whether that's a real user or null), so a reload doesn't race
   against our own fetch calls. */
function waitForUser() {
  return new Promise((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

async function authHeader() {
  const user = await waitForUser();
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export async function saveListing(listingId) {
  try {
    const response = await fetch("/api/saved-listings", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({ listingId }),
    });
    const data = await response.json();
    return data.ok ? { ok: true } : { ok: false, message: "Couldn't save this listing." };
  } catch (error) {
    return { ok: false, message: "Network problem. Check your connection and try again." };
  }
}

export async function unsaveListing(listingId) {
  try {
    const response = await fetch(`/api/saved-listings/${encodeURIComponent(listingId)}`, {
      method: "DELETE",
      headers: await authHeader(),
    });
    const data = await response.json();
    return data.ok ? { ok: true } : { ok: false, message: "Couldn't remove this listing." };
  } catch (error) {
    return { ok: false, message: "Network problem. Check your connection and try again." };
  }
}

export async function getSavedListingIds() {
  try {
    const response = await fetch("/api/saved-listings", {
      headers: await authHeader(),
    });
    const data = await response.json();
    return data.ok ? data.listingIds : [];
  } catch (error) {
    return [];
  }
}