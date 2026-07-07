# taskdock

A small, local-first personal todo app — a fast task list that lives in a single
file on your machine, backed by a real REST API. No accounts, no cloud, no sync nags.

**Landing page:** https://andrewtham.github.io/taskdock/

Built with **Node + Express + SQLite + TypeScript**. Storage uses Node's built-in
`node:sqlite` module, so there are no native modules to compile.

## Quick start

```bash
npm install        # once
npm run dev        # start with live reload
# then open http://localhost:3000
```

Other scripts:

- `npm start` — run once (no watch)
- `npm run typecheck` — `tsc --noEmit`

Data is stored in `data/todos.db` (created on first run, gitignored). It persists
across restarts. Override the location with the `TODO_DB` env var and the port
with `PORT`.

## REST API

Base URL: `http://localhost:3000`

| Method | Path             | Body                    | Result            |
| ------ | ---------------- | ----------------------- | ----------------- |
| GET    | `/api/todos`     | —                       | list, newest first|
| GET    | `/api/todos/:id` | —                       | single todo / 404 |
| POST   | `/api/todos`     | `{ "title" }`           | `201` new todo    |
| PATCH  | `/api/todos/:id` | `{ "title"?, "done"? }` | updated todo      |
| DELETE | `/api/todos/:id` | —                       | `204`             |

A todo is `{ id, title, done, created_at }`.

## Project structure

```
src/
  db.ts       opens SQLite (node:sqlite) and ensures the schema
  todos.ts    typed CRUD functions
  server.ts   Express routes + serves the web UI
public/        the web UI (index.html, app.js, styles.css) + landing.html
docs/          static landing page published to GitHub Pages
data/          SQLite database file (gitignored)
```

## Hosting notes

The `docs/` landing page is fully static and is what's published to **GitHub Pages**.

The todo app itself needs the Express backend running, so it can't be hosted on
GitHub Pages — run it locally with `npm run dev`, or deploy it to a Node host
(Render, Fly.io, Railway, etc.).
