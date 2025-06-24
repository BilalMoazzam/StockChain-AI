// frontend/src/components/analytics/ProductSalesLookup.jsx

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
} from "recharts"


const PAGE_SIZE = 10

export default function ProductSalesLookup({ products }) {
  const [term, setTerm] = useState("")
  const [matches, setMatches] = useState([])
  const [error, setError] = useState("")
  const [page, setPage] = useState(0)

  // Global top 5
  const top5 = useMemo(() => {
    return [...products]
      .map(p => ({ ...p, salesValue: p.quantity * p.Price }))
      .sort((a, b) => b.salesValue - a.salesValue)
      .slice(0, 5)
  }, [products])

  const handleSearch = () => {
    const q = term.trim().toLowerCase()
    if (!q) {
      setError("Please enter a product name or category.")
      setMatches([])
      return
    }
    const found = products
      .filter(p =>
        (p.ProductName || "").toLowerCase().includes(q) ||
        (p.Category  || "").toLowerCase().includes(q)
      )
      .map(p => ({ ...p, salesValue: p.quantity * p.Price }))

    if (!found.length) {
      setError(`No products match “${term}”.`)
    } else {
      setError("")
      setPage(0)
    }
    setMatches(found)
  }

  // Pagination helpers
  const pageCount = Math.ceil(matches.length / PAGE_SIZE)
  const pageData = matches.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  // Chart data: show top N by sales within the found set
  const chartData = useMemo(() => {
    // take top 10 by salesValue
    return [...matches]
      .sort((a, b) => b.salesValue - a.salesValue)
      .slice(0, 10)
      .map(p => ({ name: p.ProductName, value: p.salesValue }))
  }, [matches])

  return (
    <div className="AnalyticsReports.css">
      <div className="section-header">
        <h3>Product Sales Lookup & Top Products</h3>
      </div>

      <div className="search-input-group">
        <input
          type="text"
          placeholder="Enter product name or category"
          value={term}
          onChange={e => setTerm(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
        />
        <button onClick={handleSearch}>Search Sales</button>
      </div>

      {error && <div className="error-message-lookup">{error}</div>}

      {matches.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="lookup-summary-cards">
            <div className="metric-card">
              <div className="metric-content">
                <h4>Matches</h4>
                <div className="metric-value">{matches.length}</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-content">
                <h4>Total Sales</h4>
                <div className="metric-value">
                  ${matches.reduce((s, p) => s + p.salesValue, 0).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-content">
                <h4>Avg. Price</h4>
                <div className="metric-value">
                  ${(
                    matches.reduce((s, p) => s + p.Price, 0) / matches.length
                  ).toFixed(2)}
                </div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-content">
                <h4>Avg. Quantity</h4>
                <div className="metric-value">
                  {Math.round(
                    matches.reduce((s, p) => s + p.quantity, 0) / matches.length
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bar Chart of top matches */}
          <div style={{ height: 200, margin: "20px 0" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: 20, right: 20, top: 10, bottom: 30 }}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
                <YAxis />
                <Tooltip formatter={v => `$${v.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="value" name="Sales Value" fill="#007bff" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Paginated table */}
          <table className="lookup-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Sales Value</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(p => (
                <tr key={p.ProductID}>
                  <td>{p.ProductName}</td>
                  <td>{p.Category}</td>
                  <td>{p.quantity}</td>
                  <td>${p.Price.toFixed(2)}</td>
                  <td>${p.salesValue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination-controls">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 0}>
              Prev
            </button>
            <span>
              Page {page + 1} of {pageCount}
            </span>
            <button onClick={() => setPage(p => p + 1)} disabled={page + 1 === pageCount}>
              Next
            </button>
          </div>
        </>
      )}

      {/* Always show global top 5 */}
      <div className="top-products">
        <h4>Top 5 Products by Sales</h4>
        <table className="lookup-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Sales Value</th>
            </tr>
          </thead>
          <tbody>
            {top5.map((p, i) => (
              <tr key={i}>
                <td>{p.ProductName}</td>
                <td>${p.salesValue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

ProductSalesLookup.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      ProductID:    PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      ProductName:  PropTypes.string,
      Category:     PropTypes.string,
      quantity:     PropTypes.number,
      Price:        PropTypes.number,
    })
  ).isRequired,
}