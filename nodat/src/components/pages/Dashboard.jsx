"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowDownRight,
  Network,
  Blocks,
  Zap,
  Lightbulb,
} from "lucide-react";
import "../styles/Dashboard.css";
import { fetchInventory } from "../services/inventory";
import { fetchOrders } from "../services/orders";
// import MetricsCards from "../analytics/MetricsCards";
import SalesChart from "../analytics/SalesChart";
import InventoryChart from "../analytics/InventoryChart";
import CustomizableReport from "../analytics/CustomizableReport";
import ExportReports from "../analytics/ExportReports";
import AIPredictionTable from "../analytics/AIPredictionTable";
import AIPredictionChart from "../analytics/AIPredictionChart";
import StockStatusPieChart from "../analytics/StockStatusPieChart";
import ProductSalesLookup from "../analytics/ProductSalesLookup";

import { fetchBlockchainTransactions } from "../services/blockchain";

export default function Dashboard() {
  const navigate = useNavigate();
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

  useEffect(() => {
    const loadDashboardData = async () => {
      setDashboardData((d) => ({ ...d, loading: true, error: null }));
      try {
        // 1) fetch all three endpoints in parallel
        const [inv, ord, chain] = await Promise.all([
          fetchInventory(),
          fetchOrders(),
          fetchBlockchainTransactions(),
        ]);

        // 2) normalize inventory
        const inventoryItems = inv.items || inv || [];
        const LOW_STOCK_THRESHOLD = 9;
        const statusOf = (qty) =>
          isNaN(qty) || qty <= 0
            ? "Out of Stock"
            : qty <= LOW_STOCK_THRESHOLD
            ? "Low Stock"
            : "In Stock";
        const lowStock = inventoryItems.filter(
          (i) => statusOf(i.quantity) === "Low Stock"
        );
        const outStock = inventoryItems.filter(
          (i) => statusOf(i.quantity) === "Out of Stock"
        );

        // 3) normalize orders
        const orders = Array.isArray(ord) ? ord : ord.data || [];
        const pending = orders.filter((o) => o.status === "Pending");
        const completed = orders.filter((o) =>
          ["Delivered", "Shipped"].includes(o.status)
        );

        // 4) normalize blockchain txs
        const txs = Array.isArray(chain) ? chain : chain.data || [];

        // 5) build metrics cards
        const metrics = [
          {
            id: "p",
            title: "Total Products",
            value: inventoryItems.length,
            link: "/inventory",
            icon: <Blocks size={24} />,
          },
          {
            id: "l",
            title: "Low Stock",
            value: lowStock.length,
            link: "/inventory",
            icon: <ArrowDownRight size={24} />,
          },
          {
            id: "o",
            title: "Out of Stock",
            value: outStock.length,
            link: "/inventory",
            icon: <Zap size={24} />,
          },
          {
            id: "t",
            title: "Total Orders",
            value: orders.length,
            link: "/orders",
            icon: <Lightbulb size={24} />,
          },
          {
            id: "w",
            title: "Pending Orders",
            value: pending.length,
            link: "/orders",
            icon: <Network size={24} />,
          },
          {
            id: "c",
            title: "Completed Orders",
            value: completed.length,
            link: "/orders",
            icon: <ArrowUpRight size={24} />,
          },
        ].map((c) => ({
          ...c,
          trend: "",
          trendType: "up",
          bgColor: "#1a1a1a",
          textColor: "#fff",
          trendColor: "#aaff00",
        }));

        // 6) simulated chart data
        const weeklyOperations = [
          { day: "Mon", value: 120 },
          { day: "Tue", value: 135 },
          { day: "Wed", value: 150 },
          { day: "Thu", value: 130 },
          { day: "Fri", value: 160 },
          { day: "Sat", value: 90 },
          { day: "Sun", value: 85 },
        ];
        const supplyChainPerformance = [
          { label: "On-time Delivery", value: 94.8 },
          { label: "Inventory Accuracy", value: 97.2 },
          { label: "Order Fulfillment", value: 92.5 },
          { label: "Supplier Performance", value: 95.2 },
        ];
        const totalQty = inventoryItems.reduce((s, i) => s + i.quantity, 0);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
        const inventoryTrends = months.map((m) => ({
          month: m,
          value: Math.round(totalQty * (0.9 + Math.random() * 0.2)),
        }));
        const orderTrends = months.map((m) => ({
          month: m,
          value: Math.round((orders.length * (0.8 + Math.random() * 0.4)) / 6),
        }));

        // 7) commit everything
        setDashboardData({
          metrics,
          weeklyOperations,
          supplyChainPerformance,
          inventoryTrends,
          orderManagement: orderTrends,
          latestBlockchainTransactions: txs,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error("Dashboard data loading error:", err);
        setDashboardData((d) => ({
          ...d,
          loading: false,
          error: err.message || "Could not load dashboard",
        }));
      }
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/predict-all");
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

  // helper to compute bar heights
  const getBarHeight = (val, max) => (val / max) * 100;

  // helper to build an SVG polyline for line charts
  const getLinePath = (data, w, h, max) => {
    if (data.length < 2) return "";
    return (
      "M" +
      data
        .map((d, i) => {
          const x = (i / (data.length - 1)) * w;
          const y = h - (d.value / max) * h;
          return `${x},${y}`;
        })
        .join(" L")
    );
  };

  // helper to build an SVG path for area charts
  const getAreaPath = (data, w, h, max) => {
    if (data.length < 2) return "";
    const pts = data.map((d, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - (d.value / max) * h;
      return `${x},${y}`;
    });
    return `M${pts.join(" L")} L${w},${h} L0,${h} Z`;
  };

  const maxWeekly = Math.max(
    ...dashboardData.weeklyOperations.map((d) => d.value)
  );
  const maxInv = Math.max(...dashboardData.inventoryTrends.map((d) => d.value));
  const maxOrd = Math.max(...dashboardData.orderManagement.map((d) => d.value));
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

  return (
    <div className="dashboard-container">
      {/* Metric Cards */}
      <div className="metric-cards-grid">
        {dashboardData.metrics.map((metric) => (
          <div
            key={metric.id}
            className="metric-card"
            style={{ backgroundColor: metric.bgColor, color: metric.textColor }}
            onClick={() => navigate(metric.link)}
          >
            <div className="metric-card-header">
              <span className="metric-title">{metric.title}</span>
              <div className="metric-icon-wrapper">{metric.icon}</div>
            </div>
            <div className="metric-value">{metric.value}</div>
            {metric.trend && (
              <div
                className="metric-trend"
                style={{ color: metric.trendColor }}
              >
                {metric.trendType === "up" ? (
                  <ArrowUpRight size={16} />
                ) : (
                  <ArrowDownRight size={16} />
                )}
                {metric.trend} vs last month
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="dashboard-content-grid">
        {/* Weekly Operations */}
        <div className="section">
          <h3>Sales & Inventory Trends</h3>
          <div className="charts-grid">
            <SalesChart data={salesData} dateRange={dateRange} />
          </div>
        </div>

        {/* Supply Chain Performance */}
        <div className="section">
          <h3>Sales & Inventory Trends</h3>
          <div className="charts-grid">
            <InventoryChart data={inventoryData} dateRange={dateRange} />
          </div>
        </div>

         <div className="section">
          <h3>AI Inventory Prediction Overview</h3>
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

        {/* <div className="section">
          <h3>Detailed AI Inventory Insights (All Products)</h3>
          <AIPredictionTable predictions={aiPredictions} />
        </div> */}

        {/* Inventory Trends */}
        {/* <div
          className="dashboard-card inventory-trends-card"
          onClick={() => navigate("/inventory")}
        >
          <h3 className="card-title">Inventory Trends</h3>
          <div className="chart-container">
            <svg viewBox="0 0 400 200" className="line-chart">
              <polyline
                fill="none"
                stroke="#FFD700"
                strokeWidth="2"
                points={getLinePath(
                  dashboardData.inventoryTrends,
                  400,
                  200,
                  maxInv
                )}
              />
              {[0, maxInv / 2, maxInv].map((v, i) => (
                <text
                  key={i}
                  x="0"
                  y={200 - (v / maxInv) * 200 + 5}
                  textAnchor="end"
                  className="chart-label y-axis-label"
                >
                  {Math.round(v)}
                </text>
              ))}
              {dashboardData.inventoryTrends.map((d, i) => (
                <text
                  key={i}
                  x={(i / (dashboardData.inventoryTrends.length - 1)) * 400}
                  y="215"
                  textAnchor="middle"
                  className="chart-label x-axis-label"
                >
                  {d.month}
                </text>
              ))}
            </svg>
          </div>
        </div> */}

        {/* Order Management */}
        {/* <div
          className="dashboard-card order-management-card"
          onClick={() => navigate("/orders")}
        >
          <h3 className="card-title">Order Management</h3>
          <div className="chart-container">
            <svg viewBox="0 0 400 200" className="area-chart">
              <path
                fill="#FFD700"
                opacity="0.6"
                d={getAreaPath(dashboardData.orderManagement, 400, 200, maxOrd)}
              />
              {[0, maxOrd / 2, maxOrd].map((v, i) => (
                <text
                  key={i}
                  x="0"
                  y={200 - (v / maxOrd) * 200 + 5}
                  textAnchor="end"
                  className="chart-label y-axis-label"
                >
                  {Math.round(v)}
                </text>
              ))}
              {dashboardData.orderManagement.map((d, i) => (
                <text
                  key={i}
                  x={(i / (dashboardData.orderManagement.length - 1)) * 400}
                  y="215"
                  textAnchor="middle"
                  className="chart-label x-axis-label"
                >
                  {d.month}
                </text>
              ))}
            </svg>
          </div>
        </div> */}

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
                        <td>{tx.id || tx._id || "N/A"}</td>
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
}
