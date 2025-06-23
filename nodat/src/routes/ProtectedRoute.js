import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const role = localStorage.getItem("userRole");
  const isAllowed = allowedRoles.includes(role);
  return isAllowed ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
