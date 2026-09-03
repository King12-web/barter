import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProfile } from "../lib/db.js";
import { getAllReports, suspendUser } from "../lib/reports.js";
import { getAllSuggestions, markSuggestionReviewed } from "../lib/suggestions.js";

const REASON_LABELS = {
  "didnt-deliver": "Didn't deliver their side",
  "poor-communication": "Poor communication",
  "inappropriate": "Inappropriate behavior",
  "other": "Other",
};

function formatDate(timestamp) {
  if (!timestamp) return "Just now";
  const d = timestamp.toDate();
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function groupReportsByPerson(reports) {
  const groups = {};
  reports.forEach((r) => {
    if (!groups[r.reportedUid]) {
      groups[r.reportedUid] = { reportedUid: r.reportedUid, reportedName: r.reportedName, reports: [] };
    }
    groups[r.reportedUid].reports.push(r);
  });
  return Object.values(groups).sort((a, b) => b.reports.length - a.reports.length);
}

function Admin() {
  useEffect(() => { document.title = "Admin | Campus Barter"; }, []);

  const [checked, setChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState("reports");

  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportFilter, setReportFilter] = useState("open");
  const [suspending, setSuspending] = useState(null);
  const [toast, setToast] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);

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
      if (admin) loadAll();
    });
  }, []);

  function loadAll() {
    getAllReports().then((r) => {
      setReports(r.ok ? r.data : []);
      setReportsLoading(false);
    });
    getAllSuggestions().then((r) => {
      setSuggestions(r.ok ? r.data : []);
      setSuggestionsLoading(false);
    });
  }

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2600);
  }

  async function handleSuspend(group) {
    const openIds = group.reports.filter((r) => r.status === "open").map((r) => r.id);
    const reasonSummary = group.reports.map((r) => REASON_LABELS[r.reason] || r.reason).join(", ");

    setSuspending(group.reportedUid);
    const result = await suspendUser(group.reportedUid, reasonSummary, openIds);
    setSuspending(null);

    if (result.ok === false) {
      showToast(result.message);
      return;
    }
    showToast(group.reportedName + " suspended for 1 week");
    loadAll();
  }

  async function handleMarkSuggestionReviewed(id) {
    await markSuggestionReviewed(id);
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, status: "reviewed" } : s)));
  }

  const grouped = groupReportsByPerson(reports).filter((g) => {
    if (reportFilter === "all") return true;
    if (reportFilter === "open") return g.reports.some((r) => r.status === "open");
    return g.reports.every((r) => r.status === "reviewed");
  });

  const newSuggestions = suggestions.filter((s) => s.status === "new");
  const reviewedSuggestions = suggestions.filter((s) => s.status === "reviewed");

  return (
    <div className="dash-shell">
      <div className="app">
        <header className="topbar">
          <div className="topbar-inner">
            <Link to="/dashboard" aria-label="Back to board">
              <svg className="icon" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
            </Link>
            <p className="title">Admin</p>
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
              <div className="tabs" style={{ marginBottom: "18px" }}>
                <div className={"tab" + (view === "reports" ? " active" : "")} onClick={() => setView("reports")}>
                  Reports {reports.filter((r) => r.status === "open").length > 0 && `(${reports.filter((r) => r.status === "open").length})`}
                </div>
                <div className={"tab" + (view === "suggestions" ? " active" : "")} onClick={() => setView("suggestions")}>
                  Suggestions {newSuggestions.length > 0 && `(${newSuggestions.length})`}
                </div>
              </div>

              {view === "reports" && (
                <>
                  <div className="tabs">
                    <div className={"tab" + (reportFilter === "open" ? " active" : "")} onClick={() => setReportFilter("open")}>Open</div>
                    <div className={"tab" + (reportFilter === "reviewed" ? " active" : "")} onClick={() => setReportFilter("reviewed")}>Reviewed</div>
                    <div className={"tab" + (reportFilter === "all" ? " active" : "")} onClick={() => setReportFilter("all")}>All</div>
                  </div>

                  {reportsLoading && <div className="empty">Loading reports...</div>}

                  {!reportsLoading && grouped.length === 0 && <div className="empty"><p>Nothing here.</p></div>}

                  {!reportsLoading && grouped.map((group) => {
                    const openCount = group.reports.filter((r) => r.status === "open").length;
                    return (
                      <div className="card" key={group.reportedUid}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                          <div>
                            <p style={{ fontSize: "14px", fontWeight: 800 }}>{group.reportedName}</p>
                            <p style={{ fontSize: "11px", color: "var(--muted)" }}>
                              {group.reports.length} report{group.reports.length > 1 ? "s" : ""} total
                              {openCount > 0 && ` · ${openCount} open`}
                            </p>
                          </div>
                          {openCount === 0 && <span className="status st-completed">All reviewed</span>}
                        </div>

                        {group.reports.map((r) => (
                          <div key={r.id} style={{ borderTop: "1px solid var(--soft)", paddingTop: "10px", marginTop: "10px" }}>
                            <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)", marginBottom: "3px" }}>
                              {REASON_LABELS[r.reason] || r.reason}
                              {r.status === "reviewed" && <span style={{ color: "var(--muted)", fontWeight: 400 }}> — reviewed</span>}
                            </p>
                            {r.details && <p style={{ fontSize: "12.5px", color: "var(--muted)", lineHeight: 1.5, marginBottom: "4px" }}>{r.details}</p>}
                            <p style={{ fontSize: "11px", color: "var(--muted)" }}>Trade: {r.tradeId} &middot; {formatDate(r.createdAt)}</p>
                          </div>
                        ))}

                        {openCount > 0 && (
                          <button
                            className="btn btn-danger-outline"
                            style={{ marginTop: "14px" }}
                            onClick={() => handleSuspend(group)}
                            disabled={suspending === group.reportedUid}
                          >
                            {suspending === group.reportedUid ? "Suspending..." : "Suspend for 1 week"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </>
              )}

              {view === "suggestions" && (
                <>
                  {suggestionsLoading && <div className="empty">Loading suggestions...</div>}

                  {!suggestionsLoading && suggestions.length === 0 && <div className="empty"><p>No suggestions yet.</p></div>}

                  {!suggestionsLoading && newSuggestions.map((s) => (
                    <div className="card" key={s.id}>
                      <p style={{ fontSize: "13px", color: "var(--ink)", lineHeight: 1.6, marginBottom: "8px" }}>{s.text}</p>
                      <p style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "12px" }}>{s.name} &middot; {formatDate(s.createdAt)}</p>
                      <button className="btn btn-outline" onClick={() => handleMarkSuggestionReviewed(s.id)}>Mark reviewed</button>
                    </div>
                  ))}

                  {!suggestionsLoading && reviewedSuggestions.length > 0 && (
                    <>
                      <p className="section-title">Reviewed</p>
                      {reviewedSuggestions.map((s) => (
                        <div className="card" key={s.id} style={{ opacity: 0.6 }}>
                          <p style={{ fontSize: "13px", color: "var(--ink)", lineHeight: 1.6, marginBottom: "6px" }}>{s.text}</p>
                          <p style={{ fontSize: "11px", color: "var(--muted)" }}>{s.name} &middot; {formatDate(s.createdAt)}</p>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {toast && <div id="toast" className="show">{toast}</div>}
      </div>
    </div>
  );
}

export default Admin;