import { Worker } from "bullmq";
import IORedis from "ioredis";
import pool from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const connection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : new IORedis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      maxRetriesPerRequest: null,
    });

connection.on("error", (err) => {
  console.error("❌ Redis Worker Connection Error:", err.message);
});

const worker = new Worker(
  "message-queue",
  async (job) => {
    const { messageId, phoneNumber, message } = job.data;

    try {
      console.log(`\n-----------------------------------------`);
      console.log(`📩 Processing Message Job [ID: ${job.id}]`);
      console.log(`📞 To: ${phoneNumber}`);
      console.log(`📝 Text: "${message}"`);
      console.log(`-----------------------------------------`);

      const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
      const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
      const TWILIO_FROM = process.env.TWILIO_FROM || 'whatsapp:+14155238886';
      const TWILIO_CONTENT_SID = process.env.TWILIO_CONTENT_SID || 'HXb5b62575e6e4ff6129ad7c8efe1f983e';
      const TWILIO_CONTENT_VARIABLES = process.env.TWILIO_CONTENT_VARIABLES || '{"1":"12/1","2":"3pm"}';

      const isTwilioConfigured = 
        TWILIO_ACCOUNT_SID && 
        TWILIO_AUTH_TOKEN && 
        TWILIO_AUTH_TOKEN !== "[AuthToken]" && 
        TWILIO_AUTH_TOKEN.trim() !== "";

      if (isTwilioConfigured) {
        console.log(`📲 Dispatching WhatsApp via Twilio Sandbox [To: ${phoneNumber}]...`);
        const { default: twilio } = await import("twilio");
        const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        
        // Ensure recipient has 'whatsapp:' prefix
        const formattedTo = phoneNumber.startsWith("whatsapp:") 
          ? phoneNumber 
          : `whatsapp:${phoneNumber}`;

        const response = await client.messages.create({
          from: TWILIO_FROM,
          body: message, // Sends the actual custom text entered in the composer
          to: formattedTo
        });
        
        console.log(`📲 Twilio Response SID: ${response.sid}`);
      } else {
        console.log("⏳ Simulating WhatsApp transmission (2-second network latency)...");
        if (!TWILIO_AUTH_TOKEN || TWILIO_AUTH_TOKEN === "[AuthToken]") {
          console.log("ℹ️ Note: To send real WhatsApp alerts, configure your TWILIO_AUTH_TOKEN in server/.env");
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        // Simulated failure cases to help test error UI states.
        // 5% random failure rate, or force failure if the message starts with "FAIL"
        const isForcedFailure = typeof message === "string" && message.toUpperCase().startsWith("FAIL");
        if (isForcedFailure || Math.random() < 0.05) {
          throw new Error("Simulated network delivery failure (gateway timeout)");
        }
      }

      // Update database status to Sent
      await pool.query(
        `UPDATE messages
         SET status = 'Sent'
         WHERE id = $1`,
        [messageId]
      );

      console.log(`✅ Message [DB ID: ${messageId}] dispatched successfully!`);

    } catch (error) {
      console.error(`❌ Message Delivery Failed for Job [ID: ${job.id}]:`, error.message);

      // Update database status to Failed
      await pool.query(
        `UPDATE messages
         SET status = 'Failed'
         WHERE id = $1`,
        [messageId]
      );

      throw error;
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`✨ Job [ID: ${job.id}] completed.`);
});

worker.on("failed", (job, err) => {
  console.error(`💥 Job [ID: ${job?.id}] failed:`, err.message);
});

console.log("🚀 Message Worker Process Started & Listening on 'message-queue'...");
