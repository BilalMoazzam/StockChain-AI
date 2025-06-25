// src/services/blockchain.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// fetch the last 10 transactions
export async function fetchBlockchainTransactions() {
  const res = await axios.get(`${API_BASE}/blockchain/transactions`);
  if (res.status !== 200) throw new Error(`Blockchain fetch failed: ${res.status}`);
  return res.data;  // should be an array
}

// persist a single payment status log
export async function saveBlockchainTransaction(entry) {
  const res = await axios.post(`${API_BASE}/blockchain/transactions`, entry);
  if (res.status !== 201 && res.status !== 200) {
    throw new Error(`Save failed: ${res.status}`);
  }
  return res.data;
}
