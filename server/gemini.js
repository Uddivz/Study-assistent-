const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

const SYSTEM_PROMPT = `You are a study assistant. From the user's notes or topic, create:
- 8 to 12 flashcards (front = question or term, back = concise answer)
- 5 to 8 multiple-choice questions, each with exactly 4 options and one correct answer
Use only information that is accurate and relevant to the input. Keep text short.`;


const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    cards: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { front: { type: "STRING" }, back: { type: "STRING" } },
        required: ["front", "back"],
      },
    },
    questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          options: { type: "ARRAY", items: { type: "STRING" } },
          answerIndex: { type: "INTEGER" },
          explanation: { type: "STRING" },
        },
        required: ["question", "options", "answerIndex"],
      },
    },
  },
  required: ["title", "cards", "questions"],
};


export class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function parseJson(text) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new AppError("The AI returned malformed data. Please try again.", 502);
  }
}


async function callGemini(model, text) {
  try {
    return await fetch(`${API_BASE}/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.4,
        },
      }),
      signal: AbortSignal.timeout(30000),
    });
  } catch (err) {
    if (err.name === "TimeoutError") {
      throw new AppError("The AI took too long to respond. Please try again.", 504);
    }
    throw new AppError("Could not reach the AI service.", 502);
  }
}

async function readResponse(response) {
  if (response.status === 429) {
    throw new AppError("Rate limit reached. Wait a minute and try again.", 429);
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error(`Gemini error ${response.status}:`, detail.slice(0, 500));
    throw new AppError("The AI service returned an error.", 502);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new AppError("The AI service sent an unreadable response.", 502);
  }

  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) {
    throw new AppError("The AI returned an empty response. Try rephrasing.", 502);
  }
  return parseJson(raw);
}

export async function generateStudySet(text) {
  const models = [process.env.GEMINI_MODEL, process.env.GEMINI_FALLBACK_MODEL].filter(Boolean);
  if (models.length === 0) models.push("gemini-3.5-flash-lite");

  let lastError;
  for (const model of models) {
    try {
      const response = await callGemini(model, text);
      if (response.status === 503 || response.status === 404) {
        console.warn(`Model ${model} unavailable (${response.status}), trying next`);
        lastError = new AppError("The AI is busy right now. Please try again in a moment.", 503);
        continue;
      }
      return await readResponse(response);
    } catch (err) {
      if (err instanceof AppError && err.status === 504) {
        console.warn(`Model ${model} timed out, trying next`);
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}