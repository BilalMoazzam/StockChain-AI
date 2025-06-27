"use client"

import { useEffect, useState } from "react"
import { ShoppingCart, Clock, Truck, CheckCircle, Plus, Search, XCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { addNotification } from "../../utils/notificationService" // Import notification service

export function OrderDashboard({
  orders = [],
  customers = [],
  inventory = [], // This prop is now less critical as inventory is managed by context
  onCreateOrder,
  onEditOrder,
  onDeleteOrder,
  onViewOrder,
  onUpdateOrderStatus,
  setSelectedProducts, // This prop is used to update the parent's state
  selectedProducts, // This prop is the current list of selected products
  onClearSelected, // New prop for clearing selected products
  // handleBuyNow,
  onBuyNow,         
  onUpdateInventoryQuantity, // NEW PROP: Function to update inventory quantity in context
  onRemoveProductFromDraft, // NEW PROP: Function for individual product removal from draft
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  const navigate = useNavigate()

  const handleCreateOrder = () => {
    navigate("/inventory") // Navigate to inventory to select products
    addNotification({
      type: "order",
      title: "Initiating New Order",
      description: "Navigating to inventory to select products for a new order.",
      priority: "normal",
      icon: "shopping-cart",
      link: "/inventory",
    })
  }

  // This useEffect handles initial loading of selected products from localStorage
  useEffect(() => {
    const localProductList = localStorage.getItem("selectedProductFromInventory")
    if (localProductList) {
      try {
        const parsedList = JSON.parse(localProductList).filter((p) => p && typeof p.price === "number")
        setSelectedProducts((prev) => {
          const newProducts = parsedList.filter((pfi) => !prev.some((sp) => sp.id === pfi.id))
          return [...prev, ...newProducts]
        })
        // localStorage.removeItem("selectedProductFromInventory") // This line was removed in previous fix
      } catch (e) {
        console.error("Failed to parse selectedProductFromInventory from localStorage:", e)
        localStorage.removeItem("selectedProductFromInventory")
      }
    }
  }, [setSelectedProducts]) // Only run once on mount

  const draftOrderTotal = selectedProducts.reduce((sum, p) => sum + (p.totalPrice || p.price * p.quantity || 0), 0)

  const totalOrders = orders.length + selectedProducts.length
  const pendingOrders = orders.filter((o) => o.status === "Pending").length
  const processingOrders = orders.filter((o) => o.status === "Processing").length
  const shippedOrders = orders.filter((o) => o.status === "Shipped").length
  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled").length

  const totalRevenue =
    orders.filter((o) => o.status !== "Cancelled").reduce((sum, o) => sum + o.total, 0) + draftOrderTotal
  const totalQuantity = selectedProducts.reduce((sum, p) => sum + (p.quantity || 0), 0)

  const trimmedSearchTerm = searchTerm.trim().toLowerCase()

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(trimmedSearchTerm) ||
      o.customerName?.toLowerCase().includes(trimmedSearchTerm) ||
      o.customerEmail?.toLowerCase().includes(trimmedSearchTerm) ||
      o.orderDetails?.toLowerCase().includes(trimmedSearchTerm) // Added orderDetails search

    const matchesStatus = !statusFilter || o.status === statusFilter

    const matchesDate = !dateFilter || new Date(o.orderDate) >= new Date(dateFilter)

    return matchesSearch && matchesStatus && matchesDate
  })

  const handleRemoveFromOrder = (productToRemove) => {
    if (onRemoveProductFromDraft) {
      onRemoveProductFromDraft(productToRemove)
    }
  }

  const mergedSelectedProducts = Object.values(
    selectedProducts.reduce((acc, product) => {
      const key = product.id || product.sku
      if (!acc[key]) {
        acc[key] = { ...product }
      } else {
        acc[key].quantity = (acc[key].quantity || 0) + (product.quantity || 0)
        acc[key].totalPrice = (acc[key].totalPrice || 0) + (product.totalPrice || 0)
      }
      return acc
    }, {}),
  )

  return (
    <div className="order-dashboard">
      {" "}
      {/* Apply base class */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <div className="stat-value">{totalOrders}</div>
            <div className="stat-revenue">Rs. {totalRevenue.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>Pending Orders</h3>
            <div className="stat-value">
              {pendingOrders}
              {selectedProducts.length > 0 && <span className="text-yellow-600 text-sm ml-2">(Draft)</span>}
            </div>
            <div className="stat-sub">Processing: {processingOrders}</div>
          </div>
        </div>

        <div className="stat-card shipped">
          <div className="stat-icon">
            <Truck size={24} />
          </div>
          <div className="stat-content">
            <h3>Order Items</h3>
            <div className="stat-value">{totalQuantity}</div>
          </div>
        </div>

        <div className="stat-card delivered">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>Completed</h3>
            <div className="stat-value">{deliveredOrders}</div>
            <div className="stat-sub">Cancelled: {cancelledOrders}</div>
          </div>
        </div>
      </div>
      <div className="orders-table-section">
        {" "}
        {/* Apply base class */}
        <div className="table-header">
          {" "}
          {/* Apply base class */}
          <h2>Recent Orders ({filteredOrders.length + selectedProducts.length})</h2>
          <div className="table-filters">
            {" "}
            {/* Apply base class */}
            <div className="search-box">
              {" "}
              {/* Apply base class */}
              <Search size={16} />
              <input
                type="text"
                placeholder="Search orders, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select\">
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-date\"
            />
            <button className="create-order-btn" onClick={handleCreateOrder}>
              <Plus size={20} />
              <span>Create New Order</span>
            </button>
          </div>
        </div>
        {selectedProducts.length > 0 && (
          <div className="clear-selected-btn-1">
            <button className="clear-selected-btn-2" onClick={onClearSelected}>
              <XCircle size={16} /> Clear Selected Products
            </button>
          </div>
        )}
        <div className="table-container order-table-1">
          {" "}
          {/* Apply base class */}
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0 10px",
            }}
            className="orders-table" // Apply base class
          >
            <thead className="text-xs text-left text-gray-700 uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
              <tr className="rounded-md font-bold-1">
                <td className="px-4 py-3">Order Details</td>
                <td className="px-4 py-3">Customer</td>
                <td className="px-4 py-3">Category</td>
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3">Status</td>
                <td className="px-4 py-3">Order Items</td>
                <td className="px-4 py-3">Date</td>
                <td className="px-4 py-3">Actions</td>
              </tr>
            </thead>

            <tbody className="order-page-data-from-inventory-page">
              {Object.values(mergedSelectedProducts).map((product, index) => (
                <tr
                  key={`${product.id || product.sku}-${index}`}
                  className="bg-yellow-50 font-medium rounded-lg shadow-sm hover:bg-yellow-100 transition duration-150"
                >
                  <td className="px-4 py-4">{product.name}</td>
                  <td className="px-4 py-4">{product.customerName || "N/A"}</td>
                  <td className="px-4 py-4">{product.category || "Demo"}</td>
                  <td className="px-4 py-4">Rs. {product.totalPrice?.toFixed(2)}</td>
                  <td className="px-4 py-4">{product.status || "Out of Stock"}</td>
                  <td
                    style={{
                      paddingInline: "35px",
                      display: "flex",
                    }}
                  >
                    {product.quantity || 1}
                  </td>
                  <td className="px-4 py-4">{new Date().toLocaleDateString()}</td>
                  <td className="action-btn-space">
                    <button onClick={() => handleRemoveFromOrder(product)} className="remove-from-order-btn">
                      Remove
                    </button>

                    <button onClick={() => onBuyNow(product)} className="buy-from-order-btn">
                      Buy Now
                    </button>
                  </td>
                </tr>
              ))}

              {/* ⬇️ Render filtered orders (from backend or stored data) */}
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150"
                >
                  <td className="px-4 py-3">{order.orderDetails}</td>
                  <td className="px-4 py-3">{order.customer}</td>
                  <td className="px-4 py-3">{order.items.join(", ")}</td>
                  <td className="px-4 py-3">Rs. {order.total?.toFixed(2)}</td>
                  <td className="px-4 py-3">{order.status}</td>
                  <td className="px-4 py-3">{order.paymentStatus}</td>
                  <td className="px-4 py-3">{order.date}</td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:underline" onClick={() => onViewOrder && onViewOrder(order)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {/* 🔒 Empty state */}
              {filteredOrders.length === 0 && selectedProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
