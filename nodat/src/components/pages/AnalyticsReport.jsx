"use client";

import { useState, useEffect } from "react";
import Header from "../layout/Header";
import MetricsCards from "../analytics/MetricsCards";
import SalesChart from "../analytics/SalesChart";
import InventoryChart from "../analytics/InventoryChart";
import AIPredictionChart from "../analytics/AIPredictionChart";
import StockStatusPieChart from "../analytics/StockStatusPieChart";
import ProductSalesLookup from "../analytics/ProductSalesLookup";
import { RefreshCw } from "lucide-react";
import "../styles/AnalyticsReport.css";
import AIPredictionTable from "../analytics/AIPredictionTable";
import CustomizableReport from "../analytics/CustomizableReport";
import ExportReports from "../analytics/ExportReports";
import { useThreshold } from "../../context/ThresholdContext";

const AnalyticsReport = () => {
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    bestSellingProduct: "",
    inventoryHealth: 0,
  });
  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [aiPredictionChartData, setAiPredictionChartData] = useState([]);
  const [stockStatusChartData, setStockStatusChartData] = useState([]);
  const [aiPredictions, setAiPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("month");
  const [lastUpdated, setLastUpdated] = useState("");
  const { threshold } = useThreshold();


   useEffect(() => {
    console.log("Threshold value updated:", threshold);
    fetchAnalyticsData(); // Re-fetch data when threshold changes
  }, [threshold, dateRange]); 

  // useEffect(() => {
  //   fetchAnalyticsData();
  // }, [dateRange]);

  const fetchAnalyticsData = async () => {
  setLoading(true);
  try {
    const res = await fetch("http://localhost:5000/api/analytics/optimized");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    const { stats, predictions, bestSellingProduct } = data;

    const { totalSales, inStock, lowStock, outStock } = stats;

    setMetrics({
      totalSales,
      bestSellingProduct,
      inventoryHealth: Math.round(((inStock + lowStock) / (inStock + lowStock + outStock)) * 100),
    });

predictions.forEach(item => {
  if (item.quantity > 100) {
    item.ai_prediction = "Enough";
  } else if (item.quantity > 50) {
    item.ai_prediction = "Monitor";
  } else {
    item.ai_prediction = "Reorder";
  }
});

const aiPredCounts = predictions.reduce((acc, item) => {
  // Check if ai_prediction exists; default to "Unknown" if not
  const key = item.ai_prediction ? item.ai_prediction : "Unknown"; 
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

// Now, ensure that the chart will have accurate counts
setAiPredictionChartData([
  { name: "Enough", count: aiPredCounts["Enough"] || 0 },
  { name: "Monitor", count: aiPredCounts["Monitor"] || 0 },
  { name: "Reorder", count: aiPredCounts["Reorder"] || 0 },
  { name: "Unknown", count: aiPredCounts["Unknown"] || 0 } // Handle Unknowns correctly
]);



    // Stock Status Chart Data (corrected aggregation logic)
    const stockCounts = predictions.reduce(
      (acc, item) => {
        const stockStatus = item.stock || "Unknown"; // Ensure `stock` exists
        if (stockStatus === "In Stock" || stockStatus === "Low Stock" || stockStatus === "Out of Stock") {
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

    // Set sales and inventory data
    setSalesData(generateSalesData(dateRange, totalSales));
    setInventoryData(generateInventoryData(dateRange, predictions));

    setAiPredictions(predictions); // Set predictions data
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


  const generateSalesData = (range, totalSales) => {
    const pts = range === "week" ? 7 : range === "year" ? 12 : 30;
    const avg = totalSales / pts;
    return Array.from({ length: pts }, (_, index) => ({
      name: `Day ${index + 1}`,
      value: Math.round(avg * (0.8 + Math.random() * 0.4)),
    }));
  };

  const generateInventoryData = (range, products) => {
    const pts = range === "week" ? 7 : range === "year" ? 12 : 30;
    const totalQty = products.reduce((sum, product) => sum + (Number(product.quantity) || 0), 0);
    const avg = totalQty / pts;
    return Array.from({ length: pts }, (_, index) => ({
      name: `Day ${index + 1}`,
      value: Math.round(avg * (0.7 + Math.random() * 0.6)),
    }));
  };

  return (
    <div>
      <Header
        title="Analytics and Reports"
        breadcrumbs={[{ text: "Dashboard", active: false }, { text: "Analytics and Reports", active: true }]}
      />
      <div className="analytics-report">
        <div className="analytics-header">
          <p className="last-updated">
            Last updated: {lastUpdated}
            <button onClick={fetchAnalyticsData}>
              <RefreshCw size={14} />
            </button>
          </p>
          <div className="date-range-selector">
            <label>Date Range:</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
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
