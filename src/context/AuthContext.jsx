import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { loginRequest } from '../api/authApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('ap20_token'));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('ap20_user') || 'null'); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    sessionStorage.removeItem('ap20_token');
    sessionStorage.removeItem('ap20_user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('ap20:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('ap20:unauthorized', handleUnauthorized);
  }, [logout]);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const result = await loginRequest(username, password);
      const role = String(result.user?.role || '').toLowerCase();
      if (!['monitor', 'admin', 'operator'].includes(role)) {
        throw new Error('This account role is not authorized for the monitoring dashboard.');
      }
      sessionStorage.setItem('ap20_token', result.token);
      sessionStorage.setItem('ap20_user', JSON.stringify(result.user));
      setToken(result.token);
      setUser(result.user);
      return result.user;
    } finally { setLoading(false); }
  }, []);

  const value = useMemo(() => ({ token, user, loading, isAuthenticated: Boolean(token && user), login, logout }), [token, user, loading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
