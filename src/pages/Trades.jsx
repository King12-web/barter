import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  getMyTrades, acceptTrade, declineTrade, completeTrade, rateTrade, recalcMyRating,
} from "../lib/trades.js";
import { isEmailVerified, resendVerificationEmail } from "../lib/auth.js";

function initials(name) {
  const parts = name.trim().split(" ");
  const first = parts[0].charAt(0);
  const second = parts.length > 1 ? parts[1].charAt(0) : "";
  return (first + second).toUpperCase();
}

function myRole(trade, uid) {
  return trade.proposerUid === uid ? "proposer" : "receiver";
}

function whatsappLink(trade, role) {
  const theirNumber = role === "proposer" ? trade.receiverWhatsapp : trade.proposerWhatsapp;
  const theirName = role === "proposer" ? trade.receiverName : trade.proposerName;
  const mySkill = role === "proposer" ? trade.offeredSkill : trade.requestedSkill;
  const theirSkill = role === "proposer" ? trade.requestedSkill : trade.offeredSkill;
  const message = `Hi ${theirName}! Campus Barter match: my ${mySkill} for your ${theirSkill}. When works for you?`;

  let digits = theirNumber.replace(/\D/g, "");
  if (digits.charAt(0) === "0") digits = "234" + digits.slice(1);
  return "https://wa.me/" + digits + "?text=" + encodeURIComponent(message);
}

