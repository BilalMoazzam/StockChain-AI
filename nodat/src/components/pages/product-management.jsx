// import { useState, useEffect } from "react";
// import { InventoryDashboard } from "../inventory/InventoryDashboard";

// import ProductCard from "../ProductCard"; // Adjust path if placed differently
// import axios from "axios";

// export default function ProductManagement() {
//   const [view, setView] = useState("table"); // 'table' or 'cards'
//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     const fetchInventory = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/api/products"); // ✅ Update API if needed
//         setProducts(response.data);
//       } catch (error) {
//         console.error("Error fetching inventory:", error);
//       }
//     };

//     fetchInventory();
//   }, []);

//   return (
//     <div className="p-6 min-h-screen bg-gray-50">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
//         <button
//           onClick={() => setView(view === "table" ? "cards" : "table")}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
//         >
//           Switch to {view === "table" ? "Showcase View" : "Admin Table View"}
//         </button>
//       </div>

//       {view === "table" ? (
//         <InventoryDashboard inventory={products} />
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {products.map((product) => (
//             <ProductCard key={product.id} product={product} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
