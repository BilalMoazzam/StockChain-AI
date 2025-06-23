import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const AIPredictionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="no-data">No AI prediction chart data available.</div>
  }

  // Define colors for each prediction category
  const colors = {
    Reorder: "#EF4444", // Red
    Monitor: "#F59E0B", // Amber/Orange
    Enough: "#22C55E", // Green
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
        <Bar dataKey="count" fill="#8884d8" barSize={40}>
          {data.map((entry, index) => (
            <Bar key={`bar-${index}`} fill={colors[entry.name]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default AIPredictionChart
