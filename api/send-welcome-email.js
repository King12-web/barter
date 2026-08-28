import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: "us-east-1", // change this if your SES setup used a different region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { toEmail, name } = req.body;

  if (!toEmail || !name) {
    return res.status(400).json({ error: "Missing toEmail or name" });
  }

  const command = new SendEmailCommand({
    Source: "hello@campusbarter.online", // must match a verified SES identity
    Destination: { ToAddresses: [toEmail] },
    Message: {
      Subject: { Data: "Welcome to Campus Barter!" },
      Body: {
        Html: {
          Data: `<p>Hi ${name},</p><p>Welcome to Campus Barter! Your board is ready — start listing your skills and finding your first match.</p>`,
        },
      },
    },
  });

  try {
    await ses.send(command);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("SES send failed:", error);
    return res.status(500).json({ ok: false, message: error.message });
  }
}