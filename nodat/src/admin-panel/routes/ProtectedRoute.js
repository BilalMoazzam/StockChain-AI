import { Navigate, Outlet } from "react-router-dom"

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("authToken")
  const userRole = localStorage.getItem("userRole") // Assuming role is stored here

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to an unauthorized page or dashboard
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
