"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "../layout/Header";
import UserTable from "../UserTable";
import AddUserModal from "../AddUserModal";
import { Search, UserPlus } from "lucide-react";
import "../styles/UserManagement.css";
import axios from "axios";
import { useApp } from "../../context/AppContext"; // Corrected import for useApp

// Ensure this matches the port your Node.js backend is running on
const API_URL =
  process.env.REACT_APP_ADMIN_USERS_API_URL ||
  "http://localhost:5000/api/admin/users";

const UserManagement = () => {
  const { state, actions } = useApp();
  const currentUser = state.user;

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All Users");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.warn("No auth token found");
      setUsers([]);
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Backend response for fetchUsers:", response.data.users); // Keep this log
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      actions.setError(`Failed to fetch users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [actions]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Removed currentUser from dependency array to prevent re-fetching on every currentUser change

  useEffect(() => {
    const combinedUsers = [...users];
    if (currentUser) {
      const idx = combinedUsers.findIndex((u) => u.id === currentUser.id);
      if (idx !== -1) {
        const user = combinedUsers.splice(idx, 1)[0];
        combinedUsers.unshift({
          ...user,
          isCurrentUser: true,
          status: currentUser.status || "Active",
          lastActive: currentUser.lastActive || new Date().toISOString(),
          department: currentUser.department || "General",
        });
      } else {
        // Add current user if not already in the list (e.g., first login)
        combinedUsers.unshift({
          ...currentUser,
          isCurrentUser: true,
          status: currentUser.status || "Active",
          lastActive: currentUser.lastActive || new Date().toISOString(),
          department: currentUser.department || "General",
        });
      }
    }

    let filtered = combinedUsers;
    if (searchTerm) {
      filtered = filtered.filter((u) =>
        [u.name, u.email, u.role, u.department, u.status].some((field) =>
          field?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    if (selectedFilter === "Active")
      filtered = filtered.filter((u) => u.status === "Active");
    if (selectedFilter === "Inactive")
      filtered = filtered.filter((u) => u.status === "Inactive");
    setFilteredUsers(filtered);
  }, [searchTerm, selectedFilter, users, currentUser]);

  const handleAddUser = () => setShowAddModal(true);
  const handleCloseModal = () => setShowAddModal(false);

  const handleSaveUser = async (newUser) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.post(
        API_URL,
        {
          ...newUser,
          status: "Active", // Ensure status is sent
          lastActive: new Date().toISOString(), // Ensure lastActive is sent
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("User added successfully:", response.data.user);
      fetchUsers(); // Re-fetch users to update the table
    } catch (error) {
      console.error("Failed to save user:", error);
      alert(`Failed to add user: ${error.message}`);
    } finally {
      handleCloseModal();
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    const token = localStorage.getItem("authToken");
    try {
      await axios.delete(`${API_URL}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`User ${userId} deleted successfully.`);
      fetchUsers(); // Re-fetch users to update the table
    } catch (error) {
      alert(`Failed to delete user: ${error.message}`);
      console.error("Delete error:", error);
    }
  };

  const handleToggleStatus = async (userId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) {
      console.warn("User not found for status toggle.");
      return;
    }

    const token = localStorage.getItem("authToken");
    // Determine new status based on current status
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    console.log(
      `Toggling user ${userId} status from ${user.status} to ${newStatus}`
    );

    try {
      const res = await axios.put(
        `${API_URL}/${userId}`,
        {
          status: newStatus, // ✅ Corrected: Use 'status' field
          lastActive: new Date().toISOString(), // ✅ Corrected: Use 'lastActive' field
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("User status toggled successfully:", res.data.user);
      fetchUsers(); // Re-fetch users to update the table
    } catch (error) {
      console.error("Error toggling status:", error);
      alert(`Failed to toggle user status: ${error.message}`);
    }
  };

  return (
    <div>
      <Header
        title="User Management"
        breadcrumbs={[
          { text: "Dashboard", active: false },
          { text: "User Management", active: true },
        ]}
      />

      <div className="user-management">
        <div className="user-management-container">
          <div className="user-management-header">
            <h2>Manage All Users</h2>
            
          </div>

          <div className="user-management-filters">
            <div className="search-bar">
              <Search size={18} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
              />
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="All Users">All Users</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {loading ? (
            <div>Loading users...</div>
          ) : (
            <UserTable
              users={filteredUsers}
              onDelete={handleDeleteUser}
              onToggleStatus={handleToggleStatus}
              currentUserRole={currentUser?.role}
              currentUserId={currentUser?.id}
            />
          )}

          {showAddModal && (
            <AddUserModal onClose={handleCloseModal} onSave={handleSaveUser} />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
