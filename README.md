# Multimodel AI — web frontend

A web UI for the multimodel AI assistant: chat with Gemini or Groq, or load
a PDF (by file or URL) and ask questions about it. This was originally a
terminal app driven by `input()`/`print()`; this adds a thin FastAPI layer
over the existing client/service code, plus a React + TypeScript frontend.

## Live demo

**[multimodel-ai-alpha.vercel.app](https://multimodel-ai-alpha.vercel.app)**

Open that link in any browser — nothing to install, no account needed.
Pick Gemini or Groq at the top and start chatting, or attach a PDF via the
paperclip icon to ask questions about a document.

The frontend is hosted on Vercel; the FastAPI backend runs on Railway
(`backend/Dockerfile`). Vercel builds the frontend against
`VITE_API_BASE_URL`, pointed at the Railway backend's public URL, so the
two deploy independently of each other.

## Before anything else: rotate your API keys

The uploaded project's `.env` file contained live-looking Gemini and Groq
API keys committed in plaintext. Treat both as compromised — revoke or
rotate them in Google AI Studio and the Groq console, and keep `.env` out
of version control going forward (a `.gitignore` is included here that
already excludes it). Nothing in this deliverable contains those key
values.

## Architecture

```
docker-compose.yml   Orchestrates both services for local dev (recommended).
Makefile             Short, memorable commands wrapping docker compose.
backend/    FastAPI app — clients/, decorators/, services/, utils/ are the
            ORIGINAL project files, untouched. main.py is the only new
            code: it wraps gemini_response / groq_response / generate_pdf_response
            in three HTTP endpoints instead of an input() loop.
frontend/   React + TypeScript + Vite, plain CSS with design tokens
            (no framework like Tailwind/MUI — see "Design notes" below).
```

**Why FastAPI for the backend wrapper:** the existing code already returns
plain strings from typed functions (`gemini_response`, `groq_response`,
`generate_pdf_response`) — FastAPI's request/response models map onto that
shape with almost no glue code, and `UploadFile` handles the PDF upload
case the original `pathlib.Path` flow needs.

**Why Context + useReducer for conversation state, not Redux/Zustand:** the
state shape is small (a list of conversations, each with messages and an
optional attached document) and the update logic is a half-dozen cases —
exactly what `useReducer` is for. It lives in `frontend/src/state/conversations.tsx`
and is the single source of truth for every conversation; no component
keeps its own copy, which is what fixes history disappearing when you
switch screens (see "Conversations and history" below). If this needs to
sync across browser tabs or hit a real backend, that's the point to reach
for Zustand or React Query — not before.

**Why plain CSS instead of Tailwind/CSS-in-JS:** the design leans on a
small, specific token set (two engine accent colors, one mono face for
telemetry) that's easier to keep consistent in `tokens.css` than to
express through utility classes. Tailwind is a reasonable alternative
stack if the component count grows past what's here.

## Design notes

The product's whole premise is swapping between two AI engines, so the UI
is built around that rather than looking like a generic chat app:

- The provider switch is styled as a breaker switch (`EngineReadout`), not
  a dropdown, and stays pinned at the top of every view.
- The original code times every call with a `@timer` decorator but only
  prints it to the console. The frontend surfaces that same number as a
  live "last response" readout, and tags every reply bubble with which
  engine answered and how fast.
- Gemini answers are tinted violet, Groq answers amber, consistently
  whether the message is plain chat or grounded in an attached document,
  so the active engine is always visually obvious without reading labels.
- Dark, near-black surfaces throughout — treated as a console rather than
  a light productivity app. No light mode for now; flag it if you want one.

## Conversations and history

There's no separate "Chat mode" and "Documents mode" anymore — that split
was the actual bug. Each was a component with its own local `useState`, so
switching the sidebar tab unmounted whichever one you left, and React
throws local state away on unmount. There's nothing wrong with local state
in general; it's the wrong tool for anything that needs to outlive a
component's screen time.

Instead, `frontend/src/state/conversations.tsx` holds every conversation
above the view layer:

```ts
interface Conversation {
  id: string;
  document?: DocumentMeta;   // present once a PDF is attached
  messages: ChatMessage[];
}
```

A conversation is plain chat until you attach a PDF to it (the paperclip
button next to the composer) — same pattern as Claude/ChatGPT file
attachments, rather than a permanently separate page. Once attached, that
conversation's messages route through the document Q&A endpoint instead of
the plain chat one; you can detach it later and the conversation just goes
back to plain chat, history intact either way.

The sidebar lists every conversation — chat or document — sorted by most
recently active, which is the "combined history" part. "New chat" creates
an empty one and makes it active. Titles aren't stored; they're derived
from the first message (or the document name, if one's attached before any
message) via `deriveTitle()`, so there's nothing to keep in sync.

State is also written to `localStorage` on every change, so history
survives a page reload, not just a screen switch within the same session —
clear it any time via your browser's dev tools (`localStorage.removeItem("multimodel-ai:conversations")`)
if you want a clean slate.

**A real limitation, not a bug:** the backend's document store is in
memory (see `backend/main.py`) and gets wiped on restart. If you restart
the backend, conversations from before that restart will still display
their old messages fine (those are just text, already in `localStorage`),
but asking a *new* question against an old attached document will fail
with "Document not found" until you re-attach it. Worth knowing about if
this needs to survive backend restarts — that would mean persisting
document bytes/text somewhere durable (S3, a database) instead of the
current in-memory dict.

## Getting started (recommended: Docker)

One requirement: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
(or Docker Engine + Compose plugin on Linux) installed and running.

```bash
cp backend/.env.example backend/.env   # then fill in your real, rotated keys
docker compose up --build
```

That's it — backend on `http://localhost:8000`, frontend on
`http://localhost:5173`, both with hot reload (edit a file, the running app
updates). `Ctrl+C` stops both. A `Makefile` wraps the common commands so you
don't have to remember Compose flags:

```bash
make up      # start everything (same as docker compose up --build)
make down    # stop the containers
make logs    # tail logs from both services
make test    # run the frontend test suite inside its container
make clean   # stop containers and wipe the node_modules volume
```

**How the pieces connect:** `docker-compose.yml` builds an image from each
folder's `Dockerfile`, starts both containers on a shared network, and maps
their ports to your machine. The backend reads its API keys from
`backend/.env` via `env_file` (never baked into the image). The frontend is
told where the backend lives via `VITE_API_BASE_URL`, set directly in the
compose file. Both folders are bind-mounted into their containers, so
editing code on your host triggers each dev server's hot reload — no
rebuild needed for normal day-to-day changes; `make up` only needs to
rebuild when you change `requirements.txt` or `package.json`.

### Getting started (no Docker)

Two terminals, same as before:

```bash
# Terminal 1
cd backend
python -m venv .venv
source .venv/bin/activate   # .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env        # then fill in real keys
uvicorn main:app --reload --port 8000
```

```bash
# Terminal 2
cd frontend
npm install
npm run dev
```

Confirm the backend's up: `curl http://localhost:8000/api/providers` should
return `["gemini","groq"]`. Interactive API docs are at
`http://localhost:8000/docs`. Open whatever URL Vite prints (usually
`http://localhost:5173`) for the frontend.

### Tests

```bash
cd frontend
npm test          # or: make test, if using Docker
```

19 tests cover the message bubble, composer, engine switch, and the
conversation store itself — including a test asserting the original
disappearing-history bug stays fixed (`conversations.test.tsx`).

## Deployment notes

- **Backend (Railway):** built from `backend/Dockerfile`. Railway assigns
  its own `$PORT` at runtime and routes the public domain to it — the
  Dockerfile's `CMD` binds to `${PORT:-8000}` (falling back to 8000 for
  local/non-Railway use) rather than a hardcoded port, since a mismatch
  between the port the app listens on and the port Railway's proxy targets
  is what causes an "Application failed to respond" error. If Railway
  reassigns the port on a future deploy, double-check **Settings →
  Networking** on the service shows the same port number the Deploy Logs
  report (`Uvicorn running on http://0.0.0.0:<port>`).
- **CORS:** `backend/main.py` allows `http://localhost:5173` for local dev
  plus any `https://*.vercel.app` origin via `allow_origin_regex`, so
  Vercel preview deployments work without extra config.
- **Environment variables:** `GEMINI_API_KEY` and `GROQ_API_KEY` are set
  directly in Railway's **Variables** tab, not committed anywhere — the
  repo's `.env` files stay local/gitignored as described above.
- **Frontend (Vercel):** builds `frontend/` with `VITE_API_BASE_URL` set to
  the Railway backend's public URL.

## What's deliberately not included

This covers a small, real project rather than a generic enterprise
frontend template — there's no CI/CD pipeline or sprint-by-sprint estimate
here, since those didn't seem useful for a two-screen tool at this stage.
Happy to add a GitHub Actions workflow or auth layer if and when this needs
to go further than what's live now.
