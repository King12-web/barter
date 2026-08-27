function WhyUs() {
  return (
    <section className="band-soft" id="why">
      <div className="wrap">
        <div className="navy-band">
          <svg className="hero-curve" viewBox="0 0 400 400" aria-hidden="true">
            <path d="M 10 200 Q 100 40 200 120 T 390 100" />
            <path d="M 10 260 Q 120 100 220 180 T 395 160" />
          </svg>
          <h2>A better way to learn and grow on campus</h2>
          <div className="navy-feats">
            <div className="nf">
              <div className="nf-icon nfi-yellow">
                <svg className="icon" style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Student to student</h3>
              <p>Trade directly with students at real institutions with no middlemen.</p>
            </div>
            <div className="nf">
              <div className="nf-icon nfi-orange">
                <svg className="icon" style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M9 9h.01M15 15h.01M20 12c0 1.38-.28 2.63-.76 3.74M4.73 4.73A9.95 9.95 0 0 0 4 12c0 5.52 3.58 8 8 8 1.44 0 2.8-.3 4-.87" />
                </svg>
              </div>
              <h3>No money involved</h3>
              <p>Your skills are the currency. Swap, learn, grow together.</p>
            </div>
            <div className="nf">
              <div className="nf-icon nfi-blue">
                <svg className="icon" style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <h3>Campus first</h3>
              <p>Your institution is your home board, with 330+ supported nationwide.</p>
            </div>
            <div className="nf">
              <div className="nf-icon nfi-green">
                <svg className="icon" style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>Trust you can see</h3>
              <p>Ratings and trade history on every profile. Deliver, and it shows.</p>
            </div>
            <div className="nf">
              <div className="nf-icon nfi-yellow">
                <svg className="icon" style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3>Private by default</h3>
              <p>Your WhatsApp number is only shared when you accept a trade.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyUs;