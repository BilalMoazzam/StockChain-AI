"use client"

import { Edit, Trash2 } from "lucide-react"
import { formatRelativeTime } from "../utils/timeFormatter"

const UserTable = ({ users, onDelete, onToggleStatus, currentUserRole, currentUserId }) => {
  const getStatusClass = (status) => {
    return status === "Active" ? "status-active" : "status-inactive"
  }

  // Frontend action buttons are always enabled for testing.
  // Backend MUST enforce actual permissions.
  const canPerformAction = (targetUserId) => {
    // In a real app, you'd check currentUserRole and targetUserId
    // For now, always return true to allow frontend interaction
    return true
  }
  

  return (
    <div className="user-table-container">
      <table className="user-table">
        <thead>
          <tr>
            <th style={{ width: "25%" }}>User</th>
            <th style={{ width: "15%" }}>Role</th>
            <th style={{ width: "20%" }}>Department</th>
            {/* <th style={{ width: "10%" }}>Status</th> */}
            <th style={{ width: "15%" }}>Last Active</th>
            <th style={{ width: "15%" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id} className={user.isCurrentUser ? "current-user-row" : ""}>
                <td className="user-cell">
                  <div className="user-info">
                    <div className="user-name">
                      {user.name} {user.isCurrentUser && <span className="current-user-badge">(You)</span>}
                    </div>
                    <div className="user-email">{user.email}</div>
                  </div>
                </td>
                <td>{user.role || "N/A"}</td>
                <td>{user.department || "N/A"}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(user.status)}`}>{user.status || "N/A"}</span>
                </td>
                {/* <t  d>{formatRelativeTime(user.lastActive)}</td> */}
                <td className="actions-cell">
                  <div className="inline-actions">
                    {/* <button
                      className="action-btn-disable" // Changed class to action-btn
                      onClick={() => onToggleStatus(user.id)}
                      disabled={!canPerformAction(user.id)}
                      title={
                        !canPerformAction(user.id)
                          ? "Access Denied: Only administrators can change user status."
                          : `Click to ${user.status === "Active" ? "Deactivate" : "Activate"} user`
                      }
                    >
                      <Edit size={16} />
                      <span>{user.status === "Active" ? "Deactivate" : "Activate"}</span>
                    </button> */}
                    <button
                      className="action-btn-delete"
                      onClick={() => onDelete(user.id)}
                      disabled={!canPerformAction(user.id)}
                      title={
                        !canPerformAction(user.id)
                          ? "Access Denied: Only administrators can delete users."
                          : "Delete user"
                      }
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-data">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default UserTable
