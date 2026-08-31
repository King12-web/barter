import admin from "firebase-admin";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { checkRateLimit } from "./_lib/rateLimit.js";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const ses = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

function buildOwnActionLink(firebaseLink, mode) {
  const oobCode = new URL(firebaseLink).searchParams.get("oobCode");
  return `https://campusbarter.online/auth-action?mode=${mode}&oobCode=${oobCode}`;
}

function buildResetEmailHtml(resetLink) {
  return `
  <div style="background:#F7FAFD; padding:32px 16px; font-family:Arial, Helvetica, sans-serif;">
    <div style="max-width:480px; margin:0 auto; background:#FFFFFF; border-radius:14px; overflow:hidden; border:1px solid #E3E9F0;">
      <div style="background:#043873; padding:28px 24px; text-align:center;">
        <p style="margin:0; color:#FFFFFF; font-size:18px; font-weight:800;">
          CAMPUS <span style="color:#FFE492;">BARTER</span>
        </p>
      </div>
      <div style="padding:32px 28px;">
        <p style="font-size:15px; color:#212529; line-height:1.6; margin:0 0 24px;">
          We received a request to reset your Campus Barter password. Tap the button below to choose a new one.
        </p>
        <table role="presentation" style="margin:0 auto 28px;">
          <tr>
            <td style="background:#FFE492; border-radius:10px;">
              <a href="${resetLink}" style="display:inline-block; padding:14px 28px; font-size:14px; font-weight:700; color:#043873; text-decoration:none;">
                Reset my password
              </a>
            </td>
          </tr>
        </table>
        <p style="font-size:12.5px; color:#5B6470; line-height:1.6; margin:0 0 16px;">
          If the button doesn't work, copy and paste this link into your browser:<br />
          <span style="word-break:break-all;">${resetLink}</span>
        </p>
        <p style="font-size:12.5px; color:#5B6470; line-height:1.6; margin:0;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
      <div style="background:#F7FAFD; padding:18px 24px; text-align:center; border-top:1px solid #E3E9F0;">
        <p style="font-size:11.5px; color:#5B6470; margin:0;">Made for students, by students. Trade skills. Grow together.</p>
      </div>
    </div>
  </div>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { toEmail } = req.body;
  if (!toEmail) {
    return res.status(400).json({ error: "Missing toEmail" });
  }

  const rateCheck = await checkRateLimit("reset:" + toEmail.toLowerCase(), 60);
  if (rateCheck.allowed === false) {
    return res.status(429).json({
      ok: false,
      message: "Please wait " + rateCheck.waitSeconds + "s before requesting another reset email.",
    });
  }

  try {
    const firebaseLink = await admin.auth().generatePasswordResetLink(toEmail, {
      url: "https://campusbarter.online/signin",
    });

    const resetLink = buildOwnActionLink(firebaseLink, "resetPassword");

    const command = new SendEmailCommand({
      Source: "Campus Barter <admin@campusbarter.online>",
      Destination: { ToAddresses: [toEmail] },
      Message: {
        Subject: { Data: "Reset your Campus Barter password" },
        Body: {
          Html: { Data: buildResetEmailHtml(resetLink) },
          Text: {
            Data: `We received a request to reset your Campus Barter password.\n\nReset it here:\n${resetLink}\n\nIf you didn't request this, ignore this email.`,
          },
        },
      },
    });

    await ses.send(command);
    return res.status(200).json({ ok: true });
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      return res.status(200).json({ ok: true });
    }
    console.error("Reset email failed:", error);
    return res.status(500).json({ ok: false, message: error.message });
  }
}