import { createClient } from "redis";
import { env } from "./env";

export const redisClient = createClient({
  url: env.REDIS_URL,
});

redisClient.on("error", (err) => {
  // Silent fallback log so app doesn't crash if Redis is unavailable in local dev
  if (process.env.NODE_ENV === "development") {
    console.warn("[Redis] Warning: Redis connection issue, running with memory fallback.", err.message);
  }
});

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("[Redis] Connected successfully.");
    }
  } catch (err) {
    console.warn("[Redis] Could not connect to Redis server, continuing in-memory.");
  }
};
