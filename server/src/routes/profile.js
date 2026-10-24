import { Router } from 'express';
import { authRequired } from '../middleware.js';
import { findUser, publicUser, readDb, writeDb } from '../store.js';
import { buildPlan } from '../services.js';

const router = Router();
router.use(authRequired);

function normaliseProfile(body) {
  return {
    fullName: String(body.fullName || '').trim(),
    age: body.age === '' || body.age == null ? '' : Number(body.age),
    major: String(body.major || '').trim(),
    targetRole: String(body.targetRole || '').trim(),
    interests: String(body.interests || '').trim(),
    currentSkills: String(body.currentSkills || '').trim(),
    careerGoal: String(body.careerGoal || '').trim(),
    jobDescription: String(body.jobDescription || '').trim(),
    timelineMonths: Math.max(1, Math.min(6, Number(body.timelineMonths) || 1)),
    dailyMinutes: Math.max(10, Math.min(240, Number(body.dailyMinutes) || 45)),
    targetHireDate: String(body.targetHireDate || '').trim()
  };
}

router.get('/', (req, res) => {
  const user = findUser(readDb(), req.userId);
  res.json({ profile: user.profile, analysis: user.analysis });
});

router.post('/', (req, res) => {
  const profile = normaliseProfile(req.body);
  if (!profile.fullName || !profile.major) return res.status(400).json({ message: 'Please enter your name and field of study.' });
  if (profile.age && (profile.age < 14 || profile.age > 100)) return res.status(400).json({ message: 'Please enter a valid age.' });
  if (profile.targetHireDate && Number.isNaN(Date.parse(profile.targetHireDate))) return res.status(400).json({ message: 'Please enter a valid target date.' });
  const db = readDb();
  const user = findUser(db, req.userId);
  const plan = buildPlan(profile);
  user.profile = profile;
  user.analysis = plan.analysis;
  user.tasks = plan.tasks;
  user.planGeneratedAt = new Date().toISOString();
  writeDb(db);
  return res.json({ user: publicUser(user), profile: user.profile, analysis: user.analysis, tasks: user.tasks });
});

export default router;
