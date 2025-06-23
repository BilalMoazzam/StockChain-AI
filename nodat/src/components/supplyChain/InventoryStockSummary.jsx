"use client"

import { Package, AlertTriangle, TrendingDown } from "lucide-react"

const InventoryStockSummary = ({ products }) => {
  // Calculate stock counts
  const inStockCount = products.filter((p) => p.status === "In Stock").length
  const lowStockCount = products.filter((p) => p.status === "Low Stock").length
  const outOfStockCount = products.filter((p) => p.status === "Out of Stock").length
  const totalProducts = products.length

  // Filter for low/out of stock items to display
  const criticalStockItems = products.filter(
    (p) => p.status === "Low Stock" || p.status === "Out of Stock"
  )

  // Badge style based on status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "In Stock":
        return "badge success"
      case "Low Stock":
        return "badge warning"
      case "Out of Stock":
        return "badge destructive"
      default:
        return "badge secondary"
    }
  }

  return (
    <div className="inventory-summary-section">
      {/* Summary Cards */}
      <div className="summary-cards-container">
        <div className="summary-card">
          <div className="summary-card-header">
            <h3 className="summary-card-title">Total Products</h3>
            <Package className="summary-icon package" />
          </div>
          <div className="summary-card-value">{totalProducts}</div>
          <p className="summary-card-description">Overall inventory count</p>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <h3 className="summary-card-title">Low Stock Items</h3>
            <AlertTriangle className="summary-icon alert-triangle" />
          </div>
          <div className="summary-card-value">{lowStockCount}</div>
          <p className="summary-card-description">Products needing attention</p>
        </div>

        <div className="summary-card">
          <div className="summary-card-header">
            <h3 className="summary-card-title">Out of Stock Items</h3>
            <TrendingDown className="summary-icon trending-down" />
          </div>
          <div className="summary-card-value">{outOfStockCount}</div>
          <p className="summary-card-description">Products unavailable</p>
        </div>
      </div>

      {/* Critical Stock Alerts Table */}
      <div className="critical-stock-card">
        <div className="critical-stock-card-header">
          <h3 className="critical-stock-title">Critical Stock Alerts</h3>
        </div>
        <div className="critical-stock-card-content">
          {criticalStockItems.length === 0 ? (
            <div className="no-critical-stock">
              <Package className="no-critical-stock-icon" />
              <p className="no-critical-stock-text">All products are well stocked!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="stock-table">
                <thead>
                  <tr>
                    <th className="table-head-id">Product ID</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {criticalStockItems.map((product) => (
                    <tr key={product.id}>
                      <td className="table-cell-font-medium">{product.productId || product.id}</td>
                      <td>{product.name || "N/A"}</td>
                      <td>{product.category || "N/A"}</td>
                      <td>{product.quantity}</td>
                      <td>
                        <span className={getStatusBadgeClass(product.status)}>{product.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InventoryStockSummary
