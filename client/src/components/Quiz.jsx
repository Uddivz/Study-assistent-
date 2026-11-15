import { useReducer } from "react";

function init(questions) {
  return { pool: questions, round: 1, index: 0, selected: null, answers: [], finished: false };
}

function reducer(state, action) {
  switch (action.type) {
    case "select":
      if (state.selected !== null) return state;
      return { ...state, selected: action.choice };
    case "next": {
      if (state.selected === null) return state;
      const answers = [...state.answers, state.selected];
      if (state.index === state.pool.length - 1) {
        return { ...state, answers, finished: true };
      }
      return { ...state, index: state.index + 1, selected: null, answers };
    }
    case "retest":
      return {
        pool: action.missed,
        round: state.round + 1,
        index: 0,
        selected: null,
        answers: [],
        finished: false,
      };
    case "restart":
      return init(action.questions);
    default:
      return state;
  }
}

export default function Quiz({ questions }) {
  const [state, dispatch] = useReducer(reducer, questions, init);
  const { pool, round } = state;
  const total = pool.length;

  if (questions.length === 0) {
    return <p className="hint">No quiz questions were generated for this topic.</p>;
  }

  if (state.finished) {
    const results = pool.map((q, i) => ({ q, picked: state.answers[i] }));
    const missed = results.filter(({ q, picked }) => picked !== q.answerIndex);
    const score = total - missed.length;

    return (
      <section className="quiz" aria-label="Quiz results">
        <p className="quiz-progress">Round {round}</p>
        <h3>
          Score: {score} / {total}
        </h3>

        {missed.length === 0 ? (
          <p>{round === 1 ? "Perfect score!" : "You've cleared every question you missed."}</p>
        ) : (
          <>
            <p>Questions you missed:</p>
            <ul className="missed-list">
              {missed.map(({ q, picked }) => (
                <li key={q.id}>
                  <strong>{q.question}</strong>
                  <div>Your answer: {q.options[picked]}</div>
                  <div>Correct answer: {q.options[q.answerIndex]}</div>
                  {q.explanation && <div>{q.explanation}</div>}
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="quiz-actions">
          {missed.length > 0 && (
            <button
              type="button"
              onClick={() => dispatch({ type: "retest", missed: missed.map(({ q }) => q) })}
            >
              Re-test missed ({missed.length})
            </button>
          )}
          <button
            type="button"
            className="secondary"
            onClick={() => dispatch({ type: "restart", questions })}
          >
            Start over
          </button>
        </div>
      </section>
    );
  }

  const q = pool[state.index];
  const answered = state.selected !== null;
  const isCorrect = state.selected === q.answerIndex;
  const isLast = state.index === total - 1;

  return (
    <section className="quiz" aria-label="Quiz">
      <p className="quiz-progress">
        {round > 1 && `Re-test round ${round} · `}Question {state.index + 1} of {total}
      </p>
      <div className="progress-bar" aria-hidden="true">
        <div
          className="progress-fill"
          style={{ width: `${((state.index + (answered ? 1 : 0)) / total) * 100}%` }}
        />
      </div>
      <h3>{q.question}</h3>

      <div className="options">
        {q.options.map((option, i) => {
          let className = "option";
          if (answered && i === q.answerIndex) className += " correct";
          else if (answered && i === state.selected) className += " wrong";
          return (
            <button
              key={`${q.id}-${i}`}
              type="button"
              className={className}
              disabled={answered}
              onClick={() => dispatch({ type: "select", choice: i })}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div aria-live="polite">
        {answered && (
          <>
            <p>{isCorrect ? "Correct!" : "Not quite."}</p>
            {q.explanation && <p>{q.explanation}</p>}
          </>
        )}
      </div>

      {answered && (
        <button type="button" onClick={() => dispatch({ type: "next" })}>
          {isLast ? "See results" : "Next question"}
        </button>
      )}
    </section>
  );
}