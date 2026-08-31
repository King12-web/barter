import { useState } from "react";
import { resendVerificationEmail } from "../lib/auth.js";

/* ============================================================
   ONE shared modal for "you need to verify your email first" —
   used by Trades (accepting), Dashboard, and Matches (proposing).
   Originally this lived only inside Trades.jsx; pulling it out
   here means Dashboard/Matches get the SAME rich, resend-capable
   modal instead of a plain toast, and there's only one copy to
   maintain if the copy or logic ever needs to change.

   Age-aware messaging: a brand-new account's verification link
   is almost certainly still valid, so telling them "it may have
   expired" would be actively wrong. Only shift to that framing
   once the account is genuinely old enough (24h) that it's a
   realistic possibility.
   ============================================================ */
function VerifyEmailModal({ open, currentUser, onClose }) {
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  if (!open) return null;

  const joinedMs = currentUser && currentUser.joined ? new Date(currentUser.joined).getTime() : 0;
  const accountAgeMs = Date.now() - joinedMs;
  const isFreshAccount = accountAgeMs < 24 * 60 * 60 * 1000;

  async function handleResend() {
    setResending(true);
    const result = await resendVerificationEmail(currentUser.email, currentUser.name);
    setResending(false);
    setResendMessage(
      result.ok
        ? "Verification email sent. Check your inbox (and spam folder)."
        : result.message
    );
  }

  return (
    <div style={{ display: "flex", position: "fixed", inset: 0, background: "rgba(4,56,115,0.45)", zIndex: 300, alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "var(--card)", borderRadius: "16px", padding: "22px", width: "100%", maxWidth: "360px", textAlign: "center" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--need-bg)", color: "#A14E10", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <svg className="icon" viewBox="0 0 24 24"><path d="M22 2 11 13" /><path d="M22 2 15 22 11 13 2 9 22 2z" /></svg>
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "16px", fontWeight: 800, marginBottom: "8px" }}>Verify your email first</p>
        <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.6, marginBottom: "16px" }}>
          {isFreshAccount
            ? "You need to verify your email to continue. We sent a link to your inbox when you signed up, check there (and spam) for it. Still can't find it? Send a new one below."
            : "You need to verify your email to continue. Your original link may have expired by now, send a fresh one below."}
        </p>

        {resendMessage && (
          <p style={{ fontSize: "12.5px", color: resendMessage.startsWith("Verification email sent") ? "var(--offer)" : "var(--danger)", marginBottom: "14px", fontWeight: 600 }}>
            {resendMessage}
          </p>
        )}

        <button className="btn btn-navy" onClick={handleResend} disabled={resending}>
          {resending ? "Sending..." : "Resend verification email"}
        </button>
        <button className="btn" style={{ background: "transparent", color: "var(--muted)", marginTop: "8px" }}
          onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default VerifyEmailModal;