import { Router } from 'express';
import { authRequired } from '../middleware.js';
import { findUser, readDb, writeDb } from '../store.js';
import { localDateKey } from '../services.js';

const router = Router();
router.use(authRequired);

router.get('/', (req, res) => {
  const user = findUser(readDb(), req.userId);
  if (!user.profile || !user.analysis) return res.status(409).json({ message: 'Complete your profile to generate a learning plan.', needsOnboarding: true });
  const total = user.tasks.length;
  const completed = user.tasks.filter((task) => task.status === 'completed').length;
  const today = localDateKey(new Date());
  let todayTasks = user.tasks.filter((task) => task.dueDate === today);
  if (!todayTasks.length) {
    const nextTask = user.tasks.find((task) => task.status !== 'completed');
    if (nextTask) todayTasks = [nextTask];
  }
  return res.json({
    profile: user.profile,
    analysis: user.analysis,
    tasks: user.tasks,
    progress: { total, completed, percent: total ? Math.round((completed / total) * 100) : 0 },
    todayTasks,
    planGeneratedAt: user.planGeneratedAt
  });
});

router.patch('/tasks/:taskId/start', (req, res) => {
  const db = readDb();
  const user = findUser(db, req.userId);
  const task = user.tasks.find((item) => item.id === req.params.taskId);
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  if (task.status === 'completed') return res.status(400).json({ message: 'This task has already been completed.' });
  task.status = 'in_progress';
  task.startedAt = new Date().toISOString();
  writeDb(db);
  return res.json({ task });
});

router.patch('/tasks/:taskId/complete', (req, res) => {
  const db = readDb();
  const user = findUser(db, req.userId);
  const task = user.tasks.find((item) => item.id === req.params.taskId);
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  task.status = 'completed';
  task.completedAt = new Date().toISOString();
  writeDb(db);
  return res.json({ task });
});

router.patch('/tasks/:taskId/reset', (req, res) => {
  const db = readDb();
  const user = findUser(db, req.userId);
  const task = user.tasks.find((item) => item.id === req.params.taskId);
  if (!task) return res.status(404).json({ message: 'Task not found.' });
  task.status = 'todo';
  task.startedAt = null;
  task.completedAt = null;
  writeDb(db);
  return res.json({ task });
});

export default router;
