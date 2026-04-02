const express = require("express");
const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    service: "AI Document Analyzer API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "development",
  });
});

module.exports = router;