// ============================================================
// All three "send an email" endpoints, as thin Express routes.
// ============================================================
import { Router } from "express";
import admin from "../lib/firebaseAdmin.js";
import ses from "../lib/ses.js";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { rateLimited } from "../lib/rateLimit.js";
import { buildOwnActionLink } from "../lib/actionLink.js";
import { welcomeEmail, verificationEmail, resetEmail } from "../lib/emailTemplates.js";

const router = Router();

function requireFields(...fields) {
  return (req, res, next) => {
    const body = req.body || {};
    const missing = fields.filter((f) => !body[f]);
    if (missing.length > 0) {
      return res.status(400).json({ error: "Missing " + missing.join(", ") });
    }
    next();
  };
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

router.post("/send-welcome-email", requireFields("toEmail", "name"), rateLimited("verify", 60), async (req, res) => {
  const { toEmail, name } = req.body;
  try {
    const firebaseLink = await admin.auth().generateEmailVerificationLink(toEmail, {
      url: "https://campusbarter.online/signin",
    });
    const verifyLink = buildOwnActionLink(firebaseLink, "verifyEmail");
    await send(toEmail, await welcomeEmail(name, verifyLink));
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Welcome email failed:", error);
    return res.status(500).json({ ok: false, message: error.message });
  }
});

router.post("/send-verification-email", requireFields("toEmail", "name"), rateLimited("verify", 60), async (req, res) => {
  const { toEmail, name } = req.body;
  try {
    const firebaseLink = await admin.auth().generateEmailVerificationLink(toEmail, {
      url: "https://campusbarter.online/signin",
    });
    const verifyLink = buildOwnActionLink(firebaseLink, "verifyEmail");
    await send(toEmail, await verificationEmail(name, verifyLink));
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Verification email failed:", error);
    return res.status(500).json({ ok: false, message: error.message });
  }
});

router.post("/send-reset-email", requireFields("toEmail"), rateLimited("reset", 60), async (req, res) => {
  const { toEmail } = req.body;
  try {
    const firebaseLink = await admin.auth().generatePasswordResetLink(toEmail, {
      url: "https://campusbarter.online/signin",
    });
    const resetLink = buildOwnActionLink(firebaseLink, "resetPassword");
    await send(toEmail, await resetEmail(resetLink));
    return res.status(200).json({ ok: true });
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      return res.status(200).json({ ok: true });
    }
    console.error("Reset email failed:", error);
    return res.status(500).json({ ok: false, message: error.message });
  }
});

export default router;