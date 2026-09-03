import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProfile } from "../lib/db.js";
import { getAllReports, markReportReviewed } from "../lib/reports.js";

const REASON_LABELS = {
  "didnt-deliver": "Didn't deliver their side",
  "poor-communication": "Poor communication",
  "inappropriate": "Inappropriate behavior",
  "other": "Other",
};

function timeAgo(timestamp) {
  if (!timestamp) return "Just now";
  const d = timestamp.toDate();
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Admin() {
  useEffect(() => { document.title = "Admin | Campus Barter"; }, []);

  const [checked, setChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored === null) {
      setChecked(true);
      return;
    }
    const user = JSON.parse(stored);

    getProfile(user.uid).then((result) => {
      const admin = result.ok && result.data !== null && result.data.isAdmin === true;
      setIsAdmin(admin);
      setChecked(true);

      if (admin) {
        getAllReports().then((r) => {
          setReports(r.ok ? r.data : []);
          setLoading(false);
        });
      }
    });
  }, []);

  async function handleMarkReviewed(reportId) {
    await markReportReviewed(reportId);
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: "reviewed" } : r)));
  }

  const filtered = reports.filter((r) => filter === "all" || r.status === filter);

  return (
    <div className="dash-shell">
      <div className="app">
        <header className="topbar">
          <div className="topbar-inner">
            <Link to="/dashboard" aria-label="Back to board">
              <svg className="icon" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
            </Link>
            <p className="title">Reports</p>
          </div>
        </header>
        <div className="page-spacer"></div>

        <div className="body">
          {!checked && <div className="empty">Checking access...</div>}

          {checked && isAdmin === false && (
            <div className="empty">
              <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              <p>You don't have access to this page.</p>
            </div>
          )}

          {checked && isAdmin === true && (
            <>
              <div className="tabs">
                <div className={"tab" + (filter === "open" ? " active" : "")} onClick={() => setFilter("open")}>Open</div>
                <div className={"tab" + (filter === "reviewed" ? " active" : "")} onClick={() => setFilter("reviewed")}>Reviewed</div>
                <div className={"tab" + (filter === "all" ? " active" : "")} onClick={() => setFilter("all")}>All</div>
              </div>

              {loading && <div className="empty">Loading reports...</div>}

              {!loading && filtered.length === 0 && (
                <div className="empty"><p>Nothing here.</p></div>
              )}

              {!loading && filtered.map((r) => (
                <div className="card" key={r.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 800 }}>{r.reportedName}</p>
                      <p style={{ fontSize: "11px", color: "var(--muted)" }}>reported by {r.reporterUid}</p>
                    </div>
                    <span className={"status " + (r.status === "open" ? "st-pending" : "st-completed")}>
                      {r.status === "open" ? "Open" : "Reviewed"}
                    </span>
                  </div>

                  <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)", marginBottom: "4px" }}>
                    {REASON_LABELS[r.reason] || r.reason}
                  </p>
                  {r.details && <p style={{ fontSize: "12.5px", color: "var(--muted)", lineHeight: 1.5, marginBottom: "8px" }}>{r.details}</p>}
                  <p style={{ fontSize: "11px", color: "var(--muted)" }}>Trade: {r.tradeId} &middot; {timeAgo(r.createdAt)}</p>

                  {r.status === "open" && (
                    <button className="btn btn-outline" style={{ marginTop: "10px" }} onClick={() => handleMarkReviewed(r.id)}>
                      Mark reviewed
                    </button>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;