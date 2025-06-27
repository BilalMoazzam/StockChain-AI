import React from "react";
import EditUserModal from "../EditUserModal/EditUserModal";
import './styles/UserTable.css';

const UserTable = ({ users, onDelete, onToggleStatus, currentUserRole, currentUserId, onEdit }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const handleEdit = (user) => {
    setUserToEdit(user);
    setShowEditModal(true);
  };

  const handleSave = (updatedUser) => {
    onEdit(updatedUser);  // Send updated user data to parent for saving
    setShowEditModal(false);
  };

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.status}</td>
              <td >
                <button className="edit_delete_toggle" onClick={() => handleEdit(user)}>Edit</button>
                <button className="edit_delete_toggle" onClick={() => onDelete(user.id)}>Delete</button>
                <button className="edit_delete_toggle" onClick={() => onToggleStatus(user.id)}>Toggle Status</button>
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
