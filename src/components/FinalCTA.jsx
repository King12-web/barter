import { Link } from "react-router-dom";

function FinalCTA() {
  return (
    <div className="final-band">
      <span className="blob blob-top" aria-hidden="true"></span>
      <span className="blob blob-low" aria-hidden="true"></span>
      <span className="blob blob-mid" aria-hidden="true"></span>
      <h2 className="reveal">Try Campus Barter today</h2>
      <p>Join your campus board and make your first swap this week.</p>
      <Link className="btn btn-yellow glow" to="/join">Get started for free</Link>
    </div>
  );
}

export default FinalCTA;