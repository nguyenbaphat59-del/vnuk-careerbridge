import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(here, '../data/db.json');

export function readDb() {
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({ users: [] }, null, 2));
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

export function writeDb(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

export function findUser(db, id) {
  return db.users.find((user) => user.id === id);
}

export function publicUser(user) {
  if (!user) return null;
  const { passwordHash, resetToken, resetTokenExpiresAt, ...safeUser } = user;
  return safeUser;
}
