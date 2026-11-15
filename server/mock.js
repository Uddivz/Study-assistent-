import { AppError } from "./gemini.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_SET = {
  title: "Photosynthesis (sample)",
  cards: [
    { front: "What is photosynthesis?", back: "The process plants use to turn light, water and CO2 into sugar and oxygen." },
    { front: "What is chlorophyll?", back: "The green pigment that absorbs light energy." },
    { front: "Where does photosynthesis happen?", back: "In the chloroplasts of plant cells." },
    { front: "Which gas do plants take in?", back: "Carbon dioxide (CO2)." },
  ],
  questions: [
    {
      question: "Which organelle carries out photosynthesis?",
      options: ["Mitochondrion", "Chloroplast", "Nucleus", "Ribosome"],
      answerIndex: 1,
      explanation: "Chloroplasts contain chlorophyll.",
    },
    {
      question: "Which gas is released as a by-product?",
      options: ["Nitrogen", "Carbon dioxide", "Oxygen", "Hydrogen"],
      answerIndex: 2,
      explanation: "Oxygen is released when water is split.",
    },
    {
      question: "What gives leaves their green colour?",
      options: ["Carotene", "Chlorophyll", "Melanin", "Haemoglobin"],
      answerIndex: 1,
      explanation: "Chlorophyll reflects green light.",
    },
  ],
};

export async function getMockStudySet(text) {
  const t = text.toLowerCase();
  await sleep(t.includes("slow") ? 6000 : 1200);

  if (t.includes("fail")) throw new AppError("Mock: simulated server failure.", 502);
  if (t.includes("bad")) return { cards: "not an array", questions: null };
  return MOCK_SET;
}