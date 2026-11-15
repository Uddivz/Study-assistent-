# Study Assistant
 
Paste your notes or type a topic, and the app turns it into **flip-through flashcards** and a **multiple-choice quiz**. Questions you miss can be re-tested in extra rounds until you get them all right.
 
The AI never talks to the user directly. The server asks Gemini for **structured JSON**, validates it, and the React app renders it as interactive components. This is not a chatbot.
 


- **Demo video:** `<https://drive.google.com/file/d/1GAI9yoQOUpP8nQLjyIzENuav9-pCNDH2/view?usp=drive_link>`

## Features
 
- Free-form text input (notes or a topic), up to 12,000 characters, with a character counter
- **Flashcards:** click to flip, Previous / Next, "Card 2 of 4" counter
- **Quiz:** pick an answer, instant right/wrong feedback with an explanation, progress bar, score at the end
- **Re-test:** after a round, retake only the questions you missed, repeating until all are cleared; "Start over" returns to the full set
- Loading state with a spinner and a **Cancel** button; error state with **Try again**; empty states for missing cards or questions
- Clear message when the input has nothing to study (for example random characters)
- Responsive layout, light and dark theme (follows the system setting), visible keyboard focus styles, and reduced-motion support
- Keyboard-accessible controls (cards, tabs and quiz options are real buttons)
## Tech stack
 
| Part | Choice |
|---|---|
| Frontend | React (hooks, functional components) with Vite |
| Backend | Node.js + Express (a small server that keeps the API key off the browser) |
| AI | Google Gemini, called with plain `fetch` (no AI SDK) |
| Styling | Plain CSS with CSS variables |
 
## Setup
 
**Requirements:** Node.js 18 or newer, and a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
 
```bash
git clone <this-repo-url>
cd study-assistant
 
# create your local settings file, then paste your key into it
copy server\.env.example server\.env        # Windows
# cp server/.env.example server/.env        # macOS / Linux
 
npm install && npm start
```
 
Open **http://localhost:5173**.
 
`npm install` at the root also installs the client and server dependencies (via a `postinstall` script), and `npm start` runs both together. In development, Vite proxies `/api` requests to the Express server, so the browser only ever talks to one address.
 
### Environment variables (`server/.env`)
 
| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | My Gemini key. Never committed (`.env` is git-ignored) and never sent to the browser. |
| `GEMINI_MODEL` | Primary model name (default in `.env.example`: `gemini-3.5-flash-lite`) |
| `GEMINI_FALLBACK_MODEL` | Tried automatically if the primary is overloaded, unavailable or too slow (default: `gemini-3-flash-preview`) |
| `USE_MOCK` | `false` by default. Set to `true` to skip Gemini and return a built-in sample set (see below) |
| `PORT` | Server port (default 3001) |
 
Model names change often, and free-tier availability varies by account. If you get an error about a model, check which models your key can use and update the two model variables.
 
### Mock mode (for trying the UI without a key)
 
Set `USE_MOCK=true` in `server/.env` and restart. The server returns a sample study set (passed through the same validator) instead of calling Gemini. I built it so I could develop the whole UI while Gemini was unavailable, and kept it so failure states can be demonstrated on demand. These words in the input trigger test behaviour: `slow` (6 second delay), `fail` (simulated server error), `bad` (malformed data, to exercise the validator). When mock mode is on, the server prints a warning at startup. It is off by default, and all normal use calls the real API.
 
## How it works
 
```
React  ->  POST /api/generate  ->  Express route  ->  Gemini
                                        |                |
                                        |  JSON text <---+
                                        v
                                   validate.js  ->  clean JSON  ->  React renders it
```
 
- `client/src/api.js`: the only place the browser talks to the server. Turns every failure into a readable error message and re-checks the response shape.
- `client/src/hooks/useStudySet.js`: request state in one `status` value (`idle | loading | success | error`), plus cancel and retry.
- `client/src/components/`: `InputForm`, `StudySet` (tabs), `Flashcards`, `Quiz` (a reducer-based state machine with re-test rounds), and `ErrorBoundary`.
- `server/index.js`: the `/api/generate` route, input checks, and mapping errors to safe messages.
- `server/gemini.js`: the Gemini call, response schema, per-model timeout, fallback model, and JSON parsing.
- `server/validate.js`: checks and cleans everything the model returns.
- `server/mock.js`: the optional mock mode described above.
## Handling bad AI output
 
