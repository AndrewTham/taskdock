import express from "express";
import type { Request, Response } from "express";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  listTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
} from "./todos.ts";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const app = express();

app.use(express.json());

// --- API ---------------------------------------------------------------

app.get("/api/todos", (_req: Request, res: Response) => {
  res.json(listTodos());
});

app.get("/api/todos/:id", (req: Request, res: Response) => {
  const todo = getTodo(Number(req.params.id));
  if (!todo) return res.status(404).json({ error: "todo not found" });
  res.json(todo);
});

app.post("/api/todos", (req: Request, res: Response) => {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  if (!title) return res.status(400).json({ error: "title is required" });
  res.status(201).json(createTodo(title));
});

app.patch("/api/todos/:id", (req: Request, res: Response) => {
  const changes: { title?: string; done?: boolean } = {};

  if (req.body?.title !== undefined) {
    const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
    if (!title) return res.status(400).json({ error: "title cannot be empty" });
    changes.title = title;
  }
  if (req.body?.done !== undefined) {
    changes.done = Boolean(req.body.done);
  }

  const updated = updateTodo(Number(req.params.id), changes);
  if (!updated) return res.status(404).json({ error: "todo not found" });
  res.json(updated);
});

app.delete("/api/todos/:id", (req: Request, res: Response) => {
  const ok = deleteTodo(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: "todo not found" });
  res.status(204).end();
});

// --- Static web UI -----------------------------------------------------

app.use(express.static(join(projectRoot, "public")));

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`TODO app listening on http://localhost:${PORT}`);
});
