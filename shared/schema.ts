import {
  pgTable,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const books = pgTable("books", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  author: text("author").notNull(),
  isbn: text("isbn").notNull(),
  createdAt: timestamp("created_at", { mode: "date" })
    .default(sql`now()`)
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }) // O gatilho do banco de dados cuidará da atualização
    .notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBookSchema = createInsertSchema(books, {
  name: z.string().min(1, "O nome do livro é obrigatório."),
  author: z.string().min(1, "O autor é obrigatório."),
  isbn: z
    .string()
    .min(1, "O ISBN é obrigatório.")
    .regex(/^[0-9-]{10,17}$/, "ISBN inválido."),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const legacyLoginSchema = z.object({
  username: z.string().min(1, "O nome de usuário é obrigatório."),
  password: z.string().min(1, "A senha é obrigatória."),
});

export const loginSchema = z.object({
  password: z.string().min(1, "A senha é obrigatória."),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;
export type LoginRequest = z.infer<typeof legacyLoginSchema>;
