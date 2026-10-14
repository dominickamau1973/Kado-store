import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import mpesaRoutes from "./routes/mpesaRoutes.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// The production frontend origin(s) must be listed in CORS_ORIGINS as a
// comma-separated list. Local development uses Vite's usual origins.
const configuredOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = configuredOrigins.length
  ? configuredOrigins
  : process.env.NODE_ENV === "production"
    ? []
    : ["http://localhost:5173", "http://127.0.0.1:5173"];

app.disable("x-powered-by");

// Basic security headers without adding another runtime dependency.
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      // Native clients, Postman, and Safaricom callbacks may not send Origin.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-mock-callback-secret"],
  }),
);

app.use(express.json({ limit: "1mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/mpesa", mpesaRoutes);

app.get("/", (req, res) => {
  res.status(200).send("E-commerce API is running");
});

// Readiness endpoint: returns 503 until MongoDB is connected.
app.get("/healthz", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  return res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "ok" : "not_ready",
    database: databaseConnected ? "connected" : "disconnected",
  });
});

app.use((error, req, res, next) => {
  if (error?.message === "CORS origin not allowed") {
    return res.status(403).json({ message: "Origin is not allowed by CORS policy" });
  }

  if (error?.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body is too large" });
  }

  console.error("Unhandled API error:", error?.message || error);
  return res.status(500).json({ message: "Internal server error" });
});

const startServer = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured. Add it to backend/.env.");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured. Add it to backend/.env.");
  }

  if (process.env.NODE_ENV === "production" && process.env.JWT_SECRET.length < 32) {
    throw new Error("Production JWT_SECRET must contain at least 32 characters.");
  }

  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Allowed frontend origins: ${allowedOrigins.join(", ") || "none configured"}`);
  });
};

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
