"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Clock,
  Truck,
  CheckCircle,
  Plus,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { addNotification } from "../../utils/notificationService";


export function OrderDashboard({
  orders = [],
  customers = [],
  inventory = [],
  selectedProduct = null,
  onCreateOrder,
  onEditOrder,
  onDeleteOrder,
  onViewOrder,
  onUpdateOrderStatus,
  setSelectedProduct,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedProducts, setSelectedProducts] = useState(() => {
    const stored = localStorage.getItem("selectedProducts");
    return stored ? JSON.parse(stored) : [];
  });

  const navigate = useNavigate();
  // ✅ FUNCTION: Create Order
  const handleCreateOrder = () => {
    navigate("/productCard");
  };

  // ✅ FUNCTION: Buy Now
  const handleBuyNow = (product) => {
    navigate("/blockchain-transaction", { state: { product } });
  };

  // ✅ STATS derived from orders and selectedProducts
  const draftOrderTotal = selectedProducts.reduce(
    (sum, p) => sum + (p.totalPrice || p.price * p.quantity || 0),
    0
  );

  const draftOrder = selectedProducts.length
    ? {
        status: "Draft",
        total: draftOrderTotal,
      }
    : null;

  const totalOrders = orders.length + (draftOrder ? 1 : 0);
  const pendingOrders =
    orders.filter((o) => o.status === "Pending").length +
    (draftOrder ? 1 : 0);

  const processingOrders = orders.filter(
    (o) => o.status === "Processing"
  ).length;

  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled").length;

  const totalRevenue =
    orders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + o.total, 0) + draftOrderTotal;

  const totalQuantity = selectedProducts.reduce(
    (sum, p) => sum + (p.quantity || 0),
    0
  );

  // ✅ FILTERED Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
      o.customerName?.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
      o.customerEmail?.toLowerCase().includes(searchTerm.trim().toLowerCase());

    const matchesStatus = !statusFilter || o.status === statusFilter;
    const matchesDate =
      !dateFilter || new Date(o.orderDate) >= new Date(dateFilter);

    return matchesSearch && matchesStatus && matchesDate;
  });

  useEffect(() => {
    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  useEffect(() => {
    const localProductList = localStorage.getItem("selectedProductFromInventory");
    if (!localProductList) return;

    const parsedList = JSON.parse(localProductList).filter(
      (p) => p && typeof p.price === "number"
    );

    const merged = [...selectedProducts];

    parsedList.forEach((newProduct) => {
      const key = newProduct.id || newProduct.sku;
      const index = merged.findIndex((p) => (p.id || p.sku) === key);

      if (index !== -1) {
        merged[index].quantity += newProduct.quantity || 1;
        merged[index].totalPrice +=
          newProduct.totalPrice ||
          newProduct.price * (newProduct.quantity || 1);
      } else {
        merged.push({
          ...newProduct,
          quantity: newProduct.quantity || 1,
          totalPrice:
            newProduct.totalPrice ||
            newProduct.price * (newProduct.quantity || 1),
        });
      }
    });

    setSelectedProducts(merged);
    localStorage.setItem("selectedProducts", JSON.stringify(merged));
    localStorage.removeItem("selectedProductFromInventory");

    const notifiedOrders =
      JSON.parse(localStorage.getItem("notifiedOrderItems")) || {};
    const updatedNotified = { ...notifiedOrders };

    parsedList.forEach((product) => {
      const key = product.id || product.sku;
      if (!notifiedOrders[key]) {
        addNotification({
          type: "order",
          title: "New Order Received",
          description: `An order for "${product.name}" (ID: ${key}) was received from inventory.`,
          priority: "normal",
          icon: "shopping-cart",
          link: "/order-management",
        });
        updatedNotified[key] = true;
      }
    });

    localStorage.setItem("notifiedOrderItems", JSON.stringify(updatedNotified));
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;
    const alreadyExists = selectedProducts.some(
      (p) => p.sku === selectedProduct.sku
    );
    if (alreadyExists) {
      setSelectedProduct(null);
      return;
    }

    const updated = [...selectedProducts, selectedProduct];
    setSelectedProducts(updated);
    localStorage.setItem("selectedProducts", JSON.stringify(updated));
    setSelectedProduct(null);
  }, [selectedProduct]);

  const handleClearSelected = () => {
    const inventoryData = JSON.parse(localStorage.getItem("persistedInventory")) || [];
    const updatedInventory = [...inventoryData];

    selectedProducts.forEach((product) => {
      const key = product.id || product.sku;
      const index = updatedInventory.findIndex((item) => (item.id || item.sku) === key);
      if (index !== -1) {
        updatedInventory[index].quantity += product.quantity || 0;
      }
    });

    localStorage.setItem("persistedInventory", JSON.stringify(updatedInventory));
    setSelectedProducts([]);
    localStorage.removeItem("selectedProducts");
  };

  const handleRemoveFromOrder = (productToRemove) => {
    const remaining = selectedProducts.filter(
      (p) => (p.id || p.sku) !== (productToRemove.id || productToRemove.sku)
    );
    const inventoryData =
      JSON.parse(localStorage.getItem("persistedInventory")) || [];
    const restoredInventory = inventoryData.map((item) => {
      if ((item.id || item.sku) === (productToRemove.id || productToRemove.sku)) {
        return {
          ...item,
          quantity: item.quantity + (productToRemove.quantity || 0),
        };
      }
      return item;
    });

    localStorage.setItem("selectedProducts", JSON.stringify(remaining));
    localStorage.setItem("persistedInventory", JSON.stringify(restoredInventory));

    setSelectedProducts(remaining);
    console.log("✅ Inventory fully restored for:", productToRemove.name);
  };

  return (
    <div className="order-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Order Management</h1>
            <p>Track and manage customer orders and shipments</p>
          </div>
          <button className="create-order-btn" onClick={handleCreateOrder}>
            <Plus size={20} />
            <span>Create New Order</span>
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <div className="stat-value">{totalOrders}</div>
            <div className="stat-revenue">
              Rs. {totalRevenue.toLocaleString()}
            </div>
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
              {draftOrder && (
                <span className="text-yellow-600 text-sm ml-2">(Draft)</span>
              )}
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
        <div className="table-header">
          <h2>
            Recent Orders ({filteredOrders.length + selectedProducts.length})
          </h2>

          <div className="table-filters">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search orders, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
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
              className="filter-date"
            />
          </div>
        </div>

        {selectedProducts.length > 0 && (
          <div className="clear-selected-btn-1">
            <button
              className="clear-selected-btn-2"
              onClick={handleClearSelected}
            >
              🚫 Clear Selected Products
            </button>
          </div>
        )}

        <div className="table-container order-table-1">
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0 10px",
            }}
            className="w-full text-sm text-left text-gray-700 dark:text-gray-300 order-page-data-from-inventory-page"
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
              {Object.values(
                selectedProducts.reduce((acc, product) => {
                  const key = product.id || product.sku;
                  if (!acc[key]) {
                    acc[key] = { ...product };
                  } else {
                    acc[key].quantity += product.quantity;
                    acc[key].totalPrice += product.totalPrice;
                  }
                  return acc;
                }, {})
              ).map((product, index) => (
                <tr
                  key={`${product.sku}-${index}`}
                  className="bg-yellow-50 font-medium rounded-lg shadow-sm hover:bg-yellow-100 transition duration-150"
                >
                  <td className="px-4 py-4">{product.name}</td>
                  <td className="px-4 py-4">{product.customerName || "N/A"}</td>
                  <td className="px-4 py-4">{product.category || "Demo"}</td>
                  <td className="px-4 py-4">Rs. {product.totalPrice}</td>
                  <td className="px-4 py-4">
                    {product.status || "Out of Stock"}
                  </td>
                  <td
                    style={{
                      paddingInline: "35px",
                      display: "flex",
                    }}
                  >
                    {product.quantity || 1}
                  </td>
                  <td className="px-4 py-4">
                    {new Date().toLocaleDateString()}
                  </td>
                  <td className="action-btn-space">
                    <button
                      onClick={() => handleRemoveFromOrder(product)}
                      className="remove-from-order-btn"
                    >
                      Remove
                    </button>

                    <button
                      onClick={() => handleBuyNow(product)}
                      className="buy-from-order-btn"
                    >
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
                  <td className="px-4 py-3">Rs. {order.total}</td>
                  <td className="px-4 py-3">{order.status}</td>
                  <td className="px-4 py-3">{order.paymentStatus}</td>
                  <td className="px-4 py-3">{order.date}</td>
                  <td className="px-4 py-3">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => onViewOrder && onViewOrder(order)}
                    >
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
  );
}
