/* Only letters, hyphens and apostrophes from the first word, so a
   profile name can't smuggle a link or a message into an email
   sent from our domain. */
export function safeFirstName(name) {
  const first = String(name || "").trim().split(/\s+/)[0] || "";
  return first.replace(/[^\p{L}\p{M}'’-]/gu, "").slice(0, 40) || "there";
}
