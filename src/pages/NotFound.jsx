import { useEffect } from "react";
import { Link } from "react-router-dom";

function NotFound() {
  useEffect(() => { document.title = "Page not found | Campus Barter"; }, []);

  return (
    <div className="dash-shell">
      <div className="app" style={{ justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: "40px 24px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "16px",
            background: "var(--yellow)", color: "var(--navy)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <svg className="icon" style={{ width: "26px", height: "26px" }} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "22px", fontWeight: 800, marginBottom: "8px" }}>
            Page not found
          </p>
          <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: 1.6, marginBottom: "26px", maxWidth: "320px", marginLeft: "auto", marginRight: "auto" }}>
            That page doesn't exist, or the link may be outdated. Let's get you back on track.
          </p>

          <Link
            className="btn btn-navy"
            to="/"
            style={{ display: "inline-flex", width: "auto", padding: "13px 28px", marginTop: 0 }}
          >
            Back to Campus Barter
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;