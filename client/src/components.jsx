import { Component, useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, CheckCircle2, Clock3, Compass, LayoutDashboard, LogOut, Menu, Pause, Play, Sparkles, Target, X, UserRound, CalendarDays, RotateCcw, AlertCircle, LoaderCircle } from 'lucide-react';
import { useAuth } from './auth';
import { api } from './lib/api';
import { formatCountdown, formatMinutes, getInitials } from './lib/format';
import { useLanguage, LanguageSwitch } from './i18n';

export function PageMotion({ children, className = '' }) {
  return <motion.div
    className={className}
    initial={{ opacity: 0, y: 8, scale: 0.997 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -5, scale: 0.998 }}
    transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
  >{children}</motion.div>;
}

class RouteContentBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('VNUK CareerBridge route content failed to render:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    const isVietnamese = this.props.lang === 'vi';
    return <div className="route-empty-state route-error-state" role="alert">
      <span className="eyebrow">VNUK CareerBridge</span>
      <h2>{isVietnamese ? 'Không thể hiển thị nội dung trang' : 'This page could not be displayed'}</h2>
      <p>{isVietnamese ? 'Ứng dụng vẫn đang chạy, nhưng phần nội dung gặp lỗi khi render. Hãy tải lại trang để thử lại.' : 'The workspace is still running, but this section encountered a rendering error. Reload the page to try again.'}</p>
      <code>{String(this.state.error?.message || 'Unknown rendering error')}</code>
      <button className="soft-button" onClick={() => window.location.reload()}>{isVietnamese ? 'Tải lại trang' : 'Reload page'} <ArrowRight size={15} /></button>
    </div>;
  }
}

export function GlassCard({ children, className = '', ...props }) {
  return <section className={`glass-card ${className}`} {...props}>{children}</section>;
}

export function Loader({ label = 'Getting things ready…' }) {
  const { t } = useLanguage();
  return <motion.div className="loading-state" role="status" aria-live="polite" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
    <span className="loading-state-icon"><LoaderCircle size={22} className="spin" /></span>
    <span className="loading-state-copy">{t(label)}</span>
    <span className="loading-state-hint">{t('Just a moment while your workspace loads.')}</span>
  </motion.div>;
}

export function Notice({ type = 'error', children }) {
  const { t } = useLanguage();
  if (!children) return null;
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;
  const content = typeof children === 'string' ? t(children) : children;
  return <div className={`notice notice-${type}`}><Icon size={16} /> <span>{content}</span></div>;
}

export function Field({ label, hint, ...props }) {
  const { t } = useLanguage();
  return <label className="field"><span>{t(label)}</span><input {...props} />{hint && <small>{t(hint)}</small>}</label>;
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const nav = [
    { to: '/dashboard', label: 'Overview', sub: 'Your daily focus', icon: LayoutDashboard },
    { to: '/plan', label: 'My roadmap', sub: 'Skills & next steps', icon: Compass },
    { to: '/profile', label: 'Profile & settings', sub: 'Your starting point', icon: UserRound }
  ];
  const exit = () => { logout(); navigate('/login'); };
  const location = useLocation();
  // Capture the matched route element before animating it. Keeping <Outlet />
  // inside AnimatePresence can leave the transition shell empty after navigation.
  const outlet = useOutlet();
  const active = nav.find((item) => item.to === location.pathname) || nav[0];

  return <div className="app-shell">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="ambient ambient-three" />
    <aside className="sidebar" aria-label={t('YOUR SPACE')}>
      <div className="sidebar-label">{t('YOUR SPACE')}</div>
      <nav className="space-tiles">
        {nav.map(({ to, label, sub, icon: Icon }, index) => <NavLink key={to} to={to} className={({ isActive }) => `space-tile ${isActive ? 'active' : ''}`}>
          {({ isActive }) => <>
            {isActive && <motion.span layoutId="dock-active-glass" className="dock-selected-glass" transition={{ type: 'spring', stiffness: 360, damping: 32, mass: .72 }} />}
            <motion.span className="space-tile-icon" whileTap={{ scale: .88, rotate: -5 }}><Icon size={22} strokeWidth={1.8} /></motion.span>
            <span className="space-tile-copy"><b>{t(label)}</b><small>{t(sub)}</small></span>
            <span className="dock-index">0{index + 1}</span>
          </>}
        </NavLink>)}
      </nav>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <NavLink to="/dashboard" className="brand-lockup topbar-brand" aria-label="VNUK CareerBridge home"><span className="brand-mark"><Compass size={19} strokeWidth={2.1} /></span><span className="brand-name"><strong>VNUK</strong><span>CareerBridge</span></span></NavLink>
        <div className="breadcrumb"><span>{t('Workspace')}</span><span className="breadcrumb-dot">/</span><strong>{t(active.label)}</strong></div>
        <div className="topbar-right"><span className="status-pill"><i /> {t('Demo mode')}</span><LanguageSwitch compact /><button className="account-switch-top" onClick={exit} title={t('Switch account')} aria-label={t('Switch account')}><span className="avatar avatar-small">{getInitials(user?.profile?.fullName || user?.email)}</span><span className="account-top-copy">{t('Switch account')}</span><LogOut size={15} /></button></div>
      </header>
      <div className="page-content page-transition-shell" key={location.pathname}>
        <RouteContentBoundary key={location.pathname} lang={lang}>
          {outlet || <div className="route-empty-state"><b>{t('This page could not be displayed.')}</b><p>{t('Please refresh the page or return to Overview.')}</p><button className="soft-button" onClick={() => navigate('/dashboard')}>{t('Overview')} <ArrowRight size={15} /></button></div>}
        </RouteContentBoundary>
      </div>
      <footer className="app-footer"><span>{t('Made for your next chapter.')}</span><span>VNUK CareerBridge <i>·</i> {t('Demo workspace')}</span></footer>
    </main>
  </div>;
}

