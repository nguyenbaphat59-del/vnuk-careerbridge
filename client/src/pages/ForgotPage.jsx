import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, KeyRound, Mail, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { Notice } from '../components';
import { useLanguage, LanguageSwitch } from '../i18n';

export default function ForgotPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [demoToken, setDemoToken] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const requestReset = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const data = await api('/auth/forgot-password', { method: 'POST', body: { email } });
      setMessage(data.message);
      if (data.demoToken) { setDemoToken(data.demoToken); setTokenInput(data.demoToken); }
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  const resetPassword = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const data = await api('/auth/reset-password', { method: 'POST', body: { token: tokenInput, password } });
      setMessage(data.message); setResetDone(true); setDemoToken('');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return <div className="auth-page forgot-page"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="forgot-language"><LanguageSwitch /></div>
    <motion.div className="forgot-card glass-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Link to="/login" className="brand-lockup forgot-brand"><span className="brand-mark"><Compass size={19} /></span><span className="brand-name"><strong>VNUK</strong><span>CareerBridge</span></span></Link>
      <div className="forgot-icon">{resetDone ? <CheckCircle2 size={24} /> : <KeyRound size={23} />}</div>
      <span className="eyebrow"><Sparkles size={13} />{t('ACCOUNT RECOVERY')}</span>
      <h1>{resetDone ? t('You’re all set.') : demoToken ? t('Create a new password.') : t('Let’s get you back in.')}</h1>
      <p>{resetDone ? t('Your password was updated. You can sign in with your new details.') : demoToken ? t('In this demo, the reset token is generated locally instead of being emailed.') : t('Enter the email linked to your account. We’ll show a demo reset token if the account exists.')}</p>
      {error && <Notice>{error}</Notice>}{message && <Notice type={resetDone ? 'success' : 'success'}>{message}</Notice>}
      {!demoToken && !resetDone && <form className="auth-form" onSubmit={requestReset}><label className="field"><span>{t('Email address')}</span><div className="input-wrap"><Mail size={17} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></div></label><button className="primary-button full-width" disabled={busy}>{busy ? t('Requesting…') : t('Generate reset token')} <ArrowRight size={16} /></button></form>}
      {demoToken && !resetDone && <form className="auth-form reset-form" onSubmit={resetPassword}><label className="field"><span>{t('Demo reset token')}</span><input value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} required /></label><label className="field"><span>{t('New password')}</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('At least 8 characters')} minLength={8} required /></label><button className="primary-button full-width" disabled={busy}>{busy ? t('Saving…') : t('Update password')} <ArrowRight size={16} /></button></form>}
      {resetDone ? <Link className="back-link" to="/login"><ArrowLeft size={15} />{t('Back to sign in')}</Link> : <Link className="back-link" to="/login"><ArrowLeft size={15} />{t('Back to sign in')}</Link>}
      <div className="demo-note centered"><span className="demo-pulse" /> {t('Demo mode · No email is sent')}</div>
    </motion.div>
  </div>;
}
