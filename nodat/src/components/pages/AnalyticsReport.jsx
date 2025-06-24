// frontend/src/components/AnalyticsReport.jsx

"use client";

import { useState, useEffect } from "react";
import Header from "../layout/Header";
import MetricsCards from "../analytics/MetricsCards";
import SalesChart from "../analytics/SalesChart";
import InventoryChart from "../analytics/InventoryChart";
import CustomizableReport from "../analytics/CustomizableReport";
import ExportReports from "../analytics/ExportReports";
import AIPredictionTable from "../analytics/AIPredictionTable";
import AIPredictionChart from "../analytics/AIPredictionChart";
import StockStatusPieChart from "../analytics/StockStatusPieChart";
import ProductSalesLookup from "../analytics/ProductSalesLookup";
import { RefreshCw } from "lucide-react";
import "../styles/AnalyticsReport.css";

const AnalyticsReport = () => {
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    bestSellingProduct: "",
    inventoryHealth: 0,
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

      setMetrics({
        totalSales,
        bestSellingProduct: best.name,
        inventoryHealth,
      });

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
      setMetrics({
        totalSales: 0,
        bestSellingProduct: "N/A",
        inventoryHealth: 0,
      });
      setSalesData([]);
      setInventoryData([]);
      setAiPredictions([]);
      setAiPredictionChartData([]);
      setStockStatusChartData([]);
    } finally {
      setLoading(false);
    }
  };

  // Helpers (unchanged)
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
    <div>
      <Header
        title="Analytics and Reports"
        breadcrumbs={[
          { text: "Dashboard", active: false },
          { text: "Analytics and Reports", active: true },
        ]}
      />

      <div className="analytics-report">
        <div className="analytics-header">
          {/* <h2>Analytics and Reports</h2> */}
          <p className="last-updated">
            Last updated: {lastUpdated}
            <button onClick={fetchAnalyticsData}>
              <RefreshCw size={14} />
            </button>
          </p>
          <div className="date-range-selector">
            <label>Date Range:</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last 12 Months</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading analytics data...</div>
        ) : (
          <>
            <MetricsCards metrics={metrics} />

            <div className="section">
              <h3>Sales & Inventory Trends</h3>
              <div className="charts-grid">
                <SalesChart data={salesData} dateRange={dateRange} />
                <InventoryChart data={inventoryData} dateRange={dateRange} />
              </div>
            </div>

            <div className="section">
              <h3>AI Inventory Prediction Overview</h3>
              <div className="charts-grid">
                <AIPredictionChart data={aiPredictionChartData} />
                <StockStatusPieChart data={stockStatusChartData} />
              </div>
            </div>

            <div className="section">
              <h3>Product Sales Lookup & Top Products</h3>
              <ProductSalesLookup products={aiPredictions} />
            </div>

            <div className="section">
              <h3>Detailed AI Inventory Insights (All Products)</h3>
              <AIPredictionTable predictions={aiPredictions} />
            </div>

            <div className="section">
              <h3>Customizable Report (Shoes Category)</h3>
              <CustomizableReport allProducts={aiPredictions} />
            </div>

            <div className="section">
              <h3>Export Reports</h3>
              <ExportReports />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsReport;
