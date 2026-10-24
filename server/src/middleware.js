import jwt from 'jsonwebtoken';
import { findUser, readDb } from './store.js';

export function authRequired(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'internpath-demo-secret-change-me');
    const user = findUser(readDb(), payload.sub);
    if (!user) return res.status(401).json({ message: 'This account no longer exists. Please sign in again.' });
    req.userId = user.id;
    return next();
  } catch {
    return res.status(401).json({ message: 'Your session expired. Please sign in again.' });
  }
}
