import { users, books, type User, type InsertUser, type Book, type InsertBook } from "@shared/schema";
import { randomUUID } from "crypto";
import path from "path";
import { db } from "./db";
import bcrypt from "bcrypt";
import { eq, or, ilike, desc } from "drizzle-orm";

export const dbPath = path.join(process.cwd(), "db.sqlite");
export const dbDir = path.dirname(dbPath);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllBooks(): Promise<Book[]>;
  getBook(id: string): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: string, book: Partial<InsertBook>): Promise<Book | undefined>;
  deleteBook(id: string): Promise<boolean>;
  searchBooks(query: string): Promise<Book[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private books: Map<string, Book>;

  constructor() {
    this.users = new Map();
    this.books = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllBooks(): Promise<Book[]> {
    return Array.from(this.books.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getBook(id: string): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = randomUUID();
    const now = new Date();
    const book: Book = { 
      ...insertBook, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.books.set(id, book);
    return book;
  }

  async updateBook(id: string, updateData: Partial<InsertBook>): Promise<Book | undefined> {
    const book = this.books.get(id);
    if (!book) return undefined;

    const updatedBook: Book = {
      ...book,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.books.set(id, updatedBook);
    return updatedBook;
  }

  async deleteBook(id: string): Promise<boolean> {
    return this.books.delete(id);
  }

  async searchBooks(query: string): Promise<Book[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.books.values()).filter(book =>
      book.name.toLowerCase().includes(lowerQuery) ||
      book.author.toLowerCase().includes(lowerQuery) ||
      book.isbn.toLowerCase().includes(lowerQuery)
    );
  }
}

// Database Storage implementation using PostgreSQL
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10); // Gera o hash da senha
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword }) // Salva o hash
      .returning();
    return user;
  }

  async getAllBooks(): Promise<Book[]> {
    return await db
      .select()
      .from(books)
      .orderBy(desc(books.createdAt));
  }

  async getBook(id: string): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book || undefined;
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const [book] = await db
      .insert(books)
      .values(insertBook)
      .returning();
    return book;
  }

  async updateBook(id: string, updateData: Partial<InsertBook>): Promise<Book | undefined> {
    const [updatedBook] = await db
      .update(books)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(books.id, id))
      .returning();
    return updatedBook || undefined;
  }

  async deleteBook(id: string): Promise<boolean> {
    // Otimização: executa a exclusão e verifica se alguma linha foi afetada.
    // Isso evita uma consulta SELECT extra para verificar a existência.
    // O objeto de resultado do Drizzle varia por driver, mas para `node-postgres` e `better-sqlite3`,
    // podemos verificar `rowCount` ou `changes` para confirmar a exclusão.
    const result = await db.delete(books).where(eq(books.id, id));
    return (result as any).rowCount > 0 || (result as any).changes > 0;
  }

  async searchBooks(query: string): Promise<Book[]> {
    const searchPattern = `%${query}%`;
    return await db
      .select()
      .from(books)
      .where(
        or(
          ilike(books.name, searchPattern),
          ilike(books.author, searchPattern),
          ilike(books.isbn, searchPattern)
        )
      )
      .orderBy(desc(books.createdAt));
  }
}

export const storage = new DatabaseStorage();
