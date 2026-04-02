// ─────────────────────────────────────────────────────────────────────────────
// Auth Routes — POST /api/auth/login, POST /api/auth/register
// Now uses MySQL database instead of in-memory storage
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express';
import db from '../database/db.js';

const router = Router();

// ── Login ───────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'No account found with that email address.' });
    }

    const user = rows[0];

    if (user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Your account is deactivated. Please contact support.' });
    }

    // Update last_active
    await db.query('UPDATE users SET last_active = CURRENT_DATE WHERE id = ?', [user.id]);

    // Return user without password
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// ── Register ────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    const initials = name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, initials, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), password, role, initials, 'active']
    );

    // Return the new user
    const [newRows] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const { password: _, ...safeUser } = newRows[0];
    res.status(201).json({ user: safeUser });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

export default router;
