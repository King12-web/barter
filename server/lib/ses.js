// ============================================================
// Shared AWS SES client.
// ------------------------------------------------------------
// Same reasoning as firebaseAdmin.js: one client, constructed
// once per process, instead of three copies of the same
// SESClient({ region, credentials }) block. No behavior change —
// this is purely removing duplication so AWS_ACCESS_KEY_ID /
// AWS_SECRET_ACCESS_KEY are read in exactly one place.
// ============================================================
import { SESClient } from "@aws-sdk/client-ses";

const ses = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default ses;