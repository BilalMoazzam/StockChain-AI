// src/services/inventory.js
const INVENTORY_API = process.env.REACT_APP_INVENTORY_API || "http://localhost:5001";

export async function fetchInventory() {
  const url = `${INVENTORY_API}/inventory`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      // include auth here if needed...
    },
  });

  // if it's not a 2xx, grab body text too
  if (!res.ok) {
    let bodyText = "";
    try {
      bodyText = await res.text();
    } catch {}
    throw new Error(
      `Inventory fetch failed:
        URL: ${url}
        Status: ${res.status} ${res.statusText}
        Body: ${bodyText}`
        .trim()
    );
  }

  return res.json(); // { items, alerts }
}
