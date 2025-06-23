"use client"

import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { LayoutDashboard, Package, ShoppingCart, Blocks, Users, Eye, LogOut } from "lucide-react"
// No external CSS needed, using Tailwind classes directly

const Sidebar = ({ onLogout, userRole }) => {
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    // Simulate fetching notification count (replace with real data from API)
    const fetchNotifications = () => {
      setNotificationCount(5) // Example count
    }
    fetchNotifications()
  }, [])

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      onLogout()
    }
  }

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${
      isActive ? "bg-gray-100 dark:bg-gray-800" : ""
    }`

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-50 dark:bg-gray-900 border-r dark:border-gray-800 p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <img src="/web-logo.png" alt="StockChain AI" className="h-8 w-8" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">StockChain AI Admin</h2>
      </div>

      <nav className="grid gap-2 text-sm font-medium flex-grow">
        <NavLink to="/dashboard" className={navLinkClass}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        {(userRole === "admin" || userRole === "editor") && (
          <>
            <NavLink to="/inventory" className={navLinkClass}>
              <Package size={20} />
              <span>Inventory Management</span>
            </NavLink>
            <NavLink to="/orders" className={navLinkClass}>
              <ShoppingCart size={20} />
              <span>Order Management</span>
            </NavLink>
            <NavLink to="/users" className={navLinkClass}>
              <Users size={20} />
              <span>User Management</span>
            </NavLink>
          </>
        )}

        {(userRole === "admin" || userRole === "viewer") && (
          <>
            <NavLink to="/blockchain" className={navLinkClass}>
              <Blocks size={20} />
              <span>Blockchain Transactions</span>
            </NavLink>
            <NavLink to="/product-preview" className={navLinkClass}>
              <Eye size={20} />
              <span>Product Preview</span>
            </NavLink>
          </>
        )}

        {/* You can add a notification link here if needed, similar to your old sidebar */}
        {/* <NavLink to="/notifications" className={navLinkClass}>
          <div className="relative">
            <Bell size={20} />
            {notificationCount > 0 && <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">{notificationCount}</span>}
          </div>
          <span>Notifications</span>
        </NavLink> */}
      </nav>

      <div className="mt-auto pt-4 border-t dark:border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 w-full justify-start"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
