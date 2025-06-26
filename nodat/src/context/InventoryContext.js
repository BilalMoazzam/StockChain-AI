"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"

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
  const fetchInventoryData = useCallback(
  async (page = 1, limit = 20, append = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      console.log("Auth Token:", token); // Debugging log

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      } else {
        console.warn("No token found. Unable to make authenticated request.");
      }

      const res = await fetch(`http://localhost:5000/api/inventory?page=${page}&limit=${limit}`, {
        headers: headers,
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Handle unauthorized error
          const errorData = await res.json();
          console.error("Backend Error: Unauthorized", errorData);
          throw new Error("Unauthorized. Please check your authentication.");
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const responseData = await res.json();
      console.log("Fetched raw inventory data in context:", responseData);

      if (!responseData.data || !Array.isArray(responseData.data)) {
        console.warn("No inventory data found or data is not an array in response.");
        if (!append) {
          setInventory([]);
          setTotalProductsCount(0);
          localStorage.removeItem("persistedInventory");
        }
        setIsLoading(false);
        return;
      }

      const mapped = responseData.data.map((p) => {
        const price = Number.parseFloat(p.price?.retail || p.price || 0) || 0;
        const quantity = Number.parseInt(p.stock?.current || p.quantity || 0) || 0;

        const status = getItemStatus({ ...p, quantity });
        return {
          id: p._id,
          sku: p.sku || "N/A",
          name: p.name || "Unnamed Product",
          brand: p.brand || "N/A",
          gender: p.gender || "N/A",
          price: price,
          quantity: quantity,
          category: p.category?.name || p.category || "N/A",
          color: p.color || "N/A",
          status: status,
          description: p.description || "",
          imageUrl: p.imageUrl || "",
          lastUpdated: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "N/A",
        };
      });

      setTotalProductsCount(responseData.total);

      if (append) {
        setInventory((prev) => {
          const newItems = mapped.filter((newItem) => !prev.some((existingItem) => existingItem.id === newItem.id));
          const updatedPrev = prev.map((existingItem) => {
            const updatedItem = mapped.find((newItem) => newItem.id === existingItem.id);
            return updatedItem ? updatedItem : existingItem;
          });
          const combined = [...updatedPrev, ...newItems];
          localStorage.setItem("persistedInventory", JSON.stringify(combined));
          return combined;
        });
      } else {
        setInventory(mapped);
        localStorage.setItem("persistedInventory", JSON.stringify(mapped));
      }

      console.log("Inventory state updated and persisted in context.");
    } catch (err) {
      console.error("Error fetching inventory in context:", err);
      setError(err);
      if (!append) {
        setInventory([]);
        setTotalProductsCount(0);
        localStorage.removeItem("persistedInventory");
      }
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
    // Attempt to load from localStorage first
    const storedInventory = localStorage.getItem("persistedInventory")
    if (storedInventory) {
      try {
        const parsedInventory = JSON.parse(storedInventory)
        setInventory(parsedInventory)
        setTotalProductsCount(parsedInventory.length) // Initial count from stored data
      } catch (e) {
        console.error("Failed to parse stored inventory from localStorage:", e)
        localStorage.removeItem("persistedInventory")
      }
    }
    // Then fetch fresh data from the backend
    fetchInventoryData()
  }, [fetchInventoryData]) // Depend on fetchInventoryData to re-run if it changes

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
