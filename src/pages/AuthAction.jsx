import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  applyActionCode, checkActionCode, confirmPasswordReset,
} from "firebase/auth";
import { auth } from "../firebase.js";

function AuthAction() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  const [status, setStatus] = useState("loading");
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setStatus("verify-error");
      return;
    }

    if (mode === "verifyEmail") {
      applyActionCode(auth, oobCode)
        .then(() => setStatus("verified"))
        .catch(() => setStatus("verify-error"));
      return;
    }

    if (mode === "resetPassword") {
      checkActionCode(auth, oobCode)
        .then((info) => {
          setResetEmail(info.data.email);
          setStatus("reset-ready");
        })
        .catch(() => setStatus("reset-error"));
      return;
    }

    setStatus("verify-error");
  }, [mode, oobCode]);

  async function handleResetSubmit() {
    setResetError("");
    if (newPassword.length < 6) {
      setResetError("Password needs at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus("reset-done");
    } catch (error) {
      setResetError("This link may have expired. Request a new reset email and try again.");
    }
    setSubmitting(false);
  }

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

      <div className="page">
        <div className="form-card" style={{ textAlign: "center" }}>

          {status === "loading" && (
            <p className="hint">Checking your link...</p>
          )}

          {status === "verified" && (
            <>
              <div className="greet-icon" style={{ background: "var(--offer-bg)", color: "var(--offer)" }}>
                <svg className="icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              </div>
              <h1>Email verified!</h1>
              <p className="hint">You're all set. Sign in to start proposing and accepting trades.</p>
              <Link className="btn btn-navy" to="/signin" style={{ display: "block", marginTop: "16px" }}>Sign in</Link>
            </>
          )}

          {status === "verify-error" && (
            <>
              <div className="greet-icon" style={{ background: "var(--need-bg)", color: "var(--need)" }}>
                <svg className="icon" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </div>
              <h1>This link isn't working</h1>
              <p className="hint">It may have expired or already been used. Sign in and you can resend a fresh verification link from there.</p>
              <Link className="btn btn-navy" to="/signin" style={{ display: "block", marginTop: "16px" }}>Go to sign in</Link>
            </>
          )}

          {status === "reset-ready" && (
            <>
              <h1>Set a new password</h1>
              <p className="hint">Resetting the password for {resetEmail}</p>

              <label htmlFor="newPassword">New password</label>
              <input id="newPassword" type="password" placeholder="At least 6 characters"
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

              <label htmlFor="confirmPassword">Confirm password</label>
              <input id="confirmPassword" type="password" placeholder="Type it again"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

              {resetError && <p className="error" style={{ display: "block" }}>{resetError}</p>}

              <button className="btn btn-navy" onClick={handleResetSubmit} disabled={submitting}>
                {submitting ? "Saving..." : "Save new password"}
              </button>
            </>
          )}

          {status === "reset-done" && (
            <>
              <div className="greet-icon" style={{ background: "var(--offer-bg)", color: "var(--offer)" }}>
                <svg className="icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              </div>
              <h1>Password updated</h1>
              <p className="hint">Sign in with your new password.</p>
              <Link className="btn btn-navy" to="/signin" style={{ display: "block", marginTop: "16px" }}>Sign in</Link>
            </>
          )}

          {status === "reset-error" && (
            <>
              <div className="greet-icon" style={{ background: "var(--need-bg)", color: "var(--need)" }}>
                <svg className="icon" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </div>
              <h1>This link isn't working</h1>
              <p className="hint">It may have expired or already been used. Request a new password reset from the sign-in page.</p>
              <Link className="btn btn-navy" to="/signin" style={{ display: "block", marginTop: "16px" }}>Go to sign in</Link>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default AuthAction;