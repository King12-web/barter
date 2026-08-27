import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signIn, resetPassword } from "../lib/auth.js";
import { getProfile } from "../lib/db.js";

function SignIn() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passError, setPassError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [btnText, setBtnText] = useState("Sign in");

  /* Notice is split into a bold LEAD phrase + a plain-text rest,
     matching the original's <b>...</b> emphasis instead of
     flattening everything into one plain string. */
  const [noticeLead, setNoticeLead] = useState("");
  const [noticeRest, setNoticeRest] = useState("");

  const emailShape = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function clearNotice() {
    setNoticeLead("");
    setNoticeRest("");
  }

  async function handleSignIn() {
    setEmailError(false);
    setPassError(false);
    clearNotice();

    let ok = true;
    const emailValue = email.trim().toLowerCase();
    if (emailShape.test(emailValue) === false) { setEmailError(true); ok = false; }
    if (password.length === 0) { setPassError(true); ok = false; }
    if (!ok) return;

    setLoading(true);
    setBtnText("Signing you in...");

    const result = await signIn(emailValue, password);

    if (result.ok === false) {
      setLoading(false);
      setBtnText("Sign in");
      setNoticeLead("Couldn't sign you in.");
      setNoticeRest(result.message);
      return;
    }

    setBtnText("Loading your profile...");
    const profileResult = await getProfile(result.user.uid);

    if (profileResult.ok && profileResult.data !== null) {
      const currentUser = { uid: result.user.uid, ...profileResult.data };
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }

    if (result.user.emailVerified === false) {
      navigate("/dashboard?verify=1");
      return;
    }
    navigate("/dashboard");
  }

  async function handleForgotPassword() {
    setEmailError(false);
    clearNotice();
    const emailValue = email.trim().toLowerCase();

    if (emailShape.test(emailValue) === false) {
      setEmailError(true);
      setNoticeRest("Type your email above first, then tap Forgot password again.");
      return;
    }

    const result = await resetPassword(emailValue);
    if (result.ok) {
      setNoticeLead("Reset email sent to " + emailValue + ".");
      setNoticeRest("Check your inbox (and spam folder), follow the link, then come back and sign in.");
    } else {
      setNoticeLead("Couldn't send the reset email.");
      setNoticeRest(result.message);
    }
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
          <p className="topbar-note">New here? <Link to="/join">Join the board</Link></p>
        </div>
      </header>

      <div className="page">
        <div className="form-card">
          <div className="greet-icon">
            <svg className="icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </div>

          <h1>Welcome back to the board</h1>
          <p className="hint">Sign in to see your matches and trades.</p>

          <label htmlFor="email">Email address</label>
          <input
            type="email" id="email" placeholder="e.g. adaeze@gmail.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          {emailError && <p className="error">Enter a valid email address.</p>}

          <label htmlFor="password">Password</label>
          <div className="field">
            <input
              type={showPassword ? "text" : "password"} id="password" placeholder="Your password"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="peek" onClick={() => setShowPassword(!showPassword)} aria-label="Show or hide password">
              <svg className="icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            </button>
          </div>
          {passError && <p className="error">Enter your password.</p>}

          <a className="forgot" href="#" onClick={(e) => { e.preventDefault(); handleForgotPassword(); }}>Forgot password?</a>

          <button className="btn btn-navy" onClick={handleSignIn} disabled={loading}>{btnText}</button>

          {(noticeLead || noticeRest) && (
            <div className="notice">
              {noticeLead && <b>{noticeLead} </b>}
              {noticeRest}
            </div>
          )}

          <div className="divider">or</div>
          <p className="join-link">Don't have an account yet? <Link to="/join">Join the board free</Link></p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;