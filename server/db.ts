import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg'; // Use a importação padrão para compatibilidade com CJS
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

// Acessa a classe Pool através da propriedade do objeto importado
const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
