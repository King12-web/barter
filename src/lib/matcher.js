/* ============================================================
   Campus Barter's core matching rule, in ONE place.

   A match = at least one skill overlapping in EACH direction:
   they offer something I need, AND I offer something they need.
   This was previously copy-pasted identically into Dashboard.jsx
   and Matches.jsx — if the matching rule ever needed to change
   (say, requiring 2+ overlaps instead of 1), both copies would
   have to be found and updated in lockstep, with no guarantee
   they'd stay in sync. Now there's exactly one function that
   defines what a "match" means, used everywhere that concept
   is needed.
   ============================================================ */

export function isMatch(me, them) {
  const theyHelpMe = them.offers.some((s) => me.needs.includes(s));
  const iHelpThem = me.offers.some((s) => them.needs.includes(s));
  return theyHelpMe && iHelpThem;
}

export function overlap(offersA, needsB) {
  return offersA.filter((s) => needsB.includes(s));
}