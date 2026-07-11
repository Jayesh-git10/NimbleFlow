import React from "react";
import { MessageSquare, LayoutDashboard, Users, History, Send } from "lucide-react";

export default function Navbar({ activePage, setActivePage, selectedUsersCount }) {
  return (
    <header className="navbar-header">
      <div className="logo-container" onClick={() => setActivePage("dashboard")}>
        <MessageSquare className="logo-icon" size={28} />
        <span>NimbleFlow</span>
      </div>

      <nav className="nav-links">
        <button
          className={`nav-link-btn ${activePage === "dashboard" ? "active" : ""}`}
          onClick={() => setActivePage("dashboard")}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button
          className={`nav-link-btn ${activePage === "users" ? "active" : ""}`}
          onClick={() => setActivePage("users")}
        >
          <Users size={18} />
          <span>Users</span>
        </button>

        <button
          className={`nav-link-btn ${activePage === "send" ? "active" : ""}`}
          onClick={() => setActivePage("send")}
        >
          <Send size={18} />
          <span>Send Message</span>
          {selectedUsersCount > 0 && (
            <span style={{
              background: "var(--accent)",
              color: "white",
              fontSize: "0.75rem",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: "4px",
              fontWeight: "bold"
            }}>
              {selectedUsersCount}
            </span>
          )}
        </button>

        <button
          className={`nav-link-btn ${activePage === "history" ? "active" : ""}`}
          onClick={() => setActivePage("history")}
        >
          <History size={18} />
          <span>History</span>
        </button>
      </nav>
    </header>
  );
}
