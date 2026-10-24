import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { findUser, publicUser, readDb, writeDb } from '../store.js';
import { authRequired } from '../middleware.js';

const router = Router();
const secret = () => process.env.JWT_SECRET || 'internpath-demo-secret-change-me';
const makeToken = (user) => jwt.sign({ sub: user.id }, secret(), { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
  if (password.length < 8) return res.status(400).json({ message: 'Use a password with at least 8 characters.' });
  const db = readDb();
  if (db.users.some((user) => user.email === email)) return res.status(409).json({ message: 'An account with this email already exists.' });
  const user = {
    id: crypto.randomUUID(), email,
    passwordHash: await bcrypt.hash(password, 10),
    profile: null, analysis: null, tasks: [],
    createdAt: new Date().toISOString(), resetToken: null, resetTokenExpiresAt: null
  };
  db.users.push(user);
  writeDb(db);
  return res.status(201).json({ token: makeToken(user), user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const db = readDb();
  const user = db.users.find((item) => item.email === email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Email or password is incorrect.' });
  return res.json({ token: makeToken(user), user: publicUser(user) });
});

router.get('/me', authRequired, (req, res) => {
  const user = findUser(readDb(), req.userId);
  res.json({ user: publicUser(user) });
});

router.post('/forgot-password', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const db = readDb();
  const user = db.users.find((item) => item.email === email);
  if (!user) return res.json({ message: 'If the email is registered, a reset link would be sent. In demo mode, no email is sent.' });
  user.resetToken = crypto.randomBytes(24).toString('hex');
  user.resetTokenExpiresAt = Date.now() + 15 * 60 * 1000;
  writeDb(db);
  return res.json({ message: 'Demo reset token generated. No email was sent.', demoToken: user.resetToken });
});

router.post('/reset-password', async (req, res) => {
  const token = String(req.body.token || '').trim();
  const password = String(req.body.password || '');
  if (password.length < 8) return res.status(400).json({ message: 'Use a password with at least 8 characters.' });
  const db = readDb();
  const user = db.users.find((item) => item.resetToken === token && item.resetTokenExpiresAt > Date.now());
  if (!user) return res.status(400).json({ message: 'This reset token is invalid or has expired. Request a new one.' });
  user.passwordHash = await bcrypt.hash(password, 10);
  user.resetToken = null;
  user.resetTokenExpiresAt = null;
  writeDb(db);
  return res.json({ message: 'Password reset successfully. You can now sign in.' });
});

router.post('/change-password', authRequired, async (req, res) => {
  const currentPassword = String(req.body.currentPassword || '');
  const newPassword = String(req.body.newPassword || '');
  if (newPassword.length < 8) return res.status(400).json({ message: 'New password must have at least 8 characters.' });
  const db = readDb();
  const user = findUser(db, req.userId);
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) return res.status(400).json({ message: 'Current password is incorrect.' });
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  writeDb(db);
  return res.json({ message: 'Password changed successfully.' });
});

router.delete('/account', authRequired, (req, res) => {
  const db = readDb();
  db.users = db.users.filter((user) => user.id !== req.userId);
  writeDb(db);
  return res.json({ message: 'Your demo account and its data have been deleted.' });
});

export default router;
