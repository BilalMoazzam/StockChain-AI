"use client";

import React from "react";
import { useState, useEffect } from "react";
import {
  Package,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { useNavigate, useLocation  } from "react-router-dom";
import { addNotification } from "../../utils/notificationService";
import InventoryManagement from "../styles/InventoryManagement.css";


export function InventoryDashboard({
  inventory,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onViewDetails,
  onAddToOrder,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [orderQuantities, setOrderQuantities] = useState({});
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [lowStockItems, setLowStockItems] = useState(0);
const [outOfStockItems, setOutOfStockItems] = useState(0);
const [totalProducts, setTotalProducts] = useState(0);

  const LOW_STOCK_THRESHOLD = 9;

  const getCurrentInventory = () =>
  JSON.parse(localStorage.getItem("persistedInventory")) || inventory;


  // const totalProducts = getCurrentInventory().length;
  useEffect(() => {
  const updated = getCurrentInventory();

  setTotalProducts(updated.length);
  setLowStockItems(updated.filter(item => getItemStatus(item) === "Low Stock").length);
  setOutOfStockItems(updated.filter(item => getItemStatus(item) === "Out of Stock").length);
}, [filteredInventory, location.pathname]);


  const getItemStatus = (item) => {
    const qty = Number(item.quantity);

    if (isNaN(qty) || qty <= 0) return "Out of Stock";
    if (qty <= LOW_STOCK_THRESHOLD) return "Low Stock";

    return "In Stock";
  };

//   const lowStockItems = getCurrentInventory().filter(
//   (item) => getItemStatus(item) === "Low Stock"
// ).length;

// const outOfStockItems = getCurrentInventory().filter(
//   (item) => getItemStatus(item) === "Out of Stock"
// ).length;



  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const currentInventory =
      JSON.parse(localStorage.getItem("persistedInventory")) || inventory;

    const newTotal = currentInventory.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    setTotalValue(newTotal);
  }, [filteredInventory]);
  useEffect(() => {
  const refreshInventory = () => {
    const updatedInventory = getCurrentInventory();
    const filtered = updatedInventory
  .map((item) => ({ ...item, status: getItemStatus(item) }))
  .filter((item) => {
    const matchesSearch =
      (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.sku || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.size || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.color || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesStatus = !statusFilter || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

setFilteredInventory(filtered);

  };

  window.addEventListener("focus", refreshInventory);

  return () => {
    window.removeEventListener("focus", refreshInventory);
  };
}, []);

useEffect(() => {
  const inventoryData = getCurrentInventory();

  const enriched = inventoryData.map((item) => ({
    ...item,
    status: getItemStatus(item),
  }));

  setFilteredInventory(enriched); // ✅ this triggers the stats counters
}, [location.pathname]);


useEffect(() => {
  const baseInventory = getCurrentInventory();

  const newFiltered = baseInventory
    .map((item) => ({
      ...item,
      status: getItemStatus(item),
    }))
    .filter((item) => {
      const matchesSearch =
        (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sku || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.size || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.color || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !categoryFilter || item.category === categoryFilter;
      const matchesStatus = !statusFilter || item.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });

  setFilteredInventory(newFiltered);
}, [location.pathname, searchTerm, categoryFilter, statusFilter]);



  const getStatusBadge = (status) => {
    const styles = {
      "In Stock": {
        backgroundColor: "#dcfce7",
        color: "#166534",
        border: "1px solid #bbf7d0",
      },
      "Low Stock": {
        backgroundColor: "#fef3c7",
        color: "#92400e",
        border: "1px solid #fde68a",
      },
      "Out of Stock": {
        backgroundColor: "#fee2e2",
        color: "#991b1b",
        border: "1px solid #fecaca",
      },
    };

    return (
      <span
        style={{
          ...styles[status],
          padding: "8px 18px",
          borderRadius: "12px",
          fontSize: "11px",
          fontWeight: "600",
        }}
      >
        {status}
      </span>
    );
  };

  const handleEdit = (item) => {
    onEditItem(item);
  };

  const handleDelete = (itemId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      onDeleteItem(itemId);
    }
  };

  const handleView = (item) => {
    onViewDetails(item);
  };

  const handleAddToOrder = (item, quantity) => {
    if (quantity > item.quantity) {
      setOrderSuccessMsg(`❌ Not enough stock for "${item.name}"`);
      return;
    }

    // 🧮 Calculate total price for selected quantity
    const totalPrice = item.price * quantity;

    // 📦 Get existing list
    const storedList =
      JSON.parse(localStorage.getItem("selectedProductFromInventory")) || [];

    // 🔍 Check if item with same ID already exists
    const existingIndex = storedList.findIndex((p) => p.id === item.id);

    if (existingIndex !== -1) {
      // ✅ Update quantity and totalPrice if item already in list
      storedList[existingIndex].quantity += quantity;
      storedList[existingIndex].totalPrice =
        storedList[existingIndex].quantity * item.price;
    } else {
      // ➕ Add new item
      storedList.push({ ...item, quantity, totalPrice });
    }

    // 💾 Save updated list
    localStorage.setItem(
      "selectedProductFromInventory",
      JSON.stringify(storedList)
    );

    // 🔁 Update inventory by reducing item stock
    const currentInventory =
      JSON.parse(localStorage.getItem("persistedInventory")) || inventory;

    const updatedInventory = currentInventory.map((product) =>
      product.id === item.id
        ? { ...product, quantity: product.quantity - quantity }
        : product
    );

    localStorage.setItem(
      "persistedInventory",
      JSON.stringify(updatedInventory)
    );

    setFilteredInventory(updatedInventory);

    // ✅ Navigate to orders page
    navigate("/orders");
  };
  useEffect(() => {
  const inventoryData = JSON.parse(localStorage.getItem("persistedInventory")) || inventory;
  const notifiedItems = JSON.parse(localStorage.getItem("notifiedStockItems")) || {};

  const updatedNotifiedItems = { ...notifiedItems };

  inventoryData.forEach((item) => {
    const key = item.id || item.sku;
    const prevStatus = notifiedItems[key];
    const currentQty = item.quantity ?? 0;

    // Case 1: Out of stock
    if (currentQty === 0 && prevStatus !== "out") {
      addNotification({
        type: "inventory",
        title: "Out of Stock",
        description: `"${item.name}" is completely out of stock!`,
        priority: "high",
        icon: "alert-triangle",
        link: "/inventory",
      });
      updatedNotifiedItems[key] = "out";

    // Case 2: Low stock but not out
    } else if (currentQty < 5 && currentQty > 0 && prevStatus !== "low") {
      addNotification({
        type: "inventory",
        title: "Low Stock Alert",
        description: `"${item.name}" stock is low (${currentQty} left).`,
        priority: "medium",
        icon: "box",
        link: "/inventory",
      });
      updatedNotifiedItems[key] = "low";

    // Case 3: Restocked (was low/out before)
    } else if (currentQty >= 5 && (prevStatus === "low" || prevStatus === "out")) {
      addNotification({
        type: "inventory",
        title: "Restocked",
        description: `"${item.name}" has been restocked (Now: ${currentQty}).`,
        priority: "info",
        icon: "check-circle",
        link: "/inventory",
      });
      delete updatedNotifiedItems[key]; // reset notification flag
    }

    // Case 4: No change (already notified), do nothing
  });

  localStorage.setItem("notifiedStockItems", JSON.stringify(updatedNotifiedItems));
}, []);



  return (
    <div className="inventory-readonly-overlay" style={{ padding: "24px" }}>
      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#6b7280",
                  fontWeight: "500",
                }}
              >
                Total Items
              </p>
              <p
                style={{
                  margin: "8px 0 0 0",
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#1f2937",
                }}
              >
                {totalProducts.toLocaleString()}
              </p>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "#eff6ff",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Package size={24} style={{ color: "#3b82f6" }} />
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#6b7280",
                  fontWeight: "500",
                }}
              >
                Low Stock Items
              </p>
              <p
                style={{
                  margin: "8px 0 0 0",
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#1f2937",
                }}
              >
                {lowStockItems}
              </p>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "#fef3c7",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={24} style={{ color: "#f59e0b" }} />
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#6b7280",
                  fontWeight: "500",
                }}
              >
                Out of Stock
              </p>
              <p
                style={{
                  margin: "8px 0 0 0",
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#1f2937",
                }}
              >
                {outOfStockItems}
              </p>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "#fee2e2",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingDown size={24} style={{ color: "#ef4444" }} />
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#6b7280",
                  fontWeight: "500",
                }}
              >
                Total Value
              </p>
              <p
                style={{
                  margin: "8px 0 0 0",
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "#1f2937",
                }}
              >
                Rs. {totalValue.toLocaleString()}
              </p>
            </div>
            <div
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "#dcfce7",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DollarSign size={24} style={{ color: "#16a34a" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        {/* Table Header */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "600",
                color: "#1f2937",
              }}
            >
              Shalwar Kameez Inventory
            </h2>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "14px",
                color: "#6b7280",
              }}
            >
              Manage your clothing inventory for men, women, and children
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                }}
              />
              <input
                type="text"
                placeholder="Search by name, size, color..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  paddingLeft: "40px",
                  paddingRight: "12px",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "14px",
                  width: "220px",
                  outline: "none",
                }}
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                outline: "none",
                backgroundColor: "white",
              }}
            >
              <option value="">All Categories</option>
              <option value="Men">Men Shalwar Kameez</option>
              <option value="Women">Women Shalwar Kameez</option>
              <option value="Child">Children Shalwar Kameez</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                outline: "none",
                backgroundColor: "white",
              }}
            >
              <option value="">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>

            {/* Add Product Button */}
            <button
              onClick={onAddItem}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#2563eb")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#3b82f6")}
            >
              <Plus size={16} />
              Add New Item
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#f9fafb" }}>
              <tr>
                {/* Your header columns */}
                <th style={thStyle}>Product Details</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}> Color</th>
                <th style={thStyle}>Stock</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredInventory.map((item) => (
                <React.Fragment key={item.id}>
                  <tr
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f9fafb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td style={{ padding: "16px 24px" }}>
                      <div>
                        <p style={pMain}>{item.name}</p>
                        <p style={pSub}>ID: {item.id ?? item.id}</p>
                        <p style={pSub}>Brand: {item.brand ?? "N/A"}</p>
                        <p style={pSub}>Gender: {item.gender ?? "N/A"}</p>
                      </div>
                    </td>

                    <td style={tdText}>{item.category ?? "N/A"}</td>

                    <td style={{ padding: "16px 24px" }}>
                      <p style={pMain}>{item.color ?? "N/A"}</p>
                    </td>

                    <td style={tdStrong}>
                      {typeof item.quantity === "number"
                        ? item.quantity
                        : "N/A"}
                    </td>

                    <td style={tdStrong}>
                      Rs.{" "}
                      {typeof item.price === "number"
                        ? item.price.toFixed(0)
                        : "0"}
                    </td>

                    <td style={{ padding: "0 10px" }}>
                      {getStatusBadge(item.status)}
                    </td>

                    <td style={{ padding: "0 10px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <button
                          onClick={() => handleView(item)}
                          title="View Details"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "6px",
                          }}
                        >
                          <Eye size={18} color="#4b5563" />
                        </button>

                        <button
                          onClick={() => handleEdit(item)}
                          title="Edit"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "6px",
                          }}
                        >
                          <Edit size={18} color="#2563eb" />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "6px",
                          }}
                        >
                          <Trash2 size={18} color="#dc2626" />
                        </button>
                        <button
                          onClick={() =>
                            setExpandedRowId(
                              expandedRowId === item.id ? null : item.id
                            )
                          }
                          title={
                            expandedRowId === item.id
                              ? "Collapse"
                              : "Show Options"
                          }
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "6px",
                          }}
                        >
                          <span
                            style={{
                              backgroundColor:
                                expandedRowId === item.id
                                  ? "#fef3c7"
                                  : "#f3f4f6",
                              color:
                                expandedRowId === item.id
                                  ? "#92400e"
                                  : "#374151",
                              padding: "4px 12px",
                              borderRadius: "9999px",
                              fontSize: "12px",
                              fontWeight: "600",
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            {expandedRowId === item.id ? "Hide ▲" : "Options ▼"}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRowId === item.id && (
                    <tr>
                      <td colSpan="7" style={{ padding: 0 }}>
                        <div
                          style={{
                            backgroundColor: "#ffffff",
                            margin: "16px",
                            border: "1px solid #e5e7eb",
                            borderRadius: "12px",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                            padding: "24px",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              marginBottom: "16px",
                              color: "#1f2937",
                            }}
                          >
                            🛒 Add this product to your order
                          </h4>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "20px",
                              flexWrap: "wrap",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <label
                                htmlFor={`qty-${item.id}`}
                                style={{
                                  fontSize: "14px",
                                  color: "#374151",
                                  marginBottom: "6px",
                                }}
                              >
                                Quantity:
                              </label>
                              <input
                                id={`qty-${item.id}`}
                                type="number"
                                min={1}
                                max={item.quantity}
                                value={orderQuantities[item.id] ?? ""}
                                onChange={(e) =>
                                  setOrderQuantities({
                                    ...orderQuantities,
                                    [item.id]: parseInt(e.target.value) || 0,
                                  })
                                }
                                style={{
                                  width: "80px",
                                  padding: "8px",
                                  borderRadius: "6px",
                                  border: "1px solid #d1d5db",
                                  fontSize: "14px",
                                }}
                              />
                            </div>

                            <div style={{ fontSize: "14px", color: "#6b7280" }}>
                              <strong>
                                {item.quantity -
                                  (orderQuantities[item.id] || 0)}
                              </strong>{" "}
                              remaining in stock
                            </div>

                            <button
                              onClick={() =>
                                handleAddToOrder(
                                  item,
                                  orderQuantities[item.id] || 0
                                )
                              }
                              style={{
                                padding: "10px 20px",
                                backgroundColor: "#f59e0b",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "14px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "background-color 0.2s ease-in-out",
                              }}
                              onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = "#d97706")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.backgroundColor = "#f59e0b")
                              }
                            >
                              Confirm & Add
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

         
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  padding: "12px 24px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: "600",
  color: "#374151",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const tdText = {
  padding: "16px 24px",
  fontSize: "14px",
  color: "#374151",
};

const tdStrong = {
  padding: "16px 24px",
  fontSize: "14px",
  color: "#374151",
  fontWeight: "500",
};

const pMain = {
  margin: 0,
  fontSize: "14px",
  fontWeight: "500",
  color: "#1f2937",
};

const pSub = {
  margin: "2px 0 0 0",
  fontSize: "12px",
  color: "#6b7280",
};

const expandBtnStyle = {
  padding: "6px",
  border: "none",
  backgroundColor: "transparent",
  borderRadius: "4px",
  cursor: "pointer",
  color: "#6b7280",
  transition: "color 0.2s",
};
