import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer>
      <p>Made for <span className="ft-green">students</span>, by <span className="ft-green">students</span>. Trade skills. Grow together.</p>
      <p style={{ marginTop: "10px", fontSize: "11.5px" }}>
        <Link to="/terms" style={{ color: "inherit", textDecoration: "underline" }}>Terms of Service</Link>
        {" "}&middot;{" "}
        <Link to="/privacy" style={{ color: "inherit", textDecoration: "underline" }}>Privacy Policy</Link>
      </p>
    </footer>
  );
}

export default Footer;