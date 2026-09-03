/* ============================================================
   Small, reusable spinning icon — meant to sit INSIDE a button,
   right next to its loading text ("Sending..."), not as a
   full-page overlay. Pure CSS animation, no extra dependency.
   ============================================================ */
function Spinner({ size = 14, color = "currentColor" }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      style={{ animation: "cb-spin 0.7s linear infinite", flexShrink: 0 }}
      aria-hidden="true"
    >
      <circle
        cx="12" cy="12" r="9"
        stroke={color} strokeWidth="3" fill="none"
        strokeDasharray="42 100" strokeLinecap="round"
        opacity="0.9"
      />
      <style>{`
        @keyframes cb-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  );
}

export default Spinner;