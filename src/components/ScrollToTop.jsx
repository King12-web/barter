import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/* ============================================================
   Unlike a traditional multi-page site, React Router does NOT
   automatically scroll to the top when navigating — the browser
   never actually reloads, so it has no reason to. Without this,
   scrolling halfway down one page and clicking a link lands you
   on the NEXT page still scrolled halfway down, which reads as
   broken even though nothing actually is.

   This component renders nothing visible — it just watches the
   URL and resets scroll every time it changes.
   ============================================================ */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;