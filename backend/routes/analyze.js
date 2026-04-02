const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const { parseFile } = require("../utils/fileParser");
const { analyzeWithAI } = require("../utils/aiAnalyzer");

const MAX_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || "10");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/bmp",
      "image/tiff",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

router.post("/analyze", authMiddleware, (req, res, next) => {
  upload.single("document")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          error: `File too large. Max allowed: ${MAX_SIZE_MB}MB.`,
        });
      }
      return res.status(400).json({ success: false, error: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
}, async (req, res) => {
  const startTime = Date.now();
  const requestId = uuidv4();

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Send file with field name "document" as multipart/form-data.',
      });
    }

    const { buffer, mimetype, originalname, size } = req.file;
    console.log(`[${requestId}] Processing: ${originalname} (${(size / 1024).toFixed(1)} KB)`);

    let parsed;
    try {
      parsed = await parseFile(buffer, mimetype, originalname);
    } catch (parseErr) {
      return res.status(422).json({
        success: false,
        error: `File parsing failed: ${parseErr.message}`,
        request_id: requestId,
      });
    }

    let analysis;
    try {
      analysis = await analyzeWithAI(parsed.extracted_text, parsed.file_type);
    } catch (aiErr) {
      return res.status(500).json({
        success: false,
        error: `AI analysis failed: ${aiErr.message}`,
        partial_result: {
          extracted_text: parsed.extracted_text,
          word_count: parsed.word_count,
          file_type: parsed.file_type,
        },
        request_id: requestId,
      });
    }

    const processingTime = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      request_id: requestId,
      file_info: {
        filename: originalname,
        file_type: parsed.file_type,
        size_bytes: size,
        size_kb: parseFloat((size / 1024).toFixed(2)),
        pages: parsed.pages,
        word_count: parsed.word_count,
        char_count: parsed.char_count,
        ocr_confidence: parsed.ocr_confidence,
      },
      extracted_text: parsed.extracted_text,
      analysis: {
        document_type: analysis.document_type || "Unknown",
        language: analysis.language || "Unknown",
        summary: analysis.summary || "",
        key_points: analysis.key_points || [],
        entities: {
          persons: analysis.entities?.persons || [],
          organizations: analysis.entities?.organizations || [],
          dates: analysis.entities?.dates || [],
          locations: analysis.entities?.locations || [],
          monetary_amounts: analysis.entities?.monetary_amounts || [],
          emails: analysis.entities?.emails || [],
          phone_numbers: analysis.entities?.phone_numbers || [],
          urls: analysis.entities?.urls || [],
        },
        tables_detected: analysis.tables_detected || [],
        sentiment: analysis.sentiment || "Neutral",
        topics: analysis.topics || [],
        action_items: analysis.action_items || [],
        confidence_score: analysis.confidence_score || 0,
      },
      processing_time_ms: processingTime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return res.status(500).json({
      success: false,
      error: "An unexpected server error occurred.",
      request_id: requestId,
    });
  }
});

router.get("/analyze", (req, res) => {
  res.json({
    endpoint: "POST /api/analyze",
    description: "Analyze PDF, DOCX, or image files using AI",
    authentication: "X-API-Key: <key>  OR  Authorization: Bearer <key>",
    request: {
      method: "POST",
      content_type: "multipart/form-data",
      field_name: "document",
      supported_formats: ["PDF", "DOCX", "JPG", "PNG", "WEBP"],
      max_size: `${MAX_SIZE_MB}MB`,
    },
  });
});

module.exports = router;