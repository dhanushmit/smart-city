'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import {
  apiGetMe, apiGetAllIssues, apiGetWorkers, apiGetBins,
  apiUpdateIssue, apiUpdateBin, apiGetUsers, apiEditUser, apiDeleteUser,
  apiLogin as apiLoginCall, clearTokens, setTokens, getAccessToken,
} from '@/lib/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [issues, setIssues]   = useState([]);
  const [workers, setWorkers] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [bins, setBins]       = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function restore() {
      if (!getAccessToken()) { setAuthLoading(false); return; }
      try {
        const me = await apiGetMe();
        if (me.role !== 'admin') { clearTokens(); setAuthLoading(false); return; }
        setUser(me);
        await loadData();
      } catch {
        clearTokens();
      } finally {
        setAuthLoading(false);
      }
    }
    restore();
  }, []);

  async function loadData() {
    try {
      const [issuesData, workersData, binsData] = await Promise.all([
        apiGetAllIssues(),
        apiGetWorkers(),
        apiGetBins(),
      ]);
      const issuesList = Array.isArray(issuesData) ? issuesData : (issuesData.results || []);
      setIssues(issuesList);
      
      const allWorkers = Array.isArray(workersData) ? workersData : (workersData.results || []);
      setWorkers(allWorkers);
      
      const usersData = await apiGetUsers();
      setCitizens(usersData.filter(u => u.role === 'citizen'));

      const binsList = Array.isArray(binsData) ? binsData : (binsData.results || []);
      setBins(binsList);

      const notifs = [];
      binsList.filter(b => b.fill_level >= 85).forEach(b => {
        notifs.push({ id: `bin-${b.id}`, text: `${b.bin_id} overflow at ${b.location_text}`, type: 'alert', read: false });
      });
      issuesList.filter(i => i.priority === 'High' && !i.assigned_to).slice(0, 2).forEach(i => {
        notifs.push({ id: `issue-${i.id}`, text: `${i.display_id} high priority unassigned`, type: 'warning', read: false });
      });
      setNotifications(notifs);
    } catch (e) {
      console.error('loadData error', e);
    }
  }

  async function login(email, password) {
    const data = await apiLoginCall(email, password);
    if (data.user.role !== 'admin') throw new Error('Access denied: admin account required');
    setTokens(data.access, data.refresh);
    setUser(data.user);
    await loadData();
    return data.user;
  }

  function logout() {
    clearTokens();
    setUser(null);
    setIssues([]); setWorkers([]); setCitizens([]); setBins([]); setNotifications([]);
  }

  const updateIssueStatus = async (issueId, newStatus, assignedTo, note) => {
    const payload = { status: newStatus };
    if (note) payload.note = note;
    if (assignedTo !== undefined) payload.assigned_to = assignedTo;
    const updated = await apiUpdateIssue(issueId, payload);
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, ...updated } : i));
    return updated;
  };

  const assignWorker = async (issueId, workerId) => {
    const updated = await apiUpdateIssue(issueId, { assigned_to: workerId, status: 'Assigned' });
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, ...updated } : i));
    return updated;
  };

  const refreshIssues = async () => {
    const data = await apiGetAllIssues();
    setIssues(Array.isArray(data) ? data : (data.results || []));
  };

  const updateBinLevel = async (binId, fillLevel) => {
    const updated = await apiUpdateBin(binId, { fill_level: fillLevel });
    setBins(prev => prev.map(b => b.id === binId ? { ...b, ...updated } : b));
    return updated;
  };

  const refreshBins = async () => {
    const data = await apiGetBins();
    setBins(Array.isArray(data) ? data : (data.results || []));
  };

  const refreshWorkers = async () => {
    const data = await apiGetUsers();
    setWorkers(data.filter(u => u.role === 'worker'));
  };

  const refreshCitizens = async () => {
    const data = await apiGetUsers();
    setCitizens(data.filter(u => u.role === 'citizen'));
  };

  const editUser = async (id, payload) => {
    const updated = await apiEditUser(id, payload);
    if (updated.role === 'worker') setWorkers(prev => prev.map(u => u.id === id ? updated : u));
    else setCitizens(prev => prev.map(u => u.id === id ? updated : u));
    return updated;
  };

  const deleteUser = async (id) => {
    await apiDeleteUser(id);
    setWorkers(prev => prev.filter(u => u.id !== id));
    setCitizens(prev => prev.filter(u => u.id !== id));
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{
      user, authLoading, login, logout,
      issues, workers, citizens, bins, notifications, unreadCount,
      updateIssueStatus, assignWorker, refreshIssues,
      updateBinLevel, refreshBins, refreshWorkers, refreshCitizens,
      editUser, deleteUser, markNotificationRead, loadData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
