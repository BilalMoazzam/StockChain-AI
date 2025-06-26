"use client"

import { Truck, ShoppingBag, Shield } from "lucide-react"

const SupplyChainMetrics = ({ metrics }) => {
  const { deliveryRate, fulfillmentRate, blockchainVerification } = metrics

  return (
    <div className="metrics-container">
      <div className="metric-card">
        <div className="metric-card-header">
          <h3 className="metric-card-title">On-time Delivery Rate</h3>
          <Truck className="metric-icon truck" />
        </div>
        <div className="metric-card-value">{deliveryRate}%</div>
        <div className="progress-bar">
          <div className="progress-fill blue" style={{ width: `${deliveryRate}%` }}></div>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-card-header">
          <h3 className="metric-card-title">Order Fulfillment</h3>
          <ShoppingBag className="metric-icon shopping-bag" />
        </div>
        <div className="metric-card-value">{fulfillmentRate}%</div>
        <div className="progress-bar">
          <div className="progress-fill green" style={{ width: `${fulfillmentRate}%` }}></div>
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-card-header">
          <h3 className="metric-card-title">Blockchain Verification</h3>
          <Shield className="metric-icon shield" />
        </div>
        <div className="metric-card-value">{blockchainVerification}%</div>
        <div className="progress-bar">
          <div className="progress-fill purple" style={{ width: `${blockchainVerification}%` }}></div>
        </div>
      </div>
    </div>
  )
}

export default SupplyChainMetrics
