import { useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import {
  Upload, FileText, Zap, X,
  BarChart2, Tag, Table2, Code,
  CheckCircle2, Loader2, Sparkles, Download,
} from "lucide-react";

const API_BASE = "https://ai-doc-analyzer-4wdv.onrender.com/api";
const API_KEY = "mySecretKey123";

const TABS = [
  { id: "summary",  label: "Summary",  icon: <Sparkles size={14} /> },
  { id: "entities", label: "Entities", icon: <Tag size={14} /> },
  { id: "tables",   label: "Tables",   icon: <Table2 size={14} /> },
  { id: "rawtext",  label: "Raw Text", icon: <FileText size={14} /> },
  { id: "json",     label: "JSON",     icon: <Code size={14} /> },
];

const ENTITY_CONFIG = [
  { key: "persons",          label: "Persons",       emoji: "👤" },
  { key: "organizations",    label: "Organizations", emoji: "🏢" },
  { key: "dates",            label: "Dates",         emoji: "📅" },
  { key: "locations",        label: "Locations",     emoji: "📍" },
  { key: "monetary_amounts", label: "Amounts",       emoji: "💰" },
  { key: "emails",           label: "Emails",        emoji: "✉️" },
  { key: "phone_numbers",    label: "Phone Numbers", emoji: "📞" },
  { key: "urls",             label: "URLs",          emoji: "🔗" },
];

function getFileExt(name = "") {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["docx", "doc"].includes(ext)) return "docx";
  return "img";
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

export default function App() {
  const [file, setFile]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const [progress, setProgress]   = useState(0);
  const [stepMsg, setStepMsg]     = useState("");
  const [result, setResult]       = useState(null);
  const [activeTab, setActiveTab] = useState("summary");

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) { setFile(accepted[0]); setResult(null); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, maxFiles: 1,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
      "image/bmp": [".bmp"],
    },
  });

  async function handleAnalyze() {
    if (!file) return toast.error("Please upload a document first.");

    setLoading(true); setResult(null);
    setProgress(10);  setStepMsg("Uploading document…");

    const formData = new FormData();
    formData.append("document", file);

    try {
      setProgress(35); setStepMsg("Extracting text…");
      const res = await axios.post(`${API_BASE}/analyze`, formData, {
        headers: {
          "X-API-Key": API_KEY,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (e) =>
          setProgress(10 + Math.round((e.loaded / e.total) * 25)),
      });
      setProgress(80); setStepMsg("Running AI analysis…");
      await new Promise(r => setTimeout(r, 500));
      setProgress(100); setStepMsg("Done!");
      setResult(res.data); setActiveTab("summary");
      toast.success("Document analyzed!");
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleDownloadJSON() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `analysis-${result.file_info?.filename || "result"}.json`,
    });
    a.click();
  }

  const steps = [
    { label: "Upload",  done: !!file },
    { label: "Extract", done: progress >= 50 },
    { label: "AI Scan", done: progress >= 90 },
    { label: "Done",    done: !!result },
  ];

  const analysis = result?.analysis;
  const totalEntities = analysis
    ? Object.values(analysis.entities).reduce((s, a) => s + a.length, 0) : 0;

  return (
    <div className="app">

      {/* ── Header (no API key input) ── */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">🧠</div>
          <span className="logo-text">DocuMind</span>
          <span className="logo-badge">AI</span>
        </div>
        <div className="header-right">
          <span className="header-tag">
            <Zap size={12} /> GUVI Hackathon 2026
          </span>
        </div>
      </header>

      {/* ── Hero ── */}
      {!result && (
        <section className="hero">
          <div className="hero-tag"><Zap size={12} /> AI-Powered</div>
          <h1>Intelligent Document<br />Analysis & Extraction</h1>
          <p>Upload any PDF, Word document, or image. AI extracts text, entities, tables, and generates structured insights instantly.</p>
        </section>
      )}

      {/* ── Upload ── */}
      <section className="upload-section">
        {!file ? (
          <div {...getRootProps()} className={`dropzone${isDragActive ? " active" : ""}`}>
            <input {...getInputProps()} />
            <div className="dz-icon"><Upload size={28} /></div>
            <div className="dz-title">
              {isDragActive ? "Drop your file here…" : "Drop a document or click to upload"}
            </div>
            <div className="dz-sub">PDF, DOCX, JPG, PNG, WEBP — up to 10MB</div>
            <div className="dz-formats">
              {["PDF","DOCX","JPG","PNG","WEBP","GIF","BMP"].map(f => (
                <span key={f} className="format-badge">{f}</span>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="file-preview">
              <div className={`file-icon ${getFileExt(file.name)}`}>
                {getFileExt(file.name).toUpperCase()}
              </div>
              <div className="file-meta">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{formatBytes(file.size)}</div>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => { setFile(null); setResult(null); }}
              >
                <X size={14} /> Remove
              </button>
            </div>

            <div className="analyze-bar">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleAnalyze}
                disabled={loading}
              >
                {loading
                  ? <Loader2 size={16} className="spin" />
                  : <Zap size={16} />}
                {loading ? "Analyzing…" : "Analyze Document"}
              </button>
              {result && (
                <button className="btn btn-secondary" onClick={handleDownloadJSON}>
                  <Download size={14} /> Download JSON
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Progress ── */}
      {loading && (
        <div className="progress-wrap">
          <div className="progress-steps">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`step ${s.done ? "done" : i === steps.findIndex(x => !x.done) ? "active" : ""}`}
              >
                {s.done ? <CheckCircle2 size={12} /> : <span className="step-dot" />}
                {s.label}
              </div>
            ))}
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-label">{stepMsg}</div>
        </div>
      )}

      {/* ── Results ── */}
      {result && (
        <div className="results-container">
          <div className="results-header">
            <div className="results-title">Analysis Results</div>
            <div className="result-meta-badges">
              <span className="meta-badge blue">{result.file_info?.file_type?.toUpperCase()}</span>
              <span className="meta-badge green">{analysis?.document_type}</span>
              <span className="meta-badge purple">{analysis?.language}</span>
              <span className="meta-badge amber">{result.processing_time_ms}ms</span>
            </div>
          </div>

          <div className="stats-row">
            {[
              { val: result.file_info?.word_count?.toLocaleString(), label: "Words" },
              { val: totalEntities,                                   label: "Entities" },
              { val: analysis?.key_points?.length,                   label: "Key Points" },
              { val: analysis?.tables_detected?.length,              label: "Tables" },
              { val: Math.round((analysis?.confidence_score||0)*100)+"%", label: "Confidence" },
              { val: result.file_info?.pages || "—",                 label: "Pages" },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-value">{s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="tabs-bar">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`tab-btn ${activeTab === t.id ? "active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.icon} {t.label}
                {t.id === "entities" && <span className="tab-count">{totalEntities}</span>}
                {t.id === "tables"   && <span className="tab-count">{analysis?.tables_detected?.length}</span>}
              </button>
            ))}
          </div>

          {activeTab === "summary"  && <SummaryTab  analysis={analysis} />}
          {activeTab === "entities" && <EntitiesTab entities={analysis?.entities} />}
          {activeTab === "tables"   && <TablesTab   tables={analysis?.tables_detected} />}
          {activeTab === "rawtext"  && <RawTextTab  text={result.extracted_text} />}
          {activeTab === "json"     && <JsonTab     result={result} />}
        </div>
      )}

      <footer className="footer">
        <p>Built with ❤️ by <span>NXT GEN CODER</span> · GUVI Hackathon 2026</p>
      </footer>
    </div>
  );
}

