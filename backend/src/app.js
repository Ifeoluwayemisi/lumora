import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import codeRoutes from "./routes/codeRoutes.js";
import manufacturerRoutes from "./routes/manufacturerRoutes.js";
import nafdacRoutes from "./routes/nafdacRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoute from "./routes/userRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import "dotenv/config";

const app = express();
const NODE_ENV = process.env.NODE_ENV || "development";

/**
 * Security & Performance Middleware
 */

// CORS configuration - restrict in production
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Body parsing middleware with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Ensure all responses are JSON
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  if (NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const log = `[${req.method}] ${req.path} - ${res.statusCode} (${duration}ms)`;
    if (res.statusCode >= 400) {
      console.warn(log);
    } else if (NODE_ENV === "development") {
      console.log(log);
    }
  });
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/verify", verificationRoutes);
app.use("/api/codes", codeRoutes);
app.use("/api/manufacturer", manufacturerRoutes);
app.use("/api/nafdac", nafdacRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoute);
app.use("/api/reports", reportRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Lumora API",
    version: "1.0.0",
    status: "operational",
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    path: req.path,
    message: "The requested resource does not exist",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isDevelopment = NODE_ENV === "development";

  const response = {
    error: err.message || "Internal Server Error",
    ...(isDevelopment && { stack: err.stack }),
  };

  console.error(`[ERROR] ${req.method} ${req.path}:`, err);

  // Ensure response is JSON
  res.setHeader("Content-Type", "application/json");
  res.status(statusCode).json(response);
});

export default app;
