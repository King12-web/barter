import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppNav from "../components/AppNav.jsx";
import { getMyTrades } from "../lib/trades.js";
import { getMyActivity } from "../lib/activity.js";

const ICONS = {
  match: <svg className="icon" style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  check: <svg className="icon" style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>,
  x: <svg className="icon" style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  star: <svg className="icon" style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  settings: <svg className="icon" style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
};

function timeAgo(timestamp) {
  if (!timestamp) return "Just now";
  const ms = Date.now() - timestamp.toMillis();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return mins + "m ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  const days = Math.floor(hrs / 24);
  if (days < 7) return days + "d ago";
  return timestamp.toDate().toLocaleDateString();
}

function dayGroup(timestamp) {
  if (!timestamp) return "Today";
  const d = timestamp.toDate();
  const diffDays = Math.floor((new Date() - d) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return "Earlier";
}

function tradeToEntry(t, uid) {
  const role = t.proposerUid === uid ? "proposer" : "receiver";
  const theirName = role === "proposer" ? t.receiverName : t.proposerName;
  const iAmReceiver = role === "receiver";
  const myRatingField = role === "proposer" ? "proposerRating" : "receiverRating";
  const iRated = t[myRatingField] !== null && t[myRatingField] !== undefined;

  if (t.status === "pending" && iAmReceiver) {
    return { iconCls: "ni-yellow", icon: ICONS.match,
      text: <><b>{theirName}</b> wants to swap: their {t.offeredSkill} for your {t.requestedSkill}.</>,
      time: t.createdAt };
  }
  if (t.status === "accepted") {
    const text = role === "proposer"
      ? <><b>{theirName}</b> accepted your trade proposal.</>
      : <>You accepted <b>{theirName}</b>'s trade proposal.</>;
    return { iconCls: "ni-green", icon: ICONS.check, text, time: t.updatedAt };
  }
  if (t.status === "declined") {
    return { iconCls: "ni-muted", icon: ICONS.x,
      text: <><b>{theirName}</b> declined the trade proposal.</>, time: t.updatedAt };
  }
  if (t.status === "completed" && !iRated) {
    return { iconCls: "ni-orange", icon: ICONS.star,
      text: <>Trade completed with <b>{theirName}</b>. Rate the swap.</>, time: t.updatedAt };
  }
  if (t.status === "completed" && iRated) {
    return { iconCls: "ni-muted", icon: ICONS.check,
      text: <>Trade completed with <b>{theirName}</b>.</>, time: t.updatedAt };
  }
  return null;
}

function Notifications() {
  useEffect(() => { document.title = "Notifications | Campus Barter"; }, []);
  const [currentUser, setCurrentUser] = useState(null);
  const [checked, setChecked] = useState(false);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored === null) {
      setChecked(true);
      return;
    }
    const user = JSON.parse(stored);
    setCurrentUser(user);

    Promise.all([getMyTrades(user.uid), getMyActivity(user.uid)]).then(([tradesResult, activityResult]) => {
      const trades = tradesResult.ok ? tradesResult.data : [];
      const activity = activityResult.ok ? activityResult.data : [];

      let list = trades.map((t) => tradeToEntry(t, user.uid)).filter((e) => e !== null);

      activity.forEach((a) => {
        list.push({ iconCls: "ni-green", icon: ICONS.settings, text: a.message, time: a.createdAt });
      });

      list.sort((a, b) => {
        const aTime = a.time ? a.time.toMillis() : Date.now();
        const bTime = b.time ? b.time.toMillis() : Date.now();
        return bTime - aTime;
      });

      setEntries(list);
      setChecked(true);
    });
  }, []);

  let lastGroup = null;

  return (
    <div className="dash-shell">
      <div className="app">
        <header className="topbar">
          <div className="topbar-inner">
            <Link to="/dashboard" aria-label="Back to board">
              <svg className="icon" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
            </Link>
            <p className="title">Notifications</p>
          </div>
        </header>
        <AppNav active="" />
        <div className="page-spacer"></div>

        <div className="body">
          {!checked && <div className="empty">Loading...</div>}

          {checked && currentUser === null && (
            <div className="empty">Sign in to see your notifications.</div>
          )}

          {checked && currentUser !== null && entries.length === 0 && (
            <div className="empty">
              <svg className="icon" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
              <p>Nothing here yet. Propose a trade to get things moving.</p>
            </div>
          )}

          {checked && currentUser !== null && entries.length > 0 && entries.map((e, i) => {
            const group = dayGroup(e.time);
            const showLabel = group !== lastGroup;
            lastGroup = group;
            return (
              <div key={i}>
                {showLabel && <p className="day-label">{group}</p>}
                <Link className="notif" to="/trades">
                  <div className={"notif-icon " + e.iconCls}>{e.icon}</div>
                  <div><p>{e.text}</p><p className="when">{timeAgo(e.time)}</p></div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Notifications;