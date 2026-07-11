import pool from "../config/db.js";
import { messageQueue } from "../queues/queue.js";

// Send bulk messages to selected user IDs
export const sendMessage = async (req, res) => {
  try {
    const { message, userIds } = req.body;

    if (!message || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message text and userIds list are required.",
      });
    }

    // Optimization: query database once to retrieve all matching users
    const usersResult = await pool.query(
      "SELECT id, name, phone_number FROM users WHERE id = ANY($1)",
      [userIds]
    );

    const targetUsers = usersResult.rows;

    if (targetUsers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "None of the specified userIds match active users.",
      });
    }

    const queuedJobs = [];

    // Enqueue jobs asynchronously
    for (const user of targetUsers) {
      // Store the message as Pending in database
      const savedMessageResult = await pool.query(
        `INSERT INTO messages (user_id, message, status)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [user.id, message, "Pending"]
      );

      const messageId = savedMessageResult.rows[0].id;

      // Push job to BullMQ queue
      const job = await messageQueue.add("send-message", {
        messageId,
        phoneNumber: user.phone_number,
        message,
      });

      queuedJobs.push({
        messageId,
        userId: user.id,
        userName: user.name,
        jobId: job.id,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Successfully queued ${targetUsers.length} message(s).`,
      data: queuedJobs,
    });
  } catch (error) {
    console.error("Error sending message:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get All Messages
export const getAllMessages = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.id, m.message, m.status, m.created_at, u.name as user_name, u.phone_number as user_phone
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      ORDER BY m.id DESC
    `);
    
    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get Message by ID
export const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT m.id, m.message, m.status, m.created_at, u.name as user_name, u.phone_number as user_phone
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Message log not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching message:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete Message
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM messages WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Message log not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message log deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting message:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
