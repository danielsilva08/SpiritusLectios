import { db } from './db';
import { books, users } from '@shared/schema';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('Seeding database...');

  // Garante que o usuário 'admin' exista e tenha a senha correta
  const adminUser = await db.query.users.findFirst({ where: (users, { eq }) => eq(users.username, 'admin') });
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || '8847583', 10);

  if (!adminUser) {
    await db.insert(users).values({
      username: 'admin',
      password: hashedPassword,
    });
    console.log('Admin user created.');
  } else {
    // Atualiza a senha do admin se ele já existir
    await db.update(users).set({ password: hashedPassword }).where(eq(users.username, 'admin'));
    console.log('Admin user password updated.');
  }

  // Seed a book if none exist
  const bookCount = await db.select().from(books).then(res => res.length);
  if (bookCount === 0) {
    await db.insert(books).values({
      name: 'O Alquimista',
      author: 'Paulo Coelho',
      isbn: '978-85-8235-589-3',
    });
    console.log('Initial book seeded.');
  }

  console.log('Database seeding complete.');
}

main().catch(console.error);