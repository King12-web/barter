import { useEffect } from "react";
import { Link } from "react-router-dom";

function Terms() {
  useEffect(() => { document.title = "Terms of Service | Campus Barter"; }, []);

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
        <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "8px" }}>Terms of Service</h1>
        <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "32px" }}>Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>

        <div style={{ fontSize: "14.5px", color: "var(--ink)", lineHeight: 1.75 }}>

          <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "28px 0 10px" }}>1. What Campus Barter is</h2>
          <p>Campus Barter is a platform where students trade skills directly with each other, no money involved. We connect students who want to swap services; we are not a party to the trades themselves, and we don't guarantee the quality, safety, or outcome of any exchange between users.</p>

          <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "28px 0 10px" }}>2. Who can use it</h2>
          <p>Campus Barter is intended for students at Nigerian tertiary institutions. We currently do not verify enrollment status, so please use good judgment when trading with others. You must be at least 16 years old to create an account.</p>

          <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "28px 0 10px" }}>3. Your account</h2>
          <p>You're responsible for keeping your account credentials secure. The name you provide at signup cannot be changed afterward, so please make sure it's accurate. You may sign in from any device once your account is created.</p>

          <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "28px 0 10px" }}>4. Trading skills</h2>
          <p>Trades are agreements between you and another student. Campus Barter provides the tools to find matches, propose trades, and rate each other afterward, but the terms of any individual trade are between the two people involved. We encourage clear communication and following through on what you agree to.</p>

          <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "28px 0 10px" }}>5. Your WhatsApp number</h2>
          <p>Your WhatsApp number is never shown on your public profile. It's only shared with another student once you've both accepted a trade together, so you can coordinate directly.</p>

          <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "28px 0 10px" }}>6. Ratings and conduct</h2>
          <p>After a completed trade, both people can rate each other. These ratings and your trade history are visible on your public profile. We expect users to trade fairly, communicate honestly, and treat each other with respect. We may suspend or remove accounts that don't follow this.</p>

          <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "28px 0 10px" }}>7. Prohibited use</h2>
          <p>You may not use Campus Barter to trade illegal goods or services, harass other users, create fake accounts, or attempt to circumvent our verification or security systems.</p>

          <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "28px 0 10px" }}>8. Changes to these terms</h2>
          <p>We may update these terms as the platform grows. We'll update the date at the top of this page when we do.</p>

          <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "28px 0 10px" }}>9. Contact</h2>
          <p>Questions about these terms? Reach us at <a href="mailto:admin@campusbarter.online" style={{ color: "var(--blue)" }}>admin@campusbarter.online</a>.</p>

        </div>
      </div>
    </div>
  );
}

export default Terms;