function GuidelinesModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div style={{ display: "flex", position: "fixed", inset: 0, background: "rgba(4,56,115,0.45)", zIndex: 300, alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ background: "var(--card)", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "400px" }}>
        <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--yellow)", color: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
          <svg className="icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "17px", fontWeight: 800, marginBottom: "10px" }}>
          How Campus Barter works
        </p>
        <p style={{ fontSize: "13.5px", color: "var(--ink)", lineHeight: 1.7, marginBottom: "12px" }}>
          This board only works because students keep their word. When you propose or accept
          a trade, you're making a real commitment to another student, so please follow
          through on what you agree to.
        </p>
        <p style={{ fontSize: "13.5px", color: "var(--ink)", lineHeight: 1.7, marginBottom: "20px" }}>
          Ratings and trade history are visible on every profile, and they're how the whole
          community trusts each other. Trade fairly, communicate honestly, and treat every
          swap the way you'd want your own skills treated.
        </p>
        <button className="btn btn-navy" onClick={onClose}>Got it</button>
      </div>
    </div>
  );
}

export default GuidelinesModal;