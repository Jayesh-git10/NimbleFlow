import express from "express";
import {
  sendMessage,
  getAllMessages,
  getMessageById,
  deleteMessage
} from "../controllers/message.controller.js";

const router = express.Router();

// Queue and send a message/notification to multiple users
router.post("/send", sendMessage);

// Get all message history logs
router.get("/", getAllMessages);

// Get a specific message log details
router.get("/:id", getMessageById);

// Delete a message log
router.delete("/:id", deleteMessage);

export default router;
