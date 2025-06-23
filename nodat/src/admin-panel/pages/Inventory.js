"use client"

import { useState, useEffect } from "react"
import { productService } from "../services/api"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select"
import { Plus, Search } from "lucide-react"
import ProductCard from "../components/ProductCard" // This will be the new ProductCard

function Inventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await productService.getProducts()
      // Map backend data to match expected product structure for cards
      const mappedProducts = data.map((p) => ({
        id: p._id || p.id, // Use _id from MongoDB or id
        name: p.name,
        category: p.category,
        price: p.price,
        quantity: p.quantity,
        imageUrl: p.imageUrl || "/placeholder.svg?height=200&width=200", // Use placeholder if no image
        status: getProductStatus(p.quantity),
        brand: p.brand || "N/A",
        gender: p.gender || "N/A",
        color: p.color || "N/A",
        description: p.description || "",
      }))
      setProducts(mappedProducts)
    } catch (err) {
      setError("Failed to fetch products.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getProductStatus = (quantity) => {
    if (quantity <= 0) return "Out of Stock"
    if (quantity < 10) return "Low Stock" // Example threshold
    return "In Stock"
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "" || product.category === categoryFilter
    const matchesStatus = statusFilter === "" || product.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleAddProduct = () => {
    // Implement modal or navigate to a form for adding product
    alert("Add New Product functionality will open a form/modal.")
  }

  const handleEditProduct = (product) => {
    // Implement modal or navigate to a form for editing product
    alert(`Edit product: ${product.name}`)
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.deleteProduct(productId)
        fetchProducts() // Re-fetch products after deletion
        alert("Product deleted successfully!")
      } catch (err) {
        setError("Failed to delete product.")
        console.error(err)
      }
    }
  }

  const handleViewDetails = (product) => {
    alert(`Viewing details for: ${product.name}`)
    // Implement modal for detailed view
  }

  const handleAddToOrder = (product) => {
    alert(`Adding ${product.name} to order.`)
    // Implement logic to add to order, potentially navigating to orders page
  }

  if (loading) return <div className="p-6 text-center">Loading inventory...</div>
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative flex-grow max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search products..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <Select onValueChange={setCategoryFilter} value={categoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Men">Men</SelectItem>
              <SelectItem value="Women">Women</SelectItem>
              <SelectItem value="Child">Children</SelectItem>
              {/* Add more categories as needed */}
            </SelectContent>
          </Select>
          <Select onValueChange={setStatusFilter} value={statusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="In Stock">In Stock</SelectItem>
              <SelectItem value="Low Stock">Low Stock</SelectItem>
              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddProduct}>
            <Plus className="mr-2 h-4 w-4" /> Add New Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onView={handleViewDetails}
              onAddToOrder={handleAddToOrder}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">No products found matching your criteria.</p>
        )}
      </div>
    </div>
  )
}

export default Inventory
