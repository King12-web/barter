import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  {
    key: "board", label: "Board", path: "/dashboard",
    icon: <svg className="icon" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  },
  {
    key: "matches", label: "Matches", path: "/matches",
    icon: <svg className="icon" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>,
  },
  {
    key: "trades", label: "Trades", path: "/trades",
    icon: <svg className="icon" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
  },
  {
    key: "profile", label: "Profile", path: "/profile",
    icon: <svg className="icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  },
];

function AppNav({ active }) {
  const navigate = useNavigate();

  return (
    <>
      <div className="app-nav-desktop">
        <div className="wrap app-nav-desktop-inner">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={active === item.key ? "active" : ""}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <nav className="navbar">
        <div className="navbar-inner">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={"nav-item" + (active === item.key ? " active" : "")}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}

export default AppNav;