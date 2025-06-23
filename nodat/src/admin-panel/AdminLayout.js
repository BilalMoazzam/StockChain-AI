import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./components/Sidebar"; // ✅ correct if file exists at admin-panel/components/Sidebar.js


const AdminLayout = ({ onLogout, userRole }) => {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar onLogout={onLogout} userRole={userRole} />
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
