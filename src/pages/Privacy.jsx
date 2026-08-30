import { useEffect } from "react";
import { Link } from "react-router-dom";

function Privacy() {
  useEffect(() => { document.title = "Privacy Policy | Campus Barter"; }, []);

  return (
    <div>
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" to="/">
            <span className="mark">
              <svg className="icon" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
            </span>
            <span className="brand-name">Campus <span>Barter</span></span>
          </Link>
        </div>
      </header>

      <div className="wrap" style={{ maxWidth: "680px", padding: "110px 22px 70px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>Privacy Policy</h1>
        <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "32px" }}>Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>

        <div style={{ fontSize: "14.5px", color: "var(--ink)", lineHeight: 1.75 }}>

          <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "28px 0 10px" }}>1. What we collect</h2>
          <p>When you join Campus Barter, we collect your name, email address, institution, WhatsApp number, and the skills you offer and need. We also store your trade history and ratings once you start trading.</p>

          <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "28px 0 10px" }}>2. What's public vs. private</h2>
          <p>Your name, institution, offered/needed skills, rating, and trade count are visible to other students browsing the board — that's how matching works. Your email and WhatsApp number are never shown publicly. Your WhatsApp number is only shared with a specific student once you've both accepted a trade together.</p>

          <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "28px 0 10px" }}>3. How we use your data</h2>
          <p>We use your information to run the core features of Campus Barter: creating your account, matching you with other students, enabling trades, and sending you account-related emails (like verifying your email address or a welcome message when you join). We do not sell your data to third parties.</p>

          <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "28px 0 10px" }}>4. Who we share data with</h2>
          <p>We use a small number of trusted service providers to run Campus Barter:</p>
          <ul style={{ paddingLeft: "20px", margin: "8px 0 0" }}>
            <li style={{ marginBottom: "6px" }}><b>Google Firebase</b> — handles account creation, sign-in, and stores your profile and trade data securely.</li>
            <li style={{ marginBottom: "6px" }}><b>Amazon Web Services (SES)</b> — sends your welcome email when you join.</li>
            <li><b>Vercel</b> — hosts the website itself.</li>
          </ul>
          <p style={{ marginTop: "10px" }}>These providers process data on our behalf under their own security and privacy standards; we don't share your data with anyone beyond what's needed to run the app.</p>

          <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "28px 0 10px" }}>5. Data security</h2>
          <p>Your account is protected by Firebase Authentication, and access to your data is controlled by security rules that only allow you to read or write your own information (with the exception of the public profile fields listed above, which any signed-in student can view).</p>

          <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "28px 0 10px" }}>6. Your choices</h2>
          <p>You can edit your offered/needed skills and WhatsApp number anytime from your profile. If you'd like your account and data deleted entirely, contact us and we'll process the request.</p>

          <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "28px 0 10px" }}>7. Changes to this policy</h2>
          <p>We may update this policy as the platform grows. We'll update the date at the top of this page when we do.</p>

          <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "28px 0 10px" }}>8. Contact</h2>
          <p>Questions about your data? Reach us at <a href="mailto:admin@campusbarter.online" style={{ color: "var(--blue)" }}>admin@campusbarter.online</a>.</p>

        </div>
      </div>
    </div>
  );
}

export default Privacy;