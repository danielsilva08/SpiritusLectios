import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { insertBookSchema, loginSchema } from "@shared/schema";
import { z } from "zod";
import createError from "http-errors";

declare module "express-session" {
  interface SessionData {
    authenticated?: boolean;
  }
}

interface HttpError extends Error {
  status?: number;
  errors?: any;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || "spiritus-lectoris-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
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
      
      if (password === "8847583") {
        req.session.authenticated = true;
        res.json({ success: true, message: "Login successful" });
      } else {
        res.status(401).json({ message: "Invalid password" });
      }
    } catch (error) {
      next(error);
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res, next) => {
    req.session.destroy((err) => {
      if (err) {
        return next(createError(500, "Could not log out"));
      } else {
        res.json({ message: "Logout successful" });
      }
    });
  });

  // Check authentication status
  app.get("/api/auth/status", (req, res) => {
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
      next(createError(500, "Failed to retrieve books", { cause: error }));
    }
  });

  app.post("/api/books", requireAuth, async (req, res, next) => {
    try {
      const bookData = insertBookSchema.parse(req.body);
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid book data", errors: error.errors });
      } else {
        next(createError(500, "Failed to create book", { cause: error }));
      }
    }
  });

  app.put("/api/books/:id", requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const bookData = insertBookSchema.partial().parse(req.body);
      const book = await storage.updateBook(Number(id), bookData);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid book data", errors: error.errors });
      } else {
        next(createError(500, "Failed to update book", { cause: error }));
      }
    }
  });

  app.delete("/api/books/:id", requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBook(Number(id));
      
      if (!deleted) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.json({ message: "Book deleted successfully" });
    } catch (error) {
      next(createError(500, "Failed to delete book", { cause: error }));
    }
  });

  // Statistics endpoint
  app.get("/api/books/stats", requireAuth, async (req, res, next) => {
    try {
      const books = await storage.getAllBooks();
      const uniqueAuthors = Array.from(new Set(books.map(b => b.author)));
      const today = new Date().toDateString();
      const todayBooks = books.filter(b => new Date(b.createdAt).toDateString() === today);
      
      // Author frequency
      const authorCounts: Record<string, number> = {};
      books.forEach(book => {
        authorCounts[book.author] = (authorCounts[book.author] || 0) + 1;
      });
      
      const frequentAuthors = Object.entries(authorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([author, count]) => ({ author, count }));

      res.json({
        totalBooks: books.length,
        uniqueAuthors: uniqueAuthors.length,
        todayBooks: todayBooks.length,
        uniqueISBNs: Array.from(new Set(books.map(b => b.isbn))).length,
        frequentAuthors,
        recentBooks: books.slice(0, 5)
      });
    } catch (error) {
      next(createError(500, "Failed to retrieve statistics", { cause: error }));
    }
  });

  // Centralized error handler
  app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    // Log the full error for debugging
    console.error(`[${new Date().toISOString()}] ERROR on ${req.method} ${req.originalUrl}:`, err);

    // Handle Zod validation errors
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid request data", errors: err.errors });
    }

    // Handle http-errors
    if (createError.isHttpError(err)) {
      return res.status(err.status).json({ message: err.message });
    }

    // Default to 500 for any other errors
    const statusCode = err.status || 500;
    res.status(statusCode).json({ message: err.message || "Internal Server Error" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
