import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Resolve the data directory relative to the project root (one level up from src/).
const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(projectRoot, "data");
mkdirSync(dataDir, { recursive: true });

const dbPath = process.env.TODO_DB ?? join(dataDir, "todos.db");

// Synchronous SQLite via Node's built-in module — no native compilation needed.
export const db = new DatabaseSync(dbPath);

// Idempotent schema. `done` is stored as 0/1 since SQLite has no native boolean.
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    done       INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  )
`);
