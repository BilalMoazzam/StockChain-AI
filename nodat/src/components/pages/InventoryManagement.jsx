"use client"

import { useState, useEffect, useCallback } from "react"
import { useInventory } from "../../context/InventoryContext"
import Header from "../layout/Header"
import { InventoryDashboard } from "../inventory/InventoryDashboard"
import { ProductDetails } from "../inventory/product-details" // Assuming this path
import { ProductForm } from "../inventory/product-form" // Assuming this path
import { Modal } from "../ui-components" // Assuming this path
import { addNotification } from "../../utils/notificationService"
import { useNavigate, useLocation } from "react-router-dom"

const InventoryManagement = () => {
  const { inventory, setInventory, clearInventory } = useInventory()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [visibleProducts, setVisibleProducts] = useState(30)
  const [showProductForm, setShowProductForm] = useState(false)
  const [showProductDetails, setShowProductDetails] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [orderSuccessMsg, setOrderSuccessMsg] = useState("")

  const navigate = useNavigate()
  const location = useLocation()

  // Helper to determine item status
  const getItemStatus = useCallback((item) => {
    const qty = Number(item.quantity)
    const LOW_STOCK_THRESHOLD = 9

    if (isNaN(qty) || qty <= 0) return "Out of Stock"
    if (qty <= LOW_STOCK_THRESHOLD) return "Low Stock"
    return "In Stock"
  }, [])

  // Fetch data and set up initial inventory
  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:5000/api/products")
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      console.log("Fetched raw inventory data:", data) // Log raw data for inspection

      if (!Array.isArray(data) || data.length === 0) {
        setError("No inventory data found.")
        setInventory([])
        localStorage.setItem("persistedInventory", JSON.stringify([]))
        setLoading(false)
        return
      }

      const mapped = data.map((p) => {
        // Log each product object to see its exact keys
        console.log("Mapping product:", p)

        // Ensure price and quantity are parsed as numbers, with robust fallbacks
        const price = Number.parseFloat(p.Price || p.price) || 0
        const quantity = Number.parseInt(p.quantity || p.Quantity) || 0 // Added p.Quantity as a fallback

        const status = getItemStatus({ ...p, quantity }) // Recalculate status based on parsed quantity
        return {
          id: p.id ?? p._id ?? `prod-${Date.now()}-${Math.random()}`, // More robust ID fallback
          productId: p.productId ?? p.ProductID ?? "N/A", // Added ProductID as a fallback
          name: p.ProductName || p.name || "Unnamed Product",
          brand: p.ProductBrand || p.brand || "N/A",
          gender: p.Gender || p.gender || "N/A",
          price: price,
          quantity: quantity,
          category: p.Category || p.category || "N/A",
          color: p.PrimaryColor || p.color || "N/A",
          status: status, // Store the recalculated status
          description: p.Description || p.description || "",
          imageUrl: p.Image || p.imageUrl || "",
          lastUpdated: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "N/A",
        }
      })

      console.log("Mapped inventory:", mapped)
      setInventory(mapped)
      localStorage.setItem("persistedInventory", JSON.stringify(mapped))
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

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (location.pathname === "/inventory") {
      fetchData()
    }
  }, [location.pathname])

  const updateInventoryState = (updatedInventory) => {
    setInventory(updatedInventory)
    localStorage.setItem("persistedInventory", JSON.stringify(updatedInventory))
  }

  const handleAddProduct = () => {
    setEditingProduct(null)
    setShowProductForm(true)
  }

  const handleSaveProduct = async (productData) => {
    let updatedInventory
    if (editingProduct && editingProduct.id) {
      updatedInventory = inventory.map((item) =>
        item.id === editingProduct.id ? { ...productData, status: getItemStatus(productData) } : item,
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
      const newId = `PROD${Date.now()}`
      const itemToAdd = {
        ...productData,
        id: newId,
        status: getItemStatus(productData),
      }
      updatedInventory = [...inventory, itemToAdd]
      addNotification({
        type: "inventory",
        title: "New Inventory Item Added",
        description: `New product "${productData.name}" (ID: ${itemToAdd.id}) has been added to inventory.`,
        priority: "normal",
        icon: "package",
        link: "/inventory",
      })
    }
    updateInventoryState(updatedInventory)
    setShowProductForm(false)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setShowProductForm(true)
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const updatedInventory = inventory.filter((item) => item.id !== productId)
      updateInventoryState(updatedInventory)
      addNotification({
        type: "inventory",
        title: "Inventory Item Deleted",
        description: `Product with ID: ${productId} has been removed from inventory.`,
        priority: "medium",
        icon: "trash",
        link: "/inventory",
      })
      try {
        await fetch(`http://localhost:5000/api/products/${productId}`, {
          method: "DELETE",
        })
      } catch (error) {
        console.error("Failed to delete product from backend:", error)
      }
    }
  }

  const handleViewDetails = (product) => {
    setSelectedProduct(product)
    setShowProductDetails(true)
  }

  const handleAddToOrder = async (item, quantity) => {
    if (quantity > item.quantity) {
      setOrderSuccessMsg(`❌ Not enough stock for "${item.name}"`)
      return
    }

    const totalPrice = item.price * quantity
    const storedList = JSON.parse(localStorage.getItem("selectedProductFromInventory")) || []
    const existingIndex = storedList.findIndex((p) => p.id === item.id)

    if (existingIndex !== -1) {
      if (storedList[existingIndex].quantity + quantity > item.quantity) {
        setOrderSuccessMsg(`❌ Not enough stock for "${item.name}"`)
        return
      }
      storedList[existingIndex].quantity += quantity
      storedList[existingIndex].totalPrice = storedList[existingIndex].quantity * item.price
    } else {
      if (quantity > item.quantity) {
        setOrderSuccessMsg(`❌ Not enough stock for "${item.name}"`)
        return
      }
      storedList.push({ ...item, quantity, totalPrice })
    }

    localStorage.setItem("selectedProductFromInventory", JSON.stringify(storedList))

    const updatedInventory = inventory.map((product) => {
      if (product.id === item.id) {
        const newQty = product.quantity - quantity
        return {
          ...product,
          quantity: newQty,
          status: getItemStatus({ ...product, quantity: newQty }),
        }
      }
      return product
    })

    updateInventoryState(updatedInventory)

    try {
      const response = await fetch(`http://localhost:5000/api/products/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: item.quantity - quantity,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update stock in the database.")
      }

      const updatedInventoryFromDB = await fetch("http://localhost:5000/api/products").then((res) => res.json())

      const mappedUpdatedInventory = updatedInventoryFromDB.map((p) => {
        const price = Number.parseFloat(p.Price || p.price) || 0
        const quantity = Number.parseInt(p.quantity || p.Quantity) || 0
        const status = getItemStatus({ ...p, quantity })
        return {
          id: p.id ?? p._id ?? `prod-${Date.now()}-${Math.random()}`,
          productId: p.productId ?? p.ProductID ?? "N/A",
          name: p.ProductName || p.name || "Unnamed Product",
          brand: p.ProductBrand || p.brand || "N/A",
          gender: p.Gender || p.gender || "N/A",
          price: price,
          quantity: quantity,
          category: p.Category || p.category || "N/A",
          color: p.PrimaryColor || p.color || "N/A",
          status: status,
          description: p.Description || p.description || "",
          imageUrl: p.Image || p.imageUrl || "",
          lastUpdated: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "N/A",
        }
      })
      updateInventoryState(mappedUpdatedInventory)

      navigate("/orders")
    } catch (error) {
      console.error("Failed to update inventory in database:", error)
      addNotification({
        type: "alert",
        title: "Inventory Update Failed",
        description: `Failed to update inventory in database: ${error.message}`,
        priority: "high",
        icon: "alert",
        link: "/inventory",
      })
    }
  }

  const handleLogout = () => {
    clearInventory()
    navigate("/login")
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
      <main className="p-6">
        <InventoryDashboard
          onAddItem={handleAddProduct}
          onEditItem={handleEditProduct}
          onDeleteItem={handleDeleteProduct}
          onViewDetails={handleViewDetails}
          onAddToOrder={handleAddToOrder}
        />
      </main>

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
