import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, LockKeyhole, LogOut, Save, ShieldCheck, Trash2, UserRound, WandSparkles } from 'lucide-react';
import { useAuth } from '../auth';
import { api } from '../lib/api';
import { invalidatePlanCache } from '../hooks';
import { Field, GlassCard, Notice, PageMotion } from '../components';
import { useLanguage } from '../i18n';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ ...user.profile, age: user.profile?.age ?? '', timelineMonths: String(user.profile?.timelineMonths || 1), dailyMinutes: String(user.profile?.dailyMinutes || 45) });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [pwNotice, setPwNotice] = useState({ type: '', text: '' });
  const update = (key) => (event) => setProfile((prev) => ({ ...prev, [key]: event.target.value }));

  const saveProfile = async (event) => {
    event.preventDefault(); setSaving(true); setNotice({ type: '', text: '' });
    try {
      const data = await api('/profile', { method: 'POST', body: { ...profile, age: profile.age ? Number(profile.age) : '' } });
      invalidatePlanCache(user.id);
      setUser((prev) => ({ ...prev, ...data.user, profile: data.profile, analysis: data.analysis }));
      setNotice({ type: 'success', text: t('Profile saved and your roadmap has been refreshed.') });
    } catch (err) { setNotice({ type: 'error', text: err.message }); }
    finally { setSaving(false); }
  };

  const changePassword = async (event) => {
    event.preventDefault(); setChanging(true); setPwNotice({ type: '', text: '' });
    try {
      const data = await api('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } });
      setPwNotice({ type: 'success', text: data.message }); setCurrentPassword(''); setNewPassword('');
    } catch (err) { setPwNotice({ type: 'error', text: err.message }); }
    finally { setChanging(false); }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm(t('Delete this demo account and all its saved profile and task data? This cannot be undone.'));
    if (!confirmed) return;
    try {
      await api('/auth/account', { method: 'DELETE' });
      logout(); navigate('/login');
    } catch (err) { setNotice({ type: 'error', text: err.message }); }
  };

  return <PageMotion className="profile-page">
    <div className="page-heading-row profile-page-heading"><div><span className="eyebrow"><UserRound size={13} /> {t('YOUR SPACE')}</span><h1>{t('Make it')} <em>{t('your own.')}</em></h1><p>{t('Adjust your goals, keep your details up to date, and shape your next steps.')}</p></div><div className="profile-account-chip"><span className="profile-account-dot" /><span><b>{user.email}</b><small>{t('Demo account')}</small></span></div></div>
    <div className="profile-grid">
      <div className="profile-main-column">
        <GlassCard className="profile-form-card"><div className="section-title-row"><span className="section-icon"><UserRound size={18} /></span><div><h2>{t('Your profile')}</h2><p>{t('The context behind your personalised roadmap.')}</p></div></div>{notice.text && <Notice type={notice.type}>{notice.text}</Notice>}
          <form onSubmit={saveProfile} className="profile-form"><div className="form-grid"><Field label="Full name *" value={profile.fullName || ''} onChange={update('fullName')} required /><Field label="Age" type="number" min="14" max="100" value={profile.age} onChange={update('age')} /><Field label="Field of study *" value={profile.major || ''} onChange={update('major')} required /><Field label="Target role" value={profile.targetRole || ''} onChange={update('targetRole')} placeholder={t('e.g. Frontend Developer')} /></div><label className="field"><span>{t('Current skills')}</span><textarea rows="3" value={profile.currentSkills || ''} onChange={update('currentSkills')} placeholder={t('Your current skills and knowledge')} /></label><label className="field"><span>{t('Interests')}</span><textarea rows="2" value={profile.interests || ''} onChange={update('interests')} /></label><label className="field"><span>{t('Career goal')}</span><textarea rows="2" value={profile.careerGoal || ''} onChange={update('careerGoal')} /></label><label className="field"><span>{t('Job description (optional)')}</span><textarea rows="4" value={profile.jobDescription || ''} onChange={update('jobDescription')} placeholder={t('Paste a specific job description here')} /></label><div className="form-grid form-grid-three"><label className="field"><span>{t('Plan length')}</span><select value={profile.timelineMonths} onChange={update('timelineMonths')}><option value="1">{t('1 month')}</option><option value="2">{t('2 months')}</option><option value="3">{t('3 months')}</option><option value="4">{t('4 months')}</option><option value="5">{t('5 months')}</option><option value="6">{t('6 months')}</option></select></label><label className="field"><span>{t('Daily time')}</span><select value={profile.dailyMinutes} onChange={update('dailyMinutes')}><option value="15">{t('15 minutes')}</option><option value="30">{t('30 minutes')}</option><option value="45">{t('45 minutes')}</option><option value="60">{t('1 hour')}</option><option value="90">{t('1.5 hours')}</option><option value="120">{t('2 hours')}</option></select></label><label className="field"><span>{t('Target application date')}</span><input type="date" value={profile.targetHireDate || ''} onChange={update('targetHireDate')} /></label></div><div className="form-save-row"><span><WandSparkles size={14} /> {t('Saving regenerates your roadmap.')}</span><button className="primary-button" disabled={saving}>{saving ? t('Saving…') : t('Save & update plan')} <Save size={15} /></button></div></form>
        </GlassCard>
        <GlassCard className="security-card"><div className="section-title-row"><span className="section-icon"><LockKeyhole size={18} /></span><div><h2>{t('Change password')}</h2><p>{t('Keep your account secure.')}</p></div></div>{pwNotice.text && <Notice type={pwNotice.type}>{pwNotice.text}</Notice>}<form onSubmit={changePassword} className="password-form"><Field label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /><Field label="New password" type="password" minLength="8" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t('At least 8 characters')} required /><button className="soft-button" disabled={changing}>{changing ? t('Updating…') : t('Update password')} <ArrowRight size={15} /></button></form></GlassCard>
      </div>
      <div className="profile-side-column"><GlassCard className="account-summary-card"><div className="account-summary-top"><span className="account-summary-icon"><ShieldCheck size={21} /></span><span className="status-pill"><i /> {t('Active')}</span></div><span className="panel-label">{t('ACCOUNT OVERVIEW')}</span><h3>{profile.fullName || t('Your profile')}</h3><p>{profile.targetRole || profile.major || t('Your next opportunity starts here.')}</p><div className="account-summary-line"><span>{t('Email')}</span><b>{user.email}</b></div><div className="account-summary-line"><span>{t('Plan duration')}</span><b>{profile.timelineMonths} {t(Number(profile.timelineMonths) === 1 ? '1 month' : 'months')}</b></div><div className="account-summary-line"><span>{t('Daily focus')}</span><b>{profile.dailyMinutes} {t('minutes')}</b></div></GlassCard>
        <GlassCard className="account-actions-card"><span className="panel-label">{t('ACCOUNT ACTIONS')}</span><button className="account-action" onClick={() => { logout(); navigate('/login'); }}><span className="action-icon"><LogOut size={16} /></span><span><b>{t('Switch account')}</b><small>{t('Sign out and use another account')}</small></span><ArrowRight size={15} /></button><div className="action-divider" /><button className="account-action danger-action" onClick={deleteAccount}><span className="action-icon"><Trash2 size={16} /></span><span><b>{t('Delete account')}</b><small>{t('Remove your demo data permanently')}</small></span><ArrowRight size={15} /></button></GlassCard>
        <div className="privacy-note"><CheckCircle2 size={15} /><p>{t('Demo data is saved in a local JSON file on the server. Use test details only — this setup is not intended for production.')}</p></div>
      </div>
    </div>
  </PageMotion>;
}
