import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase.js";

/* ============================================================
   By default, Firebase generates verification/reset links that
   point to ITS OWN generic hosted page. Passing this settings
   object with handleCodeInApp: true makes it generate links
   pointing at OUR page instead — the one built to match our
   design and handle both link types. This is controlled entirely
   in code, no Firebase console setting involved.
   ============================================================ */
const actionCodeSettings = {
  url: "https://campusbarter.online/auth-action",
  handleCodeInApp: true,
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

    /* Sending the verification email is important, but SECONDARY.
       The account already exists at this point — if the email
       send fails (e.g. a misconfigured link, a network hiccup),
       that must NOT make this whole function report failure.
       Otherwise the caller thinks signup failed, never creates
       the Firestore profile, and the person is left with a real
       but orphaned account and no way to retry with that email. */
    try {
      await sendEmailVerification(result.user, actionCodeSettings);
    } catch (verifyError) {
      console.error("Verification email failed to send:", verifyError);
    }

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
   Resend the verification email. Verification links can go stale
   after a few days, so if a user's first email is lost or expired,
   this gives them a fresh one on demand instead of a dead end.
   ============================================================ */
export async function resendVerificationEmail() {
  if (auth.currentUser === null) {
    return { ok: false, message: "You need to be signed in to resend a verification email." };
  }
  try {
    await sendEmailVerification(auth.currentUser, actionCodeSettings);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: friendly(error) };
  }
}