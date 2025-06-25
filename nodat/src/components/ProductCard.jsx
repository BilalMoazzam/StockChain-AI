// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./styles/ProductCard.css";

// const LOW_STOCK_THRESHOLD = 20;

// const ProductCard = ({ product, showAddToCart = false }) => {
//   const [quantity, setQuantity] = useState("");
//   const [currentStock, setCurrentStock] = useState(product.quantity || 0);
//   const navigate = useNavigate();

//   const price = product.Price || product.price || 0;
//   const displayQuantity = quantity && !isNaN(quantity) ? parseInt(quantity) : 0;
//   const remainingStock = Math.max(0, currentStock - displayQuantity);
//   const isOutOfStock = currentStock <= 0;

//   // 🔄 Refresh inventory from localStorage
//   const refreshStock = () => {
//     const inventory = JSON.parse(localStorage.getItem("persistedInventory")) || [];
//     const key = product.id || product.sku;

//     const updated = inventory.find((item) => (item.id || item.sku) === key);
//     if (updated) {
//       setCurrentStock(updated.quantity);
//     } else {
//       setCurrentStock(product.quantity || 0); // fallback
//     }
//   };

//   // 🧠 Run on mount and when user focuses tab
//   useEffect(() => {
//     refreshStock();
//     window.addEventListener("focus", refreshStock);
//     return () => window.removeEventListener("focus", refreshStock);
//   }, []);

//   const handleAddToCart = () => {
//     const qty = parseInt(quantity);
//     if (!qty || qty < 1 || qty > currentStock) return;

//     const existing = JSON.parse(localStorage.getItem("selectedProducts")) || [];
//     const key = product.id || product.sku;
//     const updated = [...existing];

//     const foundIndex = updated.findIndex((item) => (item.id || item.sku) === key);

//     if (foundIndex !== -1) {
//       updated[foundIndex].quantity += qty;
//       updated[foundIndex].totalPrice =
//         updated[foundIndex].quantity * updated[foundIndex].price;
//     } else {
//       updated.push({
//         ...product,
//         quantity: qty,
//         totalPrice: qty * price,
//       });
//     }

//     // 📦 Update stock in persistedInventory
//     const allInventory = JSON.parse(localStorage.getItem("persistedInventory")) || [];
//     const newInventory = allInventory.map((item) =>
//       (item.id || item.sku) === key
//         ? { ...item, quantity: item.quantity - qty }
//         : item
//     );
//     localStorage.setItem("persistedInventory", JSON.stringify(newInventory));

//     // 💾 Save cart
//     localStorage.setItem("selectedProducts", JSON.stringify(updated));
//     setQuantity("");
//     navigate("/orders");
//   };

//   const handleQuantityChange = (e) => {
//     const val = e.target.value;
//     if (/^\d*$/.test(val)) {
//       setQuantity(val === "" ? "" : Math.max(0, parseInt(val)));
//     }
//   };

//   const getStockMessage = () => {
//     if (remainingStock <= 0 || currentStock <= 0) {
//       return <span style={{ color: "#b91c1c" }}>❌ Out of Stock</span>;
//     } else if (remainingStock < LOW_STOCK_THRESHOLD) {
//       return <span style={{ color: "#d97706" }}>⚠️ Low Stock</span>;
//     } else {
//       return <span style={{ color: "#16a34a" }}>✔ In Stock</span>;
//     }
//   };

//   if (!product) return null;

//   return (
//     <div className="card">
//       <div className="card-img-container">
//         <img
//           src={product.Image || "https://via.placeholder.com/300x200?text=No+Image"}
//           alt={product.ProductName || "Product"}
//           className="card-img"
//         />
//       </div>

//       <div className="card-content">
//         <h3 className="card-title">{product.ProductName || product.name}</h3>
//         <p className="card-category">{product.Category || product.category}</p>
//         <p className="card-price">Rs. {price.toFixed(2)}</p>

//         <p
//           style={{
//             fontSize: "14px",
//             fontWeight: "500",
//             color: isOutOfStock ? "#b91c1c" : "#4b5563",
//             marginBottom: "4px",
//           }}
//         >
//           Total Quantity: {isOutOfStock ? 0 : remainingStock}
//         </p>

//         <p style={{ fontSize: "12px", marginBottom: "8px" }}>{getStockMessage()}</p>

//         {!isOutOfStock && showAddToCart ? (
//           <div className="card-actions">
//             <input
//               type="number"
//               min="0"
//               max={currentStock}
//               value={quantity}
//               onChange={handleQuantityChange}
//               onBlur={() => {
//                 if (!quantity || parseInt(quantity) < 0) setQuantity(0);
//               }}
//               className="card-qty-input"
//               placeholder="Qty"
//             />
//             <button
//               className="card-btn"
//               onClick={handleAddToCart}
//               disabled={displayQuantity > currentStock}
//             >
//               Add to Cart
//             </button>
//           </div>
//         ) : (
//           <div
//             style={{
//               padding: "6px 12px",
//               backgroundColor: "#fee2e2",
//               color: "#991b1b",
//               fontWeight: "600",
//               borderRadius: "6px",
//               fontSize: "13px",
//               textAlign: "center",
//               marginTop: "8px",
//             }}
//           >
//             Out of Stock
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProductCard;
