"use client"

import { useState, useEffect } from "react"
import { productService } from "../services/api"
import { Card, CardContent } from "../ui/Card"
import { Input } from "../ui/Input"
import { Search } from "lucide-react"

function ProductPreview() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await productService.getProducts()
      setProducts(data)
    } catch (err) {
      setError("Failed to fetch products for preview.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) return <div className="p-6 text-center">Loading product preview...</div>
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Product Showcase Preview</h1>
      <p className="text-gray-600 mb-6">
        This section simulates how products might appear on your public-facing ERP showcase. Changes made in Inventory
        Management should reflect here (depending on your frontend's data fetching strategy).
      </p>

      <div className="relative flex-grow max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search products for preview..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden shadow-md rounded-lg">
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden rounded-t-lg">
                <img
                  src={product.imageUrl || "/placeholder.svg?height=200&width=200"}
                  alt={product.name}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = "/placeholder.svg?height=200&width=200"
                  }}
                />
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">Rs. {product.price.toFixed(0)}</span>
                  <span className="text-sm text-gray-700">Stock: {product.quantity}</span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">No products available for preview.</p>
        )}
      </div>
    </div>
  )
}

export default ProductPreview
