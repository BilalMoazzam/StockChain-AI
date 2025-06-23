"use client"
import { Card, CardContent } from "../ui/Card"
import { Button } from "../ui/Button"
import { Eye, Edit, Trash2, ShoppingCart } from "lucide-react"



function ProductCard({ product, onEdit, onDelete, onView, onAddToOrder }) {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800 border-green-200"
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Out of Stock":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <div className="relative w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden rounded-t-lg">
        <img
          src={product.imageUrl || "/placeholder.svg"}
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = "/placeholder.svg?height=200&width=200"
          }}
        />
        <span
          className={`absolute top-2 right-2 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(product.status)}`}
        >
          {product.status}
        </span>
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{product.category}</p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-gray-900">Rs. {product.price.toFixed(0)}</span>
          <span className="text-sm text-gray-700">Stock: {product.quantity}</span>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="icon" onClick={() => onView(product)} title="View Details">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => onEdit(product)} title="Edit Product">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon" onClick={() => onDelete(product.id)} title="Delete Product">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button className="flex-grow" onClick={() => onAddToOrder(product)} title="Add to Order">
            <ShoppingCart className="h-4 w-4 mr-2" /> Add to Order
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProductCard
