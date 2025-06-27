import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = {
  "In Stock": "#28a745", // Green
  "Low Stock": "#ffc107", // Orange
  "Out of Stock": "#dc3545", // Red
};

const StockStatusPieChart = ({ data }) => {
  const total = data.reduce((sum, entry) => sum + entry.count, 0); // Sum of all counts

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload; // Get the entry from the payload
      const percentage = total > 0 ? ((entry.count / total) * 100).toFixed(1) : 0;
      return (
        <div className="custom-tooltip">
          <p className="label">{`${entry.name}`}</p>
          <p className="value">{`Count: ${entry.count} (${percentage}%)`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-wrapper">
      <h3 className="chart-title">Current Stock Status Overview</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data} // Use the stock status data passed as props
            cx="50%" // Center the chart
            cy="50%"
            labelLine={false}
            outerRadius={100} // Outer radius of the pie chart
            fill="#8884d8"
            dataKey="count"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name]} /> // Use color dynamically
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} /> {/* Tooltip to show details on hover */}
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockStatusPieChart;
