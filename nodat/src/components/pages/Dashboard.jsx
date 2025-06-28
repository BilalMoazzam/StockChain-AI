"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useInventory } from "../../context/InventoryContext";
import { Blocks, ArrowDownRight, Zap, CheckCircle } from "lucide-react";
import "../styles/Dashboard.css";
import SalesChart from "../analytics/SalesChart";
import InventoryChart from "../analytics/InventoryChart";
import AIPredictionChart from "../analytics/AIPredictionChart";
import StockStatusPieChart from "../analytics/StockStatusPieChart";
import { fetchBlockchainTransactions } from "../services/blockchain";
import { useThreshold } from "../../context/ThresholdContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { inventory } = useInventory();
  const { threshold } = useThreshold();

  // Loading flags
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Shared dashboard data
  const [dashboardData, setDashboardData] = useState({
    metrics: [],
    latestBlockchainTransactions: [],
    error: null,
  });

  // Analytics chart data
  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [aiPredictionChartData, setAiPredictionChartData] = useState([]);
  const [stockStatusChartData, setStockStatusChartData] = useState([]);

  const [dateRange, setDateRange] = useState("month");
  const [lastUpdated, setLastUpdated] = useState("");

  // Helper: stock status
  const getItemStatus = (qty) => {
    if (qty <= 0) return "Out of Stock";
    if (qty <= threshold) return "Low Stock"; // Dynamic threshold applied
    return "In Stock";
  };

  // Helper: generate inventory trend
  const generateInventoryData = (range, products) => {
    const pts = range === "week" ? 7 : range === "year" ? 12 : 30;
    const totalQty = products.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
    const avg = totalQty / pts;
    return Array.from({ length: pts }, (_, index) => ({
      name: `Day ${index + 1}`,
      value: Math.round(avg * (0.7 + Math.random() * 0.6)),
    }));
  };

  // Helper: generate sales trend
  const generateSalesData = (range, total) => {
    const pts = range === "week" ? 7 : range === "year" ? 12 : 30;
    const avg = total > 0 ? total / pts : 1000000 / pts; // Default to a reasonable value if total is 0
    const minValue = Math.max(avg * 0.7, 100000);
    const maxValue = avg * 1.3;
    return Array.from({ length: pts }, (_, index) => ({
      name: `Day ${index + 1}`, // Ensure name is set for each point
      value: Math.round(minValue + Math.random() * (maxValue - minValue)),
    }));
  };

  // 1) Fetch metrics + blockchain transactions
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoadingMetrics(true);

        // Fetch on-chain data
        const chain = await fetchBlockchainTransactions();
        const txs = Array.isArray(chain) ? chain : chain.data || [];

        // Compute low/out-of-stock
        const lowStock = inventory.filter((i) => getItemStatus(i.quantity) === "Low Stock");
        const outStock = inventory.filter((i) => getItemStatus(i.quantity) === "Out of Stock");
        const acceptedBlockchainTransactions = txs.filter(
          (tx) => tx.status === "Confirmed" || tx.status === "Accepted"
        ).length;

        // Assemble cards
        const metrics = [
          {
            id: "total-products",
            title: "Total Products",
            value: inventory.length,
            icon: <Blocks size={24} />,
            bgColor: "#f2f60f",
            textColor: "#000",
            iconBg: "#000",
            iconColor: "#0ea5e9",
          },
          {
            id: "low-stock",
            title: "Low Stock",
            value: lowStock.length,
            icon: <ArrowDownRight size={24} />,
            bgColor: "#f2f60f",
            textColor: "#000",
            iconBg: "#000",
            iconColor: "#f59e0b",
          },
          {
            id: "out-of-stock",
            title: "Out of Stock",
            value: outStock.length,
            icon: <Zap size={24} />,
            bgColor: "#f2f60f",
            textColor: "#000",
            iconBg: "#000",
            iconColor: "#ef4444",
          },
          {
            id: "accepted-blockchain-tx",
            title: "Accepted Blockchain Tx",
            value: acceptedBlockchainTransactions,
            icon: <CheckCircle size={24} />,
            bgColor: "#f2f60f",
            textColor: "#000",
            iconBg: "#000",
            iconColor: "#22c55e",
          },
        ];

        setDashboardData((d) => ({
          ...d,
          metrics,
          latestBlockchainTransactions: txs,
        }));
        setLastUpdated(new Date().toLocaleString());
      } catch (err) {
        console.error(err);
        setDashboardData((d) => ({ ...d, error: "Failed to load metrics" }));
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchMetrics();
  }, [inventory]);

  // 2) Fetch analytics (charts)
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoadingAnalytics(true);
        const res = await fetch("http://localhost:5000/api/analytics/optimized");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        console.log("API Response:", data); // Debug log to check the response

        const { predictions, totalSales = 0 } = data; // Default totalSales to 0 if not present

        // Enhance predictions with AI predictions
        predictions.forEach((item) => {
          if (item.quantity > 100) {
            item.ai_prediction = "Enough";
          } else if (item.quantity > 50) {
            item.ai_prediction = "Monitor";
          } else {
            item.ai_prediction = "Reorder";
          }
        });

        // Aggregate AI prediction counts
        const aiPredCounts = predictions.reduce((acc, item) => {
          const key = item.ai_prediction || "Unknown";
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});

        console.log("AI Prediction Counts:", aiPredCounts); // Debug log

        // Update AI prediction chart data
        setAiPredictionChartData([
          { name: "Enough", count: aiPredCounts["Enough"] || 0 },
          { name: "Monitor", count: aiPredCounts["Monitor"] || 0 },
          { name: "Reorder", count: aiPredCounts["Reorder"] || 0 },
          { name: "Unknown", count: aiPredCounts["Unknown"] || 0 },
        ]);

        // Update stock status chart data
        const stockCounts = predictions.reduce(
          (acc, item) => {
            const stockStatus = item.stock || getItemStatus(item.quantity); // Fallback to calculated status
            if (
              stockStatus === "In Stock" ||
              stockStatus === "Low Stock" ||
              stockStatus === "Out of Stock"
            ) {
              acc[stockStatus] = (acc[stockStatus] || 0) + 1;
            }
            return acc;
          },
          { "In Stock": 0, "Low Stock": 0, "Out of Stock": 0 }
        );

        setStockStatusChartData([
          { name: "In Stock", count: stockCounts["In Stock"] || 0 },
          { name: "Low Stock", count: stockCounts["Low Stock"] || 0 },
          { name: "Out of Stock", count: stockCounts["Out of Stock"] || 0 },
        ]);

        // Generate sales and inventory data
        setSalesData(generateSalesData(dateRange, totalSales));
        setInventoryData(generateInventoryData(dateRange, predictions));

        setLastUpdated(new Date().toLocaleString());
      } catch (err) {
        console.error("Fetch error:", err);
        setAiPredictionChartData([]);
        setStockStatusChartData([]);
        setSalesData([]);
        setInventoryData([]);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    fetchAnalytics();
  }, [dateRange, threshold]);

  // 3) Render
  if (loadingMetrics || loadingAnalytics) {
    return (
      <div className="dashboard-loading-container">
        <div className="dashboard-spinner" />
        <p>Loading dashboard data…</p>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="dashboard-error-message">
        <h3>Error Loading Dashboard</h3>
        <p>{dashboardData.error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Top Metric Cards */}
      <div className="metric-cards-grid">
        {dashboardData.metrics.map((metric) => (
          <div
            key={metric.id}
            className="metric-card"
            style={{ backgroundColor: metric.bgColor, color: metric.textColor }}
            onClick={() => navigate("/inventory")}
          >
            <div className="metric-card-header">
              <span className="metric-title">{metric.title}</span>
              <div className="metric-icon-wrapper">{metric.icon}</div>
            </div>
            <div className="metric-value" style={{ color: metric.textColor }}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content-grid">
        {/* Sales Trends */}
        <div className="section">
          <h3>Sales Trends</h3>
          <div className="charts-grid">
            {salesData.length > 0 ? (
              <SalesChart data={salesData} dateRange={dateRange} />
            ) : (
              <p>No sales data available.</p>
            )}
          </div>
        </div>

        {/* Inventory Trends */}
        <div className="section">
          <h3>Inventory Trends</h3>
          <div className="charts-grid">
            <InventoryChart data={inventoryData} dateRange={dateRange} />
          </div>
        </div>

        {/* AI Inventory Monitoring */}
        <div className="section">
          <h3>AI Inventory Monitoring</h3>
          <div className="charts-grid">
            <AIPredictionChart data={aiPredictionChartData} />
          </div>
        </div>

        {/* Stock Status */}
        <div className="section">
          <h3>AI Inventory Prediction Overview</h3>
          <div className="charts-grid">
            <StockStatusPieChart data={stockStatusChartData} />
          </div>
        </div>

        {/* Blockchain Transactions */}
        <div className="dashboard-card blockchain-transactions-card">
          <h3 className="card-title">Latest Blockchain Transactions</h3>
          <div className="table-wrapper">
            <table className="blockchain-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.latestBlockchainTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-data">
                      No recent blockchain transactions.
                    </td>
                  </tr>
                ) : (
                  dashboardData.latestBlockchainTransactions
                    .slice(-5)
                    .reverse()
                    .map((tx, idx) => (
                      <tr key={idx} onClick={() => navigate("/blockchain")}>
                        <td>{tx.hash || tx._id || "N/A"}</td>
                        <td>{tx.name || "N/A"}</td>
                        <td>Rs. {tx.price || "N/A"}</td>
                        <td>
                          <span
                            className={`status-badge status-${tx.status?.toLowerCase()}`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td>
                          {tx.time
                            ? new Date(tx.time).toLocaleString()
                            : "Not Available"}
                        </td>
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
};

export default Dashboard;