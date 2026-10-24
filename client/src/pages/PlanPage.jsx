import { useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, CheckCircle2, ChevronDown, CircleDashed, Clock3, Layers3, Sparkles, Target } from 'lucide-react';
import { usePlan } from '../hooks';
import { useAuth } from '../auth';
import { GlassCard, Loader, Notice, PageMotion, TaskCard, TimerModal } from '../components';
import { formatMinutes } from '../lib/format';
import RadarChart, { calculateSkillValues } from '../RadarChart';
import { useLanguage } from '../i18n';

export default function PlanPage() {
  const { plan, loading, error, refresh } = usePlan();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [view, setView] = useState('week');
  const [showAllGaps, setShowAllGaps] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCompleted, setShowCompleted] = useState(true);

  const nextTask = useMemo(() => plan?.tasks?.find((task) => task.status !== 'completed'), [plan]);
  if (loading) return <Loader label="Putting your roadmap together…" />;
  if (error) return <PageMotion className="page-error-panel"><Notice>{error}</Notice><p>{t('Your saved information has not been removed. Check that the backend is running, then try again.')}</p><div className="page-error-actions"><button className="primary-button" onClick={() => refresh().catch(() => {})}>{t('Try again')} <ArrowRight size={16} /></button></div></PageMotion>;
  const { analysis, tasks, profile, progress } = plan;
  const activeWeek = nextTask?.weekNumber || 1;
  const activeMonth = nextTask?.monthNumber || 1;
  let shownTasks = view === 'today'
    ? plan.todayTasks
    : view === 'month'
      ? tasks.filter((task) => task.monthNumber === activeMonth)
      : tasks.filter((task) => task.weekNumber === activeWeek);
  if (!showCompleted) shownTasks = shownTasks.filter((task) => task.status !== 'completed');
  const doneInView = shownTasks.filter((task) => task.status === 'completed').length;
  const visibleGaps = showAllGaps ? analysis.gaps : analysis.gaps.slice(0, 4);

  return <PageMotion className="plan-page">
    <div className="page-heading-row"><div><span className="eyebrow"><Sparkles size={13} /> {t('YOUR PERSONAL ROADMAP')}</span><h1>{t('Make your next move')} <em>{t('clear.')}</em></h1><p>{t('A practical path toward')} {profile.targetRole || `${profile.major} opportunities`}, {t('built around your current skills and time.')}</p></div><div className="plan-heading-meta"><span className="plan-meta-icon"><CalendarDays size={16} /></span><span><b>{profile.timelineMonths} {t(Number(profile.timelineMonths) === 1 ? '1 month' : 'months')}</b><small>{t('your planned timeline')}</small></span></div></div>
    <div className="plan-overview-grid">
      <GlassCard className="analysis-panel"><div className="section-title-row"><span className="section-icon"><Target size={18} /></span><div><span className="panel-label">{t('SKILL GAP SNAPSHOT')}</span><h2>{t(analysis.headline)}</h2></div><span className="ai-demo-label"><Sparkles size={12} /> {t('Demo AI')}</span></div><p className="analysis-summary">{t(analysis.summary)}</p>
        <div className="analysis-columns"><div className="analysis-column strength-column"><h3><span className="strength-dot" /> {t('What’s working')}</h3><ul>{analysis.strengths.map((item, i) => <li key={i}><CheckCircle2 size={15} /> <span>{t(item)}</span></li>)}</ul></div><div className="analysis-column gap-column"><h3><span className="gap-dot" /> {t('What to strengthen')}</h3><ul>{analysis.weaknesses.map((item, i) => <li key={i}><span className="gap-line" /> <span>{t(item)}</span></li>)}</ul></div></div>
        {analysis.jdKeywords?.length > 0 && <div className="jd-keywords"><span>{t('JD signals')}</span>{analysis.jdKeywords.map((word) => <span className="keyword-chip" key={word}>{word}</span>)}</div>}
      </GlassCard>
      <GlassCard className="priority-panel"><div className="priority-heading"><span className="panel-label">{t('FOCUS AREAS')}</span><span className="priority-count">{analysis.gaps.length} {t('skills')}</span></div><p>{t('Start with the foundations that will make the biggest difference.')}</p><div className="priority-list">{visibleGaps.map((gap, index) => <div className="priority-item" key={gap.skill}><span className={`priority-index priority-${gap.priority.toLowerCase().replace(' ', '-')}`}>{String(index + 1).padStart(2, '0')}</span><div><b>{t(gap.skill)}</b><small>{t(gap.description)}</small></div><span className={`priority-tag priority-tag-${gap.priority.toLowerCase().replace(' ', '-')}`}>{t(gap.priority)}</span></div>)}</div>{analysis.gaps.length > 4 && <button className="text-button priority-more" onClick={() => setShowAllGaps((show) => !show)}>{showAllGaps ? t('Show fewer skills') : `${t('See all')} ${analysis.gaps.length} ${t('areas')}`} <ChevronDown size={14} className={showAllGaps ? 'rotate-chevron' : ''} /></button>}</GlassCard>
    </div>
    <GlassCard className="roadmap-radar-panel"><div className="roadmap-radar-copy"><span className="panel-label">{t('READINESS RADAR')}</span><h2>{t('Your skill profile')}</h2><p>{t('This radar is a demo estimate generated from your profile text and is not a validated test.')}</p><span className="radar-readiness-chip"><Sparkles size={13} /> {t('ESTIMATED SKILL BALANCE')}</span></div><RadarChart values={calculateSkillValues(profile)} compact /></GlassCard>
    <GlassCard className="timeline-panel"><div className="timeline-header"><div><span className="panel-label">{t('YOUR DAILY PRACTICE')}</span><h2>{t('Steady beats scattered.')}</h2><p>{t('Small, focused tasks — adjusted to the time you can give each day.')}</p></div><div className="timeline-progress-mini"><span>{progress.percent}% {t('complete')}</span><div className="thin-progress"><span style={{ width: `${progress.percent}%` }} /></div></div></div>
      <div className="timeline-controls"><div className="view-tabs"><button className={view === 'today' ? 'selected' : ''} onClick={() => setView('today')}>{t('Today')}</button><button className={view === 'week' ? 'selected' : ''} onClick={() => setView('week')}>{t('Week')} {activeWeek}</button><button className={view === 'month' ? 'selected' : ''} onClick={() => setView('month')}>{t('Month')} {activeMonth}</button></div><label className="completed-toggle"><input type="checkbox" checked={showCompleted} onChange={(e) => setShowCompleted(e.target.checked)} /> {t('Show completed')}</label></div>
      <div className="timeline-list"><div className="timeline-list-heading"><span>{view === 'today' ? t('TODAY’S TASKS') : view === 'month' ? `${t('Month').toUpperCase()} ${activeMonth}` : `${t('Week').toUpperCase()} ${activeWeek}`}</span><span>{doneInView} / {shownTasks.length} {t('complete')}</span></div>{shownTasks.length ? shownTasks.map((task) => <div className="timeline-task-wrap" key={task.id}><div className={`timeline-node ${task.status === 'completed' ? 'node-complete' : task.status === 'in_progress' ? 'node-progress' : ''}`}>{task.status === 'completed' ? <CheckCircle2 size={14} /> : task.status === 'in_progress' ? <Clock3 size={13} /> : <CircleDashed size={13} />}</div><TaskCard task={task} onClick={() => setSelectedTask(task)} /></div>) : <div className="timeline-empty"><Layers3 size={19} /><span>{t('No tasks in this view. Try another time range.')}</span></div>}</div>
      <div className="timeline-foot"><span><Clock3 size={14} /> {t('About')} {formatMinutes(profile.dailyMinutes)} {t('available each day')}</span><span><Sparkles size={13} /> {t('Generated for your current level')}</span></div>
    </GlassCard>
    <div className="plan-disclaimer"><Sparkles size={14} /><span>{t('This is a demo AI assessment based on your profile text and common role expectations. It’s a useful starting point, not a hiring prediction.')}</span></div>
    {selectedTask && <TimerModal task={selectedTask} onClose={() => setSelectedTask(null)} onChanged={refresh} />}
  </PageMotion>;
}
