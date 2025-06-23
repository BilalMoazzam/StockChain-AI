import React, { useState, useEffect } from "react";
import ProductCard from "../ProductCard"; // Adjust path
import axios from "axios";

const ProductCardPage = () => {
  const [products, setProducts] = useState([]);

  const syncStockWithLocalInventory = (apiProducts) => {
    const inventory = JSON.parse(localStorage.getItem("persistedInventory")) || [];
    return apiProducts.map((product) => {
      const key = product.id || product.sku;
      const match = inventory.find((item) => (item.id || item.sku) === key);
      return match ? { ...product, quantity: match.quantity } : product;
    });
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      const updated = syncStockWithLocalInventory(res.data);
      setProducts(updated);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    window.addEventListener("focus", fetchProducts);
    return () => window.removeEventListener("focus", fetchProducts);
  }, []);

  return (
    <div style={{ padding: "40px", background: "#f9fafb", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "24px", color: "#1f2937" }}>
        Product Showcase
      </h1>
      <div
        style={{
          display: "flex",
          gap: "24px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id || product.sku}
            product={product}
            showAddToCart={true}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductCardPage;
