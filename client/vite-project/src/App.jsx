import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import SendMessage from "./pages/SendMessage";
import History from "./pages/History";
import { fetchUsers } from "./services/userApi";
import { fetchMessages } from "./services/messageApi";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadData = async () => {
    try {
      const fetchedUsers = await fetchUsers();
      const fetchedMessages = await fetchMessages();
      setUsers(fetchedUsers);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Error loading application data:", error);
      showToast("Could not connect to backend server. Make sure it is running on port 5000.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Poll database updates every 3 seconds if any messages are "Pending"
  useEffect(() => {
    const hasPending = messages.some((m) => m.status === "Pending");
    if (!hasPending) return;

    const interval = setInterval(async () => {
      try {
        const fetchedMessages = await fetchMessages();
        setMessages(fetchedMessages);
      } catch (err) {
        console.error("Poller error:", err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="app-container">
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        selectedUsersCount={selectedUserIds.length}
      />

      <main className="main-content">
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: "1rem" }}>
            <div className="spinner" style={{ width: "32px", height: "32px" }}></div>
            <p className="text-muted">Connecting to Nimble database...</p>
          </div>
        ) : (
          <>
            {activePage === "dashboard" && (
              <Dashboard
                users={users}
                messages={messages}
                setActivePage={setActivePage}
                showToast={showToast}
              />
            )}

            {activePage === "users" && (
              <Users
                users={users}
                refreshData={loadData}
                selectedUserIds={selectedUserIds}
                setSelectedUserIds={setSelectedUserIds}
                setActivePage={setActivePage}
                showToast={showToast}
              />
            )}

            {activePage === "send" && (
              <SendMessage
                users={users}
                selectedUserIds={selectedUserIds}
                setSelectedUserIds={setSelectedUserIds}
                setActivePage={setActivePage}
                refreshData={loadData}
                showToast={showToast}
              />
            )}

            {activePage === "history" && (
              <History
                messages={messages}
                refreshData={loadData}
                showToast={showToast}
              />
            )}
          </>
        )}
      </main>

      {/* Toast Alert Notification Banner */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === "success" && <CheckCircle2 size={18} style={{ color: "var(--success)" }} />}
            {toast.type === "error" && <AlertCircle size={18} style={{ color: "var(--danger)" }} />}
            {toast.type === "info" && <Info size={18} style={{ color: "var(--accent)" }} />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
