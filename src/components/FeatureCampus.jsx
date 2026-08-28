import { Link } from "react-router-dom";

function FeatureCampus() {
  return (
    <section className="band-soft" id="campus">
      <div className="wrap feature-row flip">
        <div className="f-copy">
          <h2>
            Your whole campus,{" "}
            <span className="hl on-white">
              one board
              <svg viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M2 7 Q 50 1 98 6" />
              </svg>
            </span>
          </h2>
          <p>
            Pick your institution once and your board starts at home with
            the people around you and the skills within reach. Widen the search
            to other campuses whenever you want; remote-friendly skills
            travel, in-person ones stay honest about distance.
          </p>
          <Link className="btn btn-blue" to="/join">Join your campus board</Link>
        </div>
        <div className="f-art">
          {/* orbit illustration */}
          <svg viewBox="0 0 480 320" role="img" aria-label="Students orbiting one campus board">
            <circle cx="240" cy="160" r="130" fill="none" stroke="#C9DCF5" strokeWidth="2" strokeDasharray="3 8" />
            <circle cx="240" cy="160" r="78" fill="none" stroke="#C9DCF5" strokeWidth="2" strokeDasharray="3 8" />
            <rect x="212" y="132" width="56" height="56" rx="16" fill="#043873" />
            <g stroke="#FFE492" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M228 152 h24" />
              <path d="M247 146 l7 6 -7 6" />
              <path d="M252 168 h-24" />
              <path d="M233 162 l-7 6 7 6" />
            </g>
            <g fontFamily="DM Sans, sans-serif" fontSize="13" fontWeight="700" textAnchor="middle">
              <circle cx="240" cy="30" r="20" fill="#E1EEFE" /><text x="240" y="35" fill="#4F9CF9">ZK</text>
              <circle cx="110" cy="110" r="20" fill="#E8F7EE" /><text x="110" y="115" fill="#16A34A">TK</text>
              <circle cx="370" cy="110" r="20" fill="#FEF0E6" /><text x="370" y="115" fill="#F97316">MO</text>
              <circle cx="140" cy="252" r="20" fill="#FFF3D0" /><text x="140" y="257" fill="#A87908">AM</text>
              <circle cx="340" cy="252" r="20" fill="#E1EEFE" /><text x="340" y="257" fill="#4F9CF9">CE</text>
              <circle cx="240" cy="290" r="20" fill="#E8F7EE" /><text x="240" y="295" fill="#16A34A">FS</text>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}

export default FeatureCampus;