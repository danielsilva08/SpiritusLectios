import Database from 'better-sqlite3';

const db = new Database('./dev.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    published_year INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const stmt = db.prepare(`
  INSERT INTO books (title, author, published_year)
  VALUES (:title, :author, :published_year)
`);

const info = stmt.run({
  title: 'Nome do Livro',
  author: 'Nome do Autor',
  published_year: 2024,
});

console.log('Tabela books criada (ou já existia).');
db.close();