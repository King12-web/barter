import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner.jsx";
import AppNav from "../components/AppNav.jsx";
import { signOutUser } from "../lib/auth.js";
import { getProfile, saveProfile } from "../lib/db.js";
import { recalcMyRating } from "../lib/trades.js";
import { logActivity } from "../lib/activity.js";
import GuidelinesModal from "../components/GuidelinesModal.jsx";
import SuggestionModal from "../components/SuggestionModal.jsx";

function initials(name) {
  const parts = name.trim().split(" ");
  const first = parts[0].charAt(0);
  const second = parts.length > 1 ? parts[1].charAt(0) : "";
  return (first + second).toUpperCase();
}

function textToSkillArray(text) {
  return text.split(",").map((s) => s.trim().toLowerCase()).filter((s) => s.length > 0);
}

function Profile() {
  useEffect(() => { document.title = "My Profile | Campus Barter"; }, []);
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [checked, setChecked] = useState(false);

  const [offersInput, setOffersInput] = useState("");
  const [needsInput, setNeedsInput] = useState("");
  const [whatsappInput, setWhatsappInput] = useState("");

  const [saveError, setSaveError] = useState("");
  const [showSaved, setShowSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [suggestionOpen, setSuggestionOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored === null) {
      setChecked(true);
      return;
    }
    const user = JSON.parse(stored);

    recalcMyRating(user.uid).then(() => {
      getProfile(user.uid).then((result) => {
        const fresh = result.ok && result.data !== null
          ? { uid: user.uid, ...result.data }
          : user;
        setCurrentUser(fresh);
        setOffersInput(fresh.offers.join(", "));
        setNeedsInput(fresh.needs.join(", "));
        setWhatsappInput(fresh.whatsapp);
        localStorage.setItem("currentUser", JSON.stringify(fresh));
        setChecked(true);
      });
    });
  }, []);

  async function handleSave() {
    setSaveError("");
    setShowSaved(false);

    const offers = textToSkillArray(offersInput);
    const needs = textToSkillArray(needsInput);

    if (offers.length === 0) {
      setSaveError("List at least one skill you offer.");
      return;
    }

    const digits = whatsappInput.replace(/\D/g, "");
    const nigerianShape = /^(0[7-9][0-1]\d{8}|234[7-9][0-1]\d{8})$/;
    if (nigerianShape.test(digits) === false) {
      setSaveError("Enter a real Nigerian mobile number (e.g. 08012345678).");
      return;
    }

    setSaving(true);
    const updates = { offers, needs, whatsapp: digits };
    const result = await saveProfile(currentUser.uid, updates);
    setSaving(false);

    if (result.ok === false) {
      setSaveError(result.message);
      return;
    }

    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    localStorage.setItem("currentUser", JSON.stringify(updated));
    setShowSaved(true);

    logActivity(currentUser.uid, "Your profile changes were saved successfully.");
  }

  function requestSignOut() {
    setSignOutConfirmOpen(true);
  }

  async function confirmSignOut() {
    setSignOutConfirmOpen(false);
    await signOutUser();
    localStorage.removeItem("currentUser");
    navigate("/");
  }

  return (
    <div className="dash-shell profile-page">
      <div className="app">
        <header className="topbar">
          <div className="topbar-inner">
            <Link to="/dashboard" aria-label="Back to board">
              <svg className="icon" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
            </Link>
            <p className="title">My profile</p>
          </div>
        </header>
        <AppNav active="profile" />
        <div className="page-spacer"></div>

        <div className="body">
          {!checked && <div className="empty">Loading your profile...</div>}

          {checked && currentUser === null && (
            <div className="empty">
              Sign in to view your profile. <br /><br />
              <Link to="/signin" style={{ color: "var(--blue)", fontWeight: 700 }}>Sign in</Link>
            </div>
          )}

          {checked && currentUser !== null && (
            <>
              <div className="profile-head">
                <div className="avatar-lg">{initials(currentUser.name)}</div>
                <p className="profile-name">{currentUser.name}</p>
                <p className="profile-meta">{currentUser.institution} &middot; {currentUser.email}</p>
                <div className="stat-row">
                  <div className="stat"><p className="num">{currentUser.rating == null ? "New" : currentUser.rating}</p><p className="lbl">RATING</p></div>
                  <div className="stat"><p className="num">{currentUser.trades || 0}</p><p className="lbl">TRADES</p></div>
                </div>
              </div>

              <div className="card">
                <h2 className="o">Skills you offer</h2>
                <textarea rows="2" value={offersInput} onChange={(e) => setOffersInput(e.target.value)} />
                <div className="tag-preview">
                  {textToSkillArray(offersInput).map((s) => <span className="tag offer" key={s}>{s}</span>)}
                </div>
                <p className="hint">Separate with commas.</p>
              </div>

              <div className="card">
                <h2 className="n">Skills you need</h2>
                <textarea rows="2" value={needsInput} onChange={(e) => setNeedsInput(e.target.value)} />
                <div className="tag-preview">
                  {textToSkillArray(needsInput).map((s) => <span className="tag need" key={s}>{s}</span>)}
                </div>
                <p className="hint">Separate with commas. Optional.</p>
              </div>

              <div className="card">
                <h2>WhatsApp number</h2>
                <input type="tel" value={whatsappInput} onChange={(e) => setWhatsappInput(e.target.value)} />
                <p className="hint">Only shared when you accept a trade. Never on your profile.</p>
              </div>

              <button className="btn btn-navy" onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {saving && <Spinner />}
                {saving ? "Saving..." : "Save changes"}
              </button>
              {saveError && <p className="error" style={{ display: "block" }}>{saveError}</p>}
              {showSaved && <p className="saved-note">Saved.</p>}

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button className="btn btn-navy" style={{ flex: 1, width: "auto", marginTop: 0 }} onClick={() => setGuidelinesOpen(true)}>
                  <svg className="icon sm" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  Community guidelines
                </button>
                <button className="btn btn-navy" style={{ flex: 1, width: "auto", marginTop: 0 }} onClick={() => setSuggestionOpen(true)}>
                  <svg className="icon sm" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                  Suggest a feature
                </button>
              </div>

              <button className="btn btn-danger-outline" onClick={requestSignOut}>
                <svg className="icon sm" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                Sign out
              </button>
            </>
          )}
        </div>

        {signOutConfirmOpen && (
          <div style={{ display: "flex", position: "fixed", inset: 0, background: "rgba(4,56,115,0.45)", zIndex: 300, alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <div style={{ background: "var(--card)", borderRadius: "16px", padding: "22px", width: "100%", maxWidth: "340px", textAlign: "center" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--need-bg)", color: "#A14E10", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <svg className="icon" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              </div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "16px", fontWeight: 800, marginBottom: "8px" }}>Sign out?</p>
              <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.6, marginBottom: "18px" }}>
                You'll need to sign in again to see your matches and trades.
              </p>
              <button className="btn btn-navy" onClick={confirmSignOut}>Yes, sign out</button>
              <button className="btn" style={{ background: "transparent", color: "var(--muted)", marginTop: "8px" }}
                onClick={() => setSignOutConfirmOpen(false)}>Cancel</button>
            </div>
          </div>
        )}

        <GuidelinesModal open={guidelinesOpen} onClose={() => setGuidelinesOpen(false)} />
        <SuggestionModal open={suggestionOpen} currentUser={currentUser} onClose={() => setSuggestionOpen(false)} />
      </div>
    </div>
  );
}

export default Profile;