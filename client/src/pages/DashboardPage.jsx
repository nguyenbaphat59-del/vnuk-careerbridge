import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Compass, Sparkles, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlan } from '../hooks';
import { useAuth } from '../auth';
import { GlassCard, Loader, Notice, PageMotion, TaskCard, TimerModal } from '../components';
import { formatMinutes } from '../lib/format';
import { useLanguage } from '../i18n';

function ProgressRing({ percent }) {
  const { t } = useLanguage();
  return <div className="progress-ring" style={{ '--progress': `${percent * 3.6}deg` }}><div className="progress-ring-inner"><strong>{percent}<small>%</small></strong><span>{t('complete')}</span></div></div>;
}

export default function DashboardPage() {
  const { plan, loading, error, refresh } = usePlan();
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState(null);
  const incomplete = useMemo(() => plan?.tasks?.filter((task) => task.status !== 'completed') || [], [plan]);
  if (loading) return <Loader label="Opening your workspace…" />;
  if (error) return <PageMotion className="page-error-panel"><Notice>{error}</Notice><p>{t('Your saved information has not been removed. Check that the backend is running, then try again.')}</p><div className="page-error-actions"><button className="primary-button" onClick={() => refresh().catch(() => {})}>{t('Try again')} <ArrowRight size={16} /></button><button className="soft-button" onClick={() => navigate('/onboarding')}>{t('Review profile')}</button></div></PageMotion>;

  const { progress, todayTasks, profile } = plan;
  const doneToday = todayTasks.length > 0 && todayTasks.every((task) => task.status === 'completed');
  const now = new Date();
  const dateLabel = now.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const greeting = t(now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening');
  const nextTask = incomplete[0];

  return <PageMotion className="dashboard-page">
    <div className="dashboard-welcome"><div><span className="date-kicker"><CalendarDays size={14} /> {dateLabel}</span><h1>{greeting}, {profile.fullName?.split(' ')[0] || (lang === 'vi' ? 'bạn' : 'there')}<span className="greeting-spark">✳</span></h1><p>{t('Let’s keep your internship goal moving, one small step at a time.')}</p></div><button className="soft-button" onClick={() => navigate('/plan')}><Compass size={16} />{t('View roadmap')} <ArrowRight size={15} /></button></div>
    <div className="dashboard-grid">
      <GlassCard className="progress-panel">
        <div className="panel-topline"><div><span className="panel-label">{t('YOUR PROGRESS')}</span><h2>{t('A little further')}<br />{t('than yesterday.')}</h2></div><span className="panel-sticker"><Sparkles size={17} /></span></div>
        <div className="progress-content"><ProgressRing percent={progress.percent} /><div className="progress-details"><span className="progress-small-label">{t('ROADMAP COMPLETION')}</span><div className="progress-number">{progress.completed}<span> / {progress.total} {t('tasks')}</span></div><div className="thin-progress"><span style={{ width: `${progress.percent}%` }} /></div><p>{t(progress.percent === 0 ? 'Your journey starts with one focused session.' : progress.percent < 40 ? 'Good start. Keep your pace gentle and consistent.' : progress.percent < 85 ? 'You’re building real momentum. Keep going.' : 'You’re close to the finish line. Keep it up.')}</p></div></div>
        <div className="progress-footer"><span><span className="tiny-status-dot" /> {t('Personalised for')} {profile.targetRole || profile.major}</span><button className="icon-button subtle-icon" aria-label="Open roadmap" onClick={() => navigate('/plan')}><ArrowRight size={17} /></button></div>
      </GlassCard>
      <GlassCard className="today-panel">
        <div className="today-panel-header"><div><span className="panel-label">{t('YOUR FOCUS, TODAY')}</span><h2>{t('One thing at a time.')}</h2></div><span className="today-date-pill">{lang === 'vi' ? 'NGÀY' : 'DAY'} {nextTask?.dayNumber || progress.total}</span></div>
        {todayTasks.length ? <div className="today-task-list">{todayTasks.map((task) => <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} compact />)}</div> : <div className="today-empty"><span className="today-empty-icon"><CheckCircle2 size={20} /></span><div><b>{doneToday ? t('You’ve done today’s work.') : t('A clear day to make progress.')}</b><p>{doneToday ? t('Take a breath, and come back tomorrow.') : t('Choose a task from your roadmap when you’re ready.')}</p></div></div>}
        <div className="today-footer"><div className="today-time"><Clock3 size={14} /><span>{todayTasks.reduce((sum, task) => sum + (task.status === 'completed' ? 0 : task.durationMins), 0) ? `${formatMinutes(todayTasks.reduce((sum, task) => sum + (task.status === 'completed' ? 0 : task.durationMins), 0))} ${t('planned')}` : t('No time pressure')}</span></div><button className="text-button blue-text" onClick={() => navigate('/plan')}>{t('See all tasks')} <ArrowRight size={14} /></button></div>
      </GlassCard>
    </div>
    <div className="dashboard-lower-grid">
      <GlassCard className="next-step-panel"><div className="compact-panel-heading"><span className="compact-heading-icon"><Target size={17} /></span><div><span className="panel-label">{t('UP NEXT')}</span><h3>{t('Your next useful step')}</h3></div></div>{nextTask ? <div className="next-step-body"><div><span className="skill-chip">{t(nextTask.skill)}</span><h4>{t(nextTask.title)}</h4><p>{t(nextTask.description)}</p></div><div className="next-step-cta"><span><Clock3 size={14} /> {formatMinutes(nextTask.durationMins)}</span><button className="round-arrow-button" onClick={() => setSelectedTask(nextTask)} aria-label="Start next task"><ArrowRight size={17} /></button></div></div> : <div className="all-done-note"><CheckCircle2 size={18} />{t('You’ve completed this roadmap. Review your skills or generate a fresh plan.')}</div>}</GlassCard>
      <GlassCard className="gentle-note-panel"><span className="gentle-note-mark">“</span><p>{t('Progress isn’t about knowing everything. It’s about knowing what to work on next.')}</p><div className="gentle-note-bottom"><span className="note-wave">〰</span><span>{t('A small reminder from VNUK CareerBridge')}</span></div><div className="note-decoration note-decoration-a" /><div className="note-decoration note-decoration-b" /></GlassCard>
    </div>
    {selectedTask && <TimerModal task={selectedTask} onClose={() => setSelectedTask(null)} onChanged={async () => { await refresh(); }} />}
  </PageMotion>;
}
