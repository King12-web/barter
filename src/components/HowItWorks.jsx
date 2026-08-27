function HowItWorks() {
  return (
    <section id="how">
      <div className="wrap">
        <div className="steps-head">
          <h2>
            Four steps to your{" "}
            <span className="hl on-white">
              first swap
              <svg viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M2 7 Q 50 1 98 6" />
              </svg>
            </span>
          </h2>
          <p>From sign-up to a completed trade, simpler than buying airtime.</p>
        </div>

        <div className="steps">
          <div className="step-card">
            <p className="num n1">01</p>
            <h3>Create your profile</h3>
            <p>Your name, your institution, the skills you offer and the ones you need. Sixty seconds.</p>
          </div>
          <div className="step-card">
            <p className="num n2">02</p>
            <h3>Explore the board</h3>
            <p>Browse students on your campus first, or widen the search across Nigeria.</p>
          </div>
          <div className="step-card">
            <p className="num n3">03</p>
            <h3>Propose a trade</h3>
            <p>Pick the skills to swap, add your terms, send it. Matches make it one tap.</p>
          </div>
          <div className="step-card">
            <p className="num n4">04</p>
            <h3>Trade, learn, rate</h3>
            <p>Link up on WhatsApp, get it done, rate each other. Reputation is earned.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;