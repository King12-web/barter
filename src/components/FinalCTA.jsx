import { Link } from "react-router-dom";

function FinalCTA() {
  return (
    <div className="final-band">
      <h2>Try Campus Barter today</h2>
      <p>Join your campus board and make your first swap this week.</p>
      <Link className="btn btn-yellow" to="/join">Get started for free</Link>
    </div>
  );
}

export default FinalCTA;