import { Link } from "react-router-dom";

function Hero() {
  return (
    <div className="hero-band">
      <div className="wrap">
        <div className="hero">
          <svg className="hero-curve" viewBox="0 0 400 400" aria-hidden="true">
            <path d="M 10 200 Q 100 40 200 120 T 390 100" />
            <path d="M 10 260 Q 120 100 220 180 T 395 160" />
            <path d="M 10 320 Q 140 160 240 240 T 400 220" />
          </svg>

          <div>
            <h1>
              Get more done with{" "}
              <span className="hl">
                your skills
                <svg viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M2 7 Q 50 1 98 6" />
                </svg>
              </span>
            </h1>
            <p className="lede">
              Campus Barter is a student-to-student platform where you trade
              skills, not money. Offer what you're good at. Get help with
              what you need, matched right on your campus.
            </p>
            <div className="cta-row">
              <Link className="btn btn-yellow" to="/join">
                Join the board
                <svg className="icon" style={{ width: "16px", height: "16px" }} viewBox="0 0 24 24">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <Link className="btn btn-ghost-dark" to="/signin">Sign in</Link>
            </div>
            <p className="hero-proof">
              <svg className="icon" style={{ width: "15px", height: "15px", color: "var(--yellow)" }} viewBox="0 0 24 24">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              <span><b>330+ institutions</b> covering every university, polytechnic and college in Nigeria</span>
            </p>
          </div>

          {/* HERO ILLUSTRATION: two students at the swap board (flat SVG) */}
          <div className="hero-art">
            <svg viewBox="0 0 520 360" role="img" aria-label="Two students swapping skills at a board">
              <ellipse cx="260" cy="330" rx="230" ry="22" fill="#032B57" />
              <rect x="130" y="46" width="260" height="180" rx="14" fill="#FFFFFF" />
              <rect x="130" y="46" width="260" height="42" rx="14" fill="#E1EEFE" />
              <circle cx="152" cy="67" r="6" fill="#4F9CF9" />
              <rect x="166" y="62" width="90" height="10" rx="5" fill="#B9CCE6" />

              <rect x="152" y="108" width="96" height="26" rx="13" fill="#E8F7EE" />
              <rect x="164" y="116" width="72" height="10" rx="5" fill="#16A34A" />
              <rect x="272" y="108" width="96" height="26" rx="13" fill="#FEF0E6" />
              <rect x="284" y="116" width="72" height="10" rx="5" fill="#F97316" />
              <g stroke="#4F9CF9" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M225 158 h70" />
                <path d="M283 148 l12 10 -12 10" />
                <path d="M295 182 h-70" />
                <path d="M237 172 l-12 10 12 10" />
              </g>

              <circle cx="390" cy="52" r="20" fill="#FFE492" />
              <path d="M390 42 l3.1 6.3 7 1 -5 4.9 1.2 6.9 -6.3 -3.3 -6.3 3.3 1.2 -6.9 -5 -4.9 7 -1 z" fill="#043873" />

              {/* student left */}
              <circle cx="88" cy="176" r="22" fill="#8C5A3A" />
              <path d="M66 176 a22 22 0 0 1 44 0 l-4 -14 a20 20 0 0 0 -36 0 z" fill="#212529" />
              <rect x="66" y="200" width="44" height="74" rx="18" fill="#4F9CF9" />
              <rect x="98" y="204" width="46" height="14" rx="7" fill="#4F9CF9" transform="rotate(-18 98 204)" />
              <rect x="70" y="272" width="16" height="52" rx="8" fill="#043873" />
              <rect x="90" y="272" width="16" height="52" rx="8" fill="#043873" />
              <ellipse cx="78" cy="328" rx="14" ry="6" fill="#FFE492" />
              <ellipse cx="98" cy="328" rx="14" ry="6" fill="#FFE492" />

              {/* student right */}
              <circle cx="434" cy="170" r="22" fill="#6B4226" />
              <path d="M412 168 a22 24 0 0 1 44 2 l2 -18 a22 22 0 0 0 -46 -2 z" fill="#212529" />
              <rect x="412" y="194" width="44" height="76" rx="18" fill="#FFD966" />
              <rect x="376" y="200" width="46" height="14" rx="7" fill="#FFD966" transform="rotate(16 376 200)" />
              <rect x="416" y="270" width="16" height="54" rx="8" fill="#032B57" />
              <rect x="436" y="270" width="16" height="54" rx="8" fill="#032B57" />
              <ellipse cx="424" cy="330" rx="14" ry="6" fill="#4F9CF9" />
              <ellipse cx="444" cy="330" rx="14" ry="6" fill="#4F9CF9" />

              {/* speech bubbles */}
              <g>
                <rect x="34" y="108" width="76" height="34" rx="12" fill="#FFFFFF" />
                <path d="M74 142 l8 12 4 -12 z" fill="#FFFFFF" />
                <rect x="46" y="120" width="52" height="10" rx="5" fill="#16A34A" />
              </g>
              <g>
                <rect x="416" y="102" width="76" height="34" rx="12" fill="#FFFFFF" />
                <path d="M448 136 l-6 12 -4 -12 z" fill="#FFFFFF" />
                <rect x="428" y="114" width="52" height="10" rx="5" fill="#F97316" />
              </g>

              {/* floating dots */}
              <circle cx="120" cy="70" r="5" fill="#4F9CF9" />
              <circle cx="486" cy="220" r="5" fill="#FFE492" />
              <circle cx="40" cy="240" r="4" fill="#FFE492" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;