import { useId } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from './i18n';

export function calculateSkillValues(profile = {}) {
  const text = `${profile.currentSkills || ''} ${profile.careerGoal || ''} ${profile.interests || ''}`.toLowerCase();
  return [
    Math.min(88, 28 + (/(html|css|javascript|react|java|python|sql|programming|coding|git|lập trình|công nghệ)/.test(text) ? 42 : 0) + (text.length > 120 ? 10 : 0)),
    Math.min(90, 35 + (/(team|communication|presentation|leadership|collaborat|giao tiếp|làm việc nhóm|thuyết trình)/.test(text) ? 30 : 0)),
    Math.min(92, 30 + (/(english|ielts|toeic|fluent|b2|c1|tiếng anh)/.test(text) ? 38 : 0)),
    Math.min(90, 38 + (/(problem|debug|solve|algorithm|logic|giải quyết vấn đề|thuật toán)/.test(text) ? 30 : 0)),
    Math.min(90, 25 + (/(project|portfolio|internship|built|developed|dự án|thực tập)/.test(text) ? 38 : 0)),
    Math.min(95, 40 + (profile.targetRole ? 25 : 0) + (profile.careerGoal ? 15 : 0))
  ];
}

export default function RadarChart({ values, compact = false }) {
  const { t } = useLanguage();
  const gradientId = `radarFill-${useId().replace(/:/g, '')}`;
  const axes = ['Technical skills', 'Communication', 'English', 'Problem solving', 'Practical projects', 'Career clarity'];
  const size = 360, center = size / 2, radius = compact ? 102 : 112;
  const point = (i, r) => { const a = -Math.PI / 2 + i * Math.PI * 2 / values.length; return [center + Math.cos(a) * r, center + Math.sin(a) * r]; };
  const polygon = (scale) => values.map((_, i) => point(i, radius * scale).join(',')).join(' ');
  const data = values.map((v, i) => point(i, radius * v / 100).join(',')).join(' ');
  return <div className={`radar-wrap ${compact ? 'radar-wrap-compact' : ''}`}>
    <svg viewBox={`0 -18 360 384`} role="img" aria-label={t('Skill radar')}>
      <defs><linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--wine)" stopOpacity=".34"/><stop offset="100%" stopColor="var(--navy)" stopOpacity=".22"/></linearGradient></defs>
      {[.25,.5,.75,1].map((scale) => <polygon key={scale} points={polygon(scale)} className="radar-grid" />)}
      {values.map((_, i) => { const [x,y]=point(i,radius); return <line key={i} x1={center} y1={center} x2={x} y2={y} className="radar-axis" />; })}
      <motion.polygon points={data} className="radar-area" initial={{ opacity: 0, scale: .72, rotate: -4 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: .78, ease: [0.2, 0.8, 0.2, 1] }} style={{ transformOrigin: 'center', fill: `url(#${gradientId})` }} />
      {values.map((v,i) => { const [x,y]=point(i,radius+(compact ? 21 : 27)); const anchor = x < center-8 ? 'end' : x > center+8 ? 'start' : 'middle'; return <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" className="radar-label">{t(axes[i])}</text>; })}
    </svg>
    <div className="radar-legend"><span><i /> {t('Current profile estimate')}</span><span>{t('Scale: 0–100')}</span></div>
  </div>;
}
