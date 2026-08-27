function FeatureMatch() {
  return (
    <section id="match">
      <div className="wrap feature-row">
        <div className="f-copy">
          <h2>
            Matched with people who{" "}
            <span className="hl on-white">
              want you back
              <svg viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M2 7 Q 50 1 98 6" />
              </svg>
            </span>
          </h2>
          <p>
            List what you offer and what you need. The moment someone on your
            campus wants your <span className="tag offer">cv design</span> and offers the{" "}
            <span className="tag need">laptop repair</span> you've been looking for,
            Campus Barter flags the match and you propose a trade in one tap.
          </p>
          <div className="match-anim" aria-hidden="true">
            <span className="ma-tag ma-offer">cv design</span>
            <span className="ma-swap">
              <span className="ma-ring"></span>
              <svg className="icon" viewBox="0 0 24 24">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            </span>
            <span className="ma-tag ma-need">laptop repair</span>
          </div>
        </div>
        <div className="f-art">
          {/* match illustration: two avatars + connection */}
          <svg viewBox="0 0 480 300" role="img" aria-label="A match between two students">
            <ellipse cx="240" cy="272" rx="200" ry="18" fill="#F7FAFD" />
            <rect x="60" y="60" width="360" height="170" rx="18" fill="#FFFFFF" stroke="#E3E9F0" strokeWidth="2" />
            <rect x="60" y="60" width="360" height="44" rx="18" fill="#043873" />
            <rect x="82" y="76" width="120" height="12" rx="6" fill="#FFE492" />

            {/* left avatar */}
            <circle cx="150" cy="160" r="30" fill="#E1EEFE" />
            <circle cx="150" cy="152" r="12" fill="#4F9CF9" />
            <path d="M128 178 a22 14 0 0 1 44 0 z" fill="#4F9CF9" />
            <rect x="118" y="196" width="64" height="16" rx="8" fill="#E8F7EE" />
            <rect x="126" y="200" width="48" height="8" rx="4" fill="#16A34A" />

            {/* right avatar */}
            <circle cx="330" cy="160" r="30" fill="#FEF0E6" />
            <circle cx="330" cy="152" r="12" fill="#F97316" />
            <path d="M308 178 a22 14 0 0 1 44 0 z" fill="#F97316" />
            <rect x="298" y="196" width="64" height="16" rx="8" fill="#FEF0E6" />
            <rect x="306" y="200" width="48" height="8" rx="4" fill="#F97316" />

            {/* connection */}
            <g stroke="#4F9CF9" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeDasharray="1 9">
              <path d="M186 150 Q 240 120 294 150" />
              <path d="M186 172 Q 240 202 294 172" />
            </g>
            <circle cx="240" cy="136" r="16" fill="#FFE492" />
            <path d="M240 128 l2.4 4.9 5.4 0.8 -3.9 3.8 0.9 5.4 -4.8 -2.6 -4.8 2.6 0.9 -5.4 -3.9 -3.8 5.4 -0.8 z" fill="#043873" />
          </svg>
        </div>
      </div>
    </section>
  );
}

export default FeatureMatch;