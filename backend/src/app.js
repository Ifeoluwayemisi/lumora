import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import { requestLogger } from "./middleware/requestLogger.js";
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

// Get absolute path for uploads folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, "../uploads");

/**
 * Security & Performance Middleware
 */

// CORS configuration - restrict in production
// Remove trailing slash from FRONTEND_URL to ensure proper CORS matching
const frontendUrl = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.replace(/\/$/, "")
  : "http://localhost:3000";

const corsOptions = {
  origin: [
    frontendUrl,
    frontendUrl + "/",
    "http://localhost:3000",
    "http://localhost:3001",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200, // For legacy browser support
};

app.use(cors(corsOptions));

// Add request logging middleware
app.use(requestLogger);

// Body parsing middleware with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Serve static files (uploads folder for QR codes, certificates, etc.)
console.log("[APP_INIT] Serving static files from:", uploadsPath);

// Diagnostic: Check if uploads directory exists
if (fs.existsSync(uploadsPath)) {
  console.log("[APP_INIT] ✓ Uploads directory exists");
  const qrCodesDir = path.join(uploadsPath, "qrcodes");
  if (fs.existsSync(qrCodesDir)) {
    try {
      const files = fs.readdirSync(qrCodesDir);
      console.log(`[APP_INIT] ✓ QR codes directory has ${files.length} files`);
      if (files.length > 0 && files.length <= 5) {
        console.log("[APP_INIT] Files:", files);
      }
    } catch (err) {
      console.error("[APP_INIT] Error reading QR directory:", err.message);
    }
  } else {
    console.warn(
      "[APP_INIT] ⚠️  QR codes directory does not exist:",
      qrCodesDir,
    );
  }
} else {
  console.error("[APP_INIT] ❌ Uploads directory NOT FOUND:", uploadsPath);
}

// Add diagnostic middleware for static file requests
app.use("/uploads", (req, res, next) => {
  const filePath = path.join(uploadsPath, req.path);
  const relativePath = path.relative(uploadsPath, filePath);

  if (req.path.includes("qrcodes")) {
    console.log(`[STATIC_REQUEST] ${req.path}`);
    console.log(`[STATIC_REQUEST] Looking for: ${filePath}`);
    console.log(`[STATIC_REQUEST] Exists: ${fs.existsSync(filePath)}`);
  }

  next();
});

app.use("/uploads", express.static(uploadsPath));

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  if (NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
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
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime(),
  });
});

// Diagnostic endpoint - helps debug production issues
app.get("/health/diagnostics", (req, res) => {
  res.json({
    status: "running",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    nodeVersion: process.version,
    frontendUrl: process.env.FRONTEND_URL,
    database: "Connected", // You can enhance this to actually test DB connection
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    path: req.path,
    method: req.method,
    message: "The requested resource does not exist",
  });
});

// Global error handler with enhanced logging
app.use((err, req, res, next) => {
  const requestId = req.id || Math.random().toString(36).substring(7);
  const statusCode = err.statusCode || err.status || 500;
  const isDevelopment = NODE_ENV === "development";

  const response = {
    error: err.message || "Internal Server Error",
    requestId, // For production debugging
    timestamp: new Date().toISOString(),
    ...(isDevelopment && {
      stack: err.stack,
      details: {
        code: err.code,
        meta: err.meta,
      },
    }),
  };

  // Enhanced error logging
  console.error(`[ERROR-${requestId}] ${req.method} ${req.path}:`, {
    statusCode,
    message: err.message,
    code: err.code,
    stack: err.stack,
    query: req.query,
    params: req.params,
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
  });

  // Ensure response is JSON
  res.setHeader("Content-Type", "application/json");
  res.status(statusCode).json(response);
});

export default app;
