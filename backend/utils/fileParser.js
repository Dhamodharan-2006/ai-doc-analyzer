const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const path = require("path");

function getFileCategory(mimetype, originalname) {
  const ext = path.extname(originalname || "").toLowerCase();
  const mime = (mimetype || "").toLowerCase();

  if (mime === "application/pdf" || ext === ".pdf") return "pdf";
  if (
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime === "application/msword" ||
    ext === ".docx" || ext === ".doc"
  ) return "docx";
  if (
    mime.startsWith("image/") ||
    [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff"].includes(ext)
  ) return "image";

  return "unknown";
}

async function extractFromPdf(buffer) {
  try {
    const data = await pdfParse(buffer);
    return {
      text: data.text || "",
      pages: data.numpages || 0,
      metadata: { pages: data.numpages, info: data.info || {} },
    };
  } catch (err) {
    throw new Error(`PDF parsing failed: ${err.message}`);
  }
}

async function extractFromDocx(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: result.value || "",
      metadata: {},
    };
  } catch (err) {
    throw new Error(`DOCX parsing failed: ${err.message}`);
  }
}

async function extractFromImage(buffer) {
  try {
    const { data: { text, confidence } } = await Tesseract.recognize(buffer, "eng", {
      logger: () => {},
    });
    return {
      text: text || "",
      confidence: confidence || 0,
      metadata: { ocr_confidence: confidence },
    };
  } catch (err) {
    throw new Error(`Image OCR failed: ${err.message}`);
  }
}

async function parseFile(buffer, mimetype, originalname) {
  const category = getFileCategory(mimetype, originalname);

  if (category === "unknown") {
    throw new Error(`Unsupported file type: ${mimetype}. Use PDF, DOCX, or images.`);
  }

  let result;
  if (category === "pdf")        result = await extractFromPdf(buffer);
  else if (category === "docx")  result = await extractFromDocx(buffer);
  else                           result = await extractFromImage(buffer);

  return {
    file_type: category,
    extracted_text: result.text.trim(),
    word_count: result.text.trim().split(/\s+/).filter(Boolean).length,
    char_count: result.text.trim().length,
    metadata: result.metadata || {},
    pages: result.pages || null,
    ocr_confidence: result.confidence || null,
  };
}

module.exports = { parseFile, getFileCategory };