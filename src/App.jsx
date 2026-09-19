import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop.jsx";
import RequireAuth from "./components/RequireAuth.jsx";

const Landing = lazy(() => import("./pages/Landing.jsx"));
const Join = lazy(() => import("./pages/Join.jsx"));
const SignIn = lazy(() => import("./pages/SignIn.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Matches = lazy(() => import("./pages/Matches.jsx"));
const Trades = lazy(() => import("./pages/Trades.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Notifications = lazy(() => import("./pages/Notifications.jsx"));
const AuthAction = lazy(() => import("./pages/AuthAction.jsx"));
const Terms = lazy(() => import("./pages/Terms.jsx"));
const Privacy = lazy(() => import("./pages/Privacy.jsx"));
const Admin = lazy(() => import("./pages/Admin.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

function PageLoading() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--soft)" }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 700, color: "var(--navy)" }}>
        Loading...
      </p>
    </div>
  );
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/join" element={<Join />} />
          <Route path="/signin" element={<SignIn />} />

          {/* Dashboard is intentionally NOT wrapped in RequireAuth —
              guest browsing of the board is a designed feature. */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* These have nothing meaningful for a signed-out visitor —
              redirect straight to sign in instead of a dead-end page. */}
          <Route path="/matches" element={<RequireAuth><Matches /></RequireAuth>} />
          <Route path="/trades" element={<RequireAuth><Trades /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />

          <Route path="/auth-action" element={<AuthAction />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;