'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { apiGetMe, getAccessToken, clearTokens, setTokens, apiLogin as apiLoginCall } from '@/lib/api';

const CitizenContext = createContext(null);

export function CitizenProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restore() {
      if (!getAccessToken()) { setLoading(false); return; }
      try {
        const me = await apiGetMe();
        if (me.role !== 'citizen' && me.role !== 'worker') { clearTokens(); setLoading(false); return; }
        setUser(me);
      } catch {
        clearTokens();
      } finally {
        setLoading(false);
      }
    }
    restore();
  }, []);

  async function login(email, password) {
    const data = await apiLoginCall(email, password);
    if (data.user.role !== 'citizen' && data.user.role !== 'worker') throw new Error('Unauthorized access');
    setTokens(data.access, data.refresh);
    setUser(data.user);
    return data.user;
  }

  function logout() { clearTokens(); setUser(null); }

  return (
    <CitizenContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </CitizenContext.Provider>
  );
}

export const useCitizen = () => useContext(CitizenContext);
