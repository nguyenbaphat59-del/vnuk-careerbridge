import React, { useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth';
import { AppLayout, Loader } from './components';
import AuthPage from './pages/AuthPage';
import ForgotPage from './pages/ForgotPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import PlanPage from './pages/PlanPage';
import ProfilePage from './pages/ProfilePage';
import AssessmentPage from './pages/AssessmentPage';
import './styles.css';
import { LanguageProvider } from './i18n';

// Navigation between routes should always start at the top of the new page.
// Without this reset, a page that was scrolled near its footer can look blank
// while the next route is shorter or still loading its first data request.
function ScrollReset() {
  const { pathname, search } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const main = document.querySelector('.main-area');
    if (main) main.scrollTop = 0;
  }, [pathname, search]);
  return null;
}

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function EntryRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return <Navigate to={user ? (user.profile ? '/dashboard' : '/onboarding') : '/login'} replace />;
}

function AppRoutes() {
  return <Routes>
    <Route path="/" element={<EntryRedirect />} />
    <Route path="/login" element={<AuthPage />} />
    <Route path="/register" element={<AuthPage />} />
    <Route path="/forgot-password" element={<ForgotPage />} />
    <Route element={<RequireAuth />}>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/assessment" element={<AssessmentPage />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Route>
    <Route path="*" element={<EntryRedirect />} />
  </Routes>;
}

function App() {
  return <LanguageProvider><BrowserRouter><ScrollReset /><AuthProvider><AppRoutes /></AuthProvider></BrowserRouter></LanguageProvider>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
