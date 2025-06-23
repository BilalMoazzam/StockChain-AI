"use client";

import { useState, useEffect } from "react";
import Header from "../layout/Header";
import NotificationList from "../NotificationList";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Truck,
  Package,
  ShoppingCart,
} from "lucide-react";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
} from "../../utils/notificationService";
import "../styles/NotificationPage.css";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const load = () => {
      const all = getNotifications();
      setNotifications(all);
      setFilteredNotifications(all);
      setUnreadCount(all.filter((n) => !n.isRead).length);
      setLoading(false);
    };

    load();

    window.addEventListener("notificationAdded", load);
    window.addEventListener("notificationUpdated", load);
    return () => {
      window.removeEventListener("notificationAdded", load);
      window.removeEventListener("notificationUpdated", load);
    };
  }, []);

  useEffect(() => {
    filterNotifications(activeFilter);
  }, [activeFilter, notifications]);

  const filterNotifications = (filter) => {
    let filtered = [...notifications];
    if (filter === "unread") filtered = filtered.filter((n) => !n.isRead);
    else if (filter !== "all") filtered = filtered.filter((n) => n.type === filter);
    setFilteredNotifications(filtered);
  };

  const handleFilterChange = (filter) => setActiveFilter(filter);

  const markAsRead = (id) => markNotificationAsRead(id);

  const markAllAsRead = () => markAllNotificationsAsRead();

  const handleDelete = (id) => deleteNotification(id);

  const getNotificationIcon = (iconType) => {
    switch (iconType) {
      case "shopping-cart":
        return <ShoppingCart size={20} />;
      case "alert":
        return <AlertTriangle size={20} />;
      case "info":
        return <Info size={20} />;
      case "truck":
        return <Truck size={20} />;
      case "package":
        return <Package size={20} />;
      case "check":
        return <CheckCircle size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  return (
    <div className="notification-page">
      <Header
        title="Notifications"
        breadcrumbs={[
          { text: "Dashboard", active: false },
          { text: "Notifications", active: true },
        ]}
      />

      <div className="notification-container">
        <div className="notification-header">
          <h2>View and manage notifications</h2>
          {unreadCount > 0 && (
            <button className="btn btn-read-all" onClick={markAllAsRead}>
              Mark all as read
            </button>
          )}
        </div>

        <div className="notification-content">
          <div className="notification-sidebar">
            <div className="filter-header">
              <h3>Filter</h3>
            </div>
            <div className="filter-options">
              {[
                { label: "All Notifications", value: "all" },
                { label: "Unread", value: "unread" },
                { label: "Orders", value: "order" },
                { label: "Alerts", value: "alert" },
                { label: "System", value: "system" },
                { label: "Shipments", value: "shipment" },
                { label: "Inventory", value: "inventory" },
                { label: "Blockchain", value: "payment" },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  className={`filter-option ${activeFilter === value ? "active" : ""}`}
                  onClick={() => handleFilterChange(value)}
                >
                  {label}
                  {value === "unread" && unreadCount > 0 && (
                    <span className="badge">{unreadCount}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="notification-main">
            <div className="notification-list-header">
              <h3>Recent Notifications</h3>
              <div className="notification-actions">
                <select className="notification-sort">
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="priority">Priority</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="loading">Loading notifications...</div>
            ) : (
              <NotificationList
                notifications={filteredNotifications}
                getIcon={getNotificationIcon}
                onMarkAsRead={markAsRead}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
