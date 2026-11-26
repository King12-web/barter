// ============================================================
// All three "send an email" endpoints, as thin Express routes.
// ------------------------------------------------------------
// The welcome and verification routes require a signed-in user.
// The recipient comes from the verified token and the name from
// their profile, so a caller can't choose either one.
// ============================================================
import { Router } from "express";
import admin from "../lib/firebaseAdmin.js";
import ses from "../lib/ses.js";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { rateLimited } from "../lib/rateLimit.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { buildOwnActionLink } from "../lib/actionLink.js";
import { safeFirstName } from "../lib/safeName.js";
import { welcomeEmail, verificationEmail, resetEmail } from "../lib/emailTemplates.js";

const router = Router();

const SEND_FAILED = "Couldn't send the email. Try again shortly.";

/* Generous on purpose: many students on one campus network can
   share a single public IP address. */
const ipLimit = rateLimited({
  prefix: "email-ip", key: (req) => req.ip, max: 30, windowSeconds: 600,
});

const verifyLimit = rateLimited({
  prefix: "verify", key: (req) => req.firebaseUid, max: 1, windowSeconds: 60, quiet: true,
});

const resetLimit = rateLimited({
  prefix: "reset", key: (req) => req.body.toEmail.toLowerCase(), max: 1, windowSeconds: 60, quiet: true,
});

async function profileFirstName(uid) {
  const snap = await admin.firestore().collection("profiles").doc(uid).get();
  return safeFirstName(snap.exists ? snap.data().name : "");
}

function send(toEmail, { subject, html, text }) {
  return ses.send(new SendEmailCommand({
    Source: "Campus Barter <admin@campusbarter.online>",
    Destination: { ToAddresses: [toEmail] },
    Message: {
      Subject: { Data: subject },
      Body: { Html: { Data: html }, Text: { Data: text } },
    },
  }));
}

function verificationRoute(buildEmail, label) {
  return async (req, res) => {
    const toEmail = req.firebaseEmail;
    if (!toEmail) {
      return res.status(400).json({ ok: false, message: "Account has no email address" });
    }
    try {
      const firebaseLink = await admin.auth().generateEmailVerificationLink(toEmail, {
        url: "https://campusbarter.online/signin",
      });
      const verifyLink = buildOwnActionLink(firebaseLink, "verifyEmail");
      const name = await profileFirstName(req.firebaseUid);
      await send(toEmail, await buildEmail(name, verifyLink));
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error(label + " email failed:", error);
      return res.status(500).json({ ok: false, message: SEND_FAILED });
    }
  };
}

router.post("/send-welcome-email", ipLimit, requireAuth, verifyLimit, verificationRoute(welcomeEmail, "Welcome"));

router.post("/send-verification-email", ipLimit, requireAuth, verifyLimit, verificationRoute(verificationEmail, "Verification"));

/* Has to work signed out — someone who forgot their password
   can't present a token. */
function requireEmail(req, res, next) {
  const toEmail = req.body?.toEmail;
  if (typeof toEmail !== "string" || toEmail.length === 0 || toEmail.length > 254) {
    return res.status(400).json({ error: "Missing or invalid toEmail" });
  }
  next();
}

router.post("/send-reset-email", ipLimit, requireEmail, resetLimit, async (req, res) => {
  const { toEmail } = req.body;
  try {
    /* Checked first so an unknown address gets the same answer as
       a real one. */
    await admin.auth().getUserByEmail(toEmail);
    const firebaseLink = await admin.auth().generatePasswordResetLink(toEmail, {
      url: "https://campusbarter.online/signin",
    });
    const resetLink = buildOwnActionLink(firebaseLink, "resetPassword");
    await send(toEmail, await resetEmail(resetLink));
    return res.status(200).json({ ok: true });
  } catch (error) {
    if (error.code === "auth/user-not-found" || error.code === "auth/invalid-email") {
      return res.status(200).json({ ok: true });
    }
    console.error("Reset email failed:", error);
    return res.status(500).json({ ok: false, message: SEND_FAILED });
  }
});

export default router;
