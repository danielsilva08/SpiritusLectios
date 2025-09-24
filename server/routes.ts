import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import path, { dirname } from "path";
import session from "express-session";
import PgSimple from "connect-pg-simple";
import { storage } from "./storage";
import { insertBookSchema, loginSchema, type Book } from "@shared/schema";
import { z } from "zod";
import { promisify } from "util";
import createHttpError from "http-errors";
import express from "express";
import bcrypt from "bcrypt";
import { pool } from "./db";

declare module "express-session" {
  interface SessionData {
    authenticated?: boolean;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configuração para servir arquivos estáticos do cliente React em produção
  const isProduction = process.env.NODE_ENV === "production";
  if (process.env.NODE_ENV === "production") {
    const clientDistPath = path.join(process.cwd(), "client", "dist");
    app.use(express.static(clientDistPath));
  }
  const PgStore = PgSimple(session);

  // Session configuration
  app.use(session({
    store: new PgStore({ pool }),
    secret: process.env.SESSION_SECRET || "spiritus-lectoris-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.authenticated) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Login endpoint
  app.post("/api/auth/login", async (req, res, next) => {
    try {
      const { password } = loginSchema.parse(req.body);
      const username = "admin"; // Username fixo, já que a UI não o solicita
      
      const user = await storage.getUserByUsername(username);

      // Compara a senha fornecida com o hash armazenado de forma segura
      if (user && await bcrypt.compare(password, user.password)) {
        req.session.authenticated = true;
        res.json({ success: true, message: "Login successful" });
      } else {
        next(createHttpError(401, "Invalid username or password"));
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(createHttpError(400, "Invalid login data", { cause: error.errors }));
      }
      next(error);
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", async (req, res, next) => {
    try {
      // Promisify destroy to use async/await for cleaner error handling
      const destroySession = promisify(req.session.destroy.bind(req.session));
      await destroySession();
      res.status(204).send(); // 204 No Content is more appropriate for a successful logout
    } catch (err) {
      next(createHttpError(500, "Could not log out", { cause: err }));
    }
  });

  // Check authentication status
  app.get("/api/auth/status", (req, res) => {
    // Desabilita o cache para este endpoint sensível.
    // Isso garante que o cliente sempre obtenha o status de autenticação atual.
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    res.json({ authenticated: !!req.session.authenticated });
  });

  // Books CRUD endpoints
  app.get("/api/books", requireAuth, async (req, res, next) => {
    try {
      const { search } = req.query;
      let books;
      
      if (search && typeof search === 'string') {
        books = await storage.searchBooks(search);
      } else {
        books = await storage.getAllBooks();
      }
      
      res.json(books);
    } catch (error) {
      next(createHttpError(500, "Failed to retrieve books", { cause: error }));
    }
  });

  app.post("/api/books", requireAuth, async (req, res, next) => {
    try {
      const bookData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(createHttpError(400, "Invalid book data", { cause: error.errors }));
      }
      next(createHttpError(500, "Failed to create book", { cause: error }));
    }
  });

  app.put("/api/books/:id", requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const bookData = insertBookSchema.partial().parse(req.body);
      const book = await storage.updateBook(id, bookData);
      
      if (!book) {
        return next(createHttpError(404, "Book not found"));
      }
      
      res.json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return next(createHttpError(400, "Invalid book data", { cause: error.errors }));
      }
      next(createHttpError(500, "Failed to update book", { cause: error }));
    }
  });

  app.delete("/api/books/:id", requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBook(id);
      
      if (!deleted) {
        return next(createHttpError(404, "Book not found"));
      }
      
      res.status(204).send(); // 204 No Content é mais apropriado para um delete bem-sucedido
    } catch (error) {
      next(createHttpError(500, "Failed to delete book", { cause: error }));
    }
  });

  // Statistics endpoint
  app.get("/api/books/stats", requireAuth, async (req, res, next) => {
    try {
      const books = await storage.getAllBooks();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayBooks = books.filter(b => b.createdAt >= today);
      
      const authorCounts = books.reduce((acc: Record<string, number>, book: Book) => {
        acc[book.author] = (acc[book.author] || 0) + 1;
        return acc;
      }, {});

      res.json({
        totalBooks: books.length,
        uniqueAuthors: Object.keys(authorCounts).length,
        todayBooks: todayBooks.length,
        uniqueISBNs: Array.from(new Set(books.map(b => b.isbn))).length,
        frequentAuthors: Object.entries(authorCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([author, count]) => ({ author, count })),
        recentBooks: books.slice(0, 5)
      });
    } catch (error) {
      next(createHttpError(500, "Failed to retrieve statistics", { cause: error }));
    }
  });

  // Centralized error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: err.flatten().fieldErrors });
    }
    
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  // Em produção, qualquer rota que não seja da API deve servir o index.html do React
  // Isso é crucial para o roteamento do lado do cliente (wouter) funcionar corretamente.
  if (process.env.NODE_ENV === "production") {
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), "client", "dist", "index.html"));
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
