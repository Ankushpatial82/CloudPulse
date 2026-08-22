import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../../../.env") });

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5001", 10),
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/cloudpulse?schema=public",
  JWT_SECRET: process.env.JWT_SECRET || "cloudpulse_super_secret_jwt_key_2026_prod",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  DEFAULT_MONITOR_INTERVAL: parseInt(process.env.MONITOR_INTERVAL || "5000", 10),
};
