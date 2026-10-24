import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('internpath_token');
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('internpath_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api('/auth/me')
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('internpath:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('internpath:unauthorized', handleUnauthorized);
  }, [logout]);

  const acceptSession = useCallback(({ token, user: nextUser }) => {
    localStorage.setItem('internpath_token', token);
    setUser(nextUser);
  }, []);

  const value = useMemo(() => ({ user, setUser, loading, logout, acceptSession }), [user, loading, logout, acceptSession]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
