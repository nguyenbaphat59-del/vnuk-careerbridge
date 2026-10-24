import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, Eye, EyeOff, LockKeyhole, Mail, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../auth';
import { Notice } from '../components';
import { useLanguage, LanguageSwitch } from '../i18n';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { acceptSession } = useAuth();
  const { t } = useLanguage();
  const signup = location.pathname === '/register';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const data = await api(`/auth/${signup ? 'register' : 'login'}`, { method: 'POST', body: { email, password } });
      acceptSession(data);
      navigate(data.user.profile ? '/dashboard' : '/onboarding');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return <div className="auth-page">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="ambient ambient-three" />
    <motion.div className="auth-wrap" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42 }}>
      <div className="auth-page-tools"><LanguageSwitch /></div><div className="auth-brand"><span className="brand-mark"><Compass size={20} /></span><span className="brand-name"><strong>VNUK</strong><span>CareerBridge</span></span><span className="auth-brand-tag">{t('YOUR NEXT CHAPTER')}</span></div>
      <div className="auth-panel glass-card">
        <div className="auth-main">
          <div className="auth-heading"><span className="eyebrow"><Sparkles size={13} /> {t('A CLEARER WAY FORWARD')}</span><h1>{signup ? t('Make room to grow.') : t('Find your next step.')}</h1><p>{signup ? t('Start with where you are. We’ll help you build a practical path to the internship you want.') : t('A calmer, more focused way to prepare for your first internship.')}</p></div>
          <form onSubmit={submit} className="auth-form">
            {error && <Notice>{error}</Notice>}
            <label className="field"><span>{t('Email address')}</span><div className="input-wrap"><Mail size={17} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" required /></div></label>
            <label className="field"><span>{t('Password')}</span><div className="input-wrap"><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={signup ? 'new-password' : 'current-password'} placeholder={signup ? t('At least 8 characters') : t('Enter your password')} minLength={signup ? 8 : 1} required /><button type="button" className="input-action" aria-label={showPassword ? t('Hide password') : t('Show password')} onClick={() => setShowPassword((show) => !show)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
            {!signup && <div className="auth-form-meta"><span>{t('Welcome back')}</span><Link to="/forgot-password">{t('Forgot password?')}</Link></div>}
            <button className="primary-button full-width auth-submit" disabled={busy}>{busy ? <span className="button-spinner" /> : <>{signup ? t('Create your account') : t('Sign in')} <ArrowRight size={16} /></>}</button>
          </form>
          <div className="auth-switch">{signup ? t('Already have an account?') : t('New around here?')} <Link to={signup ? '/login' : '/register'}>{signup ? t('Sign in') : t('Create an account')}</Link></div>
          <div className="demo-note"><span className="demo-pulse" /> {t('Demo workspace')} <i /> {t('No AI API key needed')}</div>
        </div>
        <div className="auth-aside">
          <div className="aside-glow" />
          <div className="aside-content"><span className="aside-kicker">{t('LESS GUESSING. MORE GROWING.')}</span><h2>{t('Your ambition deserves')}<br />{t('a practical plan.')}</h2><p>{t('Turn a big, blurry goal into a few clear actions you can take today.')}</p>
            <div className="mini-roadmap"><div className="mini-step"><span className="mini-step-icon"><span /></span><div><b>{t('Know your starting point')}</b><small>{t('Skills, interests, and goals')}</small></div><span className="mini-step-no">01</span></div><div className="mini-connector" /><div className="mini-step"><span className="mini-step-icon"><Sparkles size={14} /></span><div><b>{t('See what to work on')}</b><small>{t('A focused skill-gap review')}</small></div><span className="mini-step-no">02</span></div><div className="mini-connector" /><div className="mini-step"><span className="mini-step-icon"><ArrowRight size={15} /></span><div><b>{t('Make steady progress')}</b><small>{t('Small tasks, one day at a time')}</small></div><span className="mini-step-no">03</span></div></div>
            <div className="aside-foot"><span className="aside-avatar-stack"><i>✦</i><i>↗</i><i>·</i></span><span>{t('Built around')} <b>{t('your pace')}</b>, {t('not someone else’s.')}</span></div>
          </div>
          <div className="aside-orbit aside-orbit-one" /><div className="aside-orbit aside-orbit-two" />
        </div>
      </div>
      <div className="auth-footer"><span>© 2026 VNUK CareerBridge</span><span>{t('Build a little. Learn a lot.')}</span></div>
    </motion.div>
  </div>;
}
