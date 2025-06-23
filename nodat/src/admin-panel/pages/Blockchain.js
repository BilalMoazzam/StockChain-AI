"use client"

import { useState, useEffect } from "react"
import { blockchainService } from "../services/api"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table"
import  Badge  from "../ui/Badge"

function Blockchain() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await blockchainService.getTransactions()
      setTransactions(data)
    } catch (err) {
      setError("Failed to fetch blockchain transactions.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>
      case "pending":
        return <Badge variant="warning">Pending</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) return <div className="p-6 text-center">Loading blockchain transactions...</div>
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Blockchain Payment Logs</h1>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.transactionId}</TableCell>
                    <TableCell>Rs. {tx.amount.toFixed(0)}</TableCell>
                    <TableCell>{tx.sender}</TableCell>
                    <TableCell>{tx.receiver}</TableCell>
                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                    <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500">No blockchain transactions found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Blockchain
