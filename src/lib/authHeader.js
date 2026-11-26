import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase.js";

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

/* Header for calls to our own /api routes. Throws when signed out. */
export async function authHeader() {
  const user = await waitForUser();
  if (user === null) throw new Error("Not signed in");
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}
