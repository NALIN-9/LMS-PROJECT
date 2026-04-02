// ─────────────────────────────────────────────────────────────────────────────
// User Routes — CRUD for admin user management (MySQL)
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express';
import db from '../database/db.js';

const router = Router();

// ── GET all users ───────────────────────────────────────────────────────────
router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, role, initials, status, joined_date, last_active, courses_count, created_at FROM users');
    res.json(rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// ── GET user by ID ──────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, role, initials, status, joined_date, last_active, courses_count, created_at FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

// ── POST create user (admin) ────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    const initials = name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, initials, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), password, role, initials, 'active']
    );

    const [newRows] = await db.query('SELECT id, name, email, role, initials, status, joined_date, last_active FROM users WHERE id = ?', [result.insertId]);
    res.status(201).json(newRows[0]);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Failed to create user.' });
  }
});

// ── PUT update user ─────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const [existing] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'User not found.' });

    const updates = req.body;
    if (updates.name) {
      updates.initials = updates.name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    // Build dynamic SET clause
    const fields = Object.keys(updates).filter(k => ['name', 'email', 'role', 'status', 'initials', 'password'].includes(k));
    if (fields.length === 0) return res.json(existing[0]);

    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => updates[f]);

    await db.query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, req.params.id]);

    const [updated] = await db.query('SELECT id, name, email, role, initials, status, joined_date, last_active FROM users WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// ── DELETE user ─────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'User not found.' });

    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted.' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

export default router;
