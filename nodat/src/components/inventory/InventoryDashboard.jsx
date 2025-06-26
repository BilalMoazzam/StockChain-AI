"use client";

import React, { useState, useEffect } from "react";
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
import { useNavigate, useLocation } from "react-router-dom";
import { useInventory } from "../../context/InventoryContext";

export function InventoryDashboard({
  onAddItem,
  onEditItem,
  onDeleteItem,
  onViewDetails,
  onAddToOrder,
}) {
  const { inventory: contextInventory, setInventory } = useInventory();
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
  const [totalValue, setTotalValue] = useState(0);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const LOW_STOCK_THRESHOLD = 9;

  // Helper to determine item status (unified logic)
  const getItemStatus = (item) => {
    const qty = Number(item.quantity);
    if (isNaN(qty) || qty <= 0) return "Out of Stock";
    if (qty <= LOW_STOCK_THRESHOLD) return "Low Stock";
    return "In Stock";
  };

  const updateDashboardStats = (updatedInventory) => {
    setTotalProducts(updatedInventory.length);
    setLowStockItems(
      updatedInventory.filter((item) => getItemStatus(item) === "Low Stock")
        .length
    );
    setOutOfStockItems(
      updatedInventory.filter((item) => getItemStatus(item) === "Out of Stock")
        .length
    );
    setTotalValue(
      updatedInventory.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
        0
      )
    );
  };

  // Define the missing functions
  const handleView = (item) => {
    onViewDetails(item);
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

  // Filter inventory whenever contextInventory, searchTerm, categoryFilter, or statusFilter changes
  useEffect(() => {
    const newFiltered = contextInventory
      .map((item) => ({
        ...item,
        status: getItemStatus(item), // Ensure status is always up-to-date
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
    updateDashboardStats(newFiltered); // Update stats based on filtered inventory
  }, [contextInventory, searchTerm, categoryFilter, statusFilter]);

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

  return (
    <div className="" style={{ padding: "24px" }}>
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
              Shoes Inventory
            </h2>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "14px",
                color: "#6b7280",
              }}
            >
              Manage your Shoes inventory.
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
              <option value="Nike">Nike Shoes</option>
              <option value="Adidas">Adidas Shoes</option>
              <option value="Vans">Vans Shoes</option>
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
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#f9fafb" }}>
              <tr style={{ textAlign:"left"  }}>
                <th className="thStyle" style={{ paddingBlock:"20px", paddingInline:"50px"  }}>Product Details</th>
                <th className="thStyle">Category</th>
                <th className="thStyle">Color</th>
                <th className="thStyle">Stock</th>
                <th className="thStyle">Price</th>
                <th className="thStyle" style={{  paddingInline:"20px"  }}>Status</th>
                <th className="thStyle" style={{  paddingInline:"50px"  }}>Actions</th>
              </tr>
            </thead>
            <tbody className="">
              {filteredInventory.map((item, index) => (
                <React.Fragment key={item.id || `${item.name}-${index}`}>
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
                    <td className="tdText">
                      <div >
                        {" "}
                        {/* Adding margin to the main div */}
                        <p
                          className="pMain"
                          style={{ fontWeight: "bold", paddingLeft:"60px", marginBlock:"20px"}}
                        >
                          {item.name}
                        </p>{" "}
                        <p
                          className="pMain"
                          style={{   paddingLeft:"60px", marginBlock:"6px"}}
                        >
                           {item.id ?? "N/A"}
                        </p>{" "}
                        <p
                          className="pMain"
                          style={{   paddingLeft:"60px", marginBlock:"6px"}}
                        >
                           {item.brand ?? "N/A"}
                        </p>{" "}
                        <p
                          className="pMain"
                          style={{   paddingLeft:"60px", marginBlock:"6px"}}
                        >
                           {item.gender ?? "N/A"}
                        </p>{" "}
                        {/* Making product name bold */}
                        {/* <p className="pSub">ID: {item.id ?? "N/A"}</p>
                        <p className="pSub">Brand: {item.brand ?? "N/A"}</p>
                        <p className="pSub">Gender: {item.gender ?? "N/A"}</p> */}
                      </div>
                    </td>

                    <td className="tdText">{item.category ?? "N/A"}</td>

                    <td className="tdText">
                      <p className="pMain">{item.color ?? "N/A"}</p>
                    </td>

                    <td className="tdStrong">
                      {typeof item.quantity === "number"
                        ? item.quantity
                        : "N/A"}
                    </td>

                    <td className="tdStrong">
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
                                    [item.id]:
                                      Number.parseInt(e.target.value) || 0,
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
                                onAddToOrder(
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
