import React, { useState, useMemo } from "react";
import { UserPlus, Search, Trash2, X, RefreshCw } from "lucide-react";
import { createUser as apiCreateUser, deleteUser as apiDeleteUser } from "../services/userApi";

export default function Users({ users, refreshData, selectedUserIds, setSelectedUserIds, setActivePage, showToast }) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.phone_number.includes(search)
    );
  }, [users, search]);

  const handleSelectUser = (id) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((uid) => uid !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleSelectAll = () => {
    const filteredIds = filteredUsers.map((u) => u.id);
    const allSelected = filteredIds.every((id) => selectedUserIds.includes(id));

    if (allSelected) {
      // Deselect all filtered users
      setSelectedUserIds(selectedUserIds.filter((id) => !filteredIds.includes(id)));
    } else {
      // Select all filtered users
      const newSelections = Array.from(new Set([...selectedUserIds, ...filteredIds]));
      setSelectedUserIds(newSelections);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phoneNumber.trim()) {
      showToast("Name and phone number are required.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiCreateUser({ name, phone_number: phoneNumber });
      showToast("Recipient registered successfully!", "success");
      setName("");
      setPhoneNumber("");
      setIsModalOpen(false);
      refreshData();
    } catch (error) {
      showToast(error.message || "Failed to register recipient", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) return;
    try {
      await apiDeleteUser(id);
      showToast("Recipient deleted successfully", "success");
      setSelectedUserIds(selectedUserIds.filter((uid) => uid !== id));
      refreshData();
    } catch (error) {
      showToast(error.message || "Failed to delete recipient", "error");
    }
  };

  const isAllSelected = filteredUsers.length > 0 && filteredUsers.every((u) => selectedUserIds.includes(u.id));

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Recipients Management</h1>
          <p>Register new users and select recipients for message broadcast dispatches.</p>
        </div>
        <button className="btn" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={18} />
          <span>Add Recipient</span>
        </button>
      </div>

      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="search-input"
                placeholder="Search recipients by name or phone number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {selectedUserIds.length > 0 && (
              <button 
                className="btn btn-secondary nav-link-btn"
                style={{ padding: "0.55rem 1rem", fontSize: "0.85rem" }}
                onClick={() => setSelectedUserIds([])}
              >
                Clear Selected
              </button>
            )}
          </div>
          
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button 
              className="btn btn-secondary" 
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
              onClick={refreshData}
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            
            <button 
              className="btn" 
              disabled={selectedUserIds.length === 0}
              onClick={() => setActivePage("send")}
            >
              <span>Compose Alert ({selectedUserIds.length})</span>
            </button>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <p>No recipients found. Register a new user to populate this list.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th className="checkbox-cell">
                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Phone Number</th>
                  <th>Registered On</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isChecked = selectedUserIds.includes(user.id);
                  return (
                    <tr key={user.id} style={{ backgroundColor: isChecked ? "hsla(var(--hue), 20%, 50%, 0.05)" : "transparent" }}>
                      <td className="checkbox-cell">
                        <input
                          type="checkbox"
                          className="custom-checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectUser(user.id)}
                        />
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>#{user.id}</td>
                      <td style={{ fontWeight: "700" }}>{user.name}</td>
                      <td>{user.phone_number}</td>
                      <td>{new Date(user.created_at).toLocaleString()}</td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", transition: "color 0.2s" }}
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register User Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h2>Register New Recipient</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="E.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="E.g. +1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "2rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn" disabled={isSubmitting}>
                  {isSubmitting ? "Registering..." : "Add Recipient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
