"use client"

import { useState, useEffect, useCallback } from "react"
import Header from "../layout/Header" // Assuming Header is in layout folder
import { InventoryDashboard } from "../inventory/InventoryDashboard"
import { ProductDetails } from "../inventory/product-details"
import { ProductForm } from "../inventory/product-form"
import { Modal } from "../ui-components" // Assuming Modal is a shadcn/ui component or similar
import { addNotification } from "../../utils/notificationService" // Import notification service
import { useNavigate } from "react-router-dom" // Use useNavigate for React Router consistency

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showProductForm, setShowProductForm] = useState(false)
  const [showProductDetails, setShowProductDetails] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const navigate = useNavigate()

  // Helper to determine item status
  const getItemStatus = useCallback((item) => {
    const qty = Number(item.quantity)
    const LOW_STOCK_THRESHOLD = 9 // Define threshold here or import from a config

    if (isNaN(qty) || qty <= 0) return "Out of Stock"
    if (qty <= LOW_STOCK_THRESHOLD) return "Low Stock"
    return "In Stock"
  }, [])

  // Fetch data and set up initial inventory
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch("http://localhost:5000/api/products")
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const data = await res.json()

        const mapped = data.map((p) => ({
          id: p.id ?? p._id,
          productId: p.productId ?? "N/A",
          name: p.name ?? "Unnamed Product",
          brand: p.brand ?? "N/A",
          gender: p.gender ?? "N/A",
          price: typeof p.price === "number" ? p.price : 0,
          quantity: typeof p.quantity === "number" ? p.quantity : 0,
          category: p.category ?? "N/A",
          color: p.PrimaryColor ?? p.color ?? "N/A",
          status: getItemStatus(p), // Set initial status based on quantity
          description: p.description ?? "",
          imageUrl: p.imageUrl || "",
          lastUpdated: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "N/A",
        }))
        setInventory(mapped)
        localStorage.setItem("persistedInventory", JSON.stringify(mapped)) // Persist initial data
        setLoading(false)
      } catch (error) {
        console.error("Failed to load products:", error)
        setError("Failed to load inventory data.")
        setLoading(false)
        addNotification({
          type: "alert",
          title: "Inventory Load Failed",
          description: `Failed to load inventory data: ${error.message}`,
          priority: "high",
          icon: "alert",
          link: "/inventory",
        })
      }
    }

    fetchData()
  }, [getItemStatus])

  // Monitor inventory for stock level changes and dispatch notifications
  useEffect(() => {
    const prevInventory = JSON.parse(localStorage.getItem("persistedInventory")) || []
    inventory.forEach((currentItem) => {
      const prevItem = prevInventory.find((item) => item.id === currentItem.id)
      const currentStatus = getItemStatus(currentItem)
      const prevStatus = prevItem ? getItemStatus(prevItem) : null

      if (prevStatus && currentStatus !== prevStatus) {
        if (currentStatus === "Low Stock") {
          addNotification({
            type: "alert",
            title: "Low Stock Alert",
            description: `Item "${currentItem.name}" (ID: ${currentItem.id}) is now low in stock (${currentItem.quantity} units).`,
            priority: "high",
            icon: "alert",
            link: "/inventory",
          })
        } else if (currentStatus === "Out of Stock") {
          addNotification({
            type: "alert",
            title: "Out of Stock Alert",
            description: `Item "${currentItem.name}" (ID: ${currentItem.id}) is now out of stock.`,
            priority: "high",
            icon: "alert",
            link: "/inventory",
          })
        } else if (currentStatus === "In Stock" && (prevStatus === "Low Stock" || prevStatus === "Out of Stock")) {
          addNotification({
            type: "inventory",
            title: "Inventory Restocked",
            description: `Item "${currentItem.name}" (ID: ${currentItem.id}) has been restocked to ${currentItem.quantity} units.`,
            priority: "normal",
            icon: "package",
            link: "/inventory",
          })
        }
      }
    })
    localStorage.setItem("persistedInventory", JSON.stringify(inventory)) // Update persisted inventory
  }, [inventory, getItemStatus])

  // 🔁 Sync inventory state with localStorage on mount or tab focus
