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
 * ============================
 * CORS (FIXED & SIMPLIFIED)
 * ============================
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Explicitly handle preflight requests
app.options("*", cors());

/**
 * ============================
 * Body Parsing
 * ============================
 */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

/**
 * ============================
 * Security Headers
 * ============================
 */
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

/**
 * ============================
 * Request Logging
 * ============================
 */
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

/**
 * ============================
 * Routes
 * ============================
 */
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

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

/**
 * ============================
 * 404 Handler
 * ============================
 */
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    path: req.path,
    message: "The requested resource does not exist",
  });
});

/**
 * ============================
 * Global Error Handler
 * ============================
 */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  console.error(`[ERROR] ${req.method} ${req.path}:`, err);

  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
    ...(NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
