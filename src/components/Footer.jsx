import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer>
      <p>Made for <span className="ft-green">students</span>, by <span className="ft-green">students</span>. Trade skills. Grow together.</p>
      <p className="legal-row" style={{ marginTop: "10px" }}>
        <Link to="/terms" className="legal">Terms of Service</Link>
        {" "}&middot;{" "}
        <Link to="/privacy" className="legal">Privacy Policy</Link>
      </p>
    </footer>
  );
}

export default Footer;