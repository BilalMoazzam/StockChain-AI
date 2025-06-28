"use client"

import { useState, useEffect } from "react"
import Header from "../layout/Header"
import SupplyChainMetrics from "../supplyChain/SupplyChainMetrics"
import InventoryStockSummary from "../supplyChain/InventoryStockSummary"
import "../styles/SupplyChainOverview.css"
import { useThreshold } from "../../context/ThresholdContext";

const SupplyChainOverview = () => {
  const [metrics, setMetrics] = useState({
    deliveryRate: 0,
    fulfillmentRate: 0,
    blockchainVerification: 0,
  })
  const [networkData, setNetworkData] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
    const { threshold } = useThreshold();

  const getItemStatus = (product) => {
    if (!product.quantity || product.quantity === 0) return "Out of Stock";
    if (product.quantity <= threshold) return "Low Stock"; // Use threshold here
    return "In Stock";
  };

  useEffect(() => {
    const fetchSupplyChainData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Simulated KPI metrics and network map
        setTimeout(() => {
          setMetrics({
            deliveryRate: 94.2,
            fulfillmentRate: 98.5,
            blockchainVerification: 100,
          })
          setNetworkData([
            { id: 1, name: "Manufacturer", type: "manufacturer", x: 50, y: 100, connections: [2, 3] },
            { id: 2, name: "Warehouse A", type: "warehouse", x: 200, y: 50, connections: [4] },
            { id: 3, name: "Warehouse B", type: "warehouse", x: 200, y: 150, connections: [4] },
            { id: 4, name: "Distribution", type: "distribution", x: 350, y: 100, connections: [5] },
            { id: 5, name: "Retail Store", type: "retail", x: 500, y: 100, connections: [] },
          ])
        }, 500)

        // ✅ Fetch products from backend
        const productRes = await fetch("http://localhost:5000/api/products")
        if (!productRes.ok) throw new Error(`HTTP error! status: ${productRes.status}`)

        const productData = await productRes.json()

        // ✅ Normalize product structure
        const mappedProducts = productData.map((p) => {
          const quantity = typeof p.quantity === "number" ? p.quantity : Number.parseInt(p.quantity) || 0

          return {
            id: p.id ?? p._id ?? Math.random().toString(36).substr(2, 9),
            name: p.name ?? p.ProductName ?? "Unnamed Product",
            brand: p.brand ?? p.ProductBrand ?? "N/A",
            gender: p.gender ?? p.Gender ?? "N/A",
            price: typeof p.price === "number" ? p.price : Number(p.Price) || 0,
            quantity,
            category: p.category ?? p.Category ?? "N/A",
            color: p.PrimaryColor ?? p.color ?? "N/A",
            status: getItemStatus({ quantity }), // fixed
            description: p.description ?? p.Description ?? "",
            imageUrl: p.imageUrl || p.Image || "",
            lastUpdated: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "N/A",
          }
        })

        setProducts(mappedProducts)
      } catch (err) {
        console.error("❌ Error fetching supply chain data:", err)
        setError("Failed to load supply chain data. Please check your backend connection.")
      } finally {
        setLoading(false)
      }
    }

    fetchSupplyChainData()
  }, [])

  return (
    <div className="supply-chain-overview">
      <Header
        title="Supply Chain Overview"
        breadcrumbs={[
          { text: "Dashboard", active: false },
          { text: "Supply Chain Overview", active: true },
        ]}
      />

      <div className="supply-chain-container">
        {loading ? (
          <div className="loading">
            <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="loading-text">Loading supply chain data...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p className="error-title">Error: {error}</p>
            <p className="error-description">
              Please ensure your backend server is running and accessible at `http://localhost:5000/api/products`.
            </p>
          </div>
        ) : (
          <>
            <div className="section-wrapper">
              <h2 className="section-main-title">Key Performance Indicators</h2>
              <SupplyChainMetrics metrics={metrics} />
            </div>

            <div className="section-wrapper inventory-summary-section">
              <h2 className="section-main-title">Inventory Stock Summary</h2>
              <InventoryStockSummary products={products} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SupplyChainOverview
