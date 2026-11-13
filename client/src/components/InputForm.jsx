import { useState } from "react";

const MAX_CHARS = 12000;

export default function InputForm({ onSubmit, disabled }) {
  const [text, setText] = useState("");
  const trimmed = text.trim();

  function handleSubmit(event) {
    event.preventDefault();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
  }

  return (
    <form className="input-form" onSubmit={handleSubmit}>
      <label htmlFor="notes">Paste your notes or type a topic</label>
      <textarea
        id="notes"
        rows={6}
        value={text}
        maxLength={MAX_CHARS}
        onChange={(event) => setText(event.target.value)}
        placeholder="e.g. Photosynthesis, or paste a page of notes"
      />
      <div className="form-footer">
        <span className="counter">{text.length}/{MAX_CHARS}</span>
        <button type="submit" disabled={!trimmed || disabled}>
          Generate
        </button>
      </div>
    </form>
  );
}