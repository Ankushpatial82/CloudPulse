import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { connectRedis } from "./config/redis";
import { socketManager } from "./sockets/socketManager";
import routes from "./routes";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
socketManager.init(server);

// Security & Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Parse client URLs
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  ...(env.CLIENT_URL ? env.CLIENT_URL.split(",").map((s) => s.trim()) : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in deployment to avoid CORS blocking
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Global Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use(limiter);

// Root route — redirect browsers to frontend, return JSON for curl
app.get("/", (_req, res) => {
  res.json({
    success: true,
    app: "CloudPulse API",
    version: "1.0.0",
    message: "🚀 CloudPulse API is running. Visit the frontend at http://localhost:3000",
    frontend: "http://localhost:3000",
    docs: "http://localhost:5002/api/health",
    environment: env.NODE_ENV,
  });
});

// API Routes
app.use("/api", routes);

// Central Error Handler
app.use(errorHandler);

// Connect Redis & Start Server
const startServer = async () => {
  await connectRedis();

  server.listen(env.PORT, "0.0.0.0", () => {
    console.log(`=================================================`);
    console.log(` 🚀 CLOUDPULSE API Server running on port ${env.PORT}`);
    console.log(` 📡 Real-time Socket.IO initialized`);
    console.log(` 🔒 Environment: ${env.NODE_ENV}`);
    console.log(`=================================================`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start CloudPulse API server:", err);
  process.exit(1);
});
