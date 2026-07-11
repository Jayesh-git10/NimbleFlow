const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_URL = `${BASE_URL}/api/messages`;

export const fetchMessages = async () => {
  const response = await fetch(API_URL);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch messages");
  }
  return data.data || [];
};

export const sendBulkMessages = async (message, userIds) => {
  const response = await fetch(`${API_URL}/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, userIds }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to send messages");
  }
  return data;
};

export const deleteMessageLog = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete message log");
  }
  return data;
};
