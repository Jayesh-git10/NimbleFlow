import React, { useState, useMemo } from "react";
import { Search, RefreshCw, Trash2, CheckCircle2, Clock, XCircle, Filter } from "lucide-react";
import { deleteMessageLog as apiDeleteMessageLog } from "../services/messageApi";

export default function History({ messages, refreshData, showToast }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const handleCleanLog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this log entry?")) return;
    try {
      await apiDeleteMessageLog(id);
      showToast("Log entry deleted successfully", "success");
      refreshData();
    } catch (error) {
      showToast(error.message || "Failed to delete log entry", "error");
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const matchesSearch =
        msg.message.toLowerCase().includes(search.toLowerCase()) ||
        (msg.user_name && msg.user_name.toLowerCase().includes(search.toLowerCase())) ||
        (msg.user_phone && msg.user_phone.includes(search));
      
      const matchesStatus = statusFilter === "All" || msg.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [messages, search, statusFilter]);

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Delivery Logs & History</h1>
          <p>Track delivery status of bulk dispatches processed asynchronously by BullMQ workers.</p>
        </div>
        <button className="btn" onClick={refreshData}>
          <RefreshCw size={16} />
          <span>Refresh Logs</span>
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
                placeholder="Search logs by body, recipient name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Filter size={16} style={{ color: "var(--text-secondary)" }} />
              <select
                className="form-input"
                style={{ padding: "0.6rem 2.25rem 0.6rem 1.0rem", fontSize: "0.9rem", width: "auto" }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Sent">Sent</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {filteredMessages.length === 0 ? (
          <div className="empty-state">
            <p>No dispatch records match your search criteria. Trigger a broadcast to create logs.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Recipient</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Dispatched On</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((msg) => (
                  <tr key={msg.id}>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>#{msg.id}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "700" }}>{msg.user_name || "Deleted User"}</span>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{msg.user_phone || "N/A"}</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: "300px", wordBreak: "break-word" }}>{msg.message}</td>
                    <td>
                      <span className={`badge ${msg.status.toLowerCase()}`}>
                        {msg.status === "Sent" && <CheckCircle2 size={12} />}
                        {msg.status === "Pending" && <Clock size={12} />}
                        {msg.status === "Failed" && <XCircle size={12} />}
                        <span>{msg.status}</span>
                      </span>
                    </td>
                    <td>{new Date(msg.created_at).toLocaleString()}</td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", transition: "color 0.2s" }}
                        onClick={() => handleCleanLog(msg.id)}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
