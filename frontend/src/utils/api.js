// ─────────────────────────────────────────────────────────────────────────────
// API Service — Centralizes all HTTP calls to the Node.js backend
// ─────────────────────────────────────────────────────────────────────────────

// In development:  Vite proxy or explicit localhost
// In production:   Backend serves frontend, so same origin (/api)
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Resolve the base URL for file downloads (uploads, etc.)
// Strips '/api' suffix so we get the server root
const SERVER_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
  : '';   // same origin in production

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// Don't set Content-Type for FormData — browser sets it with boundary
async function uploadRequest(url, formData, method = 'POST') {
  const res = await fetch(`${API_BASE}${url}`, {
    method,
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

// ── Auth ────────────────────────────────────────────────────────────────────
export const apiLogin = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const apiRegister = (userData) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify(userData) });

// ── Users ───────────────────────────────────────────────────────────────────
export const apiGetUsers = () => request('/users');
export const apiGetUser = (id) => request(`/users/${id}`);
export const apiCreateUser = (user) =>
  request('/users', { method: 'POST', body: JSON.stringify(user) });
export const apiUpdateUser = (id, updates) =>
  request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const apiDeleteUser = (id) =>
  request(`/users/${id}`, { method: 'DELETE' });

// ── Courses ─────────────────────────────────────────────────────────────────
export const apiGetCourses = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/courses${qs ? '?' + qs : ''}`);
};
export const apiGetCourse = (id) => request(`/courses/${id}`);
export const apiCreateCourse = (course) =>
  request('/courses', { method: 'POST', body: JSON.stringify(course) });
export const apiUpdateCourse = (id, updates) =>
  request(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const apiDeleteCourse = (id) =>
  request(`/courses/${id}`, { method: 'DELETE' });
export const apiEnrollStudent = (courseId, userId) =>
  request(`/courses/${courseId}/enroll`, { method: 'POST', body: JSON.stringify({ userId }) });

// ── Assignments ─────────────────────────────────────────────────────────────
export const apiGetAssignments = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/assignments${qs ? '?' + qs : ''}`);
};
export const apiGetStudentAssignments = (studentId) =>
  request(`/assignments/student/${studentId}`);
export const apiGetAssignment = (id) => request(`/assignments/${id}`);
export const apiCreateAssignment = (assignment) =>
  request('/assignments', { method: 'POST', body: JSON.stringify(assignment) });
export const apiUpdateAssignment = (id, updates) =>
  request(`/assignments/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const apiDeleteAssignment = (id) =>
  request(`/assignments/${id}`, { method: 'DELETE' });

// ── Assignment File Upload (Admin/Instructor/CC) ────────────────────────────
export const apiUploadAssignmentFiles = (assignmentId, files, uploadedBy, uploadedByName, assignmentTitle) => {
  const formData = new FormData();
  files.forEach(f => formData.append('files', f));
  formData.append('uploadedBy', uploadedBy);
  formData.append('uploadedByName', uploadedByName);
  formData.append('assignmentTitle', assignmentTitle || 'Assignment');
  return uploadRequest(`/assignments/${assignmentId}/files`, formData);
};

export const apiDeleteAssignmentFile = (assignmentId, fileId) =>
  request(`/assignments/${assignmentId}/files/${fileId}`, { method: 'DELETE' });

// ── Submissions ─────────────────────────────────────────────────────────────
export const apiGetSubmissions = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/submissions${qs ? '?' + qs : ''}`);
};
export const apiGetAdminSubmissions = (adminId) =>
  request(`/submissions/admin/${adminId}`);

// Submit with text + files
export const apiSubmitAssignment = (data, files = []) => {
  const formData = new FormData();
  formData.append('assignmentId', data.assignmentId);
  formData.append('studentId', data.studentId);
  formData.append('studentName', data.studentName);
  formData.append('studentInitials', data.studentInitials);
  formData.append('answer', data.answer || '');
  files.forEach(f => formData.append('files', f));
  return uploadRequest('/submissions', formData);
};

export const apiGradeSubmission = (id, score, feedback) =>
  request(`/submissions/${id}/grade`, { method: 'PUT', body: JSON.stringify({ score, feedback }) });

// ── Announcements ───────────────────────────────────────────────────────────
export const apiGetAnnouncements = () => request('/announcements');
export const apiCreateAnnouncement = (ann) =>
  request('/announcements', { method: 'POST', body: JSON.stringify(ann) });
export const apiDeleteAnnouncement = (id) =>
  request(`/announcements/${id}`, { method: 'DELETE' });

// ── Content ─────────────────────────────────────────────────────────────────
export const apiGetContent = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/content${qs ? '?' + qs : ''}`);
};
export const apiCreateContent = (item) =>
  request('/content', { method: 'POST', body: JSON.stringify(item) });
export const apiUpdateContent = (id, updates) =>
  request(`/content/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
export const apiDeleteContent = (id) =>
  request(`/content/${id}`, { method: 'DELETE' });

// ── Messages ────────────────────────────────────────────────────────────────
export const apiGetInbox = (userId) => request(`/messages/inbox/${userId}`);
export const apiGetSent = (userId) => request(`/messages/sent/${userId}`);
export const apiSendMessage = (msg) =>
  request('/messages', { method: 'POST', body: JSON.stringify(msg) });
export const apiMarkMessageRead = (id) =>
  request(`/messages/${id}/read`, { method: 'PUT' });
export const apiDeleteMessage = (id, asSender = false) =>
  request(`/messages/${id}?asSender=${asSender}`, { method: 'DELETE' });

// ── Health ──────────────────────────────────────────────────────────────────
export const apiHealthCheck = () => request('/health');

// File URL helper — works both locally and in production
export const getFileUrl = (relativePath) => `${SERVER_BASE}${relativePath}`;
