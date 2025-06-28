"use client";

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../layout/Header";
import { getContract } from "../../lib/blockchain"; // Assuming this is a .js file
import "../styles/BlockchainTransaction.css";
import { addNotification } from "../../utils/notificationService"; // Assuming this is a .js file
import { ShoppingBag, CreditCard, Package } from "lucide-react"; // Using Lucide React for icons
import { saveBlockchainTransaction } from "../services/blockchain";

export default function BlockchainTransactionPage() {
  const { state } = useLocation();
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState({});
  const [paymentStatus, setPaymentStatus] = useState("");

  const BLOCKCHAIN_KEY = "blockchainSelectedProducts";
  const STATUS_LOG_KEY = "blockchainPaymentStatusLog";

  const [statusLog, setStatusLog] = useState(() => {
    const storedLog = localStorage.getItem(STATUS_LOG_KEY);
    return storedLog ? JSON.parse(storedLog) : [];
  });

  useEffect(() => {
    localStorage.setItem(STATUS_LOG_KEY, JSON.stringify(statusLog));
  }, [statusLog]);

  useEffect(() => {
    const existing = JSON.parse(localStorage.getItem(BLOCKCHAIN_KEY)) || [];

    if (state?.product) {
      const isDuplicate = existing.some((p) => p.id === state.product.id);
      if (!isDuplicate) {
        const updated = [...existing, state.product];
        localStorage.setItem(BLOCKCHAIN_KEY, JSON.stringify(updated));
        setProducts(updated);
      } else {
        setProducts(existing);
      }
    } else {
      setProducts(existing);
    }
  }, [state?.product?.id, state?.product]); // Added state.product to dependency array

  const removeProduct = (id) => {
    const existing = JSON.parse(localStorage.getItem(BLOCKCHAIN_KEY)) || [];
    const updated = existing.filter((p) => p.id !== id);
    localStorage.setItem(BLOCKCHAIN_KEY, JSON.stringify(updated));
    setProducts(updated);
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const contract = await getContract(false); // read-only
      const count = await contract.getTransactionCount();
      const txCount = count.toNumber
        ? count.toNumber()
        : Number.parseInt(count);

      const allTx = [];
      for (let i = 0; i < txCount; i++) {
        const tx = await contract.getTransaction(i);
        allTx.push({
          txId: tx.txId,
          from: tx.fromEntity,
          to: tx.toEntity,
          type: tx.txType,
          description: tx.description,
          quantity: tx.quantity.toString(),
          status: tx.status,
          timestamp: new Date(tx.timestamp.toNumber() * 1000).toLocaleString(),
        });
      }

      setTransactions(allTx.reverse());
    } catch (err) {
      console.error("Error loading transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const ensureWalletConnected = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask not detected.");
    }
    await window.ethereum.request({ method: "eth_requestAccounts" });
  };

  const handleSinglePayment = async (product) => {
  if (!product) return;

  try {
    setIsPaying((prev) => ({ ...prev, [product.id]: true }));
    setPaymentStatus("🔄 Connecting MetaMask...");

    await ensureWalletConnected();
    const contract = await getContract(true); // signer-enabled

    const tx = await contract.recordTransaction(
      "tx-" + Date.now(),
      "User",
      "Shop",
      "Purchase",
      product?.name || "Unnamed Product",
      1,
      "Confirmed"
    );

    await tx.wait();

    addNotification({
      type: "payment",
      title: "Payment Successful",
      description: `Transaction for "${product.name}" (ID: ${product.id}) was successfully confirmed.`,
      priority: "normal",
      icon: "check",
      link: "/blockchain",
    });

    const acceptedLog = {
      time: new Date().toISOString(),
      status: "Accepted",
      name: product.name,
      id: product.id,
      size: product.size,
      price: product.price,
      sku: product.sku,
    };

    setStatusLog((prev) => [{ time: new Date().toLocaleString(), status: "Accepted", product }, ...prev]);
    await saveBlockchainTransaction(acceptedLog);

    setPaymentStatus("✅ Payment confirmed!");
    await loadTransactions();
    removeProduct(product.id);
  } catch (err) {
    console.error("Payment failed:", err);
    setPaymentStatus("❌ Payment failed or denied.");

    addNotification({
      type: "payment",
      title: "Blockchain Transaction Failed",
      description: `Transaction for "${product.name}" (ID: ${product.id}) was declined.`,
      priority: "high",
      icon: "alert",
      link: "/blockchain",
    });

    const declinedLog = {
      time: new Date().toISOString(),
      status: "Declined",
      name: product.name,
      id: product.id,
      size: product.size,
      price: product.price,
      sku: product.sku,
    };

    setStatusLog((prev) => [{ time: new Date().toLocaleString(), status: "Declined", product }, ...prev]);
    await saveBlockchainTransaction(declinedLog);
  } finally {
    setIsPaying((prev) => ({ ...prev, [product.id]: false }));
  }
};


  const handleBulkPayment = async () => {
  try {
    setIsPaying((prev) => ({ ...prev, all: true }));
    setPaymentStatus("🔄 Connecting MetaMask...");

    await ensureWalletConnected();
    const contract = await getContract(true);

    const txPromises = products.map(async (product) => {
      try {
        const tx = await contract.recordTransaction(
          "tx-" + Date.now(),
          "User",
          "Shop",
          "Purchase",
          product?.name || "Unnamed Product",
          1,
          "Confirmed"
        );

        await tx.wait();

        // ✅ Notification
        addNotification({
          type: "payment",
          title: "Bulk Payment Successful",
          description: `Payment for "${product.name}" (ID: ${product.id}) confirmed.`,
          priority: "normal",
          icon: "check",
          link: "/blockchain",
        });

        const logEntry = {
          time: new Date().toISOString(),
          status: "Accepted",
          name: product.name,
          id: product.id,
          size: product.size,
          price: product.price,
          sku: product.sku,
        };

        setStatusLog((prev) => [
          { time: new Date().toLocaleString(), status: "Accepted", product },
          ...prev,
        ]);

        await saveBlockchainTransaction(logEntry);
      } catch (err) {
        console.error("Single bulk tx failed:", err);

        // ❌ Notification
        addNotification({
          type: "payment",
          title: "Bulk Payment Failed",
          description: `Transaction for "${product.name}" (ID: ${product.id}) was declined.`,
          priority: "high",
          icon: "alert",
          link: "/blockchain",
        });

        const logEntry = {
          time: new Date().toISOString(),
          status: "Declined",
          name: product.name,
          id: product.id,
          size: product.size,
          price: product.price,
          sku: product.sku,
        };

        setStatusLog((prev) => [
          { time: new Date().toLocaleString(), status: "Declined", product },
          ...prev,
        ]);

        await saveBlockchainTransaction(logEntry);
      }
    });

    await Promise.all(txPromises);

    setPaymentStatus("✅ All payments processed.");
    await loadTransactions();
    localStorage.removeItem(BLOCKCHAIN_KEY);
    setProducts([]);
  } catch (err) {
    console.error("Bulk payment main error:", err);
    setPaymentStatus("❌ Bulk payment failed completely.");
  } finally {
    setIsPaying((prev) => ({ ...prev, all: false }));
  }
};


  return (
    <div>
      <Header
        title="Blockchain Transactions"
        breadcrumbs={[
          { text: "Dashboard", active: false },
          { text: "Blockchain Transactions", active: true },
        ]}
      />

      <div className="bt-container">
        {/* <h1 className="bt-heading">Blockchain Transactions</h1> */}

        {products.length > 0 && (
          <div className="bt-section bt-product-payment">
            <h3 className="bt-subheading">
              <ShoppingBag size={24} /> Selected Products
            </h3>
            <div className="bt-table-wrapper">
              <table className="bt-detail-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    
                    <th>ID</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, idx) => (
                    <tr key={idx}>
                      <td>{product.name}</td>
                      <td>Rs. {product.price}</td>
                      
                      <td>{product.id || "N/A"}</td>
                      <td>{product.size || "Standard"}</td>
                      <td>{product.status || "In Stock"}</td>
                      <td>
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="remove-from-order-btn"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => handleSinglePayment(product)}
                          disabled={!!isPaying[product.id]}
                          className="buy-from-order-btn"
                        >
                          {isPaying[product.id]
                            ? "Processing..."
                            : "Pay Amount"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bt-payment-method">
              <h4 className="bt-subheading">
                <CreditCard size={24} /> Payment Method
              </h4>
              <p>
                Payment via <strong>MetaMask Wallet</strong>
              </p>
              <button
                onClick={handleBulkPayment}
                disabled={!!isPaying.all}
                className="bt-pay-btn"
              >
                {isPaying.all ? "Processing..." : "Confirm & Pay for All"}
              </button>
              {paymentStatus && (
                <p
                  className={`bt-status-message ${
                    paymentStatus.startsWith("✅") ? "success" : "error"
                  }`}
                >
                  {paymentStatus}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="bt-section">
          <h3 className="bt-subheading">
            <Package size={24} /> Payment Status Log
          </h3>
          <div className="bt-table-wrapper">
            <table className="bt-transaction-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Name</th>
                  <th>ID</th>
                
                  <th>Price</th>
                  
                </tr>
              </thead>
              <tbody>
                {statusLog.length === 0 ? (
                  <tr>
                    <td colSpan="7">No payment log available yet.</td>
                  </tr>
                ) : (
                  statusLog.map((log, index) => (
                    <tr key={index}>
                      <td>{log.time}</td>
                      <td>
                        <span
                          className={`bt-status-badge ${
                            log.status === "Accepted" ? "success" : "failed"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td>{log.product.name}</td>
                      <td>{log.product.id || "N/A"}</td>
                     
                      <td>Rs. {log.product.price}</td>
                      
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
