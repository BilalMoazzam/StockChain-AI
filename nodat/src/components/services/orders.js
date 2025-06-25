// src/services/orders.js
const ORDERS_API = process.env.REACT_APP_ORDERS_API || "http://localhost:3000/api/orders";

export async function fetchOrders() {
  const token = localStorage.getItem("authToken");
  const res = await fetch(ORDERS_API, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Orders fetch failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  return json.data;    // ← return just the array
}
