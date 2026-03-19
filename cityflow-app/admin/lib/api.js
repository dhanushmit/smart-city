const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ── Token helpers ─────────────────────────────────────────────────────────────
export const getAccessToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cf_access');
};
export const getRefreshToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cf_refresh');
};
export const setTokens = (access, refresh) => {
  localStorage.setItem('cf_access', access);
  if (refresh) localStorage.setItem('cf_refresh', refresh);
};
export const clearTokens = () => {
  localStorage.removeItem('cf_access');
  localStorage.removeItem('cf_refresh');
};

// ── Core fetch ────────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}, retry = true) {
  const token = getAccessToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    try {
      const refresh = getRefreshToken();
      if (!refresh) throw new Error('No refresh token');
      const rRes = await fetch(`${BASE}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (!rRes.ok) throw new Error('Refresh failed');
      const rData = await rRes.json();
      setTokens(rData.access, null);
      return apiFetch(path, options, false);
    } catch {
      clearTokens();
      throw new Error('SESSION_EXPIRED');
    }
  }
  return res;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function apiLogin(email, password) {
  const res = await fetch(`${BASE}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  return data;
}

export async function apiGetMe() {
  const res = await apiFetch('/api/auth/me/');
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

// ── Issues ────────────────────────────────────────────────────────────────────
export async function apiGetAllIssues(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await apiFetch(`/api/issues/${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error('Failed to fetch issues');
  return res.json();
}

export async function apiGetIssueDetail(id) {
  const res = await apiFetch(`/api/issues/${id}/`);
  if (!res.ok) throw new Error('Failed to fetch issue detail');
  return res.json();
}

export async function apiUpdateIssue(issueId, payload) {
  const isFormData = payload instanceof FormData;
  const res = await apiFetch(`/api/issues/${issueId}/`, {
    method: 'PATCH',
    body: isFormData ? payload : JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update issue');
  return data;
}

export async function apiUpvoteIssue(id) {
  const res = await apiFetch(`/api/issues/${id}/upvote/`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to upvote');
  return data;
}

export async function apiAddComment(id, text) {
  const res = await apiFetch(`/api/issues/${id}/comment/`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to add comment');
  return data;
}

// ── Workers ───────────────────────────────────────────────────────────────────
export async function apiGetWorkers() {
  const res = await apiFetch('/api/auth/workers/');
  if (!res.ok) throw new Error('Failed to fetch workers');
  return res.json();
}

export async function apiGetUsers() {
  const res = await apiFetch('/api/auth/users/');
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function apiEditUser(id, payload) {
  const res = await apiFetch(`/api/auth/users/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update user');
  return data;
}

export async function apiDeleteUser(id) {
  const res = await apiFetch(`/api/auth/users/${id}/`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to delete user');
  return data;
}

export async function apiGetWorker(id) {
  const res = await apiFetch(`/api/auth/workers/${id}/`);
  if (!res.ok) throw new Error('Failed to fetch worker');
  return res.json();
}

export async function apiCreateWorker(data) {
  const res = await apiFetch('/api/auth/register/', {
    method: 'POST',
    body: JSON.stringify({ ...data, role: 'worker' }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail || Object.values(json).flat().join(' ') || 'Failed to create worker');
  return json;
}

// ── Bins ──────────────────────────────────────────────────────────────────────
export async function apiGetBins(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await apiFetch(`/api/bins/${qs ? '?' + qs : ''}`);
  if (!res.ok) throw new Error('Failed to fetch bins');
  return res.json();
}

export async function apiUpdateBin(binId, payload) {
  const res = await apiFetch(`/api/bins/${binId}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Failed to update bin');
  return data;
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export async function apiGetDashboardStats() {
  const res = await apiFetch('/api/analytics/dashboard-stats/');
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function apiGetWardAnalytics() {
  const res = await apiFetch('/api/analytics/wards/');
  if (!res.ok) throw new Error('Failed to fetch ward analytics');
  const data = await res.json();
  const arr = Array.isArray(data) ? data : (data.results || []);
  return arr.map(w => ({
    id: w.ward ?? w.id,
    totalIssues: w.total_issues ?? w.totalIssues ?? 0,
    resolved: w.resolved ?? 0,
    pending: w.pending ?? 0,
  }));
}

export async function apiGetCategoryTrend() {
  const res = await apiFetch('/api/analytics/category-trend/');
  if (!res.ok) throw new Error('Failed to fetch category trend');
  return res.json();
}

export async function apiGetResolutionTrend() {
  const res = await apiFetch('/api/analytics/resolution-trend/');
  if (!res.ok) throw new Error('Failed to fetch resolution trend');
  const data = await res.json();
  const arr = Array.isArray(data) ? data : (data.results || []);
  return arr.map(r => ({ ...r, avgHours: r.avg_hours ?? r.avgHours ?? 0 }));
}

export async function apiGetActivityLog() {
  const res = await apiFetch('/api/analytics/activity-log/');
  if (!res.ok) throw new Error('Failed to fetch activity log');
  return res.json();
}
