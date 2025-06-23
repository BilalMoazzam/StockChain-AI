"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

const ShipmentTrends = ({ data }) => {
  return (
    <div className="shipment-trends">
      <h2 className="section-title">Shipment Status Trends</h2>
      <div className="section-content">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="OnTime" fill="#4CAF50" />
            <Bar dataKey="Delayed" fill="#F44336" />
            <Bar dataKey="InTransit" fill="#FFC107" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ShipmentTrends
