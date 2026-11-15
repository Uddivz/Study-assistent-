const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;
const PLACEHOLDER = /^(question|answer|term|definition|card|front|back|option|choice)\s*[a-z0-9]{0,2}[.:]?$/i;
const isPlaceholder = (v) => typeof v === "string" && PLACEHOLDER.test(v.trim());
export class EmptyResultError extends Error {}

function cleanCard(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (isPlaceholder(raw.front) || isPlaceholder(raw.back)) return null;
  if (!isNonEmptyString(raw.front) || !isNonEmptyString(raw.back)) return null;
  return { front: raw.front.trim(), back: raw.back.trim() };
}

function cleanQuestion(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (!isNonEmptyString(raw.question)) return null;
  if (!Array.isArray(raw.options) || raw.options.length !== 4) return null;
  if (!raw.options.every(isNonEmptyString)) return null;
  if (isPlaceholder(raw.question) || raw.options.some(isPlaceholder)) return null;
  if (!Number.isInteger(raw.answerIndex)) return null;
  if (raw.answerIndex < 0 || raw.answerIndex > 3) return null;
  return {
    question: raw.question.trim(),
    options: raw.options.map((o) => o.trim()),
    answerIndex: raw.answerIndex,
    explanation: isNonEmptyString(raw.explanation) ? raw.explanation.trim() : "",
  };
}

export function validateStudySet(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Model response was not a JSON object");
  }

  if (raw.isStudyable === false) {
    throw new EmptyResultError("Model reported the input was not studyable");
  }

  const cards = (Array.isArray(raw.cards) ? raw.cards : [])
    .map(cleanCard)
    .filter(Boolean)
    .map((card, i) => ({ id: `card-${i + 1}`, ...card }));

  const questions = (Array.isArray(raw.questions) ? raw.questions : [])
    .map(cleanQuestion)
    .filter(Boolean)
    .map((q, i) => ({ id: `q-${i + 1}`, ...q }));

  if (cards.length === 0 && questions.length === 0) {
    throw new EmptyResultError("Model response had no usable cards or questions");
  }

  return {
    title: isNonEmptyString(raw.title) ? raw.title.trim() : "Study set",
    cards,
    questions,
  };
}