useEffect(() => {
  const syncInventoryFromStorage = () => {
    const persisted = localStorage.getItem("persistedInventory");
    if (persisted) {
      const parsed = JSON.parse(persisted);
      setInventory(parsed);
    }
  };

  // Initial sync
  syncInventoryFromStorage();

  // Sync on tab focus
  window.addEventListener("focus", syncInventoryFromStorage);
  return () => {
    window.removeEventListener("focus", syncInventoryFromStorage);
  };
}, []);


  const handleAddProduct = (productData = null) => {
    setEditingProduct(productData || null)
    setShowProductForm(true)
  }

  const handleSaveProduct = (productData) => {
    if (editingProduct && editingProduct.id) {
      setInventory((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id ? { ...productData, status: getItemStatus(productData) } : item,
        ),
      )
      addNotification({
        type: "inventory",
        title: "Inventory Item Updated",
        description: `Product "${productData.name}" (ID: ${productData.id}) has been updated.`,
        priority: "normal",
        icon: "package",
        link: "/inventory",
      })
    } else {
      const newId = `PROD${Date.now()}` // Simple unique ID
      const itemToAdd = { ...productData, id: newId, status: getItemStatus(productData) }
      setInventory((prev) => [...prev, itemToAdd])
      addNotification({
        type: "inventory",
        title: "New Inventory Item Added",
        description: `New product "${productData.name}" (ID: ${itemToAdd.id}) has been added to inventory.`,
        priority: "normal",
        icon: "package",
        link: "/inventory",
      })
    }
    setShowProductForm(false)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setShowProductForm(true)
  }

  const handleDeleteProduct = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setInventory((prev) => prev.filter((item) => item.id !== productId))
      addNotification({
        type: "inventory",
        title: "Inventory Item Deleted",
        description: `Product with ID: ${productId} has been removed from inventory.`,
        priority: "medium",
        icon: "trash",
        link: "/inventory",
      })
    }
  }

  const handleViewDetails = (product) => {
    setSelectedProduct(product)
    setShowProductDetails(true)
  }

  const handleCreateOrderFromProduct = (product) => {
    // This function is likely used to navigate to the orders page with a pre-selected product
    // The actual order creation notification will happen on the OrderManagement page
    addNotification({
      type: "order",
      title: "Product Selected for Order",
      description: `Product "${product.name}" selected to create a new order.`,
      priority: "normal",
      icon: "shopping-cart",
      link: "/orders",
    })
    // Navigate to orders page, passing the product via state
    // The OrderManagement component will then pick this up and add to selectedProducts
    localStorage.setItem("selectedProductFromInventory", JSON.stringify([product]))
    navigate("/orders")
  }

  const handleAddToOrder = (product) => {
    // This function is likely for adding to an existing order draft or similar
    // The actual order creation notification will happen on the OrderManagement page
    addNotification({
      type: "order",
      title: "Product Added to Order Draft",
      description: `Product "${product.name}" added to your current order draft.`,
      priority: "normal",
      icon: "shopping-cart",
      link: "/orders",
    })
    // Logic to add to local storage for order draft
    const existing = JSON.parse(localStorage.getItem("selectedProductFromInventory")) || []
    const updated = [...existing, product]
    localStorage.setItem("selectedProductFromInventory", JSON.stringify(updated))
    // No navigation here, as it's just adding to a draft
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-64px)] text-gray-500 text-lg">
          Loading inventory data...
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-[calc(100vh-64px)] text-red-600 text-lg">Error: {error}</div>
      )
    }

    return (
      <InventoryDashboard
        inventory={inventory}
        onAddItem={handleAddProduct}
        onEditItem={handleEditProduct}
        onDeleteItem={handleDeleteProduct}
        onViewDetails={handleViewDetails}
        onCreateOrder={handleCreateOrderFromProduct}
        onAddToOrder={handleAddToOrder}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Inventory Management"
        breadcrumbs={[
          { text: "Dashboard", active: false },
          { text: "Inventory Management", active: true },
        ]}
      />
      <main className="p-6">{renderContent()}</main>

      <ProductForm
        isOpen={showProductForm}
        onClose={() => setShowProductForm(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
      />

      {showProductDetails && selectedProduct && (
        <Modal
          isOpen={showProductDetails}
          onClose={() => setShowProductDetails(false)}
          title="Product Details"
          size="xlarge"
        >
          <ProductDetails
            product={selectedProduct}
            onEdit={(product) => {
              setShowProductDetails(false)
              handleEditProduct(product)
            }}
          />
        </Modal>
      )}
    </div>
  )
}

export default InventoryManagement
