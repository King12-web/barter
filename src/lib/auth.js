import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase.js";

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
    await sendEmailVerification(result.user);
    return { ok: true, user: result.user };
  } catch (error) {
    return { ok: false, message: friendly(error) };
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
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