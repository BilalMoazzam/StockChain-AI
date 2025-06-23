"use client"

import { useState } from "react"

const ProductSalesLookup = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [foundProduct, setFoundProduct] = useState(null)
  const [error, setError] = useState("")

  const handleSearch = () => {
    setError("")
    setFoundProduct(null)

    if (!searchTerm.trim()) {
      setError("Please enter a product name.")
      return
    }

    // Find product by exact name match (case-insensitive)
    const product = products.find(
      (p) => p.ProductName && p.ProductName.toLowerCase() === searchTerm.trim().toLowerCase(),
    )

    if (product) {
      setFoundProduct(product)
    } else {
      setError(`Product "${searchTerm}" not found. Please check the name.`)
    }
  }

  return (
    <div className="product-lookup-container">
      <div className="search-input-group">
        <input
          type="text"
          placeholder="Enter product name (e.g., Running Shoes)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSearch()
            }
          }}
        />
        <button onClick={handleSearch}>Search Sales</button>
      </div>
      {error && <p className="error-message-lookup">{error}</p>}

      {foundProduct && (
        <div className="product-details">
          <h4>{foundProduct.ProductName} Sales Overview</h4>
          <p>
            <strong>Product ID:</strong> {foundProduct.ProductID}
          </p>
          <p>
            <strong>Current Quantity:</strong> {foundProduct.quantity}
          </p>
          <p>
            <strong>Price per Unit:</strong> ${foundProduct.Price ? foundProduct.Price.toFixed(2) : "N/A"}
          </p>
          <p>
            <strong>Estimated Sales Value:</strong> $
            {(foundProduct.quantity * foundProduct.Price).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p>
            <strong>Stock Status:</strong>{" "}
            <span className={`prediction-${foundProduct.stock.toLowerCase().replace(/\s/g, "-")}`}>
              {foundProduct.stock}
            </span>
          </p>
          <p>
            <strong>AI Prediction:</strong>{" "}
            <span className={`prediction-${foundProduct.ai_prediction.toLowerCase().replace(/\s/g, "-")}`}>
              {foundProduct.ai_prediction}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

export default ProductSalesLookup
