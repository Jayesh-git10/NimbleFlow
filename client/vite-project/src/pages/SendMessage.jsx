import React, { useState, useMemo } from "react";
import { Send, Users as UsersIcon, X, AlertCircle } from "lucide-react";
import { sendBulkMessages } from "../services/messageApi";

const TEMPLATES = [
  { id: "hackathon", name: "Hackathon Start", text: "🚀 Hackathon starts at 6 PM! Make sure your environments are set up." },
  { id: "meeting", name: "Meeting Alert", text: "📅 Quick reminder: Our sync meeting is scheduled for today at 5:00 PM." },
  { id: "maintenance", name: "Maintenance", text: "⚠️ System Alert: Scheduled database maintenance will occur tonight from 2 AM to 4 AM UTC." },
  { id: "fail_test", name: "Failure Test (Simulated)", text: "FAIL - Testing simulated background delivery failure status updates." }
];

export default function SendMessage({ users, selectedUserIds, setSelectedUserIds, setActivePage, refreshData, showToast }) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Get matching users from selected IDs
  const selectedUsers = useMemo(() => {
    return users.filter((u) => selectedUserIds.includes(u.id));
  }, [users, selectedUserIds]);

  const handleRemoveUser = (id) => {
    setSelectedUserIds(selectedUserIds.filter((uid) => uid !== id));
  };

  const handleApplyTemplate = (text) => {
    setMessage(text);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (selectedUserIds.length === 0) {
      showToast("Please select at least one recipient first.", "error");
      return;
    }
    if (!message.trim()) {
      showToast("Message content cannot be blank.", "error");
      return;
    }

    setIsSending(true);
    try {
      await sendBulkMessages(message, selectedUserIds);
      showToast(`Successfully queued ${selectedUserIds.length} message(s)!`, "success");
      setMessage("");
      setSelectedUserIds([]);
      refreshData();
      setActivePage("history");
    } catch (error) {
      showToast(error.message || "Failed to dispatch messages", "error");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1>Send Message Broadcast</h1>
        <p>Compose custom alerts or select templates to dispatch queued notifications instantly.</p>
      </div>

      {selectedUsers.length === 0 ? (
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem 1.5rem" }}>
          <AlertCircle size={48} style={{ color: "var(--warning)", marginBottom: "1rem" }} />
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>No Recipients Selected</h2>
          <p style={{ maxWidth: "420px", textAlign: "center", marginBottom: "1.5rem" }}>
            You must choose which users should receive this message. Go to the Recipients page to select your targets.
          </p>
          <button className="btn" onClick={() => setActivePage("users")}>
            <UsersIcon size={16} />
            <span>Select Recipients</span>
          </button>
        </div>
      ) : (
        <div className="content-layout">
          {/* Editor form */}
          <div className="glass-panel">
            <h2>Compose Alert</h2>
            
            <form onSubmit={handleSend}>
              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Recipients List ({selectedUsers.length})</label>
                <div className="recipients-box">
                  {selectedUsers.map((user) => (
                    <span key={user.id} className="recipient-tag">
                      <span>{user.name}</span>
                      <button type="button" onClick={() => handleRemoveUser(user.id)}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <label className="form-label">Message Body</label>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "600" }}>
                    {message.length} characters
                  </span>
                </div>
                <textarea
                  className="form-textarea"
                  placeholder="Enter message text to broadcast..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSending}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn" 
                style={{ width: "100%", marginTop: "1.5rem", padding: "0.85rem" }}
                disabled={isSending || selectedUserIds.length === 0 || !message.trim()}
              >
                <Send size={18} />
                <span>{isSending ? "Queueing Messages..." : `Broadcast to ${selectedUsers.length} Recipient(s)`}</span>
              </button>
            </form>
          </div>

          {/* Quick templates column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className="glass-panel">
              <h2>Quick Templates</h2>
              <p style={{ fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                Click on any template to instantly pre-fill your compose textarea.
              </p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    className="action-item"
                    style={{ 
                      width: "100%", 
                      textAlign: "left", 
                      cursor: "pointer", 
                      display: "flex", 
                      flexDirection: "column", 
                      alignItems: "flex-start",
                      gap: "0.25rem",
                      background: "hsla(var(--hue), 20%, 50%, 0.02)",
                      transition: "border-color 0.2s, background-color 0.2s"
                    }}
                    onClick={() => handleApplyTemplate(tpl.text)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent)";
                      e.currentTarget.style.backgroundColor = "var(--accent-glow)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-color)";
                      e.currentTarget.style.backgroundColor = "hsla(var(--hue), 20%, 50%, 0.02)";
                    }}
                  >
                    <span style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--accent)" }}>{tpl.name}</span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {tpl.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
