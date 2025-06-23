"use client"

import { useState, useEffect } from "react"
// import Header from "../layout/Header"
import MetricsCards from "../analytics/MetricsCards"
import SalesChart from "../analytics/SalesChart"
import InventoryChart from "../analytics/InventoryChart"
import CustomizableReport from "../analytics/CustomizableReport"
import ExportReports from "../analytics/ExportReports"
import AIPredictionTable from "../analytics/AIPredictionTable"
import AIPredictionChart from "../analytics/AIPredictionChart"
import StockStatusPieChart from "../analytics/StockStatusPieChart" // Keep this import
import ProductSalesLookup from "../analytics/ProductSalesLookup"
import { RefreshCw } from "lucide-react"
import "../styles/AnalyticsReport.css"

const AnalyticsReport = () => {
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    bestSellingProduct: "",
    inventoryHealth: 0,
  })

  const [salesData, setSalesData] = useState([])
  const [inventoryData, setInventoryData] = useState([])
  const [aiPredictions, setAiPredictions] = useState([]) // All AI predictions from Flask
  const [aiPredictionChartData, setAiPredictionChartData] = useState([])
  const [stockStatusChartData, setStockStatusChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("month")
  const [lastUpdated, setLastUpdated] = useState("")

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange])

  const fetchAnalyticsData = async () => {
    setLoading(true)

    try {
      // Fetch AI predictions from Flask backend
      const aiResponse = await fetch("http://localhost:5001/predict-all")
      if (!aiResponse.ok) {
        throw new Error(`HTTP error! status: ${aiResponse.status}`)
      }
      const aiData = await aiResponse.json()
      console.log("Raw data from Flask (aiData):", aiData) // ADD THIS LINE
      setAiPredictions(aiData) // Store all predictions

      // --- Calculate Metrics from AI Data ---
      let calculatedTotalSales = 0
      let highestValueProduct = { ProductName: "N/A", value: 0 }
      let inStockCount = 0
      let lowStockCount = 0
      let outOfStockCount = 0
      let enoughPredictionCount = 0
      let reorderCount = 0

      aiData.forEach((item) => {
        // Ensure quantity and Price are numbers, default to 0 if not
        const quantity = Number.parseFloat(item.quantity) || 0
        const price = Number.parseFloat(item.Price) || 0
        const productValue = quantity * price

        calculatedTotalSales += productValue

        if (productValue > highestValueProduct.value) {
          highestValueProduct = { ProductName: item.ProductName, value: productValue }
        }

        // Count stock statuses
        if (item.stock === "In Stock") {
          inStockCount++
        } else if (item.stock === "Low Stock") {
          lowStockCount++
        } else if (item.stock === "Out of Stock") {
          outOfStockCount++
        }

        // Count AI predictions for health
        if (item.ai_prediction === "Enough") {
          enoughPredictionCount++
        } else if (item.ai_prediction === "Reorder") {
          reorderCount++
        }
      })

      const totalProducts = aiData.length
      // Inventory Health: Percentage of products that are 'Enough' or 'In Stock'
      // Adjusted calculation: (Total Products - Reorder - Out of Stock) / Total Products
      const calculatedInventoryHealth =
        totalProducts > 0 ? Math.round(((totalProducts - reorderCount - outOfStockCount) / totalProducts) * 100) : 0

      setMetrics({
        totalSales: calculatedTotalSales,
        bestSellingProduct: highestValueProduct.ProductName,
        inventoryHealth: calculatedInventoryHealth,
      })

      // --- Generate Chart Data based on AI Data (Simulated) ---
      const mockSalesData = generateSalesData(dateRange, calculatedTotalSales)
      setSalesData(mockSalesData)

      const mockInventoryData = generateInventoryData(dateRange, aiData)
      setInventoryData(mockInventoryData)

      // --- Prepare AI Prediction Chart Data ---
      const predictionCounts = aiData.reduce((acc, item) => {
        // Normalize the prediction string to match expected keys (optional, but good for robustness)
        let predictionKey = item.ai_prediction
        if (predictionKey) {
          predictionKey = predictionKey.charAt(0).toUpperCase() + predictionKey.slice(1).toLowerCase()
          if (!["Enough", "Monitor", "Reorder"].includes(predictionKey)) {
            predictionKey = "Unknown"
          }
        } else {
          predictionKey = "Unknown"
        }

        acc[predictionKey] = (acc[predictionKey] || 0) + 1
        return acc
      }, {})

      const aiChartData = [
        { name: "Enough", count: predictionCounts["Enough"] || 0 },
        { name: "Monitor", count: predictionCounts["Monitor"] || 0 },
        { name: "Reorder", count: predictionCounts["Reorder"] || 0 },
      ]
      setAiPredictionChartData(aiChartData)

      // --- Prepare Stock Status Chart Data ---
      const stockStatusData = [
        { name: "In Stock", count: inStockCount },
        { name: "Low Stock", count: lowStockCount },
        { name: "Out of Stock", count: outOfStockCount },
      ]
      setStockStatusChartData(stockStatusData)

      const now = new Date()
      setLastUpdated(now.toLocaleString())
    } catch (error) {
      console.error("Failed to fetch analytics data or AI predictions:", error)
      setMetrics({ totalSales: 0, bestSellingProduct: "N/A", inventoryHealth: 0 })
      setSalesData([])
      setInventoryData([])
      setAiPredictions([])
      setAiPredictionChartData([])
      setStockStatusChartData([])
    } finally {
      setLoading(false)
    }
  }

  // Generate sales data based on total sales value
  const generateSalesData = (range, totalSalesValue) => {
    const data = []
    let numPoints = 30 // Default for month

    if (range === "week") {
      numPoints = 7
    } else if (range === "year") {
      numPoints = 12 // Months in a year
    }

    const averageDailySales = totalSalesValue / numPoints

    for (let i = 0; i < numPoints; i++) {
      const value = averageDailySales * (0.8 + Math.random() * 0.4) // +/- 20% randomness
      data.push({
        name: "", // Name will be formatted by XAxis
        value: Math.round(value),
      })
    }
    return data
  }

  // Generate inventory data based on current product quantities
  const generateInventoryData = (range, products) => {
    const data = []
    let numPoints = 30 // Default for month
    const totalCurrentQuantity = products.reduce((sum, item) => sum + (Number.parseFloat(item.quantity) || 0), 0)

    if (range === "week") {
      numPoints = 7
    } else if (range === "year") {
      numPoints = 12 // Months in a year
    }

    const averageInventoryLevel = totalCurrentQuantity / numPoints

    for (let i = 0; i < numPoints; i++) {
      const value = averageInventoryLevel * (0.7 + Math.random() * 0.6) // +/- 30% randomness
      data.push({
        name: "", // Name will be formatted by XAxis
        value: Math.round(value),
      })
    }
    return data
  }

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value)
  }

  const handleRefresh = () => {
    fetchAnalyticsData()
  }

  return (
    <div className="analytics-report">
      {/* <Header
        title="Analytics and Reports"
        breadcrumbs={[
          { text: "Dashboard", active: false },
          { text: "Analytics and Reports", active: true },
        ]}
      /> */}

      <div className="analytics-container">
        <div className="analytics-header">
          <div className="header-left">
            <h2>Analytics and Reports</h2>
            <p className="last-updated">
              Last updated: {lastUpdated}
              <button className="btn-refresh" onClick={handleRefresh}>
                <RefreshCw size={14} />
              </button>
            </p>
          </div>
          <div className="header-right">
            <div className="date-range-selector">
              <label>Date Range:</label>
              <select value={dateRange} onChange={handleDateRangeChange}>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last 12 Months</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading analytics data...</div>
        ) : (
          <>
            <MetricsCards metrics={metrics} />

            <div className="section">
              <div className="section-header">
                <h3>Sales & Inventory Trends</h3>
              </div>
              <div className="charts-grid">
                <div className="chart-container">
                  <SalesChart data={salesData} dateRange={dateRange} />
                </div>
                <div className="chart-container">
                  <InventoryChart data={inventoryData} dateRange={dateRange} />
                </div>
              </div>
            </div>

            <div className="section">
              <div className="section-header">
                <h3>AI Inventory Prediction Overview</h3>
              </div>
              <div className="charts-grid">
                <div className="chart-container">
                  <AIPredictionChart data={aiPredictionChartData} />
                </div>
                <div className="chart-container">
                  <StockStatusPieChart data={stockStatusChartData} /> {/* Reverted to Pie Chart */}
                </div>
              </div>
            </div>

            <div className="section">
              <div className="section-header">
                <h3>Product Sales Lookup & Top Products</h3>
              </div>
              <ProductSalesLookup products={aiPredictions} />
            </div>

            <div className="section">
              <div className="section-header">
                <h3>Detailed AI Inventory Insights (All Products)</h3>
              </div>
              <AIPredictionTable predictions={aiPredictions} />
            </div>

            <div className="section">
              <div className="section-header">
                <h3>Customizable Report (Shoes Category)</h3>
              </div>
              <CustomizableReport allProducts={aiPredictions} />
            </div>

            <div className="section">
              <div className="section-header">
                <h3>Export Reports</h3>
              </div>
              <ExportReports />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AnalyticsReport
