import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarDays, Clock3, Sparkles, WandSparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { invalidatePlanCache } from '../hooks';
import { useAuth } from '../auth';
import { Field, Notice, PageMotion } from '../components';
import { useLanguage, LanguageSwitch } from '../i18n';

const emptyProfile = {
  fullName: '', age: '', major: '', targetRole: '', interests: '', currentSkills: '', careerGoal: '', jobDescription: '', timelineMonths: '1', dailyMinutes: '45', targetHireDate: ''
};

export default function OnboardingPage() {
  const { t } = useLanguage();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...emptyProfile, ...(user?.profile || {}), age: user?.profile?.age ?? '', timelineMonths: String(user?.profile?.timelineMonths || 1), dailyMinutes: String(user?.profile?.dailyMinutes || 45) });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const data = await api('/profile', { method: 'POST', body: { ...form, age: form.age ? Number(form.age) : '' } });
      invalidatePlanCache(user?.id);
      setUser((prev) => ({ ...prev, ...data.user, profile: data.profile, analysis: data.analysis }));
      navigate(user?.profile ? '/dashboard' : '/assessment');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return <div className="app-shell onboarding-shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <header className="onboarding-top"><Link className="brand-lockup" to={user?.profile ? '/dashboard' : '/onboarding'}><span className="brand-mark"><WandSparkles size={18} /></span><span className="brand-name"><strong>VNUK</strong><span>CareerBridge</span></span></Link><span className="onboarding-top-actions"><LanguageSwitch compact /><span className="onboarding-step">{t('YOUR STARTING POINT')} <i>01 / 01</i></span></span></header>
    <PageMotion className="onboarding-content">
      <div className="onboarding-heading"><span className="eyebrow"><Sparkles size={13} /> {t('BUILT AROUND YOU')}</span><h1>{t('Let’s find your')} <em>{t('next step.')}</em></h1><p>{t('A little context helps us turn your internship goal into a plan that fits your starting point and your time.')}</p></div>
      <form onSubmit={submit} className="onboarding-form">
        {error && <Notice>{error}</Notice>}
        <section className="form-section glass-card"><div className="form-section-heading"><span className="section-icon"><BriefcaseBusiness size={18} /></span><div><h2>{t('About you')}</h2><p>{t('The basics that give your plan some context.')}</p></div><span className="section-count">01</span></div>
          <div className="form-grid"><Field label="Your name *" placeholder={t('How should we call you?')} value={form.fullName} onChange={update('fullName')} required /><Field label="Age" type="number" min="14" max="100" placeholder={t('Optional')} value={form.age} onChange={update('age')} /><Field label="Field of study *" placeholder={t('e.g. Information Technology')} value={form.major} onChange={update('major')} required /><Field label="Role you’re curious about" placeholder={t('e.g. Frontend Developer')} value={form.targetRole} onChange={update('targetRole')} /></div>
          <label className="field"><span>{t('Interests outside / inside your studies')}</span><textarea rows="2" value={form.interests} onChange={update('interests')} placeholder={t('What topics or activities keep you curious?')} /></label>
        </section>
        <section className="form-section glass-card"><div className="form-section-heading"><span className="section-icon"><WandSparkles size={18} /></span><div><h2>{t('Your starting point')}</h2><p>{t('No need to have everything figured out. Just be honest about where you are.')}</p></div><span className="section-count">02</span></div>
          <label className="field"><span>{t('Skills or knowledge you already have')}</span><textarea rows="3" value={form.currentSkills} onChange={update('currentSkills')} placeholder={t('e.g. HTML basics, Java, teamwork, English A2…')} /><small>{t('Separate skills with commas. Beginner-level knowledge is still worth mentioning.')}</small></label>
          <label className="field"><span>{t('Career goal')}</span><textarea rows="2" value={form.careerGoal} onChange={update('careerGoal')} placeholder={t('What would you like to be able to do in the next few months?')} /></label>
          <label className="field"><span>{t('Specific job description (optional)')}</span><textarea rows="4" value={form.jobDescription} onChange={update('jobDescription')} placeholder={t('Paste the JD for a particular internship if you have one. We’ll use it as extra context in the demo analysis.')} /><small>{t('Leave this blank if you’re still exploring roles.')}</small></label>
        </section>
        <section className="form-section glass-card"><div className="form-section-heading"><span className="section-icon"><CalendarDays size={18} /></span><div><h2>{t('Set your pace')}</h2><p>{t('Build a plan you can realistically keep showing up for.')}</p></div><span className="section-count">03</span></div>
          <div className="form-grid form-grid-three"><label className="field"><span>{t('Plan length')}</span><select value={form.timelineMonths} onChange={update('timelineMonths')}><option value="1">{t('1 month')}</option><option value="2">{t('2 months')}</option><option value="3">{t('3 months')}</option><option value="4">{t('4 months')}</option><option value="5">{t('5 months')}</option><option value="6">{t('6 months')}</option></select></label><label className="field"><span>{t('Time each day')}</span><select value={form.dailyMinutes} onChange={update('dailyMinutes')}><option value="15">{t('15 minutes')}</option><option value="30">{t('30 minutes')}</option><option value="45">{t('45 minutes')}</option><option value="60">{t('1 hour')}</option><option value="90">{t('1.5 hours')}</option><option value="120">{t('2 hours')}</option></select></label><label className="field"><span>{t('Target application date')}</span><input type="date" value={form.targetHireDate} onChange={update('targetHireDate')} /></label></div>
          <div className="pace-note"><span><Clock3 size={16} /></span><p>{t('Your daily tasks will be short focus sessions. You can adjust your plan whenever your priorities change.')}</p></div>
        </section>
        <div className="onboarding-actions">{user?.profile ? <button type="button" className="text-button" onClick={() => navigate('/dashboard')}><ArrowLeft size={15} /> {t('Back to workspace')}</button> : <span className="text-button onboarding-later-label"><ArrowLeft size={15} /> {t('One step to your new roadmap')}</span>}<button className="primary-button" disabled={busy}>{busy ? t('Building your plan…') : t('Create my roadmap')} <ArrowRight size={16} /></button></div>
      </form>
      <div className="onboarding-footnote"><Sparkles size={13} /> {t('Your first skill-gap review is generated locally in demo mode. No AI key needed.')}</div>
    </PageMotion>
  </div>;
}