export function TaskCard({ task, onClick, compact = false }) {
  const { t } = useLanguage();
  const completed = task.status === 'completed';
  const inProgress = task.status === 'in_progress';
  return <motion.button layout whileHover={{ y: -2 }} whileTap={{ scale: 0.988 }} className={`task-card ${compact ? 'task-card-compact' : ''} ${completed ? 'task-completed' : ''}`} onClick={onClick}>
    <span className={`task-check ${completed ? 'checked' : inProgress ? 'in-progress' : ''}`}>{completed ? <Check size={15} /> : inProgress ? <Play size={11} fill="currentColor" /> : <span />}</span>
    <span className="task-main"><span className="task-title">{t(task.title)}</span><span className="task-meta"><span>{t(task.skill)}</span><i /> <span><Clock3 size={12} /> {formatMinutes(task.durationMins)}</span></span></span>
    {inProgress && <span className="task-live">{t('In progress')}</span>}
    {!inProgress && !completed && <ArrowRight size={16} className="task-arrow" />}
    {completed && <span className="task-done-label">{t('Done')}</span>}
  </motion.button>;
}

export function TimerModal({ task: initialTask, onClose, onChanged }) {
  const { t } = useLanguage();
  const [task, setTask] = useState(initialTask);
  const [tick, setTick] = useState(Date.now());
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const startedAtMs = task.startedAt ? new Date(task.startedAt).getTime() : null;
  const remaining = useMemo(() => {
    if (task.status === 'completed') return 0;
    if (task.status !== 'in_progress' || !startedAtMs) return task.durationMins * 60;
    return Math.max(0, task.durationMins * 60 - Math.floor((tick - startedAtMs) / 1000));
  }, [task.status, task.durationMins, startedAtMs, tick]);

  useEffect(() => {
    if (task.status !== 'in_progress') return undefined;
    const interval = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [task.status]);

  const start = async () => {
    setWorking(true); setError('');
    try {
      const data = await api(`/plan/tasks/${task.id}/start`, { method: 'PATCH' });
      setTask(data.task); setTick(Date.now());
      await onChanged?.();
    } catch (err) { setError(err.message); }
    finally { setWorking(false); }
  };
  const complete = async () => {
    setWorking(true); setError('');
    try {
      await api(`/plan/tasks/${task.id}/complete`, { method: 'PATCH' });
      await onChanged?.(); onClose();
    } catch (err) { setError(err.message); }
    finally { setWorking(false); }
  };
  const reset = async () => {
    setWorking(true); setError('');
    try {
      const data = await api(`/plan/tasks/${task.id}/reset`, { method: 'PATCH' });
      setTask(data.task); await onChanged?.();
    } catch (err) { setError(err.message); }
    finally { setWorking(false); }
  };

  return <AnimatePresence>
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <motion.div className="timer-modal glass-card" initial={{ opacity: 0, y: 16, scale: 0.975, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, y: 10, scale: 0.98 }} transition={{ duration: 0.24 }} role="dialog" aria-modal="true" aria-label={t('FOCUS SESSION')}>
        <button className="modal-close icon-button" onClick={onClose} aria-label="Close timer"><X size={18} /></button>
        <span className="eyebrow"><span className="eyebrow-spark"><Sparkles size={13} /></span>{t('FOCUS SESSION')}</span>
        <div className="timer-orbit-wrap"><div className={`timer-orbit ${task.status === 'in_progress' ? 'timer-active' : ''}`}><div><span className="timer-time">{formatCountdown(remaining)}</span><span className="timer-caption">{task.status === 'completed' ? t('Session complete') : remaining === 0 ? t('Time is up') : task.status === 'in_progress' ? t('Time remaining') : t('Ready when you are')}</span></div></div><span className="orbit-dot dot-a" /><span className="orbit-dot dot-b" /><span className="orbit-dot dot-c" /></div>
        <div className="timer-task-info"><span className="skill-chip">{t(task.skill)}</span><h2>{t(task.title)}</h2><p>{t(task.description)}</p></div>
        {error && <Notice>{error}</Notice>}
        {task.status === 'completed' ? <div className="modal-actions"><button className="primary-button full-width" onClick={onClose}>{t('Back to roadmap')} <ArrowRight size={16} /></button></div> : <div className="modal-actions">
          {task.status === 'todo' && <button className="primary-button full-width" disabled={working} onClick={start}><Play size={16} fill="currentColor" /> {t('Start focus session')}</button>}
          {task.status === 'in_progress' && <><button className="primary-button full-width" disabled={working} onClick={complete}><CheckCircle2 size={17} /> {t('Mark as complete')}</button><div className="modal-secondary-actions"><button className="text-button" disabled={working} onClick={reset}><RotateCcw size={14} /> {t('Reset timer')}</button><span>{remaining === 0 ? t('Nice work showing up.') : t('Stay with one thing at a time.')}</span></div></>}
        </div>}
        <div className="timer-footnote"><Clock3 size={13} /> {t('Planned focus:')} {formatMinutes(task.durationMins)} <i /> {t('Day')} {task.dayNumber} {t('of your roadmap')}</div>
      </motion.div>
    </motion.div>
  </AnimatePresence>;
}

export function EmptyState({ title = 'Nothing here just yet', text = 'Your next step will appear here.', action, onAction }) {
  const { t } = useLanguage();
  return <div className="empty-state"><span className="empty-icon"><Sparkles size={21} /></span><h3>{t(title)}</h3><p>{t(text)}</p>{action && <button className="primary-button" onClick={onAction}>{t(action)} <ArrowRight size={15} /></button>}</div>;
}
