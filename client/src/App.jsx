import StudySet from "./components/StudySet";
import InputForm from "./components/InputForm";

import { useStudySet } from "./hooks/useStudySet";
import "./App.css";

export default function App() {
  const { status, data, error, generate, retry, cancel } = useStudySet();

  return (
    <main className="app">
      <h1>Study Assistant</h1>
      <InputForm onSubmit={generate} disabled={status === "loading"} />

      {status === "idle" && (
        <p className="hint">
          Paste notes or enter a topic to generate flashcards and a quiz.
        </p>
      )}

      {status === "loading" && (
        <div className="panel" role="status">
          <p>Generating your study set…</p>
          <button type="button" onClick={cancel}>Cancel</button>
        </div>
      )}

      {status === "error" && (
        <div className="panel error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={retry}>Try again</button>
        </div>
      )}

            {status === "success" && <StudySet data={data} />}
    </main>
  );
}