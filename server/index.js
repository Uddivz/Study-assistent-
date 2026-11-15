import { getMockStudySet } from "./mock.js";
import express from "express";

import "dotenv/config";
import { generateStudySet, AppError } from "./gemini.js";
import { validateStudySet, EmptyResultError } from "./validate.js";


const app = express();
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});
const MAX_INPUT_CHARS = 12000;
const USE_MOCK = process.env.USE_MOCK === "true";
if (USE_MOCK) console.log("⚠ MOCK MODE: not calling Gemini");

app.post("/api/generate", async (req, res) => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";

  if (!text) {
    return res.status(400).json({ error: "Please enter some notes or a topic." });
  }
  if (text.length > MAX_INPUT_CHARS) {
    return res.status(400).json({ error: "Input is too long. Please shorten it." });
  }

  try {
    const raw = USE_MOCK ? await getMockStudySet(text) : await generateStudySet(text);
    const studySet = validateStudySet(raw);
    res.json(studySet);
  } catch (err) {
    console.error("generate failed:", err.message);
        if (err instanceof EmptyResultError) {
      return res.status(422).json({
        error: "We couldn't find anything to study in that text. Try a clearer topic or paste some notes.",
      });
    }
    if (err instanceof AppError) {
      return res.status(err.status).json({ error: err.message });
    }
    res.status(502).json({ error: "The AI's response couldn't be used. Please try again." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});