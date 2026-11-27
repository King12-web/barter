import { useState, useEffect } from "react";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#why", label: "Why us" },
  { href: "#faq", label: "FAQ" },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    function handleKey(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  return (
    <header className="topbar">
      <div className="wrap">
        <nav>
          <div className="brand">
            <div className="mark">
              <svg className="icon" viewBox="0 0 24 24">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            </div>
            <p className="brand-name">Campus <span>Barter</span></p>
          </div>
          <div className="nav-links">
            {LINKS.map((link) => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
          </div>
          {/* Phones and small tablets: the same links behind a menu button. */}
          <button
            type="button"
            className="menu-btn"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="landing-menu"
            aria-label="Menu"
          >
            <svg className="icon" style={{ width: "24px", height: "24px" }} viewBox="0 0 24 24" aria-hidden="true">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </button>
        </nav>
      </div>
      <div id="landing-menu" className={"menu-panel" + (menuOpen ? " open" : "")}>
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a>
        ))}
      </div>
    </header>
  );
}

export default Navbar;
