import InputForm from "./components/InputForm";
import StudySet from "./components/StudySet";
import ErrorBoundary from "./components/ErrorBoundary";
import { useStudySet } from "./hooks/useStudySet";
import "./App.css";


export default function App() {
  const { status, data, error, generate, retry, cancel } = useStudySet();

  return (
    <main className="app">
      <header className="app-header">
        <h1>Study Assistant</h1>
        <p className="subtitle">Turn your notes into flashcards and a quiz.</p>
      </header>

      <InputForm onSubmit={generate} disabled={status === "loading"} />

      {status === "idle" && (
        <p className="hint">
          Paste notes or enter a topic to generate flashcards and a quiz.
        </p>
      )}

      {status === "loading" && (
        <div className="panel loading" role="status">
          <span className="spinner" aria-hidden="true" />
          <p>Generating your study set…</p>
          <button type="button" className="secondary" onClick={cancel}>
            Cancel
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="panel error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={retry}>Try again</button>
        </div>
      )}

      {status === "success" && (
        <ErrorBoundary>
          <StudySet data={data} />
        </ErrorBoundary>
      )}
    </main>
  );
}