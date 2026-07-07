import { db } from "./db.ts";

/** A todo as returned by the API (JSON-friendly: `done` is a real boolean). */
export interface Todo {
  id: number;
  title: string;
  done: boolean;
  created_at: string;
}

/** Row shape as stored in SQLite (`done` is 0/1). */
interface TodoRow {
  id: number;
  title: string;
  done: number;
  created_at: string;
}

const toTodo = (row: TodoRow): Todo => ({
  id: row.id,
  title: row.title,
  done: row.done === 1,
  created_at: row.created_at,
});

export function listTodos(): Todo[] {
  const rows = db
    .prepare("SELECT * FROM todos ORDER BY created_at DESC, id DESC")
    .all() as unknown as TodoRow[];
  return rows.map(toTodo);
}

export function getTodo(id: number): Todo | undefined {
  const row = db
    .prepare("SELECT * FROM todos WHERE id = ?")
    .get(id) as unknown as TodoRow | undefined;
  return row ? toTodo(row) : undefined;
}

export function createTodo(title: string): Todo {
  const info = db
    .prepare("INSERT INTO todos (title) VALUES (?)")
    .run(title);
  return getTodo(Number(info.lastInsertRowid))!;
}

/** Partial update. Returns the updated todo, or undefined if the id is unknown. */
export function updateTodo(
  id: number,
  changes: { title?: string; done?: boolean },
): Todo | undefined {
  const existing = getTodo(id);
  if (!existing) return undefined;

  const title = changes.title ?? existing.title;
  const done = changes.done ?? existing.done;
  db.prepare("UPDATE todos SET title = ?, done = ? WHERE id = ?").run(
    title,
    done ? 1 : 0,
    id,
  );
  return getTodo(id);
}

/** Returns true if a row was deleted, false if the id was not found. */
export function deleteTodo(id: number): boolean {
  const info = db.prepare("DELETE FROM todos WHERE id = ?").run(id);
  return info.changes > 0;
}
