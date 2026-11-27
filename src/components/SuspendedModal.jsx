/* Shown instead of the propose/accept action while an account is
   suspended. `suspension` comes from getMySuspension(). */
function SuspendedModal({ suspension, onClose }) {
  if (suspension === null) return null;

  const until = suspension.until.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{ display: "flex", position: "fixed", inset: 0, background: "rgba(4,56,115,0.45)", zIndex: 300, alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "var(--card)", borderRadius: "16px", padding: "22px", width: "100%", maxWidth: "360px", textAlign: "center" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--need-bg)", color: "#A14E10", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "16px", fontWeight: 800, marginBottom: "8px" }}>Account suspended</p>
        <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.6, marginBottom: "16px" }}>
          You can't propose or accept trades until {until}.
          {suspension.reason && <> Reason: {suspension.reason}.</>}
          {" "}Contact admin@campusbarter.online if you think this is a mistake.
        </p>
        <button className="btn btn-navy" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default SuspendedModal;
