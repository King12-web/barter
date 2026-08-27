import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Join from "./pages/Join.jsx";
import SignIn from "./pages/SignIn.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Matches from "./pages/Matches.jsx";
import Trades from "./pages/Trades.jsx";
import Profile from "./pages/Profile.jsx";
import Notifications from "./pages/Notifications.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/join" element={<Join />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/matches" element={<Matches />} />
      <Route path="/trades" element={<Trades />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/notifications" element={<Notifications />} />
    </Routes>
  );
}

export default App;