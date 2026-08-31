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

function buildWelcomeEmailHtml(name, verifyLink) {
  const firstName = name.split(" ")[0];

  return `
  <div style="background:#F7FAFD; padding:32px 16px; font-family:Arial, Helvetica, sans-serif;">
    <div style="max-width:480px; margin:0 auto; background:#FFFFFF; border-radius:14px; overflow:hidden; border:1px solid #E3E9F0;">

      <div style="background:#043873; padding:28px 24px; text-align:center;">
        <p style="margin:0; color:#FFFFFF; font-size:18px; font-weight:800;">
          CAMPUS <span style="color:#FFE492;">BARTER</span>
        </p>
      </div>

      <div style="padding:32px 28px;">
        <p style="font-size:16px; color:#212529; margin:0 0 16px;">Hi ${firstName},</p>

        <p style="font-size:15px; color:#212529; line-height:1.6; margin:0 0 16px;">
          Welcome to Campus Barter! You've just joined a community where students trade real
          skills for real skills, no money involved. We're glad you're here.
        </p>

        <p style="font-size:15px; color:#212529; line-height:1.6; margin:0 0 24px;">
          One quick step before you're fully set up: verify your email below. This is what
          unlocks proposing and accepting trades on the board.
        </p>

        <table role="presentation" style="margin:0 auto 28px;">
          <tr>
            <td style="background:#FFE492; border-radius:10px;">
              <a href="${verifyLink}"
                 style="display:inline-block; padding:14px 28px; font-size:14px; font-weight:700;
                        color:#043873; text-decoration:none;">
                Verify my email
              </a>
            </td>
          </tr>
        </table>

        <p style="font-size:12.5px; color:#5B6470; line-height:1.6; margin:0 0 24px;">
          If the button doesn't work, copy and paste this link into your browser:<br />
          <span style="word-break:break-all;">${verifyLink}</span>
        </p>

        <div style="background:#F7FAFD; border-radius:10px; padding:18px 20px; margin-bottom:8px;">
          <p style="font-size:13.5px; font-weight:700; color:#043873; margin:0 0 8px;">
            A quick word on how Campus Barter works
          </p>
          <p style="font-size:13px; color:#5B6470; line-height:1.65; margin:0;">
            This board only works because students keep their word. When you propose or accept
            a trade, you're making a real commitment to another student, so please follow
            through on what you agree to. Ratings and trade history are visible on every
            profile, and they're how the whole community trusts each other. Trade fairly,
            communicate honestly, and treat every swap the way you'd want your own skills
            treated.
          </p>
        </div>
      </div>

      <div style="background:#F7FAFD; padding:18px 24px; text-align:center; border-top:1px solid #E3E9F0;">
        <p style="font-size:11.5px; color:#5B6470; margin:0;">
          Made for students, by students. Trade skills. Grow together.
        </p>
      </div>

    </div>
  </div>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { toEmail, name } = req.body;
  if (!toEmail || !name) {
    return res.status(400).json({ error: "Missing toEmail or name" });
  }

  const rateCheck = await checkRateLimit("verify:" + toEmail.toLowerCase(), 60);
  if (rateCheck.allowed === false) {
    console.error("Welcome/verification email rate-limited for", toEmail);
    return res.status(200).json({ ok: true, skipped: true });
  }

  try {
    const firebaseLink = await admin.auth().generateEmailVerificationLink(toEmail, {
      url: "https://campusbarter.online/signin",
    });
    const verifyLink = buildOwnActionLink(firebaseLink, "verifyEmail");

    const command = new SendEmailCommand({
      Source: "Campus Barter <admin@campusbarter.online>",
      Destination: { ToAddresses: [toEmail] },
      Message: {
        Subject: { Data: "Welcome to Campus Barter — verify your email to get started" },
        Body: {
          Html: { Data: buildWelcomeEmailHtml(name, verifyLink) },
          Text: {
            Data: `Hi ${name.split(" ")[0]},\n\n` +
              `Welcome to Campus Barter! You've joined a community where students trade real skills for real skills, no money involved.\n\n` +
              `Verify your email to unlock proposing and accepting trades:\n${verifyLink}\n\n` +
              `A quick word on how Campus Barter works: this board only works because students keep their word. When you propose or accept a trade, follow through on what you agree to. Ratings and trade history are visible on every profile, so trade fairly and communicate honestly.\n\n` +
              `Made for students, by students. Trade skills. Grow together.`,
          },
        },
      },
    });

    await ses.send(command);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Welcome/verification email failed:", error);
    return res.status(500).json({ ok: false, message: error.message });
  }
}