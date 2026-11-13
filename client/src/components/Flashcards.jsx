import { useState } from "react";

export default function Flashcards({ cards }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) {
    return <p className="hint">No flashcards were generated for this topic.</p>;
  }

  const card = cards[index];
  const isFirst = index === 0;
  const isLast = index === cards.length - 1;

  function goTo(nextIndex) {
    setIndex(nextIndex);
    setFlipped(false);
  }

  return (
    <section className="flashcards" aria-label="Flashcards">
      <button
        type="button"
        className={`flashcard ${flipped ? "flipped" : ""}`}
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Showing answer. Click to show question." : "Showing question. Click to show answer."}
      >
        <div className="flashcard-inner">
          <div className="face front">{card.front}</div>
          <div className="face back">{card.back}</div>
        </div>
      </button>

      <div className="flashcard-nav">
        <button type="button" onClick={() => goTo(index - 1)} disabled={isFirst}>
          Previous
        </button>
        <span aria-live="polite">
          Card {index + 1} of {cards.length}
        </span>
        <button type="button" onClick={() => goTo(index + 1)} disabled={isLast}>
          Next
        </button>
      </div>
    </section>
  );
}