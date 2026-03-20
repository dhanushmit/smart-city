const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://smart-city-qc23.onrender.com';

export const getAccessToken = () => { if (typeof window === 'undefined') return null; return localStorage.getItem('cf_access_cit'); };
export const getRefreshToken = () => { if (typeof window === 'undefined') return null; return localStorage.getItem('cf_refresh_cit'); };
export const setTokens = (access, refresh) => { localStorage.setItem('cf_access_cit', access); if (refresh) localStorage.setItem('cf_refresh_cit', refresh); };
export const clearTokens = () => { localStorage.removeItem('cf_access_cit'); localStorage.removeItem('cf_refresh_cit'); };

async function apiFetch(path, options = {}, retry = true) {
  const token = getAccessToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  
  try {
    const res = await fetch(`${BASE}${path}`, { ...options, headers });
    if (res.status === 401 && retry) {
      const refresh = getRefreshToken();
      if (!refresh) throw new Error('No refresh token');
      const rRes = await fetch(`${BASE}/api/auth/token/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh }) });
      if (!rRes.ok) throw new Error('Refresh failed');
      const rData = await rRes.json();
      setTokens(rData.access, null);
      return apiFetch(path, options, false);
    }
    return res;
  } catch (e) {
    if (e.name === 'TypeError' && e.message === 'Failed to fetch') {
      throw new Error('Connection failed. The server might be waking up or your internet is unstable. Please wait 10 seconds and try again.');
    }
    throw e;
  }
}

export async function apiLogin(email, password) {
  const res = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  const data = await res.json(); if (!res.ok) throw new Error(data.detail || 'Login failed');
  return data;
}

export async function apiRegister(formData) {
  const res = await apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ ...formData, role: 'citizen' }) });
  const data = await res.json(); if (!res.ok) throw new Error(data.detail || Object.values(data).flat().join(' '));
  return data;
}

export async function apiGetMe() {
  const res = await apiFetch('/api/auth/me');
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export async function apiGetPublicIssues() {
  const res = await apiFetch('/api/issues');
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export async function apiGetMyIssues() {
  const res = await apiFetch('/api/issues/my/issues');
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export async function apiGetWorkerTasks(workerId) {
  const res = await apiFetch(`/api/issues/?assigned_to=${workerId}`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function apiReportIssue(formData) {
  const res = await apiFetch('/api/issues', { method: 'POST', body: formData });
  const data = await res.json(); if (!res.ok) throw new Error(data.detail || 'Failed');
  return data;
}

export async function apiDetectIssue(formData) {
  const res = await apiFetch('/api/ai/detect-issue', { method: 'POST', body: formData });
  const data = await res.json(); if (!res.ok) throw new Error(data.detail || 'Failed AI Detection');
  return data;
}

export async function apiUpvoteIssue(id) {
  const res = await apiFetch(`/api/issues/${id}/upvote`, { method: 'POST' });
  return res.json();
}

export async function apiAddComment(id, text) {
  const res = await apiFetch(`/api/issues/${id}/comment`, { method: 'POST', body: JSON.stringify({ text }) });
  return res.json();
}

export async function apiDeleteIssue(id) {
  const res = await apiFetch(`/api/issues/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete');
  return res.json();
}

export async function apiGetBins() {
  const res = await apiFetch('/api/bins');
  return res.json();
}
