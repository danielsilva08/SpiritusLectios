import {
  sqliteTable,
  text,
  integer,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const books = sqliteTable("books", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  author: text("author").notNull(),
  isbn: text("isbn").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$onUpdate(() => new Date())
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
