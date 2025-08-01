"use client";

import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

// Import User Context
import { UserProvider } from "./context/UserContext";

// Import layout and pages
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./components/pages/Dashboard";
import InventoryManagement from "./components/pages/InventoryManagement"; // Corrected import path
import OrderManagement from "./components/pages/OrderManagement";
import SupplyChainOverview from "./components/pages/SupplyChainOverview";
import AnalyticsReport from "./components/pages/AnalyticsReport";
import UserManagement from "./components/pages/UserManagement";
import BlockchainTransaction from "./components/pages/BlockchainTransaction";
import NotificationPage from "./components/pages/NotificationPage";
import HelpSupport from "./components/pages/HelpSupport";
import Settings from "./components/pages/Settings";
import Logout from "./components/pages/Logout";
import Login from "./components/pages/Login";
import Signup from "./components/pages/Signup";
import ForgotPassword from "./components/pages/ForgotPassword";
import ResetPassword from "./components/pages/ResetPassword";
import Introduction from "./components/pages/Introduction";
import ProductCardPage from "./components/pages/ProductCardPage";
import { InventoryProvider } from "./context/InventoryContext";
import { ThresholdProvider } from "./context/ThresholdContext";
// Optional pages you commented out
// import ProductManagement from "./components/pages/product-management";
// import ProductShowcase from "./components/pages/products";
// import CartPage from "./components/pages/cart";

function App() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  const handleShowLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const handleCloseLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const handleLogin = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setShowLogoutModal(false);
  };

  return (
    <Router>
      <UserProvider>
        {" "}
        {/* ✅ Context is available globally */}
        <ThresholdProvider>
          <InventoryProvider>
            {!isLoggedIn ? (
              <Routes>
                <Route path="/" element={<Introduction />} />
                <Route path="/intro" element={<Introduction />} />
                <Route
                  path="/login"
                  element={<Login onLoginSuccess={handleLogin} />}
                />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            ) : (
              <div className="app">
                <Sidebar onShowLogoutModal={handleShowLogoutModal} />
                <div className="content">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />

                    <Route
                      path="/inventory"
                      element={<InventoryManagement />}
                    />

                    <Route path="/orders" element={<OrderManagement />} />
                    <Route
                      path="/supply-chain"
                      element={<SupplyChainOverview />}
                    />
                    <Route path="/productCard" element={<ProductCardPage />} />
                    <Route path="/analytics" element={<AnalyticsReport />} />
                    <Route path="/users" element={<UserManagement />} />
                    <Route
                      path="/blockchain-transaction"
                      element={<BlockchainTransaction />}
                    />
                    <Route
                      path="/notifications"
                      element={<NotificationPage />}
                    />
                    <Route path="/help" element={<HelpSupport />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route
                      path="/logout"
                      element={<Logout onLogout={handleLogout} />}
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>

                  {showLogoutModal && (
                    <Logout
                      onLogout={handleLogout}
                      onCancel={handleCloseLogoutModal}
                    />
                  )}
                </div>
              </div>
            )}
          </InventoryProvider>
        </ThresholdProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
