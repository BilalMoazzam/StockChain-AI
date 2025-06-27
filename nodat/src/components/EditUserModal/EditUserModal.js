import React, { useState, useEffect } from "react";

const EditUserModal = ({ user, onClose, onSave }) => {
  const [editedUser, setEditedUser] = useState(user);

  useEffect(() => {
    setEditedUser(user);  // Pre-fill with current user data
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(editedUser);  // Call the save function passed from parent
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Edit User</h3>
        <div>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={editedUser.name || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={editedUser.email || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Role</label>
          <input
            type="text"
            name="role"
            value={editedUser.role || ""}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Status</label>
          <select
            name="status"
            value={editedUser.status || "Active"}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div>
          <button onClick={handleSubmit}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
