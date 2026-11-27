import { useState, useEffect } from "react";

/* Appears once the visitor has scrolled past the top of the page.
   Scrolling is smooth because index.css sets scroll-behavior on
   <html> (switched off for reduced motion in landing.css). */
function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 400);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      type="button"
      className={"to-top" + (visible ? " show" : "")}
      onClick={() => window.scrollTo({ top: 0 })}
      aria-label="Back to top"
    >
      <svg className="icon" style={{ width: "22px", height: "22px" }} viewBox="0 0 24 24" aria-hidden="true">
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    </button>
  );
}

export default BackToTop;
