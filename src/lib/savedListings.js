import { authHeader } from "./authHeader.js";

export async function saveListing(listingId) {
  try {
    const response = await fetch("/api/saved-listings", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({ listingId }),
    });
    const data = await response.json();
    return data.ok ? { ok: true } : { ok: false, message: "Couldn't save this listing." };
  } catch (error) {
    return { ok: false, message: "Network problem. Check your connection and try again." };
  }
}

export async function unsaveListing(listingId) {
  try {
    const response = await fetch(`/api/saved-listings/${encodeURIComponent(listingId)}`, {
      method: "DELETE",
      headers: await authHeader(),
    });
    const data = await response.json();
    return data.ok ? { ok: true } : { ok: false, message: "Couldn't remove this listing." };
  } catch (error) {
    return { ok: false, message: "Network problem. Check your connection and try again." };
  }
}

export async function getSavedListingIds() {
  try {
    const response = await fetch("/api/saved-listings", {
      headers: await authHeader(),
    });
    const data = await response.json();
    return data.ok ? data.listingIds : [];
  } catch (error) {
    return [];
  }
}