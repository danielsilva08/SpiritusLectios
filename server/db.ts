import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";
import path from "node:path";
import fs from "node:fs";

const dbPath = process.env.DATABASE_URL || "./dev.db";

// Garante que o diretório do banco de dados exista antes de criar a conexão.
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
