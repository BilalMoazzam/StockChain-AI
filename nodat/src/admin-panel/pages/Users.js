"use client"

import { useState, useEffect } from "react"
import { userService } from "../services/api"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table"
import { Button } from "../ui/Button"
import { Edit, Trash2, Plus } from "lucide-react"

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await userService.getUsers()
      setUsers(data)
    } catch (err) {
      setError("Failed to fetch users.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = () => {
    alert("Add User functionality will open a form/modal.")
  }

  const handleEditUser = (user) => {
    alert(`Editing user: ${user.name || user.email}`)
    // Implement modal or navigate to user edit form
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await userService.deleteUser(userId)
        fetchUsers()
        alert("User deleted successfully!")
      } catch (err) {
        setError("Failed to delete user.")
        console.error(err)
      }
    }
  }

  if (loading) return <div className="p-6 text-center">Loading users...</div>
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      <div className="flex justify-end mb-4">
        <Button onClick={handleAddUser}>
          <Plus className="mr-2 h-4 w-4" /> Add New User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.status || "Active"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditUser(user)} title="Edit User">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete User"
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
            <p className="text-center text-gray-500">No users found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Users
