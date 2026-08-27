function FAQ() {
  return (
    <section id="faq">
      <div className="wrap faq-wrap">
        <div className="steps-head">
          <h2>
            Questions students{" "}
            <span className="hl on-white">
              actually ask
              <svg viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M2 7 Q 50 1 98 6" />
              </svg>
            </span>
          </h2>
        </div>

        <details name="faq">
          <summary>
            Is Campus Barter free?
            <svg className="icon" style={{ width: "17px", height: "17px" }} viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </summary>
          <p>Completely. No fees, no subscriptions, no money anywhere in the app. That's the whole point. Your skills are the currency.</p>
        </details>

        <details name="faq">
          <summary>
            How do we contact each other after a match?
            <svg className="icon" style={{ width: "17px", height: "17px" }} viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </summary>
          <p>Through WhatsApp, where you already chat. Your number stays private until you accept a trade; then both of you get a chat button. Nobody can see or search your number on your profile.</p>
        </details>

        <details name="faq">
          <summary>
            What if someone doesn't deliver their side?
            <svg className="icon" style={{ width: "17px", height: "17px" }} viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </summary>
          <p>Every completed trade ends with both people rating each other, and ratings plus trade history show on every profile. Trade with people who deliver. Reputations are earned, not claimed.</p>
        </details>

        <details name="faq">
          <summary>
            Is my institution supported?
            <svg className="icon" style={{ width: "17px", height: "17px" }} viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </summary>
          <p>We cover 330+ Nigerian tertiary institutions: universities, polytechnics, colleges of education and monotechnics. If yours is somehow missing, pick "Other" at sign-up and we'll add it.</p>
        </details>
      </div>
    </section>
  );
}

export default FAQ;