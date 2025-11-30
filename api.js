const API_BASE = (window.location.origin.includes('3000') ? 'http://localhost:5000' : window.location.origin);

const authHeaders = () => ({
  Authorization: 'Bearer ' + (localStorage.getItem('token') || ''),
  'Content-Type': 'application/json'
});

export const login = async (email, password) => {
  const res = await fetch(`${API_BASE}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  return res.json();
};

export const register = async (name, email, password) => {
  const res = await fetch(`${API_BASE}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
  return res.json();
};

export const me = async () => {
  const res = await fetch(`${API_BASE}/api/users/me`, { headers: authHeaders() });
  return res.json();
};

export const getTeams = async () => {
  const res = await fetch(`${API_BASE}/api/teams`, { headers: authHeaders() });
  return res.json();
};

export const createTeam = async (name, description) => {
  const res = await fetch(`${API_BASE}/api/teams`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ name, description }) });
  return res.json();
};

export const getTasksForTeam = async (teamId) => {
  const res = await fetch(`${API_BASE}/api/tasks/team/${teamId}`, { headers: authHeaders() });
  return res.json();
};

export const createTask = async (payload) => {
  const res = await fetch(`${API_BASE}/api/tasks`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
  return res.json();
};

export const updateTask = async (id, updates) => {
  const res = await fetch(`${API_BASE}/api/tasks/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(updates) });
  return res.json();
};

export const getUsers = async () => {
  const res = await fetch(`${API_BASE}/api/users`, { headers: authHeaders() });
  return res.json();
};

export default { login, register, me, getTeams, createTeam, createTask, getTasksForTeam, updateTask, getUsers };