function StarRow({ tradeId, selected, onPick }) {
  return (
    <div className="rating-row">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i} type="button"
          className={"star-btn" + (i <= selected ? " on" : "")}
          onClick={() => onPick(tradeId, i)}
          aria-label={i + " stars"}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function TradeCard({ trade, uid, onAccept, onDecline, onComplete, onRate, pendingStar, onPickStar }) {
  const role = myRole(trade, uid);
  const theirName = role === "proposer" ? trade.receiverName : trade.proposerName;
  const mySkill = role === "proposer" ? trade.offeredSkill : trade.requestedSkill;
  const theirSkill = role === "proposer" ? trade.requestedSkill : trade.offeredSkill;
  const iAmReceiver = role === "receiver";
  const statusLabel = trade.status.charAt(0).toUpperCase() + trade.status.slice(1);

  const myRatingField = role === "proposer" ? "proposerRating" : "receiverRating";
  const alreadyRated = trade[myRatingField] !== null && trade[myRatingField] !== undefined;

  return (
    <div className="card">
      <div className="trade-top">
        <div className="trade-avatar">{initials(theirName)}</div>
        <div>
          <p className="trade-name">{theirName}</p>
          <p className="trade-sub">{role === "proposer" ? "You proposed" : "They proposed"}</p>
        </div>
        <span className={"status st-" + trade.status}>{statusLabel}</span>
      </div>

      <div className="skill-row">
        <div className="skill-col o"><p className="lbl">YOU GIVE</p><p className="val">{mySkill}</p></div>
        <div className="skill-col n"><p className="lbl">YOU GET</p><p className="val">{theirSkill}</p></div>
      </div>

      {trade.terms && <p className="terms">{trade.terms}</p>}

      {trade.status === "pending" && (
        iAmReceiver ? (
          <div className="btn-row">
            <button className="btn btn-green" onClick={() => onAccept(trade.id)}>Accept</button>
            <button className="btn btn-danger-outline" onClick={() => onDecline(trade.id)}>Decline</button>
          </div>
        ) : (
          <p className="trade-sub" style={{ textAlign: "center", marginTop: "4px" }}>Waiting for {theirName} to respond.</p>
        )
      )}

      {trade.status === "accepted" && (
        <>
          <a className="btn btn-green" href={whatsappLink(trade, role)} target="_blank" rel="noopener noreferrer">
            <svg className="icon sm" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
            Chat on WhatsApp
          </a>
          <button className="btn btn-outline" onClick={() => onComplete(trade.id)}>Mark completed</button>
        </>
      )}

      {trade.status === "completed" && (
        alreadyRated ? (
          <p className="rated-note">You rated this trade {trade[myRatingField]} / 5</p>
        ) : (
          <>
            <p className="rated-note">How was the swap with {theirName}?</p>
            <StarRow tradeId={trade.id} selected={pendingStar || 0} onPick={onPickStar} />
            <button className="btn btn-navy" onClick={() => onRate(trade.id, role)}>Submit rating</button>
          </>
        )
      )}
    </div>
  );
}

function Trades() {
  const [currentUser, setCurrentUser] = useState(null);
  const [checked, setChecked] = useState(false);
  const [allTrades, setAllTrades] = useState([]);
  const [tab, setTab] = useState("active");
  const [pendingStars, setPendingStars] = useState({});
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  const [verifyPromptOpen, setVerifyPromptOpen] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored !== null) setCurrentUser(JSON.parse(stored));
    setChecked(true);
  }, []);

  function loadTrades() {
    if (currentUser === null) return;
    getMyTrades(currentUser.uid).then((result) => {
      setAllTrades(result.ok ? result.data : []);
    });
    recalcMyRating(currentUser.uid);
  }

  useEffect(() => {
    loadTrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  function showToast(message) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  }

  async function handleAccept(id) {
    /* live check — same reasoning as propose: someone could have
       verified in another tab moments ago, so we check fresh
       instead of trusting stale data */
    const verified = await isEmailVerified();
    if (verified === false) {
      setResendMessage("");
      setVerifyPromptOpen(true);
      return;
    }
    acceptTrade(id).then((r) => { showToast(r.ok ? "Trade accepted" : r.message); loadTrades(); });
  }

  async function handleResendVerification() {
    setResending(true);
    const result = await resendVerificationEmail();
    setResending(false);
    setResendMessage(result.ok
      ? "Verification email sent. Check your inbox (and spam folder)."
      : result.message);
  }
  function handleDecline(id) {
    declineTrade(id).then((r) => { showToast(r.ok ? "Trade declined" : r.message); loadTrades(); });
  }
  function handleComplete(id) {
    completeTrade(id).then((r) => { showToast(r.ok ? "Marked completed. Rate your trade partner!" : r.message); loadTrades(); });
  }
  function handlePickStar(tradeId, value) {
    setPendingStars((prev) => ({ ...prev, [tradeId]: value }));
  }
  function handleRate(tradeId, role) {
    const stars = pendingStars[tradeId];
    if (!stars) { showToast("Pick a star rating first"); return; }
    rateTrade(tradeId, role, stars).then((r) => { showToast(r.ok ? "Thanks for rating!" : r.message); loadTrades(); });
  }

  const filtered = allTrades.filter((t) =>
    tab === "active" ? t.status === "pending" || t.status === "accepted" : t.status === "completed" || t.status === "declined"
  );

  return (
    <div className="dash-shell trades-page">
      <div className="app">
        <header className="topbar">
          <div className="topbar-inner">
            <Link to="/dashboard" aria-label="Back to board">
              <svg className="icon" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
            </Link>
            <p className="title">My trades</p>
          </div>
        </header>
        <div className="page-spacer"></div>

        <div className="body">
          {checked && currentUser === null && (
            <div className="empty"><p>Sign in to see your trades.</p></div>
          )}

          {currentUser !== null && (
            <>
              <div className="tabs">
                <div className={"tab" + (tab === "active" ? " active" : "")} onClick={() => setTab("active")}>Active</div>
                <div className={"tab" + (tab === "completed" ? " active" : "")} onClick={() => setTab("completed")}>Completed</div>
              </div>

              {filtered.length === 0 ? (
                <div className="empty">
                  <svg className="icon" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                  <p>{tab === "active" ? "No active trades. Propose a swap from the board to get started." : "No completed trades yet."}</p>
                </div>
              ) : (
                filtered.map((t) => (
                  <TradeCard
                    key={t.id} trade={t} uid={currentUser.uid}
                    onAccept={handleAccept} onDecline={handleDecline} onComplete={handleComplete}
                    onRate={handleRate} pendingStar={pendingStars[t.id]} onPickStar={handlePickStar}
                  />
                ))
              )}
            </>
          )}
        </div>

        {toast && <div className="toast-trades show">{toast}</div>}
      </div>

      {verifyPromptOpen && (() => {
        /* Don't tell a brand-new signup "your link may have
           expired" — that's simply false minutes after signup,
           and it's confusing, wrong advice. Only shift toward
           that framing once enough real time has actually
           passed. 24 hours is a reasonable, simple threshold. */
        const joinedMs = currentUser && currentUser.joined ? new Date(currentUser.joined).getTime() : 0;
        const accountAgeMs = Date.now() - joinedMs;
        const isFreshAccount = accountAgeMs < 24 * 60 * 60 * 1000;

        return (
        <div style={{ display: "flex", position: "fixed", inset: 0, background: "rgba(4,56,115,0.45)", zIndex: 300, alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "var(--card)", borderRadius: "16px", padding: "22px", width: "100%", maxWidth: "360px", textAlign: "center" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--need-bg)", color: "#A14E10", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <svg className="icon" viewBox="0 0 24 24"><path d="M22 2 11 13" /><path d="M22 2 15 22 11 13 2 9 22 2z" /></svg>
            </div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "16px", fontWeight: 800, marginBottom: "8px" }}>Verify your email first</p>
            <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.6, marginBottom: "16px" }}>
              {isFreshAccount
                ? "You need to verify your email before accepting a trade. We sent a link to your inbox when you signed up, check there (and spam) for it. Still can't find it? Send a new one below."
                : "You need to verify your email before accepting a trade. Your original link may have expired by now, send a fresh one below."}
            </p>

            {resendMessage && (
              <p style={{ fontSize: "12.5px", color: resendMessage.startsWith("Verification email sent") ? "var(--offer)" : "var(--danger)", marginBottom: "14px", fontWeight: 600 }}>
                {resendMessage}
              </p>
            )}

            <button className="btn btn-navy" onClick={handleResendVerification} disabled={resending}>
              {resending ? "Sending..." : "Resend verification email"}
            </button>
            <button className="btn" style={{ background: "transparent", color: "var(--muted)", marginTop: "8px" }}
              onClick={() => setVerifyPromptOpen(false)}>Close</button>
          </div>
        </div>
        );
      })()}
    </div>
  );
}

export default Trades;