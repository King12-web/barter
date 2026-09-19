import { Navigate } from "react-router-dom";

/* ============================================================
   Wraps a page that has NOTHING to show a signed-out visitor —
   Matches/Trades/Profile/Notifications/Admin all just show a
   plain "sign in to see this" message otherwise. Redirecting
   straight to /signin is a genuine UX improvement there.

   Dashboard deliberately does NOT use this wrapper — guest
   browsing of the board is an intentional, designed feature
   (the guest banner, browsing without an account), not an
   oversight. Wrapping it here would silently remove that.

   This is a UX convenience, not real security — the actual,
   unbypassable protection is Firestore's security rules, which
   deny real data to anyone not properly authenticated regardless
   of what this component does or doesn't redirect.
   ============================================================ */
function RequireAuth({ children }) {
  const stored = localStorage.getItem("currentUser");
  if (stored === null) {
    return <Navigate to="/signin" replace />;
  }
  return children;
}

export default RequireAuth;