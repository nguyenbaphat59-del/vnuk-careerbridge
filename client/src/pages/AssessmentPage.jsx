import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Sparkles, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../auth';
import { GlassCard, PageMotion } from '../components';
import RadarChart, { calculateSkillValues } from '../RadarChart';
import { LanguageSwitch, useLanguage } from '../i18n';

export default function AssessmentPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const analysis = user?.analysis || {};
  const profile = user?.profile || {};
  const values = useMemo(() => calculateSkillValues(profile), [profile]);
  const average = Math.round(values.reduce((a,b)=>a+b,0)/values.length);
  return <div className="app-shell assessment-shell"><div className="ambient ambient-one"/><div className="ambient ambient-two"/><PageMotion className="assessment-content">
    <header className="assessment-top"><span className="brand-lockup"><span className="brand-mark"><Sparkles size={18}/></span><span className="brand-name"><strong>VNUK</strong><span>CareerBridge</span></span></span><span className="assessment-top-actions"><LanguageSwitch compact /><span className="assessment-step">{t('YOUR FIRST REVIEW · 02 / 02')}</span></span></header>
    <div className="assessment-heading"><span className="eyebrow"><Sparkles size={13}/> {t('YOUR STARTING POINT')}</span><h1>{t('A clearer picture of')} <em>{t('where you are.')}</em></h1><p>{t('Here is your first skill-gap snapshot, based on the profile you shared. Use it as a helpful starting estimate, not a hiring score.')}</p></div>
    <div className="assessment-grid"><GlassCard className="radar-panel"><div className="assessment-panel-title"><div><span className="panel-label">{t('SKILL READINESS MAP')}</span><h2>{t('Your profile at a glance')}</h2></div><span className="panel-sticker"><Target size={17}/></span></div><RadarChart values={values}/></GlassCard>
      <div className="assessment-side"><GlassCard className="assessment-score"><span className="panel-label">{t('STARTING READINESS')}</span><div className="score-line"><strong>{average}</strong><span>/ 100</span></div><div className="thin-progress"><span style={{width:`${average}%`}}/></div><p>{t('This is a demo estimate from the information provided. It is not an objective assessment of your ability.')}</p></GlassCard>
      <GlassCard className="assessment-insights"><div className="insight-heading"><span className="insight-icon"><TrendingUp size={16}/></span><div><span className="panel-label">{t('FIRST IMPRESSIONS')}</span><h3>{t('What to focus on')}</h3></div></div><ul>{(analysis.weaknesses || []).slice(0,3).map((item,i)=><li key={i}><span>{String(i+1).padStart(2,'0')}</span>{t(item)}</li>)}{!(analysis.weaknesses || []).length && <li><span>01</span>{t('Build small projects that demonstrate what you know.')}</li>}</ul><div className="assessment-strengths"><b><CheckCircle2 size={15}/> {t('A strength to build on')}</b><p>{t(analysis.strengths?.[0] || `You have identified ${profile.targetRole || profile.major || 'a direction'} as a starting point. We’ll turn it into practical steps.`)}</p></div></GlassCard></div>
    </div>
    <div className="assessment-bottom"><span><Sparkles size={14}/> {t('Your roadmap will adapt to your timeline and daily study time.')}</span><button className="primary-button" onClick={()=>navigate('/dashboard')}>{t('Go to my dashboard')} <ArrowRight size={16}/></button></div>
  </PageMotion></div>;
}
