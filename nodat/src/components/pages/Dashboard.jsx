"use client";

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useInventory } from "../../context/InventoryContext"; // Use Inventory Context
import { Blocks, ArrowDownRight, Zap, CheckCircle } from "lucide-react";
import "../styles/Dashboard.css";
import SalesChart from "../analytics/SalesChart";
import InventoryChart from "../analytics/InventoryChart";
import AIPredictionChart from "../analytics/AIPredictionChart";
import StockStatusPieChart from "../analytics/StockStatusPieChart";
import { fetchBlockchainTransactions } from "../services/blockchain";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { inventory } = useInventory(); // Access inventory data from context
  const [dashboardData, setDashboardData] = useState({
    metrics: [],
    loading: true,
    error: null,
    latestBlockchainTransactions: [],
    weeklyOperations: [],
    supplyChainPerformance: [],
    inventoryTrends: [],
    orderManagement: [],
  });

  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [aiPredictionChartData, setAiPredictionChartData] = useState([]);
  const [stockStatusChartData, setStockStatusChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("month");
  const [lastUpdated, setLastUpdated] = useState("");  // To track when data was last updated

  // Helper function to determine stock status
  const getItemStatus = (qty) => {
    const LOW_STOCK_THRESHOLD = 9;
    if (qty <= 0) return "Out of Stock";
    if (qty <= LOW_STOCK_THRESHOLD) return "Low Stock";
    return "In Stock";
  };


  const generateInventoryData = (range, products) => {
    const pts = range === "week" ? 7 : range === "year" ? 12 : 30;
    const totalQty = products.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
    const avg = totalQty / pts;
    return Array.from({ length: pts }, () => ({
      name: "",
      value: Math.round(avg * (0.7 + Math.random() * 0.6)),
    }));
  };

  // Fetch blockchain transactions and metrics for the dashboard
  useEffect(() => {
  // Ensure inventory is defined and has a length
  if (inventory && inventory.length > 0) {
    const fetchData = async () => {
      try {
        setLoading(true);  // Set loading to true before data fetching

        // Fetch blockchain transactions
        const [chain] = await Promise.all([fetchBlockchainTransactions()]);

        console.log("Blockchain Transactions Data:", chain);

        // Define txs to ensure it's available and map over it safely
        const txs = Array.isArray(chain) ? chain : chain.data || [];

        const LOW_STOCK_THRESHOLD = 9;

        // Safely check if inventory is available
        const lowStock = inventory.filter(
          (item) => getItemStatus(item.quantity) === "Low Stock"
        );
        const outStock = inventory.filter(
          (item) => getItemStatus(item.quantity) === "Out of Stock"
        );

        // Normalize blockchain transactions data
        const acceptedBlockchainTransactions = txs.filter(
          (tx) => tx.status === "Confirmed" || tx.status === "Accepted"
        ).length;

        const metrics = [
          {
            id: "total-products",
            title: "Total Products",
            value: inventory.length,
            icon: <Blocks size={24} />,
            bgColor: "#e0f2fe", // Light blue
            textColor: "#0c4a6e", // Dark blue text
            iconBg: "#7dd3fc", // Medium blue for icon background
            iconColor: "#0ea5e9", // Blue icon
          },
          {
            id: "low-stock",
            title: "Low Stock",
            value: lowStock.length,
            icon: <ArrowDownRight size={24} />,
            bgColor: "#fffbeb", // Light yellow
            textColor: "#9a3412", // Dark orange text
            iconBg: "#fcd34d", // Medium yellow for icon background
            iconColor: "#f59e0b", // Orange icon
          },
          {
            id: "out-of-stock",
            title: "Out of Stock",
            value: outStock.length,
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
            icon: <CheckCircle size={24} />,
            bgColor: "#dcfce7", // Light green
            textColor: "#166534", // Dark green text
            iconBg: "#86efad", // Medium green for icon background
            iconColor: "#22c55e", // Green icon
          },
        ];

        // Simulated data for charts (could be dynamically generated from fetched data)
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

          const latestBlockchainTransactions = txs.map((tx) => ({
            hash: tx.hash || tx._id || "N/A",
            name: tx.name || "N/A", // Ensure that 'name' is set correctly
            price: tx.price ? `Rs. ${tx.price}` : "Rs. N/A", // Fallback to 'Rs. N/A' if price is not available
            status: tx.status || "N/A", // Ensure that 'status' is set correctly
            timestamp: tx.time ? new Date(tx.timestamp).toLocaleString() : "Not Available",
            from: tx.from || "N/A",
            to: tx.to || "N/A",
          }));
        

        setDashboardData({
          metrics,
          loading: false,
          error: null,
          weeklyOperations,
          supplyChainPerformance,
          latestBlockchainTransactions,
        });

        // Update the last updated time
        setLastUpdated(new Date().toLocaleString());
      } catch (err) {
        console.error("Error fetching blockchain transactions", err);
        setDashboardData((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load additional data",
        }));
      }
    };

    fetchData();
  }
}, [inventory]); // Dependency on inventory to trigger the useEffect hook


  // Fetch Analytics Data for Sales, Inventory, AI Prediction, and Stock Status
  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/products");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      console.log("Fetched Data:", data);

      let totalSales = 0;
      let inStock = 0, lowStock = 0, outStock = 0;
      data.forEach((item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.Price) || 0;
        const val = qty * price;
        totalSales += val;

        if (item.stock === "In Stock") inStock++;
        else if (item.stock === "Low Stock") lowStock++;
        else if (item.stock === "Out of Stock") outStock++;
      });

      // Generate Sales Data for chart
      const salesData = generateSalesData("month", totalSales);
      const inventoryData = generateInventoryData("month", data);

      // AI Prediction Chart Data
      const aiPredictionCounts = data.reduce((acc, item) => {
        const key = item.ai_prediction || "Unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      const aiPredictionChartData = [
        { name: "Enough", count: aiPredictionCounts["Enough"] || 0 },
        { name: "Monitor", count: aiPredictionCounts["Monitor"] || 0 },
        { name: "Reorder", count: aiPredictionCounts["Reorder"] || 0 },
      ];

      // Stock Status Chart Data
      const stockStatusChartData = [
        { name: "In Stock", count: inStock },
        { name: "Low Stock", count: lowStock },
        { name: "Out of Stock", count: outStock },
      ];

      // Update dashboard data state
      setSalesData(salesData);
      setInventoryData(inventoryData);
      setAiPredictionChartData(aiPredictionChartData);
      setStockStatusChartData(stockStatusChartData);

      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      console.error("Fetch error:", err);
      setSalesData([]);
      setInventoryData([]);
      setAiPredictionChartData([]);
      setStockStatusChartData([]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger data fetch on date range change
  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

const generateSalesData = (range, total) => {
  const pts = range === "week" ? 7 : range === "year" ? 12 : 30;
  const avg = total / pts;

  // Set reasonable min and max values to avoid extreme fluctuations
  const minValue = Math.max(avg * 0.7, 100000); // Ensure minimum is 70% of average or 100,000
  const maxValue = avg * 1.3;  // Allow a maximum fluctuation of 30% above the average

  return Array.from({ length: pts }, () => {
    const value = Math.round(minValue + Math.random() * (maxValue - minValue));

    // Clamp the value to avoid it going below the minimum
    return { name: "", value: Math.max(value, minValue) }; // Ensure value does not drop below minValue
  });
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
        {/* <div className="section">
          <h3>Sales Trends</h3>
          <SalesChart data={salesData} dateRange={dateRange} />
        </div> */}

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
                        {console.log(tx)} {/* Log the entire tx object */}
<td>
  {tx.time ? new Date(tx.time).toLocaleString() : "Not Available"}
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
