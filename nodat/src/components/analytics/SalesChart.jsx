import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const SalesChart = ({ data, dateRange }) => {
  const formatYAxis = (tickItem) => {
    if (tickItem >= 1000000) {
      return `$${(tickItem / 1000000).toFixed(1)}M`
    }
    if (tickItem >= 1000) {
      return `$${(tickItem / 1000).toFixed(0)}k`
    }
    return `$${tickItem}`
  }

  const getXAxisLabel = (value, index, dataLength) => {
    if (dateRange === "week") {
      return `Day ${index + 1}`
    } else if (dateRange === "month") {
      // Show Day 1, Day 5, Day 10, Day 15, Day 20, Day 25, Day 30 for clarity
      if (index === 0 || (index + 1) % 5 === 0 || index === dataLength - 1) {
        return `Day ${index + 1}`
      }
      return "" // Hide other labels
    } else if (dateRange === "year") {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      return monthNames[index]
    }
    return `Day ${index + 1}`
  }

  return (
    <div className="chart-wrapper">
      <h3 className="chart-title">
        Sales - {dateRange === "week" ? "Last 7 Days" : dateRange === "month" ? "Last 30 Days" : "Last 12 Months"}
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="name"
            tickFormatter={(value, index) => getXAxisLabel(value, index, data.length)}
            tickLine={false}
            axisLine={false}
            padding={{ left: 20, right: 20 }}
          />
          <YAxis tickFormatter={formatYAxis} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
          <Tooltip
            formatter={(value) => [`$${value.toLocaleString()}`, "Sales"]}
            labelFormatter={(label) => `Period: ${label}`}
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "4px" }}
            labelStyle={{ color: "#333" }}
          />
          <Line type="monotone" dataKey="value" stroke="#ffc107" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SalesChart
