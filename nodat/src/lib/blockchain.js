import { BrowserProvider, Contract } from "ethers";
import abi from "../abi/SupplyChainTransactions.json";

const CONTRACT_ADDRESS = "0xc64951694d0b5ebfcf612dae4221e0af35d4cd44";

export async function getContract() {
  if (!window.ethereum) {
    alert("Please install MetaMask!");
    throw new Error("MetaMask not found");
  }

  try {
    // Force MetaMask to prompt connection
    const provider = new BrowserProvider(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const signer = await provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, abi, signer);
  } catch (err) {
    console.error("MetaMask connection error:", err);
    throw new Error("User denied wallet connection or connection failed");
  }
}
