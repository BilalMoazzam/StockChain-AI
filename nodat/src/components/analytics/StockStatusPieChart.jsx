import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

const COLORS = {
  "In Stock": "#28a745", // Green
  "Low Stock": "#ffc107", // Orange
  "Out of Stock": "#dc3545", // Red
}

const StockStatusPieChart = ({ data }) => {
  const total = data.reduce((sum, entry) => sum + entry.count, 0)

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload
      const percentage = total > 0 ? ((entry.count / total) * 100).toFixed(1) : 0
      return (
        <div className="custom-tooltip">
          <p className="label">{`${entry.name}`}</p>
          <p className="value">{`Count: ${entry.count} (${percentage}%)`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="chart-wrapper">
      <h3 className="chart-title">Current Stock Status Overview</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="count"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default StockStatusPieChart
