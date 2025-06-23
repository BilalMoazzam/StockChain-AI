"use client"

import { useState, useEffect } from "react"
import { orderService } from "../services/api"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table"
import { Button } from "../ui/Button"
import { Edit, Eye, Trash2 } from "lucide-react"

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await orderService.getOrders()
      setOrders(data)
    } catch (err) {
      setError("Failed to fetch orders.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewOrder = (order) => {
    alert(`Viewing order: ${order.orderId}`)
    // Implement modal or navigate to order details page
  }

  const handleEditOrder = (order) => {
    alert(`Editing order: ${order.orderId}`)
    // Implement modal or navigate to order edit form
  }

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await orderService.deleteOrder(orderId)
        fetchOrders()
        alert("Order deleted successfully!")
      } catch (err) {
        setError("Failed to delete order.")
        console.error(err)
      }
    }
  }

  if (loading) return <div className="p-6 text-center">Loading orders...</div>
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Order Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderId}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>Rs. {order.totalAmount.toFixed(0)}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleViewOrder(order)} title="View Order">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleEditOrder(order)} title="Edit Order">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteOrder(order.id)}
                          title="Delete Order"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500">No orders found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Orders
