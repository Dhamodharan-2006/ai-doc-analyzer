🧠 DocuMind AI — AI-Powered Document Analysis & Extraction

 GUVI Hackathon 2026 · NXT GEN CODER ·

---

## 🌐 Live Demo

- **Frontend:** https://ai-doc-analyzer-yj17.vercel.app/
- **API Endpoint:** https://ai-doc-analyzer-4wdv.onrender.com
- **API Key for judges:** mySecretKey123

---

## 📋 Problem Statement

AI-Powered Document Analysis & Extraction — Build an API that accepts PDF, DOCX, and image files and returns structured AI-generated analysis including text extraction, named entity recognition, summarization, sentiment analysis, and table detection.

---

## 🚀 Features

- 📄 Upload PDF, DOCX, JPG, PNG, WEBP documents
- 🧠 AI-powered summarization and key point extraction
- 🏷️ Named Entity Recognition (persons, orgs, dates, locations, amounts, emails, phones, URLs)
- 📊 Table detection and structured extraction
- 💡 Sentiment analysis (Positive / Negative / Neutral / Mixed)
- 🔍 Document type classification and language detection
- ✅ Action items identification
- 📥 Download full JSON result
- 🔐 API key authentication

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Dropzone, Axios |
| Backend | Node.js, Express.js, Multer, Helmet |
| AI Engine | Groq API (Llama 3.3 70B) |
| PDF Parsing | pdf-parse |
| DOCX Parsing | Mammoth.js |
| OCR (Images) | Tesseract.js |
| Deployment | Vercel (Frontend), Render (Backend) |

---

## 📡 API Usage

### Health Check
\`\`\`
GET https://your-backend.onrender.com/api/health
\`\`\`

### Analyze Document
\`\`\`
POST https://your-backend.onrender.com/api/analyze
\`\`\`

**Headers:**
\`\`\`
X-API-Key: mySecretKey123
Content-Type: multipart/form-data
\`\`\`

**Body:**
\`\`\`
Field: document (file) — PDF, DOCX, JPG, PNG, WEBP
\`\`\`

**Example using curl:**
\`\`\`bash
curl -X POST https://your-backend.onrender.com/api/analyze \
  -H "X-API-Key: mySecretKey123" \
  -F "document=@invoice.pdf"
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "request_id": "uuid",
  "file_info": {
    "filename": "invoice.pdf",
    "file_type": "pdf",
    "word_count": 312,
    "pages": 2
  },
  "extracted_text": "Full document text...",
  "analysis": {
    "document_type": "Invoice",
    "language": "English",
    "summary": "AI generated summary...",
    "key_points": ["point 1", "point 2"],
    "entities": {
      "persons": ["John Smith"],
      "organizations": ["ABC Corp"],
      "dates": ["April 1, 2026"],
      "locations": ["Chennai"],
      "monetary_amounts": ["$4,500"],
      "emails": ["billing@abc.com"],
      "phone_numbers": ["+91 98765 43210"],
      "urls": ["https://abc.com"]
    },
    "tables_detected": [],
    "sentiment": "Neutral",
    "topics": ["Finance", "Invoice"],
    "action_items": ["Pay by April 30"],
    "confidence_score": 0.95
  },
  "processing_time_ms": 2100,
  "timestamp": "2026-04-02T10:00:00.000Z"
}
\`\`\`

---

## 🏗️ Architecture

\`\`\`
User (Browser)
    │
    ▼
React Frontend (Vercel)
    │  POST /api/analyze
    ▼
Express Backend (Render)
    │
    ├── Auth Middleware (API Key check)
    ├── Multer (file upload)
    ├── File Parser
    │   ├── PDF  → pdf-parse
    │   ├── DOCX → Mammoth.js
    │   └── IMG  → Tesseract.js (OCR)
    └── AI Analyzer → Groq API (Llama 3.3 70B)
         │
         ▼
    Structured JSON Response
\`\`\`

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- npm
- Groq API key (free at https://console.groq.com)

### 1. Clone Repository
\`\`\`bash
git clone https://github.com/Dhamodharan-2006/ai-doc-analyzer.git
cd ai-doc-analyzer
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install
cp .env.example .env
# Edit .env with your keys
npm run dev
\`\`\`

### 3. Frontend Setup
\`\`\`bash
cd frontend
npm install
# Create .env file with VITE_API_URL and VITE_API_KEY
npm run dev
\`\`\`

### 4. Environment Variables

**backend/.env**
\`\`\`
GROQ_API_KEY=your_groq_key
API_KEY=mySecretKey123
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
\`\`\`

**frontend/.env**
\`\`\`
VITE_API_URL=http://localhost:5000/api
VITE_API_KEY=mySecretKey123
\`\`\`

---

## 🤖 AI Tools Used

| Tool | Purpose |
|------|---------|
| **Groq API (Llama 3.3 70B)** | Document analysis, NER, summarization, sentiment |
| **Tesseract.js** | OCR text extraction from images |
| **Claude (Anthropic)** | Development assistance and code generation |
| **ChatGPT** | Code review and debugging help |

---

## ⚠️ Known Limitations

- OCR accuracy depends on image quality
- Max file size: 10MB
- Very large documents truncated at 8,000 characters for AI analysis
- Render free tier sleeps after 15 min inactivity (first request takes ~30 sec)
- Tables in scanned PDFs may not extract perfectly

---

