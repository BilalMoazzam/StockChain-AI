"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useApp } from "../context/AppContext";


const InventoryContext = createContext(null)

export const useInventory = () => {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider")
  }
  return context
}

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([])
  const [totalProductsCount, setTotalProductsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { state: { user } } = useApp();
const isAuthenticated = Boolean(user);


  // Helper to determine item status (unified logic)
  const getItemStatus = useCallback((item) => {
    const qty = Number(item.quantity)
    const LOW_STOCK_THRESHOLD = 9

    if (isNaN(qty) || qty <= 0) return "Out of Stock"
    if (qty <= LOW_STOCK_THRESHOLD) return "Low Stock"
    return "In Stock"
  }, [])

  // Function to clear inventory data
  const clearInventory = () => {
    console.log("Clearing inventory and localStorage...")
    setInventory([])
    setTotalProductsCount(0)
    localStorage.removeItem("persistedInventory")
  }

  // Function to fetch inventory data with pagination
// inside your InventoryContext.js, replace fetchInventoryData with:
const fetchInventoryData = useCallback(
  async (page = 1, limit = 20, append = false) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1) Grab the token you saved during login
      const token = localStorage.getItem("authToken");
      console.log("🕵️‍♂️ [InventoryContext] token from localStorage:", token);
      if (!token) {
        console.error("No auth token found; cannot fetch inventory.");
        throw new Error("Not authorized, no token");
      }

      // 2) Fetch, attaching the Bearer token
      console.log(
        `🕵️‍♂️ [InventoryContext] calling /api/inventory?page=${page}&limit=${limit}`
      );
      const res = await fetch(
        `http://localhost:5000/api/inventory?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      // 3) Handle common failure cases
      if (res.status === 401) {
        console.error("🛑 [InventoryContext] Unauthorized (401) from server");
        throw new Error("Not authorized, token failed");
      }
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // 4) Parse and map your data
      const responseData = await res.json();
      console.log("✅ [InventoryContext] raw responseData:", responseData);

      // … then your mapping & setInventory logic as before …

    } catch (err) {
      console.error("❌ [InventoryContext] Error fetching inventory:", err);
      // … your existing error handling …
    } finally {
      setIsLoading(false);
    }
  },
  [getItemStatus]
);


  // Function to update a product's quantity in the context
  const updateProductQuantityInContext = useCallback(
    (productId, newQuantity) => {
      setInventory((prevInventory) => {
        const updated = prevInventory.map((product) => {
          if (product.id === productId) {
            const updatedProduct = { ...product, quantity: newQuantity }
            return { ...updatedProduct, status: getItemStatus(updatedProduct) }
          }
          return product
        })
        localStorage.setItem("persistedInventory", JSON.stringify(updated))
        return updated
      })
    },
    [getItemStatus],
  )

   useEffect(() => {
    const stored = localStorage.getItem("persistedInventory");
    if (stored) {
      try {
        const arr = JSON.parse(stored);
        setInventory(arr);
        setTotalProductsCount(arr.length);
      } catch {
        localStorage.removeItem("persistedInventory");
      }
    }
  }, []); // ← run only once

  // 3️⃣ Fetch fresh data—but only after login (isAuthenticated flips to true)
  useEffect(() => {
    if (isAuthenticated) {
      fetchInventoryData();
    }
  }, [fetchInventoryData, isAuthenticated]);

  const contextValue = {
    inventory,
    setInventory,
    clearInventory,
    fetchInventoryData,
    updateProductQuantityInContext, // This is correctly exposed
    totalProductsCount,
    isLoading,
    error,
  }

  return <InventoryContext.Provider value={contextValue}>{children}</InventoryContext.Provider>
}
