import React, { useMemo } from "react";
import { Users as UsersIcon, Send, CheckCircle2, XCircle, Clock, Zap, Plus, ArrowRight } from "lucide-react";

export default function Dashboard({ users, messages, setActivePage }) {
  // Compute analytics from state
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalMessages = messages.length;
    const sent = messages.filter((m) => m.status === "Sent").length;
    const pending = messages.filter((m) => m.status === "Pending").length;
    const failed = messages.filter((m) => m.status === "Failed").length;
    
    // Calculate success percentage
    const totalFinished = sent + failed;
    const successRate = totalFinished > 0 ? Math.round((sent / totalFinished) * 100) : 100;

    return { totalUsers, totalMessages, sent, pending, failed, successRate };
  }, [users, messages]);

  const recentMessages = useMemo(() => {
    return messages.slice(0, 5);
  }, [messages]);

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1>System Overview</h1>
        <p>Monitor your broadcast logs and deliver bulk alerts with background queues.</p>
      </div>

      {/* Analytics stats */}
      <div className="dashboard-grid">
        <div className="glass-panel stat-card total">
          <div className="stat-header">
            <span>Total Recipients</span>
            <div className="stat-icon-wrapper">
              <UsersIcon size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-subtext">Registered phone contacts</div>
        </div>

        <div className="glass-panel stat-card pending">
          <div className="stat-header">
            <span>Pending Delivery</span>
            <div className="stat-icon-wrapper">
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-subtext">Queued in background thread</div>
        </div>

        <div className="glass-panel stat-card sent">
          <div className="stat-header">
            <span>Delivered</span>
            <div className="stat-icon-wrapper">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.sent}</div>
          <div className="stat-subtext">{stats.totalMessages > 0 ? `${Math.round((stats.sent/stats.totalMessages)*100)}%` : "0%"} of all transmissions</div>
        </div>

        <div className="glass-panel stat-card failed">
          <div className="stat-header">
            <span>Failed Alerts</span>
            <div className="stat-icon-wrapper">
              <XCircle size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.failed}</div>
          <div className="stat-subtext">{stats.totalMessages > 0 ? `${Math.round((stats.failed/stats.totalMessages)*100)}%` : "0%"} error rate</div>
        </div>
      </div>

      <div className="content-layout">
        {/* Main graphics & charts */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h2>Transmission Performance</h2>
          
          <div style={{
            display: "flex", 
            alignItems: "center", 
            gap: "2rem", 
            background: "hsla(var(--hue), 20%, 50%, 0.03)", 
            padding: "1.5rem", 
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-color)",
            flexWrap: "wrap"
          }}>
            {/* Custom SVG gauge */}
            <div style={{ position: "relative", width: "120px", height: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="60" cy="60" r="50" fill="transparent" stroke="var(--border-color)" strokeWidth="8" />
                <circle 
                  cx="60" 
                  cy="60" 
                  r="50" 
                  fill="transparent" 
                  stroke="var(--accent)" 
                  strokeWidth="8" 
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={2 * Math.PI * 50 * (1 - stats.successRate / 100)}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
                />
              </svg>
              <div style={{ position: "absolute", textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)" }}>{stats.successRate}%</div>
                <div style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "bold" }}>Success</div>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: "200px" }}>
              <h3 style={{ marginBottom: "0.5rem" }}>Delivery Health Index</h3>
              <p style={{ marginBottom: "1rem", fontSize: "0.95rem" }}>
                Your server currently has a <strong>{stats.successRate}% delivery rate</strong>. Out of {stats.totalMessages} messages sent, {stats.sent} were successfully received by the gateway.
              </p>
              
              {/* Progress visual bar */}
              <div style={{ height: "8px", background: "var(--border-color)", borderRadius: "4px", overflow: "hidden", display: "flex" }}>
                <div style={{ width: `${stats.totalMessages ? (stats.sent/stats.totalMessages)*100 : 0}%`, background: "var(--success)" }} />
                <div style={{ width: `${stats.totalMessages ? (stats.pending/stats.totalMessages)*100 : 0}%`, background: "var(--warning)" }} />
                <div style={{ width: `${stats.totalMessages ? (stats.failed/stats.totalMessages)*100 : 0}%`, background: "var(--danger)" }} />
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.75rem", fontWeight: "700" }}>
                <span style={{ color: "var(--success)", display: "flex", alignItems: "center", gap: "0.25rem" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--success)", display: "inline-block" }}></span> Sent ({stats.sent})</span>
                <span style={{ color: "var(--warning)", display: "flex", alignItems: "center", gap: "0.25rem" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--warning)", display: "inline-block" }}></span> Pending ({stats.pending})</span>
                <span style={{ color: "var(--danger)", display: "flex", alignItems: "center", gap: "0.25rem" }}><span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--danger)", display: "inline-block" }}></span> Failed ({stats.failed})</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <div className="section-header" style={{ marginBottom: "1rem" }}>
              <h3>Recent Message Activity</h3>
              <button className="btn btn-secondary nav-link-btn" onClick={() => setActivePage("history")} style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                <span>View Full Log</span>
                <ArrowRight size={14} />
              </button>
            </div>
            
            {recentMessages.length === 0 ? (
              <div className="empty-state" style={{ padding: "2rem" }}>
                <p>No messages have been sent yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="action-item" style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                      <span style={{ fontWeight: "700", fontSize: "0.9rem" }}>{msg.user_name || "Unknown User"} ({msg.user_phone || "No phone"})</span>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                        {msg.message}
                      </span>
                    </div>
                    <span className={`badge ${msg.status.toLowerCase()}`}>{msg.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Quick links */}
          <div className="glass-panel">
            <h2>Quick Actions</h2>
            <div className="action-list">
              <button className="btn" onClick={() => setActivePage("send")} style={{ width: "100%" }}>
                <Send size={18} />
                <span>Compose Broadcast</span>
              </button>
              
              <button className="btn btn-secondary" onClick={() => setActivePage("users")} style={{ width: "100%" }}>
                <Plus size={18} />
                <span>Register Recipient</span>
              </button>
            </div>
          </div>

          {/* Engine Status */}
          <div className="glass-panel">
            <h2>System Health</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", fontSize: "0.95rem" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>PostgreSQL Connection</span>
                <span style={{ color: "var(--success)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Zap size={14} fill="var(--success)" /> Active
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", fontSize: "0.95rem" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>BullMQ Redis Queue</span>
                <span style={{ color: "var(--success)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Zap size={14} fill="var(--success)" /> Online
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", fontSize: "0.95rem" }}>
                <span style={{ color: "var(--text-secondary)", fontWeight: "500" }}>Background Worker</span>
                <span style={{ color: "var(--success)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Zap size={14} fill="var(--success)" /> Listening
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