This was the main focus. The model's reply is never trusted.
 
| Problem | How it is handled |
|---|---|
| Malformed JSON, or JSON wrapped in markdown fences | Fences are stripped; a failed parse gives a friendly error, not a crash |
| Wrong shape or missing fields | Each card and question is validated individually (4 options, `answerIndex` between 0 and 3, non-empty text) |
| Some items bad, some good | Bad items are dropped and good ones are kept; it only fails if nothing usable remains |
| Placeholder filler ("Question 1", "Answer A") | Filtered out by the validator |
| Gibberish or meaningless input | The schema has a required `isStudyable` field the model must fill in first; the validator also rejects empty or placeholder results. The user gets a specific "nothing to study" message (HTTP 422) instead of a generic failure |
| Empty response | Detected and reported with a "try rephrasing" message |
| Slow response | 30 second timeout per model attempt, plus a Cancel button in the UI |
| Model overloaded (503), unavailable (404), or timed out | The server automatically tries the fallback model |
| Rate limit (429) | Specific message; not retried, since another model would hit the same limit |
| Server unreachable or unreadable reply | Caught in `api.js` with a clear message and a Try again button |
| Stale response overwriting a newer one | A new request aborts the old one, and a request id check ignores any late reply |
| A component crashing while rendering | An error boundary shows a fallback panel instead of a blank page |
| Raw errors leaking to users | The server logs details to its own console and sends only safe messages |
 
The client also re-checks the response shape before rendering, so a component never receives data it cannot display.
 


## AI usage note

I used **Claude** as a tutor and pair-programmer. It drafted much of the code in small steps, and I asked for each piece to be explained line by line before moving on. I typed the code in myself, ran it, and tested it on real notes, on failure cases (a wrong API key, a stopped server, slow responses, meaningless input). Several problems I found and worked through myself with its help: a duplicated key in `package.json`, a project folder in a protected system directory, `.env` loading, Gemini models being retired or overloaded during development, a quiz results screen that crashed, and the model inventing content for gibberish input. I also used it to review my fixes and for help with syntax and structure, and to plan the failure-handling approach and draft this README.

At one point the Gemini models stopped responding (long timeouts and "overloaded" errors), which blocked my progress on the real API. On Claude's suggestion I built a temporary mock mode and moved on to the frontend, then came back to the Gemini integration later, tested which models actually responded for my key, and added a fallback model.

I can walk through every part of the code and explain the decisions behind it: the validator, the stale-response protection, the quiz reducer, and the fallback model.
 
## Known limitations
 
- **The AI can be wrong.** The validator guarantees a valid *shape*, not correct facts. A question might have the wrong answer marked; check important material against your notes.
- **Meaningless input is only partly caught.** The model is asked to flag it and placeholder filler is filtered out, but a model can occasionally still produce content for ambiguous or nonsensical text.
- **Free-tier limits and model churn.** Gemini free tiers have rate limits, and model availability changes (models I started with were retired during development). The fallback model reduces, but does not remove, failures, and "preview" models may change or disappear.
- **No saved sessions.** Refreshing the page loses the current study set and quiz progress.
- **No streaming.** The result appears all at once after generation (typically several seconds).
- **Text only.** No file or PDF upload; input is capped at 12,000 characters.
- **Fixed quiz format.** Four-option multiple choice only; questions and options are not shuffled.
- **Simple styling.** The interface is clean and responsive but intentionally plain; the theme follows the system setting and there is no manual toggle.
- **No automated tests.** The failure cases were tested manually (using mock mode triggers, breaking the key, stopping the server, and unusual input).


## Time spent

About **7 to 9 hours** of active working time, estimated from my commit history.

/*------------- IMPORTANT NOTE -----------*/

The top of the range is slightly over the suggested 8 hours. Most of the overrun was not feature work: a good part went on Gemini models being unavailable or overloaded, and on environment problems, before I moved on with a mock mode and returned to the API later.

| Area | Time |
|---|---|
| Project setup, server, Gemini integration | ~1.5 h |
| Validation and failure handling | ~1 h |
| React fetch layer, state, loading and error states | ~1 h |
| Flashcards, quiz, re-test | ~2 h |
| Debugging (environment, model availability, crashes) | ~1.5 to 2 h |
| Styling, README, recording | ~1 to 1.5 h |


