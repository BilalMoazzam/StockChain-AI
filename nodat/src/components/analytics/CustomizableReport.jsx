// frontend/src/components/analytics/CustomizableReport.jsx

import React, { useState, useMemo } from "react"
import PropTypes from "prop-types"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Brush,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts"

const REPORT_TYPES = ["Performance Metrics", "Sales Trends", "Stock Status"]
const COLORS = ["#28a745", "#ffc107", "#dc3545", "#007bff"]

export default function CustomizableReport({ allProducts, dateRange }) {
  const categories = useMemo(
    () => Array.from(new Set(allProducts.map((p) => p.Category || "Uncategorized"))),
    [allProducts]
  )
  const [category, setCategory]   = useState(categories[0] || "")
  const [reportType, setReportType] = useState(REPORT_TYPES[0])

  const filtered = useMemo(
    () => allProducts.filter((p) => p.Category === category),
    [allProducts, category]
  )

  const totalSKUs = filtered.length
  const totalSales = filtered.reduce((s, p) => s + p.Price * p.quantity, 0)
  const avgPrice   = totalSKUs ? filtered.reduce((s, p) => s + p.Price, 0) / totalSKUs : 0
  const avgQty     = totalSKUs ? filtered.reduce((s, p) => s + p.quantity, 0) / totalSKUs : 0

  const stockCounts = filtered.reduce((acc, p) => {
    acc[p.stock] = (acc[p.stock] || 0) + 1
    return acc
  }, {})

  const N = dateRange === "week" ? 7 : dateRange === "year" ? 12 : 30
  const avgPerPoint = totalSales / N || 0
  const timeSeries = Array.from({ length: N }, (_, i) => ({
    label:
      dateRange === "week"
        ? ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]
        : dateRange === "year"
        ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i]
        : `Day ${i+1}`,
    value: Math.round(avgPerPoint * (0.8 + Math.random() * 0.4)),
  }))

  const stockData = Object.entries(stockCounts).map(([name, cnt]) => ({ name, value: cnt }))

  return (
    <div className="section customizable-report">
      <div className="section-header">
        <h3>Customizable Report</h3>
      </div>

      <div className="form-row" style={{ display: "flex", gap: 20, padding: 20 }}>
        <label>
          Category:
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>

        <label>
          Report Type:
          <select value={reportType} onChange={e => setReportType(e.target.value)}>
            {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
      </div>

      <div className="report-output">
        {!totalSKUs ? (
          <p style={{ padding: 20 }}>No data for <strong>{category}</strong>.</p>
        ) : reportType === "Performance Metrics" ? (
          <div className="metrics-cards" style={{ padding: 20 }}>
            {[
              { label: "Total SKUs",    value: totalSKUs },
              { label: "Total Sales",   value: `$${totalSales.toLocaleString()}` },
              { label: "Avg. Price",    value: `$${avgPrice.toFixed(2)} `},
              { label: "Avg. Quantity", value: Math.round(avgQty) },
            ].map(({ label, value }) => (
              <div key={label} className="metric-card">
                <div className="metric-content">
                  <h4>{label}</h4>
                  <div className="metric-value">{value}</div>
                </div>
              </div>
            ))}
          </div>
        ) : reportType === "Sales Trends" ? (
          // *Here’s the wrapper with explicit height*
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timeSeries}
                margin={{ top: 20, right: 20, bottom: 50, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="top" />
                <Bar dataKey="value" name="Sales" fill={COLORS[0]} />
                <Brush dataKey="label" height={20} stroke="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          // And likewise for the pie
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {stockData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

CustomizableReport.propTypes = {
  allProducts: PropTypes.array.isRequired,
  dateRange:   PropTypes.oneOf(["week","month","year"]).isRequired,
}