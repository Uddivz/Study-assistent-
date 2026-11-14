import { useState } from "react";
import Flashcards from "./Flashcards";
import Quiz from "./Quiz";

export default function StudySet({ data }) {
  const [mode, setMode] = useState("cards");

  return (
    <section className="panel">
      <h2>{data.title}</h2>

      <div className="tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "cards"}
          className={mode === "cards" ? "tab active" : "tab"}
          onClick={() => setMode("cards")}
        >
          Flashcards ({data.cards.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "quiz"}
          className={mode === "quiz" ? "tab active" : "tab"}
          onClick={() => setMode("quiz")}
        >
          Quiz ({data.questions.length})
        </button>
      </div>

      <div hidden={mode !== "cards"}>
        <Flashcards cards={data.cards} />
      </div>
      <div hidden={mode !== "quiz"}>
        <Quiz questions={data.questions} />
      </div>
    </section>
  );
}