import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase.js";
import { authHeader } from "./authHeader.js";

/* Password reset still goes through Firebase's own sender —
   only VERIFICATION emails moved to our custom SES pipeline
   (Nigerian networks were flagging Firebase's sending domain as
   spam). `url` becomes a "continue" link shown after Firebase's
   own reset-password page finishes. */
const actionCodeSettings = {
  url: "https://campusbarter.online/signin",
};

const FRIENDLY = {
  "auth/email-already-in-use": "An account with this email already exists. Try signing in instead.",
  "auth/invalid-email": "That email address doesn't look right. Check it and try again.",
  "auth/weak-password": "Password is too weak. Use at least 6 characters.",
  "auth/invalid-credential": "Email or password is incorrect. Check both and try again.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
  "auth/network-request-failed": "Network problem. Check your connection and try again.",
};

function friendly(error) {
  return FRIENDLY[error.code] || "Something went wrong. Please try again. (" + error.code + ")";
}

export async function signIn(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { ok: true, user: result.user };
  } catch (error) {
    return { ok: false, message: friendly(error) };
  }
}

export async function signUp(email, password) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    /* No verification email sent here anymore — Join.jsx sends it
       via /api/send-verification-email (SES-backed) right after
       this succeeds, since it already has the user's name and
       the account creation shouldn't be blocked by that call
       either way. */
    return { ok: true, user: result.user };
  } catch (error) {
    return { ok: false, message: friendly(error) };
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: friendly(error) };
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: friendly(error) };
  }
}

/* ============================================================
   Live verification check — used right before a trade-committing
   action (propose, accept). Deliberately calls .reload() first
   instead of trusting whatever emailVerified said at sign-in time:
   if someone verifies their email in another tab, then comes back
   here, this check must see the FRESH status, not a stale cached
   one from login.

   NOTE: this is a UX convenience, not the real security boundary.
   The actual enforcement lives in firestore.rules, which requires
   request.auth.token.email_verified == true to CREATE a trade —
   that's the part nothing can bypass. This just gives a clear,
   friendly message before a user hits a confusing permission
   error from Firestore.
   ============================================================ */
export async function isEmailVerified() {
  if (auth.currentUser === null) return false;
  try {
    await auth.currentUser.reload();

    /* reload() updates the live user object (emailVerified flips
       to true right away) but Firestore's rules read a DIFFERENT
       thing: the email_verified CLAIM baked inside the auth
       TOKEN, which doesn't refresh automatically. Without this
       forced refresh, the app correctly shows "verified" while
       Firestore is still looking at an old token that says
       otherwise — rejecting the write with a confusing error. */
    if (auth.currentUser.emailVerified) {
      await auth.currentUser.getIdToken(true);
    }

    return auth.currentUser.emailVerified;
  } catch (error) {
    return false;
  }
}

/* ============================================================
   Welcome and verification emails go through our own /api routes
   (Firebase Admin generates the link server-side, SES delivers it
   from our trusted domain). Only the ID token is sent: the server
   takes the address from the token and the name from the profile.
   ============================================================ */
async function requestEmail(path) {
  try {
    const response = await fetch(path, { method: "POST", headers: await authHeader() });
    const data = await response.json();
    if (data.ok !== true) {
      return { ok: false, message: "Couldn't send the verification email. Try again shortly." };
    }
    return { ok: true };
  } catch (error) {
    console.error("Email request failed:", error);
    return { ok: false, message: "Couldn't send the email. Check your connection, or sign in again." };
  }
}

export function sendWelcomeEmail() {
  return requestEmail("/api/send-welcome-email");
}

export function resendVerificationEmail() {
  return requestEmail("/api/send-verification-email");
}
