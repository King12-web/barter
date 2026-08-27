import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signOutUser } from "../lib/auth.js";
import { getProfilesByInstitution, getAllProfiles } from "../lib/db.js";
import { proposeTrade, recalcMyRating } from "../lib/trades.js";

const IN_PERSON = [
  "laptop repair", "phone repair", "haircut", "barbing",
  "makeup", "tailoring", "photography", "fitness coaching",
];
function isRemote(skill) {
  return IN_PERSON.includes(skill) === false;
}
function initials(name) {
  const parts = name.trim().split(" ");
  const first = parts[0].charAt(0);
  const second = parts.length > 1 ? parts[1].charAt(0) : "";
  return (first + second).toUpperCase();
}
function isMatch(me, them) {
  const theyHelpMe = them.offers.some((s) => me.needs.includes(s));
  const iHelpThem = me.offers.some((s) => them.needs.includes(s));
  return theyHelpMe && iHelpThem;
}
function overlap(offersA, needsB) {
  return offersA.filter((s) => needsB.includes(s));
}
const AV_CLASSES = ["av-0", "av-1", "av-2"];

function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showVerifyBanner = searchParams.get("verify") === "1";

  const [currentUser, setCurrentUser] = useState(null);
  const [checkedUser, setCheckedUser] = useState(false); // has the localStorage check finished?
  const [viewInstitution, setViewInstitution] = useState(null);
  const [remoteOnly, setRemoteOnly] = useState(true);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const [people, setPeople] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  /* ---- propose modal state ---- */
  const [proposeTarget, setProposeTarget] = useState(null);
  const [proposeOffer, setProposeOffer] = useState("");
  const [proposeNeed, setProposeNeed] = useState("");
  const [proposeTerms, setProposeTerms] = useState("");
  const [proposeError, setProposeError] = useState("");
  const [proposeSending, setProposeSending] = useState(false);

  /* ============================================================
     On mount: read the local profile (same job as vanilla's
     window.onload), decide the starting campus.
     ============================================================ */
  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored !== null) {
      const user = JSON.parse(stored);
      setCurrentUser(user);
      setViewInstitution(user.institution);
    } else {
      setViewInstitution("University of Lagos");
    }
    setCheckedUser(true);
  }, []);

  /* ============================================================
     Fetch people whenever viewInstitution changes (covers the
     first load AND every campus switch — one effect does both,
     since it re-runs any time viewInstitution's value changes).
     ============================================================ */
  useEffect(() => {
    if (viewInstitution === null) return; // still waiting on mount check above

    setDataLoaded(false);
    setPeople([]);

    if (currentUser !== null) {
      recalcMyRating(currentUser.uid); // self-heal my own rating; see lib/trades.js
    }

    const fetchPromise = viewInstitution === "__ALL__"
      ? getAllProfiles()
      : getProfilesByInstitution(viewInstitution);

    fetchPromise.then((result) => {
      setDataLoaded(true);
      setPeople(result.ok ? result.data : []);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewInstitution]);

  function showToast(message) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }

  function switchInstitution(value) {
    setSwitcherOpen(false);
    const away = currentUser === null || value !== currentUser.institution;
    setRemoteOnly(away);
    setViewInstitution(value); // triggers the fetch effect above
  }

  function toggleRemote() {
    setRemoteOnly((r) => !r);
  }

  async function handleSignOut() {
    await signOutUser();
    localStorage.removeItem("currentUser");
    navigate("/");
  }

  /* ---- derive the visible list every render — no separate state
     needed, this is what "render()" did in vanilla, just computed
     directly instead of manually rebuilt into innerHTML ---- */
  const viewingAll = viewInstitution === "__ALL__";
  const viewingAway = currentUser === null || viewInstitution !== currentUser.institution;

  let hiddenSkillCount = 0;
  const visible = [];
  for (const p of people) {
    if (currentUser !== null && p.email === currentUser.email) continue;
    if (viewingAll === false && p.institution !== viewInstitution) continue;

    if (searchTerm.trim().length > 0) {
      const term = searchTerm.trim().toLowerCase();
      const inName = p.name.toLowerCase().includes(term);
      const inSkills = p.offers.concat(p.needs).some((s) => s.includes(term));
      if (!inName && !inSkills) continue;
    }

    let shownOffers = p.offers;
    if (viewingAway && remoteOnly) {
      shownOffers = p.offers.filter(isRemote);
      hiddenSkillCount += p.offers.length - shownOffers.length;
      if (shownOffers.length === 0) continue;
    }

    visible.push({ person: p, shownOffers });
  }

  const matches = currentUser !== null
    ? visible.filter((v) => isMatch(currentUser, v.person))
    : [];
  const heroMatch = matches.length > 0 ? matches[0].person : null;

  const peopleTitle = viewingAll
    ? "People across campuses"
    : currentUser !== null && viewInstitution === currentUser.institution
      ? "People on your campus"
      : "People at " + viewInstitution;

  function openProposeModal(person) {
    if (currentUser === null) {
      showToast("Join the board first to propose a trade");
      return;
    }
    setProposeTarget(person);
    setProposeOffer(currentUser.offers[0] || "");
    setProposeNeed(person.offers[0] || "");
    setProposeTerms("");
    setProposeError("");
  }

  function closeProposeModal() {
    setProposeTarget(null);
  }

  async function sendProposal() {
    setProposeError("");
    if (proposeOffer === "" || proposeNeed === "") {
      setProposeError("Both skills are required to propose a trade.");
      return;
    }

    setProposeSending(true);
    const result = await proposeTrade(currentUser, proposeTarget, proposeOffer, proposeNeed, proposeTerms.trim());
    setProposeSending(false);

    if (result.ok === false) {
      setProposeError(result.message);
      return;
    }

    showToast("Proposal sent to " + proposeTarget.name + ". Check the Trades page to track it.");
    closeProposeModal();
  }

  const campusesWithPeople = []; // switcher just needs current + all + current away campus

  return (
    <div className="dash-shell">
      <div className="app">

        <header className="topbar">
          <div className="topbar-inner">
            <span className="brand-mark">
              <svg className="icon" style={{ width: "17px", height: "17px" }} viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
            </span>

            <button className="inst-switch" onClick={() => setSwitcherOpen((o) => !o)}>
              <span>{viewingAll ? "All campuses" : viewInstitution}</span>
              <svg className="icon sm" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
            </button>

            <nav className="desktop-nav" aria-label="Main">
              <button className="active">
                <svg className="icon" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                Board
              </button>
              <button onClick={() => navigate("/matches")}>
                <svg className="icon" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
                Matches
              </button>
              <button onClick={() => navigate("/trades")}>
                <svg className="icon" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                Trades
              </button>
              <button onClick={() => navigate("/profile")}>
                <svg className="icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Profile
              </button>
            </nav>

            <button className="iconbtn" aria-label="Notifications" onClick={() => navigate("/notifications")}>
              <svg className="icon" style={{ width: "17px", height: "17px" }} viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
            </button>

            {currentUser !== null && (
              <button className="iconbtn" aria-label="Sign out" onClick={handleSignOut}>
                <svg className="icon" style={{ width: "17px", height: "17px" }} viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              </button>
            )}
          </div>

          {switcherOpen && (
            <select
              className="open"
              id="instSelect"
              value={viewInstitution || ""}
              onChange={(e) => switchInstitution(e.target.value)}
            >
              {currentUser !== null && (
                <option value={currentUser.institution}>My campus — {currentUser.institution}</option>
              )}
              <option value="__ALL__">All campuses (wider search)</option>
              {viewInstitution !== "__ALL__" && (currentUser === null || viewInstitution !== currentUser.institution) && (
                <option value={viewInstitution}>{viewInstitution}</option>
              )}
            </select>
          )}
        </header>

        <div className="page-spacer"></div>

        <div className="body">
          {currentUser === null && (
            <div className="banner">
              You are browsing as a guest. Open the onboarding page (<a href="/join">join</a>) to join the board, or <a href="/signin">sign in</a> if you already have.
            </div>
          )}

          {showVerifyBanner && (
            <div className="banner verify-banner">
              <svg className="icon sm" viewBox="0 0 24 24"><path d="M22 2 11 13" /><path d="M22 2 15 22 11 13 2 9 22 2z" /></svg>
              <span>Verify your email to unlock proposing and accepting trades. Check your inbox (and spam) for the link.</span>
            </div>
          )}

          <div className="search-wrap">
            <svg className="icon sm" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" placeholder="Search skills or people" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="filter-row">
            {viewingAway && (
              <>
                <button className={"chip " + (remoteOnly ? "on" : "off")} onClick={toggleRemote}>
                  {remoteOnly && <svg className="icon sm" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>}
                  Remote-friendly only
                </button>
                {remoteOnly && hiddenSkillCount > 0 && (
                  <span className="chip-note">({hiddenSkillCount} in-person skills hidden)</span>
                )}
              </>
            )}
          </div>

          {!dataLoaded && (
            <>
              <p className="section-title">Loading the board...</p>
              <div className="empty">
                <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                <p>Fetching students from your campus...</p>
              </div>
            </>
          )}

          {dataLoaded && heroMatch && (
            <>
              <p className="section-title">
                <svg className="icon sm" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                New match for you
              </p>
              <div className="card match-hero">
                <svg className="hero-curve" viewBox="0 0 200 200" aria-hidden="true">
                  <path d="M 5 100 Q 50 20 100 60 T 195 50" />
                  <path d="M 5 130 Q 60 50 110 90 T 195 80" />
                </svg>
                <div className="swap-row">
                  <div className="swap-person"><div className="avatar av-0">{initials(currentUser.name)}</div>You</div>
                  <div className="swap-mid"><svg className="icon" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg></div>
                  <div className="swap-person"><div className="avatar av-2">{initials(heroMatch.name)}</div>{heroMatch.name}</div>
                </div>
                <p className="match-note">
                  Your <b className="o">{overlap(currentUser.offers, heroMatch.needs)[0]}</b> for their <b className="n">{overlap(heroMatch.offers, currentUser.needs)[0]}</b>
                </p>
                <button className="btn btn-navy" onClick={() => openProposeModal(heroMatch)}>Propose trade</button>
              </div>
            </>
          )}

          {dataLoaded && (
            <>
              <p className="section-title">{peopleTitle}</p>

              {visible.length === 0 && (
                <div className="empty">
                  <svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  <p>{viewingAway
                    ? "No one to show here yet. Try another campus, clear filters, or check back soon."
                    : "Your campus board is quiet right now. Share Campus Barter with friends to get it started."}</p>
                </div>
              )}

              <div id="peopleList">
                {visible.map((v, i) => (
                  <div className="card" key={v.person.uid || v.person.email}>
                    <div className="person-top">
                      <div className={"avatar " + AV_CLASSES[i % AV_CLASSES.length]}>{initials(v.person.name)}</div>
                      <div>
                        <p className="name">{v.person.name}</p>
                        <p className="meta">
                          {v.person.institution} &middot;{" "}
                          <svg className="icon sm fill" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>{" "}
                          {v.person.rating == null ? "New" : v.person.rating.toFixed(1)} &middot; {v.person.trades || 0} trades
                        </p>
                      </div>
                    </div>
                    <div className="skill-split">
                      <div className="skill-panel o"><p className="skill-panel-label">OFFERS</p><p className="skill-panel-list">{v.shownOffers.join(", ")}</p></div>
                      <div className="skill-panel n"><p className="skill-panel-label">NEEDS</p><p className="skill-panel-list">{v.person.needs.length > 0 ? v.person.needs.join(", ") : "nothing listed"}</p></div>
                    </div>
                    <button className="btn btn-outline" onClick={() => openProposeModal(v.person)}>Propose swap</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {toast && <div id="toast" className="show">{toast}</div>}

        <nav className="navbar">
          <div className="navbar-inner">
            <button className="nav-item active">
              <svg className="icon" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              Board
            </button>
            <button className="nav-item" onClick={() => navigate("/matches")}>
              <svg className="icon" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
              Matches
            </button>
            <button className="nav-item" onClick={() => navigate("/trades")}>
              <svg className="icon" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
              Trades
            </button>
            <button className="nav-item" onClick={() => navigate("/profile")}>
              <svg className="icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              Profile
            </button>
          </div>
        </nav>

        {proposeTarget && (
          <div style={{ display: "flex", position: "fixed", inset: 0, background: "rgba(4,56,115,0.45)", zIndex: 300, alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <div style={{ background: "var(--card)", borderRadius: "16px", padding: "20px", width: "100%", maxWidth: "380px", maxHeight: "85vh", overflowY: "auto" }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "16px", fontWeight: 800, marginBottom: "14px" }}>Propose a swap with {proposeTarget.name}</p>

              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#0F6E56", marginBottom: "6px" }}>YOUR SKILL</label>
              <select style={{ width: "100%", border: "1.5px solid var(--line)", borderRadius: "9px", padding: "11px", fontFamily: "inherit", fontSize: "13px", marginBottom: "14px" }}
                value={proposeOffer} onChange={(e) => setProposeOffer(e.target.value)}>
                {currentUser.offers.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#A14E10", marginBottom: "6px" }}>THEIR SKILL</label>
              <select style={{ width: "100%", border: "1.5px solid var(--line)", borderRadius: "9px", padding: "11px", fontFamily: "inherit", fontSize: "13px", marginBottom: "14px" }}
                value={proposeNeed} onChange={(e) => setProposeNeed(e.target.value)}>
                {proposeTarget.offers.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--muted)", marginBottom: "6px" }}>TERMS (OPTIONAL)</label>
              <textarea rows="2" placeholder="e.g. I'll redesign your CV, you fix my laptop."
                style={{ width: "100%", border: "1.5px solid var(--line)", borderRadius: "9px", padding: "11px", fontFamily: "inherit", fontSize: "13px", resize: "vertical", marginBottom: "6px" }}
                value={proposeTerms} onChange={(e) => setProposeTerms(e.target.value)} />
              {proposeError && <p className="error" style={{ display: "block", marginBottom: "10px" }}>{proposeError}</p>}

              <button className="btn btn-navy" style={{ marginTop: "4px" }} onClick={sendProposal} disabled={proposeSending}>
                {proposeSending ? "Sending..." : "Send proposal"}
              </button>
              <button className="btn" style={{ background: "transparent", color: "var(--muted)", marginTop: "8px" }} onClick={closeProposeModal}>Cancel</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;