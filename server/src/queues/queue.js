import { Queue } from "bullmq";
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const connection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : new IORedis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      maxRetriesPerRequest: null, // Critical for BullMQ compatibility
    });

connection.on("error", (err) => {
  console.error("❌ Redis Connection Error:", err.message);
});

export const messageQueue = new Queue("message-queue", {
  connection,
});
