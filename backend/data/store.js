// ─────────────────────────────────────────────────────────────────────────────
// In-Memory Data Store (will be replaced by MySQL later)
// ─────────────────────────────────────────────────────────────────────────────
// This module acts as a central "database" that all routes read/write to.
// When we integrate MySQL, we only need to swap this file's exports with
// real DB queries — the route logic stays the same.
// ─────────────────────────────────────────────────────────────────────────────

let nextId = 100; // auto-increment counter
export const genId = () => ++nextId;

// ── Users ───────────────────────────────────────────────────────────────────
export const users = [
  { id: 1, name: 'Admin User', email: 'admin@gmail.com', password: 'Admin@123', role: 'Admin', initials: 'AU', avatar: null, joined: '2025-01-01', status: 'active' },
  { id: 2, name: 'Bhargav', email: 'ins@gmail.com', password: 'ins@123', role: 'Instructor', initials: 'BH', avatar: null, joined: '2025-01-01', status: 'active' },
  { id: 3, name: 'Prasanth', email: 'cc@gmail.com', password: 'cc@123', role: 'Content Creator', initials: 'PR', avatar: null, joined: '2025-01-01', status: 'active' },
  { id: 4, name: 'Kumar', email: 'st@gmail.com', password: 'st@123', role: 'Student', initials: 'KU', avatar: null, joined: '2025-01-01', status: 'active' },
];

// ── Courses ─────────────────────────────────────────────────────────────────
export const courses = [];

// ── Enrollments  { courseId: [userId, ...] } ────────────────────────────────
export const enrollments = {};

// ── Assignments ─────────────────────────────────────────────────────────────
// Each assignment can have `files: [{ id, originalName, storedName, mimetype, size, uploadedBy, uploadedByName, uploadedAt }]`
export const assignments = [];

// ── Submissions ─────────────────────────────────────────────────────────────
// Each submission can have `files: [{ id, originalName, storedName, mimetype, size, uploadedAt }]` in addition to `answer` text
export const submissions = [];

// ── Announcements ───────────────────────────────────────────────────────────
export const announcements = [];

// ── Content Items ───────────────────────────────────────────────────────────
export const contentItems = [];

// ── Messages ────────────────────────────────────────────────────────────────
export const messages = [];

// ── Notifications ───────────────────────────────────────────────────────────
export const notifications = [];
