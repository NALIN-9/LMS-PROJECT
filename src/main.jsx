import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ── Run BEFORE React boots so HMR never skips this ──────────────────────────
// Bump DB_VERSION whenever seed data changes to force a full re-seed.
const DB_VERSION = 'v4';
const DEMO_USERS = [
  { id: 1, name: 'Admin User', email: 'admin@gmail.com', password: 'Admin@123', role: 'Admin', initials: 'AU', avatar: null, nameChanged: false, joined: '2025-01-01', status: 'active', courses: 0 },
  { id: 2, name: 'Bhargav', email: 'ins@gmail.com', password: 'ins@123', role: 'Instructor', initials: 'BH', avatar: null, nameChanged: false, joined: '2025-01-01', status: 'active', courses: 0 },
  { id: 3, name: 'Prasanth', email: 'cc@gmail.com', password: 'cc@123', role: 'Content Creator', initials: 'PR', avatar: null, nameChanged: false, joined: '2025-01-01', status: 'active', courses: 0 },
  { id: 4, name: 'Kumar', email: 'st@gmail.com', password: 'st@123', role: 'Student', initials: 'KU', avatar: null, nameChanged: false, joined: '2025-01-01', status: 'active', courses: 0 },
];

if (localStorage.getItem('dbb_version') !== DB_VERSION) {
  // Wipe all app data
  Object.keys(localStorage)
    .filter(k => k.startsWith('dbb_'))
    .forEach(k => localStorage.removeItem(k));
  // Re-seed with the new demo users
  localStorage.setItem('dbb_users', JSON.stringify(DEMO_USERS));
  localStorage.setItem('dbb_version', DB_VERSION);
  // Hard reload so React sees the fresh data from the start
  window.location.reload();
}
// ────────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
