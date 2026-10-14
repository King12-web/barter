// ============================================================
// Renders each email's HTML via EJS, builds the plain-text
// fallback in plain JS (a templating engine buys nothing for
// three lines of plain text, so it stays simple here on purpose).
// ============================================================
import path from "path";
import { fileURLToPath } from "url";
import ejs from "ejs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIEWS_DIR = path.join(__dirname, "..", "views", "emails");

function render(templateName, data) {
  return ejs.renderFile(path.join(VIEWS_DIR, templateName + ".ejs"), data);
}

export async function welcomeEmail(name, verifyLink) {
  const firstName = name.split(" ")[0];
  const html = await render("welcome", { name, verifyLink });
  const text =
    `Hi ${firstName},\n\n` +
    `Welcome to Campus Barter! You've joined a community where students trade real skills for real skills, no money involved.\n\n` +
    `Verify your email to unlock proposing and accepting trades:\n${verifyLink}\n\n` +
    `A quick word on how Campus Barter works: this board only works because students keep their word. When you propose or accept a trade, follow through on what you agree to. Ratings and trade history are visible on every profile, so trade fairly and communicate honestly.\n\n` +
    `Made for students, by students. Trade skills. Grow together.`;

  return { subject: "Welcome to Campus Barter — verify your email to get started", html, text };
}

export async function verificationEmail(name, verifyLink) {
  const firstName = name.split(" ")[0];
  const html = await render("verification", { name, verifyLink });
  const text =
    `Hi ${firstName},\n\nVerify your email to unlock trading on Campus Barter:\n${verifyLink}\n\n` +
    `Made for students, by students.`;

  return { subject: "Verify your email for Campus Barter", html, text };
}

export async function resetEmail(resetLink) {
  const html = await render("reset", { resetLink });
  const text =
    `We received a request to reset your Campus Barter password.\n\n` +
    `Reset it here:\n${resetLink}\n\n` +
    `If you didn't request this, ignore this email.`;

  return { subject: "Reset your Campus Barter password", html, text };
}