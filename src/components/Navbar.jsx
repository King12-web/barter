function Navbar() {
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
            <a href="#how">How it works</a>
            <a href="#why">Why us</a>
            <a href="#faq">FAQ</a>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;