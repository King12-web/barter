import { useState } from "react";
import { submitSuggestion } from "../lib/suggestions.js";

function SuggestionModal({ open, currentUser, onClose }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit() {
    setError("");
    if (text.trim().length < 5) {
      setError("Tell us a bit more — a few words is enough.");
      return;
    }
    setSubmitting(true);
    const result = await submitSuggestion(currentUser.uid, currentUser.name, text.trim());
    setSubmitting(false);

    if (result.ok === false) {
      setError(result.message);
      return;
    }
    setSubmitted(true);
  }

  function handleClose() {
    setText("");
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
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "16px", fontWeight: 800, marginBottom: "8px" }}>Thanks!</p>
            <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.6, marginBottom: "18px" }}>
              We've got your suggestion and will take a look.
            </p>
            <button className="btn btn-navy" onClick={handleClose}>Close</button>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "16px", fontWeight: 800, marginBottom: "6px" }}>Suggest a feature</p>
            <p style={{ fontSize: "12.5px", color: "var(--muted)", marginBottom: "16px" }}>What would make Campus Barter better for you?</p>

            <textarea
              rows="4" placeholder="e.g. It would help if I could filter by rating..."
              style={{ width: "100%", border: "1.5px solid var(--line)", borderRadius: "9px", padding: "11px", fontFamily: "inherit", fontSize: "16px", resize: "vertical", marginBottom: "6px" }}
              value={text} onChange={(e) => setText(e.target.value)}
            />
            {error && <p className="error" style={{ display: "block", marginBottom: "8px" }}>{error}</p>}

            <button className="btn btn-navy" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Sending..." : "Send suggestion"}
            </button>
            <button className="btn" style={{ background: "transparent", color: "var(--muted)", marginTop: "8px" }}
              onClick={handleClose}>Cancel</button>
          </>
        )}

      </div>
    </div>
  );
}

export default SuggestionModal;