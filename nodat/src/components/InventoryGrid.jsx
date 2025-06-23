// src/components/InventoryGrid.jsx
import { motion } from "framer-motion"
import { AlertTriangle, CheckCircle, Package } from "lucide-react"

const getStatus = (qty) => {
  if (qty <= 0) return { label: "Out of Stock", color: "#fee2e2", icon: <AlertTriangle color="#b91c1c" size={16} /> }
  if (qty < 5) return { label: "Low Stock", color: "#fef3c7", icon: <Package color="#b45309" size={16} /> }
  return { label: "In Stock", color: "#dcfce7", icon: <CheckCircle color="#15803d" size={16} /> }
}

const InventoryGrid = ({ inventory }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {inventory.map((item) => {
        const status = getStatus(item.quantity)
        return (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden flex flex-col"
          >
            <img
              src="/placeholder-shoe.png"
              alt={item.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 flex-grow">
              <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-500">Brand: {item.brand}</p>
              <p className="text-sm text-gray-500">Gender: {item.gender}</p>
              <p className="mt-2 font-bold text-blue-600">Rs. {item.price}</p>
            </div>
            <div className="px-4 py-2" style={{ backgroundColor: status.color }}>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                {status.icon}
                {status.label}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default InventoryGrid
