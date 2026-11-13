export async function requestStudySet(text, signal) {
  let res;
  try {
    res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error("Can't reach the server. Check your connection.");
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("The server sent an unreadable response.");
  }

  if (!res.ok) {
    throw new Error(data?.error || "Something went wrong. Please try again.");
  }

  const hasCards = Array.isArray(data?.cards);
  const hasQuestions = Array.isArray(data?.questions);
  if (!hasCards || !hasQuestions || data.cards.length + data.questions.length === 0) {
    throw new Error("The response was in an unexpected format.");
  }
  return data;
}