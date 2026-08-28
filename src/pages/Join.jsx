import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUp } from "../lib/auth.js";
import { saveProfile } from "../lib/db.js";
import { INSTITUTIONS, INSTITUTION_NAMES } from "../data/institutions.js";

function textToSkillArray(text) {
  return text
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
}

function Join() {
  const navigate = useNavigate();

  // ---- which step is showing, or "done" for the success screen ----
  const [step, setStep] = useState(1);
  const [returningName, setReturningName] = useState(null);

  // ---- step 1: account ----
  const [fullName, setFullName] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — never shown to real users
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  // ---- step 2: campus ----
  const [institution, setInstitution] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [suggestHits, setSuggestHits] = useState([]);
  const [suggestOpen, setSuggestOpen] = useState(false);

  // ---- steps 3 & 4: skills ----
  const [offersInput, setOffersInput] = useState("");
  const [needsInput, setNeedsInput] = useState("");

  // ---- errors, one boolean per field, matching vanilla exactly ----
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passError, setPassError] = useState(false);
  const [pass2Error, setPass2Error] = useState(false);
  const [instError, setInstError] = useState(false);
  const [waError, setWaError] = useState(false);
  const [offersError, setOffersError] = useState(false);
  const [signupError, setSignupError] = useState("");

  const [loadingStage, setLoadingStage] = useState(null); // null | "creating" | "saving"

  /* ============================================================
     useEffect #1 — runs once when the page first loads.
     This replaces vanilla's "window.onload": check if a profile
     already exists on this device, and if so, skip straight to
     a "welcome back" screen instead of the form.
     The empty [] at the end means "run this only once, on mount."
     ============================================================ */
  useEffect(() => {
    const existing = localStorage.getItem("currentUser");
    if (existing !== null) {
      const user = JSON.parse(existing);
      setReturningName(user.name.split(" ")[0]);
      setStep("done");
    }
  }, []);

  /* ============================================================
     useEffect #2 — "click outside closes the suggestion panel."
     This is the React way to do document.addEventListener: attach
     the listener when the component mounts, and — critically —
     REMOVE it when the component unmounts (the function returned
     from useEffect is the cleanup). Forgetting cleanup is how
     React apps leak memory over time.

     suggestBoxRef is a useRef — a direct handle to a real DOM
     element, for the rare cases (like "did they click inside this
     box?") that state alone can't answer.
     ============================================================ */
  const suggestBoxRef = useRef(null);

  useEffect(() => {
    function handleDocClick(event) {
      if (suggestBoxRef.current && !suggestBoxRef.current.contains(event.target)) {
        setSuggestOpen(false);
      }
    }
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  function runInstitutionSearch(value) {
    const term = value.trim().toLowerCase();
    if (term.length < 2) {
      setSuggestOpen(false);
      return;
    }
    const hits = INSTITUTIONS.filter(
      (inst) => inst.name.toLowerCase().includes(term) || inst.code.toLowerCase().includes(term)
    ).slice(0, 8);
    setSuggestHits(hits);
    setSuggestOpen(true);
  }

  function handleInstitutionChange(value) {
    setInstitution(value);
    runInstitutionSearch(value);
  }

  function pickInstitution(name) {
    setInstitution(name);
    setSuggestOpen(false);
  }

  function clearAllErrors() {
    setNameError(false);
    setEmailError(false);
    setPassError(false);
    setPass2Error(false);
    setInstError(false);
    setWaError(false);
    setOffersError(false);
    setSignupError("");
  }

  function attemptGoToStep(n) {
    clearAllErrors();

    if (n === 2 && step === 1) {
      if (website !== "") return;

      let ok = true;
      if (fullName.trim().length < 2) { setNameError(true); ok = false; }

      const emailShape = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailShape.test(email.trim()) === false) { setEmailError(true); ok = false; }

      if (password.length < 6) { setPassError(true); ok = false; }
      if (password.length >= 6 && password2 !== password) { setPass2Error(true); ok = false; }

      if (!ok) return;
    }

    if (n === 3 && step === 2) {
      let ok = true;
      const instValue = institution.trim();
      if (instValue === "" || (INSTITUTION_NAMES.includes(instValue) === false && instValue !== "Other")) {
        setInstError(true); ok = false;
      }

      const digits = whatsapp.replace(/\D/g, "");
      const nigerianShape = /^(0[7-9][0-1]\d{8}|234[7-9][0-1]\d{8})$/;
      if (nigerianShape.test(digits) === false) { setWaError(true); ok = false; }

      if (!ok) return;
    }

    if (n === 4 && step === 3) {
      if (textToSkillArray(offersInput).length === 0) {
        setOffersError(true);
        return;
      }
    }

    setStep(n);
    window.scrollTo(0, 0);
  }

  async function handleSubmit() {
    setSignupError("");
    setLoadingStage("creating");

    const result = await signUp(email.trim().toLowerCase(), password);

    if (result.ok === false) {
      setLoadingStage(null);
      setSignupError(result.message);
      return;
    }

    const digits = whatsapp.replace(/\D/g, "");
    const profile = {
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      institution: institution.trim(),
      whatsapp: digits,
      offers: textToSkillArray(offersInput),
      needs: textToSkillArray(needsInput),
      rating: null,
      trades: 0,
      joined: new Date().toISOString(),
    };

    setLoadingStage("saving");
    const saveResult = await saveProfile(result.user.uid, profile);
    if (saveResult.ok === false) {
      console.error("Cloud profile save failed:", saveResult.message);
    }

    const currentUser = { uid: result.user.uid, ...profile };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    /* Fire-and-forget: a welcome email failing to send should
       NEVER block someone from finishing signup. We don't await
       this or check its result before showing the success screen —
       worst case, they just don't get a welcome email, which is
       far better than being stuck on a loading spinner because
       of an email server hiccup. */
    fetch("/api/send-welcome-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toEmail: profile.email, name: profile.name }),
    }).catch((error) => {
      console.error("Welcome email failed to send:", error);
    });

    setLoadingStage(null);
    setStep("done");
  }

  const joinBtnText =
    loadingStage === "creating" ? "Creating your account..." :
    loadingStage === "saving" ? "Saving your profile..." :
    "Join the board";

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
          <p className="topbar-note">Already on the board? <Link to="/signin">Sign in</Link></p>
        </div>
      </header>

      <div className="page">
        <div className="form-card">

          {step !== "done" && (
            <div className="progress">
              {[1, 2, 3, 4].map((i) => (
                <span key={i} className={"p-dot " + (i < step ? "done" : i === step ? "now" : "")}></span>
              ))}
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="step-label">Step 1 of 4</p>
              <h1>Create your account</h1>
              <p className="hint">This gets you on the board. Your campus is next.</p>

              <label htmlFor="fullName">Full name</label>
              <input id="fullName" type="text" placeholder="e.g. Adaeze Michael" autoFocus
                value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <p className="field-note">This can't be changed after you join, so make sure it's right.</p>
              {nameError && <p className="error" style={{ display: "block" }}>Enter your name to continue.</p>}

              <div className="hp-field" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" type="text" tabIndex="-1" autoComplete="off"
                  value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>

              <label htmlFor="email">Email address</label>
              <input id="email" type="email" placeholder="e.g. adaeze@gmail.com" autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)} />
              {emailError && <p className="error" style={{ display: "block" }}>Enter a valid email address.</p>}

              <label htmlFor="password">Password</label>
              <div className="field">
                <input id="password" type={showPass1 ? "text" : "password"} placeholder="At least 6 characters" autoComplete="new-password"
                  value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="peek" onClick={() => setShowPass1(!showPass1)} aria-label="Show or hide password">
                  <svg className="icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                </button>
              </div>
              {passError && <p className="error" style={{ display: "block" }}>Password needs at least 6 characters.</p>}

              <label htmlFor="password2">Confirm password</label>
              <div className="field">
                <input id="password2" type={showPass2 ? "text" : "password"} placeholder="Type it again" autoComplete="new-password"
                  value={password2} onChange={(e) => setPassword2(e.target.value)} />
                <button type="button" className="peek" onClick={() => setShowPass2(!showPass2)} aria-label="Show or hide password">
                  <svg className="icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                </button>
              </div>
              {pass2Error && <p className="error" style={{ display: "block" }}>Passwords don't match.</p>}

              <button className="btn btn-navy" onClick={() => attemptGoToStep(2)}>Continue</button>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="step-label">Step 2 of 4</p>
              <h1>Your campus</h1>
              <p className="hint">Your board starts at your own institution.</p>

              <label htmlFor="institution">Institution</label>
              <div className="field" ref={suggestBoxRef}>
                <input id="institution" type="text" placeholder="Start typing, e.g. Lagos or YCT" autoComplete="off"
                  value={institution}
                  onChange={(e) => handleInstitutionChange(e.target.value)}
                  onFocus={() => runInstitutionSearch(institution)}
                />
                <div className={"suggest" + (suggestOpen ? " open" : "")}>
                  {suggestHits.length === 0 && <p className="s-empty">No match found. Pick "Other" below.</p>}
                  {suggestHits.map((hit) => (
                    <button type="button" key={hit.name} onClick={() => pickInstitution(hit.name)}>
                      <span className="s-name">{hit.name}</span>
                      <span className="s-code">{hit.code}</span>
                    </button>
                  ))}
                  <button type="button" onClick={() => pickInstitution("Other")}>
                    <span className="s-name">Other</span>
                    <span className="s-code">My institution is not listed</span>
                  </button>
                </div>
              </div>
              <p className="field-note">Can't find yours? Type it and pick "Other" from the suggestions.</p>
              {instError && <p className="error" style={{ display: "block" }}>Choose an institution from the list. Your board starts there.</p>}

              <label htmlFor="whatsapp">WhatsApp number</label>
              <input id="whatsapp" type="tel" placeholder="e.g. 08012345678"
                value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              <p className="field-note trust">
                <svg viewBox="0 0 24 24" style={{ width: "13px", height: "13px", stroke: "currentColor", fill: "none", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", verticalAlign: "-2px" }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                {" "}Only shared when you accept a trade. Never on your profile.
              </p>
              {waError && <p className="error" style={{ display: "block" }}>Enter a real Nigerian mobile number (e.g. 08012345678).</p>}

              <button className="btn btn-navy" onClick={() => attemptGoToStep(3)}>Continue</button>
              <button className="btn btn-ghost" onClick={() => attemptGoToStep(1)}>Back</button>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="step-label">Step 3 of 4</p>
              <h1>What can you do? <span style={{ color: "var(--offer)" }}>•</span></h1>
              <p className="hint">List skills you can offer other students. Separate with commas.</p>

              <label htmlFor="offersInput">Skills you offer</label>
              <input id="offersInput" type="text" placeholder="e.g. CV design, maths tutoring"
                value={offersInput} onChange={(e) => setOffersInput(e.target.value)} />
              <div className="tag-preview">
                {textToSkillArray(offersInput).map((s) => <span className="tag offer" key={s}>{s}</span>)}
              </div>
              {offersError && <p className="error" style={{ display: "block" }}>Add at least one skill. Everyone brings something.</p>}

              <button className="btn btn-navy" onClick={() => attemptGoToStep(4)}>Continue</button>
              <button className="btn btn-ghost" onClick={() => attemptGoToStep(2)}>Back</button>
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="step-label">Step 4 of 4</p>
              <h1>What do you need? <span style={{ color: "var(--need)" }}>•</span></h1>
              <p className="hint">Skills you're looking for. This is how matches find you. Optional, you can add more later.</p>

              <label htmlFor="needsInput">Skills you need</label>
              <input id="needsInput" type="text" placeholder="e.g. laptop repair, public speaking"
                value={needsInput} onChange={(e) => setNeedsInput(e.target.value)} />
              <div className="tag-preview">
                {textToSkillArray(needsInput).map((s) => <span className="tag need" key={s}>{s}</span>)}
              </div>

              <button className="btn btn-yellow" onClick={handleSubmit} disabled={loadingStage !== null}>{joinBtnText}</button>
              {signupError && <p className="error" style={{ display: "block", marginTop: "12px" }}>{signupError}</p>}
              <button className="btn btn-ghost" onClick={() => attemptGoToStep(3)}>Back</button>
            </div>
          )}

          {step === "done" && (
            <div className="success">
              <p className="big">
                <svg viewBox="0 0 24 24" style={{ width: "54px", height: "54px", stroke: "#16A34A", fill: "none", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </p>
              <h1>You're on the board!</h1>
              <p className="hint">
                {returningName
                  ? "Welcome back, " + returningName + ". You're already set up."
                  : fullName.split(" ")[0] + ", we sent a verification link to your email. Verify it, then your board at " + institution + " is waiting."}
              </p>
              <button className="btn btn-navy" onClick={() => navigate("/signin")}>Sign in to continue</button>
              <p className="hint" style={{ marginTop: "8px" }}>Signing in confirms your account works and checks your verification status.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Join;