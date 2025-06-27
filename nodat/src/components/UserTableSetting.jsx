import React, { useState, useEffect } from 'react';  
import EditUserModal from "./EditUserModal/EditUserModal";  // Ensure correct import for EditUserModal
import './styles/UserTable.css';  // Ensure to import the correct CSS file

const UserTable = ({ users, onDelete, onToggleStatus, onEdit, currentUserRole, currentUserId }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const handleEdit = (user) => {
    setUserToEdit(user);
    setShowEditModal(true);
  };

  const handleSave = (updatedUser) => {
    onEdit(updatedUser);  // Call onEdit function passed from the parent component
    setShowEditModal(false);
  };

  return (
    <>
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            {/* <th>Role</th> */}
            <th>Status</th>
            <th>Last Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              {/* <td>{user.role}</td> */}
              <td>{user.status}</td>
              <td>{user.lastActive}</td>
              <td>
                {user.id !== currentUserId && (  // Ensure 'You' user is not editable
                  < >
                    <button className="edit-btn edit_delete_toggle" onClick={() => handleEdit(user)}>Edit</button>
                    <button className="delete-btn edit_delete_toggle" onClick={() => onDelete(user.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showEditModal && (
        <EditUserModal
          user={userToEdit}
          onClose={() => setShowEditModal(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default UserTable;
