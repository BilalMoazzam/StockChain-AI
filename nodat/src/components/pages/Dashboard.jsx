"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Blocks,
  ArrowDownRight,
  Zap,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";
import "../styles/Dashboard.css";
import { fetchInventory } from "../services/inventory";
import { fetchOrders } from "../services/orders";
import { fetchBlockchainTransactions } from "../services/blockchain";
import SalesChart from "../analytics/SalesChart";
import InventoryChart from "../analytics/InventoryChart";
import AIPredictionChart from "../analytics/AIPredictionChart";
import StockStatusPieChart from "../analytics/StockStatusPieChart";
import { useInventory } from "../../context/InventoryContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState({
    metrics: [],
    weeklyOperations: [],
    supplyChainPerformance: [],
    inventoryTrends: [],
    orderManagement: [],
    latestBlockchainTransactions: [],
    loading: true,
    error: null,
  });

  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [aiPredictions, setAiPredictions] = useState([]);
  const [aiPredictionChartData, setAiPredictionChartData] = useState([]);
  const [stockStatusChartData, setStockStatusChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("month");
  const [lastUpdated, setLastUpdated] = useState("");
  const { inventory, fetchInventoryData, isLoading, error } = useInventory();




 const loadDashboardData = async () => {
  setDashboardData((prev) => ({ ...prev, loading: true, error: null }));
  try {
    // 1) fetch all three endpoints in parallel
    const [inv, ord, chain] = await Promise.all([
      fetchInventory(),
      fetchOrders(),
      fetchBlockchainTransactions(),
    ]);

    // 2) normalize inventory
    const inventoryItems = inv.items || inv || [];
    const LOW_STOCK_THRESHOLD = 9; // Ensure this is the correct threshold for low stock
    const statusOf = (qty) => {
      if (isNaN(qty) || qty <= 0) return "Out of Stock"; // Out of stock if quantity is 0 or negative
      if (qty <= LOW_STOCK_THRESHOLD) return "Low Stock"; // Low stock if less than or equal to 9
      return "In Stock"; // Otherwise, it's in stock
    };

    // 3) filter based on stock status
    const lowStock = inventoryItems.filter((i) => statusOf(i.quantity) === "Low Stock");
    const outStock = inventoryItems.filter((i) => statusOf(i.quantity) === "Out of Stock");

    // 4) normalize orders
    const orders = Array.isArray(ord) ? ord : ord.data || [];
    const pending = orders.filter((o) => o.status === "Pending");
    const completed = orders.filter((o) => ["Delivered", "Shipped"].includes(o.status));

    // 5) normalize blockchain transactions and count accepted ones
    const txs = Array.isArray(chain) ? chain : chain.data || [];
    const acceptedBlockchainTransactions = txs.filter(
      (tx) => tx.status === "Confirmed" || tx.status === "Accepted"
    ).length;

    // 6) build metrics cards
    const metrics = [
      {
        id: "total-products",
        title: "Total Products",
        value: inventoryItems.length,
        link: "/inventory",
        icon: <Blocks size={24} />,
        bgColor: "#e0f2fe", // Light blue
        textColor: "#0c4a6e", // Dark blue text
        iconBg: "#7dd3fc", // Medium blue for icon background
        iconColor: "#0ea5e9", // Blue icon
      },
      {
        id: "low-stock",
        title: "Low Stock",
        value: lowStock.length, // Correctly show the count of low stock
        link: "/inventory",
        icon: <ArrowDownRight size={24} />,
        bgColor: "#fffbeb", // Light yellow
        textColor: "#9a3412", // Dark orange text
        iconBg: "#fcd34d", // Medium yellow for icon background
        iconColor: "#f59e0b", // Orange icon
      },
      {
        id: "out-of-stock",
        title: "Out of Stock",
        value: outStock.length, // Correctly show the count of out of stock
        link: "/inventory",
        icon: <Zap size={24} />,
        bgColor: "#fee2e2", // Light red
        textColor: "#991b1b", // Dark red text
        iconBg: "#fca5a5", // Medium red for icon background
        iconColor: "#ef4444", // Red icon
      },
      {
        id: "accepted-blockchain-tx",
        title: "Accepted Blockchain Tx",
        value: acceptedBlockchainTransactions,
        link: "/blockchain",
        icon: <CheckCircle size={24} />,
        bgColor: "#dcfce7", // Light green
        textColor: "#166534", // Dark green text
        iconBg: "#86efad", // Medium green for icon background
        iconColor: "#22c55e", // Green icon
      },
    ];

    // 7) Simulated chart data (unchanged)
    const weeklyOperations = [
      { day: "Mon", value: Math.floor(Math.random() * 50) + 100 },
      { day: "Tue", value: Math.floor(Math.random() * 50) + 100 },
      { day: "Wed", value: Math.floor(Math.random() * 50) + 100 },
      { day: "Thu", value: Math.floor(Math.random() * 50) + 100 },
      { day: "Fri", value: Math.floor(Math.random() * 50) + 100 },
      { day: "Sat", value: Math.floor(Math.random() * 50) + 50 },
      { day: "Sun", value: Math.floor(Math.random() * 50) + 40 },
    ];

    const supplyChainPerformance = [
      { label: "On-time Delivery", value: 94.8 },
      { label: "Inventory Accuracy", value: 97.2 },
      { label: "Order Fulfillment", value: 92.5 },
      { label: "Supplier Performance", value: 95.2 },
    ];

    const totalCurrentInventoryQty = inventoryItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const inventoryTrends = [
      {
        month: "Jan",
        value: totalCurrentInventoryQty * (0.9 + Math.random() * 0.2),
      },
      {
        month: "Feb",
        value: totalCurrentInventoryQty * (0.9 + Math.random() * 0.2),
      },
      {
        month: "Mar",
        value: totalCurrentInventoryQty * (0.9 + Math.random() * 0.2),
      },
      {
        month: "Apr",
        value: totalCurrentInventoryQty * (0.9 + Math.random() * 0.2),
      },
      {
        month: "May",
        value: totalCurrentInventoryQty * (0.9 + Math.random() * 0.2),
      },
      {
        month: "Jun",
        value: totalCurrentInventoryQty * (0.9 + Math.random() * 0.2),
      },
    ].map((d) => ({ ...d, value: Math.round(d.value) }));

    const orderTrends = [
      {
        month: "Jan",
        value: (orders.length * (0.8 + Math.random() * 0.4)) / 6,
      },
      {
        month: "Feb",
        value: (orders.length * (0.8 + Math.random() * 0.4)) / 6,
      },
      {
        month: "Mar",
        value: (orders.length * (0.8 + Math.random() * 0.4)) / 6,
      },
      {
        month: "Apr",
        value: (orders.length * (0.8 + Math.random() * 0.4)) / 6,
      },
      {
        month: "May",
        value: (orders.length * (0.8 + Math.random() * 0.4)) / 6,
      },
      {
        month: "Jun",
        value: (orders.length * (0.8 + Math.random() * 0.4)) / 6,
      },
    ].map((d) => ({ ...d, value: Math.round(d.value) }));

    const latestBlockchainTransactions = txs.map((tx) => ({
      // Ensure consistent structure for display
      hash: tx.hash || tx._id || "N/A",
      type: tx.type || "N/A",
      timestamp: tx.timestamp || new Date().toLocaleString(),
      status: tx.status || "N/A",
      quantity: tx.quantity || 0,
      from: tx.from || "N/A",
      to: tx.to || "N/A",
    }));

    setDashboardData({
      metrics,
      weeklyOperations,
      supplyChainPerformance,
      inventoryTrends,
      orderManagement: orderTrends,
      latestBlockchainTransactions,
      loading: false,
      error: null,
    });
  } catch (err) {
    console.error("Dashboard data loading error:", err);
    setDashboardData((prev) => ({
      ...prev,
      loading: false,
      error: err.message || "Failed to load dashboard data",
    }));
  }
};
  useEffect(() => {
    if (location.pathname === "/dashboard" || location.pathname === "/") {
      loadDashboardData();
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/products");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      console.log("Raw AI data:", data);
      setAiPredictions(data);

      // Metrics
      let totalSales = 0;
      let best = { name: "N/A", value: 0 };
      let inStock = 0,
        lowStock = 0,
        outStock = 0,
        enoughCnt = 0,
        reorderCnt = 0;

      data.forEach((item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.Price) || 0;
        const val = qty * price;
        totalSales += val;
        if (val > best.value) best = { name: item.ProductName, value: val };

        if (item.stock === "In Stock") inStock++;
        else if (item.stock === "Low Stock") lowStock++;
        else if (item.stock === "Out of Stock") outStock++;

        if (item.ai_prediction === "Enough") enoughCnt++;
        else if (item.ai_prediction === "Reorder") reorderCnt++;
      });

      const totalProducts = data.length;
      const inventoryHealth =
        totalProducts > 0
          ? Math.round(
              ((totalProducts - reorderCnt - outStock) / totalProducts) * 100
            )
          : 0;

      // Charts
      setSalesData(generateSalesData(dateRange, totalSales));
      setInventoryData(generateInventoryData(dateRange, data));

      const predCounts = data.reduce((acc, it) => {
        const key = it.ai_prediction || "Unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      setAiPredictionChartData([
        { name: "Enough", count: predCounts["Enough"] || 0 },
        { name: "Monitor", count: predCounts["Monitor"] || 0 },
        { name: "Reorder", count: predCounts["Reorder"] || 0 },
      ]);

      setStockStatusChartData([
        { name: "In Stock", count: inStock },
        { name: "Low Stock", count: lowStock },
        { name: "Out of Stock", count: outStock },
      ]);

      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      console.error("Fetch error:", err);
      setSalesData([]);
      setInventoryData([]);
      setAiPredictions([]);
      setAiPredictionChartData([]);
      setStockStatusChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSalesData = (range, total) => {
    const pts = range === "week" ? 7 : range === "year" ? 12 : 30;
    const avg = total / pts;
    return Array.from({ length: pts }, () => ({
      name: "",
      value: Math.round(avg * (0.8 + Math.random() * 0.4)),
    }));
  };

  const generateInventoryData = (range, products) => {
    const pts = range === "week" ? 7 : range === "year" ? 12 : 30;
    const totalQty = products.reduce(
      (s, it) => s + (Number(it.quantity) || 0),
      0
    );
    const avg = totalQty / pts;
    return Array.from({ length: pts }, () => ({
      name: "",
      value: Math.round(avg * (0.7 + Math.random() * 0.6)),
    }));
  };

  if (dashboardData.loading) {
    return (
      <div className="dashboard-loading-container">
        <div className="dashboard-spinner" />
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error-message">
          <h3>Error Loading Dashboard</h3>
          <p>{dashboardData.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="dashboard-retry-btn"
          >
            Try Again
          </button>
        </div>
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
            onClick={() => navigate(metric.link)}
          >
            <div className="metric-card-header">
              <span
                className="metric-title"
                style={{ color: metric.textColor }}
              >
                {metric.title}
              </span>
              <div
                className="metric-icon-wrapper"
                style={{
                  backgroundColor: metric.iconBg,
                  color: metric.iconColor,
                }}
              >
                {metric.icon}
              </div>
            </div>
            <div className="metric-value" style={{ color: metric.textColor }}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-content-grid">
        {/* Weekly Operations */}
        <div className="section">
          <h3>Sales Trends</h3>
          <div className="charts-grid">
            <SalesChart data={salesData} dateRange={dateRange} />
          </div>
        </div>

        {/* Supply Chain Performance */}
        <div className="section">
          <h3>Inventory Trends</h3>
          <div className="charts-grid">
            <InventoryChart data={inventoryData} dateRange={dateRange} />
          </div>
        </div>

        <div className="section">
          <h3>AI Inventory Monitoring</h3>
          <div className="charts-grid">
            <AIPredictionChart data={aiPredictionChartData} />
          </div>
        </div>

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
