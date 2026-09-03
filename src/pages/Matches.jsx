import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AppNav from "../components/AppNav.jsx";
import { getProfilesByInstitution, getAllProfiles } from "../lib/db.js";
import { proposeTrade } from "../lib/trades.js";
import { isEmailVerified } from "../lib/auth.js";
import VerifyEmailModal from "../components/VerifyEmailModal.jsx";
import Spinner from "../components/Spinner.jsx";
import { isMatch, overlap } from "../lib/matcher.js";

function initials(name) {
  const parts = name.trim().split(" ");
  const first = parts[0].charAt(0);
  const second = parts.length > 1 ? parts[1].charAt(0) : "";
  return (first + second).toUpperCase();
}

function Matches() {
  useEffect(() => { document.title = "Matches | Campus Barter"; }, []);
  const [currentUser, setCurrentUser] = useState(null);
  const [checked, setChecked] = useState(false);
  const [scope, setScope] = useState("campus");
  const [allPeople, setAllPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  const [modalTarget, setModalTarget] = useState(null);
  const [verifyPromptOpen, setVerifyPromptOpen] = useState(false);
  const [proposeOffer, setProposeOffer] = useState("");
  const [proposeNeed, setProposeNeed] = useState("");
  const [proposeTerms, setProposeTerms] = useState("");
  const [proposeError, setProposeError] = useState("");
  const [proposeSending, setProposeSending] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored !== null) setCurrentUser(JSON.parse(stored));
    setChecked(true);
  }, []);

  useEffect(() => {
    if (currentUser === null) { setLoading(false); return; }
    setLoading(true);

    const fetchPromise = scope === "all"
      ? getAllProfiles()
      : getProfilesByInstitution(currentUser.institution);

    fetchPromise.then((result) => {
      setAllPeople(result.ok ? result.data : []);
      setLoading(false);
    });
  }, [scope, currentUser]);

  function showToast(message) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  }

  const matches = currentUser !== null
    ? allPeople.filter((p) => p.email !== currentUser.email && isMatch(currentUser, p))
    : [];

  async function openModal(person) {
    const verified = await isEmailVerified();
    if (verified === false) {
      setVerifyPromptOpen(true);
      return;
    }
    setModalTarget(person);
    setProposeOffer(currentUser.offers[0] || "");
    setProposeNeed(person.offers[0] || "");
    setProposeTerms("");
    setProposeError("");
  }
  function closeModal() { setModalTarget(null); }

  async function sendProposal() {
    setProposeError("");
    if (proposeOffer === "" || proposeNeed === "") {
      setProposeError("Both skills are required to propose a trade.");
      return;
    }
    setProposeSending(true);
    const result = await proposeTrade(currentUser, modalTarget, proposeOffer, proposeNeed, proposeTerms.trim());
    setProposeSending(false);

    if (result.ok === false) {
      setProposeError(result.message);
      return;
    }
    closeModal();
    showToast("Proposal sent to " + modalTarget.name + ". Track it on My Trades.");
  }

  return (
    <div className="dash-shell matches-page">
      <div className="app">
        <header className="topbar">
          <div className="topbar-inner">
            <Link to="/dashboard" aria-label="Back to board">
              <svg className="icon" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
            </Link>
            <p className="title">Matches</p>
          </div>
        </header>
        <AppNav active="matches" />
        <div className="page-spacer"></div>

        <div className="body">
          {checked && currentUser === null && <div className="empty">Sign in to see your matches.</div>}

          {currentUser !== null && (
            <>
              <div className="toggle-row">
                <button className={"chip" + (scope === "campus" ? " on" : "")} onClick={() => setScope("campus")}>My campus</button>
                <button className={"chip" + (scope === "all" ? " on" : "")} onClick={() => setScope("all")}>All campuses</button>
              </div>

              {loading && <div className="empty">Loading your matches...</div>}

              {!loading && matches.length === 0 && (
                <div className="empty">
                  <svg className="icon" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                  <p>No matches here yet. Try "All campuses" or check back once more students join.</p>
                </div>
              )}

              {!loading && matches.length > 0 && (
                <div className="grid">
                  {matches.map((m) => {
                    const youGive = overlap(currentUser.offers, m.needs);
                    const youGet = overlap(m.offers, currentUser.needs);
                    return (
                      <div className="card" key={m.uid || m.email}>
                        <div className="swap-row">
                          <div className="swap-person"><div className="match-avatar av-a">{initials(currentUser.name)}</div>You</div>
                          <div className="swap-mid"><svg className="icon" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg></div>
                          <div className="swap-person"><div className="match-avatar av-b">{initials(m.name)}</div>{m.name}</div>
                        </div>
                        <p className="match-note">Your <b className="o">{youGive[0]}</b> for their <b className="n">{youGet[0]}</b></p>
                        <p className="meta">{m.institution}</p>
                        <button className="btn btn-navy" onClick={() => openModal(m)}>Propose trade</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {toast && <div className="toast-matches show">{toast}</div>}
      </div>

      {modalTarget && (
        <div style={{ display: "flex", position: "fixed", inset: 0, background: "rgba(4,56,115,0.45)", zIndex: 300, alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "var(--card)", borderRadius: "16px", padding: "20px", width: "100%", maxWidth: "380px" }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "16px", fontWeight: 800, marginBottom: "14px" }}>Propose a swap with {modalTarget.name}</p>

            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#0F6E56", marginBottom: "6px" }}>YOUR SKILL</label>
            <select style={{ width: "100%", border: "1.5px solid var(--line)", borderRadius: "9px", padding: "11px", fontFamily: "inherit", fontSize: "16px", marginBottom: "14px" }}
              value={proposeOffer} onChange={(e) => setProposeOffer(e.target.value)}>
              {currentUser.offers.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#A14E10", marginBottom: "6px" }}>THEIR SKILL</label>
            <select style={{ width: "100%", border: "1.5px solid var(--line)", borderRadius: "9px", padding: "11px", fontFamily: "inherit", fontSize: "16px", marginBottom: "14px" }}
              value={proposeNeed} onChange={(e) => setProposeNeed(e.target.value)}>
              {modalTarget.offers.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--muted)", marginBottom: "6px" }}>TERMS (OPTIONAL)</label>
            <textarea rows="2" placeholder="e.g. I'll redesign your CV, you fix my laptop."
              style={{ width: "100%", border: "1.5px solid var(--line)", borderRadius: "9px", padding: "11px", fontFamily: "inherit", fontSize: "16px", resize: "vertical", marginBottom: "6px" }}
              value={proposeTerms} onChange={(e) => setProposeTerms(e.target.value)} />
            {proposeError && <p className="error" style={{ display: "block", marginBottom: "8px" }}>{proposeError}</p>}

            <button className="btn btn-navy" onClick={sendProposal} disabled={proposeSending} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              {proposeSending && <Spinner />}
              {proposeSending ? "Sending..." : "Send proposal"}
            </button>
            <button className="btn" style={{ background: "transparent", color: "var(--muted)", marginTop: "8px" }} onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}

      <VerifyEmailModal
        open={verifyPromptOpen}
        currentUser={currentUser}
        onClose={() => setVerifyPromptOpen(false)}
      />
    </div>
  );
}

export default Matches;