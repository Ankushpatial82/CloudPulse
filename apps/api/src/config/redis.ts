import { createClient } from "redis";
import { env } from "./env";

const isProd = process.env.NODE_ENV === "production";
const hasRedis = Boolean(
  env.REDIS_URL &&
    env.REDIS_URL.trim() !== "" &&
    !(isProd && env.REDIS_URL.includes("localhost:6379"))
);

export const redisClient = hasRedis
  ? createClient({
      url: env.REDIS_URL,
      socket: {
        connectTimeout: 3000,
        reconnectStrategy: (retries) => (retries > 3 ? new Error("Redis retry limit reached") : 500),
      },
    })
  : (null as any);

if (redisClient) {
  redisClient.on("error", (err: any) => {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Redis] Warning: Redis connection issue:", err.message);
    }
  });
}

export const connectRedis = async () => {
  if (!redisClient) {
    console.log("[Redis] No REDIS_URL configured, running in high-performance in-memory mode.");
    return;
  }
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log("[Redis] Connected successfully.");
    }
  } catch (err) {
    console.warn("[Redis] Could not connect to Redis server, fallback to in-memory mode.");
  }
};
