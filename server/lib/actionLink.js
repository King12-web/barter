// ============================================================
// Firebase's generated link points at *.firebaseapp.com, but the
// actual verification power lives entirely in the oobCode query
// param, validated against Firebase's own servers regardless of
// what URL carried it. So we pull just that code and build our
// own branded /auth-action link. Same security, our domain.
// ============================================================
export function buildOwnActionLink(firebaseLink, mode) {
  const oobCode = new URL(firebaseLink).searchParams.get("oobCode");
  return `https://campusbarter.online/auth-action?mode=${mode}&oobCode=${oobCode}`;
}