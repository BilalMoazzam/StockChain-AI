"use client"

import { useState } from "react"
import { authService } from "../services/api"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Label } from "../ui/Label"
import { Input } from "../ui/Input"
import { Button } from "../ui/Button"

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      // Simulate different roles for demonstration
      let role = "viewer" // Default role
      if (email === "admin@example.com") {
        role = "admin"
      } else if (email === "editor@example.com") {
        role = "editor"
      }

      // In a real app, the role would come from the backend response
      const response = await authService.login({ email, password })
      onLoginSuccess(response.token || "mock-token-123", role) // Use mock token and simulated role
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Use `admin@example.com` / `password` for admin access.
          </p>
          <p className="text-center text-sm text-gray-500">Use `editor@example.com` / `password` for editor access.</p>
          <p className="text-center text-sm text-gray-500">Use `viewer@example.com` / `password` for viewer access.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
