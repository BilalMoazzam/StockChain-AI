import React from "react";
import Sidebar from '../components/Sidebar'; // ✅ correct path

import { Outlet } from "react-router-dom";

const ERPLayout = ({ onShowLogoutModal, userRole }) => {
  return (
    <div className="app">
      <Sidebar onShowLogoutModal={onShowLogoutModal} userRole={userRole} />
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default ERPLayout;
