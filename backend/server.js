require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const analyzeRouter = require("./routes/analyze");
const healthRouter = require("./routes/health");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(morgan("combined"));
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:3000",
      /\.vercel\.app$/,
      /\.netlify\.app$/,
      /\.render\.com$/,
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: "Too many requests. Please try again later." },
});
app.use("/api/", limiter);

app.use("/api", healthRouter);
app.use("/api", analyzeRouter);

app.get("/", (req, res) => {
  res.json({
    name: "AI Document Analyzer API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "GET /api/health",
      analyze: "POST /api/analyze",
    },
    authentication: "X-API-Key: <key>  OR  Authorization: Bearer <key>",
    supported_formats: ["pdf", "docx", "jpg", "jpeg", "png", "webp", "gif", "bmp"],
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("[ERROR]", err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 AI Doc Analyzer API → http://localhost:${PORT}`);
  console.log(`📋 Health → http://localhost:${PORT}/api/health\n`);
});