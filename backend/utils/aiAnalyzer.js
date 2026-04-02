const Groq = require("groq-sdk");

let client = null;
function getClient() {
  if (!client) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY not set in environment.");
    }
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}

const PROMPT = (text, fileType) => `
You are an expert document analysis AI. Analyze the following ${fileType.toUpperCase()} document text and return a comprehensive structured JSON analysis.

EXTRACTED TEXT:
"""
${text.substring(0, 8000)}
"""

Return ONLY a valid JSON object — no markdown, no explanation, no code fences. Exact structure:
{
  "document_type": "Invoice | Resume | Contract | Research Paper | Report | Letter | Form | Receipt | Legal Document | Medical Record | Other",
  "language": "English",
  "summary": "2-4 sentence comprehensive summary",
  "key_points": ["point 1", "point 2"],
  "entities": {
    "persons": [],
    "organizations": [],
    "dates": [],
    "locations": [],
    "monetary_amounts": [],
    "emails": [],
    "phone_numbers": [],
    "urls": []
  },
  "tables_detected": [
    {
      "description": "table description",
      "headers": ["col1", "col2"],
      "rows": [["val1", "val2"]]
    }
  ],
  "sentiment": "Positive | Negative | Neutral | Mixed",
  "topics": ["topic1", "topic2"],
  "action_items": ["action 1"],
  "confidence_score": 0.95
}
`;

async function analyzeWithAI(extractedText, fileType) {
  if (!extractedText || extractedText.trim().length < 5) {
    return {
      document_type: "Unknown",
      language: "Unknown",
      summary: "No readable text could be extracted from the document.",
      key_points: [],
      entities: {
        persons: [], organizations: [], dates: [],
        locations: [], monetary_amounts: [],
        emails: [], phone_numbers: [], urls: [],
      },
      tables_detected: [],
      sentiment: "Neutral",
      topics: [],
      action_items: [],
      confidence_score: 0.0,
    };
  }

  const groq = getClient();

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are a document analysis expert. Always respond with valid JSON only. No markdown, no explanation, no code fences.",
      },
      {
        role: "user",
        content: PROMPT(extractedText, fileType),
      },
    ],
    temperature: 0.1,
    max_tokens: 2048,
    response_format: { type: "json_object" },
  });

  const rawContent = completion.choices[0]?.message?.content || "{}";

  let analysis;
  try {
    analysis = JSON.parse(rawContent);
  } catch {
    const match = rawContent.match(/\{[\s\S]*\}/);
    if (match) analysis = JSON.parse(match[0]);
    else throw new Error("AI returned invalid JSON");
  }

  return analysis;
}

module.exports = { analyzeWithAI };