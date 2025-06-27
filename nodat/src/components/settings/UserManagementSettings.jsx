import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";  // Import useNavigate
import axios from "axios";
import UserTableSetting from "../UserTableSetting";
import AddUserModal from "../AddUserModal";
import { useApp } from "../../context/AppContext";

const API_URL =
  process.env.REACT_APP_ADMIN_USERS_API_URL ||
  "http://localhost:5000/api/admin/users";

const UserManagementSettings = ({ onSettingsChange = () => {} }) => {
  const { state, actions } = useApp();
  const currentUser = state.user;
  const navigate = useNavigate(); // Initialize navigate

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
  }, [fetchUsers]);

  useEffect(() => {
    let combinedUsers = [...users];
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

  const handleEditUser = async (updatedUser) => {
  const token = localStorage.getItem("authToken");
  try {
    const response = await axios.put(
      `${API_URL}/${updatedUser.id}`,
      updatedUser,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("User updated successfully:", response.data.user);
    fetchUsers(); // Re-fetch users to update the table
    navigate(`/user/${updatedUser.id}`);  // Navigate to the updated user's details page
  } catch (error) {
    console.error("Failed to save user:", error);
    alert(`Failed to save user: ${error.message}`);
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
    const newStatus = user.status === "Active" ? "Inactive" : "Active";

    try {
      const res = await axios.put(
        `${API_URL}/${userId}`,
        {
          status: newStatus,
          lastActive: new Date().toISOString(),
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
          <UserTableSetting
            users={filteredUsers}
            onDelete={handleDeleteUser}
            onToggleStatus={handleToggleStatus}
            onEdit={handleSaveUser}  // Pass handleSaveUser to the UserTable for editing
            currentUserRole={currentUser?.role}
            currentUserId={currentUser?.id}
          />
        )}

        {showAddModal && (
          <AddUserModal onClose={handleCloseModal} onSave={handleSaveUser} />
        )}
      </div>
    </div>
  );
};

export default UserManagementSettings;
