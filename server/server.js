import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/config/db.js";

import userRoutes from "./src/routes/user.routes.js";
import messageRoutes from "./src/routes/message.routes.js";
import "./src/queues/worker.js";

dotenv.config();

const app = express();

// Initialize Database Connection & Tables
connectDB();

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL?.replace(/\/$/, ""),
  "https://nimble-flow.vercel.app",
  "http://localhost:5173"
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        return callback(null, false);
      }
    },
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Bulk Messaging API is running..."
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found"
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
