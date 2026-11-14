import { useReducer } from "react";

const initialState = { index: 0, selected: null, answers: [], finished: false };

function reducer(state, action) {
  switch (action.type) {
    case "select":
      if (state.selected !== null) return state;
      return { ...state, selected: action.choice };
    case "next": {
      if (state.selected === null) return state;
      const answers = [...state.answers, state.selected];
      if (state.index === action.total - 1) {
        return { ...state, answers, finished: true };
      }
      return { index: state.index + 1, selected: null, answers, finished: false };
    }
    case "restart":
      return initialState;
    default:
      return state;
  }
}

export default function Quiz({ questions }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const total = questions.length;

  if (total === 0) {
    return <p className="hint">No quiz questions were generated for this topic.</p>;
  }

  if (state.finished) {
    const results = questions.map((q, i) => ({ q, picked: state.answers[i] }));
    const missed = results.filter(({ q, picked }) => picked !== q.answerIndex);
    const score = total - missed.length;

    return (
      <section className="quiz" aria-label="Quiz results">
        <h3>
          Score: {score} / {total}
        </h3>
        {missed.length === 0 ? (
          <p>Perfect score!</p>
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
        <button type="button" onClick={() => dispatch({ type: "restart" })}>
          Try again
        </button>
      </section>
    );
  }

  const q = questions[state.index];
  const answered = state.selected !== null;
  const isCorrect = state.selected === q.answerIndex;
  const isLast = state.index === total - 1;

  return (
    <section className="quiz" aria-label="Quiz">
      <p className="quiz-progress">
        Question {state.index + 1} of {total}
      </p>
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
        <button type="button" onClick={() => dispatch({ type: "next", total })}>
          {isLast ? "See results" : "Next question"}
        </button>
      )}
    </section>
  );
}