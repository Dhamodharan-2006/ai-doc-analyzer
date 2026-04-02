const authMiddleware = (req, res, next) => {
  const expectedKey = process.env.API_KEY;

  if (!expectedKey) {
    return res.status(500).json({
      success: false,
      error: "Server misconfiguration: API key not configured.",
    });
  }

  let providedKey = null;

  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    providedKey = authHeader.substring(7).trim();
  }

  if (!providedKey && req.headers["x-api-key"]) {
    providedKey = req.headers["x-api-key"].trim();
  }

  if (!providedKey) {
    return res.status(401).json({
      success: false,
      error: "Missing API key. Provide via Authorization: Bearer <key> or X-API-Key header.",
    });
  }

  if (providedKey !== expectedKey) {
    return res.status(403).json({
      success: false,
      error: "Invalid API key. Access denied.",
    });
  }

  next();
};

module.exports = authMiddleware;
