import { useState } from "react";
import { submitReport } from "../lib/reports.js";

const REASONS = [
  { value: "didnt-deliver", label: "Didn't deliver their side" },
  { value: "poor-communication", label: "Poor communication" },
  { value: "inappropriate", label: "Inappropriate behavior" },
  { value: "other", label: "Other" },
];

function ReportModal({ open, trade, reporterUid, onClose }) {
  const [reason, setReason] = useState(REASONS[0].value);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (!open || !trade) return null;

  const reportedUid = trade.proposerUid === reporterUid ? trade.receiverUid : trade.proposerUid;
  const reportedName = trade.proposerUid === reporterUid ? trade.receiverName : trade.proposerName;

  async function handleSubmit() {
    setError("");
    setSubmitting(true);
    const result = await submitReport(reporterUid, reportedUid, reportedName, trade.id, reason, details.trim());
    setSubmitting(false);

    if (result.ok === false) {
      setError(result.message);
      return;
    }
    setSubmitted(true);
  }

  function handleClose() {
    setReason(REASONS[0].value);
    setDetails("");
    setSubmitted(false);
    setError("");
    onClose();
  }

  return (
    <div style={{ display: "flex", position: "fixed", inset: 0, background: "rgba(4,56,115,0.45)", zIndex: 300, alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "var(--card)", borderRadius: "16px", padding: "22px", width: "100%", maxWidth: "380px" }}>

        {submitted ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--offer-bg)", color: "var(--offer)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <svg className="icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "16px", fontWeight: 800, marginBottom: "8px" }}>Report submitted</p>
            <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.6, marginBottom: "18px" }}>
              Thanks for letting us know. We'll look into it.
            </p>
            <button className="btn btn-navy" onClick={handleClose}>Close</button>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "16px", fontWeight: 800, marginBottom: "6px" }}>Report an issue</p>
            <p style={{ fontSize: "12.5px", color: "var(--muted)", marginBottom: "16px" }}>With {reportedName}, about your trade.</p>

            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--muted)", marginBottom: "6px" }}>WHAT HAPPENED?</label>
            <select
              style={{ width: "100%", border: "1.5px solid var(--line)", borderRadius: "9px", padding: "11px", fontFamily: "inherit", fontSize: "16px", marginBottom: "14px" }}
              value={reason} onChange={(e) => setReason(e.target.value)}
            >
              {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>

            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "var(--muted)", marginBottom: "6px" }}>DETAILS (OPTIONAL)</label>
            <textarea
              rows="3" placeholder="Anything else we should know?"
              style={{ width: "100%", border: "1.5px solid var(--line)", borderRadius: "9px", padding: "11px", fontFamily: "inherit", fontSize: "16px", resize: "vertical", marginBottom: "6px" }}
              value={details} onChange={(e) => setDetails(e.target.value)}
            />
            {error && <p className="error" style={{ display: "block", marginBottom: "8px" }}>{error}</p>}

            <button className="btn btn-navy" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit report"}
            </button>
            <button className="btn" style={{ background: "transparent", color: "var(--muted)", marginTop: "8px" }}
              onClick={handleClose}>Cancel</button>
          </>
        )}

      </div>
    </div>
  );
}

export default ReportModal;