/* ── Summary Tab ── */
function SummaryTab({ analysis }) {
  if (!analysis) return null;
  return (
    <div>
      <div className="card">
        <div className="card-title">
          <Sparkles size={13} style={{ color: "var(--accent)" }} /> Summary
        </div>
        <p className="summary-text">{analysis.summary || "No summary available."}</p>
      </div>

      {analysis.key_points?.length > 0 && (
        <div className="card">
          <div className="card-title">
            <BarChart2 size={13} style={{ color: "var(--accent)" }} /> Key Points
          </div>
          <ul className="key-points-list">
            {analysis.key_points.map((p, i) => (
              <li key={i} className="key-point">
                <span className="key-point-marker" />{p}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div className="card">
          <div className="card-title">Sentiment</div>
          <span className={`sentiment-pill sentiment-${analysis.sentiment}`}>
            {analysis.sentiment}
          </span>
        </div>
        {analysis.topics?.length > 0 && (
          <div className="card">
            <div className="card-title">Topics</div>
            <div className="topics-wrap">
              {analysis.topics.map((t, i) => (
                <span key={i} className="topic-chip">{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {analysis.action_items?.length > 0 && (
        <div className="card">
          <div className="card-title">
            <CheckCircle2 size={13} style={{ color: "var(--accent)" }} /> Action Items
          </div>
          <ul className="key-points-list">
            {analysis.action_items.map((a, i) => (
              <li key={i} className="key-point">
                <span className="key-point-marker" />{a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── Entities Tab ── */
function EntitiesTab({ entities }) {
  if (!entities) return null;
  return (
    <div className="entities-grid">
      {ENTITY_CONFIG.map(({ key, label, emoji }) => (
        <div key={key} className="entity-card">
          <div className="entity-card-header">
            <span style={{ fontSize: "1rem" }}>{emoji}</span>
            <span className="entity-type-label">{label}</span>
            <span className="entity-count">{entities[key]?.length || 0}</span>
          </div>
          {entities[key]?.length > 0 ? (
            <div className="entity-tags">
              {entities[key].map((v, i) => (
                <span key={i} className="entity-tag">{v}</span>
              ))}
            </div>
          ) : (
            <span className="entity-empty">None found</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Tables Tab ── */
function TablesTab({ tables }) {
  if (!tables?.length) return (
    <div className="empty-state card">
      <Table2 size={32} /><p>No tables detected in this document.</p>
    </div>
  );
  return (
    <div>
      {tables.map((tbl, i) => (
        <div key={i} className="card">
          <div className="card-title">
            <Table2 size={13} style={{ color: "var(--accent)" }} />
            Table {i + 1} — {tbl.description}
          </div>
          {tbl.headers?.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table className="doc-table">
                <thead>
                  <tr>{tbl.headers.map((h, j) => <th key={j}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {(tbl.rows || []).map((row, ri) => (
                    <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Structure not parseable.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Raw Text Tab ── */
function RawTextTab({ text }) {
  return (
    <div className="card">
      <div className="card-title">
        <FileText size={13} style={{ color: "var(--accent)" }} /> Extracted Text
      </div>
      <div className="raw-text-box">{text || "No text extracted."}</div>
    </div>
  );
}

/* ── JSON Tab ── */
function JsonTab({ result }) {
  return (
    <div className="card">
      <div className="card-title">
        <Code size={13} style={{ color: "var(--accent)" }} /> Full API Response
      </div>
      <div className="json-box">{JSON.stringify(result, null, 2)}</div>
    </div>
  );
}
