// ─────────────────────────────────────────────────────────────────────────────
// Announcement Routes (MySQL)
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express';
import db from '../database/db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM announcements ORDER BY created_at DESC');
    const mapped = rows.map(r => ({
      id: r.id, title: r.title, message: r.content, priority: r.priority,
      author: r.author, date: r.date,
    }));
    res.json(mapped);
  } catch (err) {
    console.error('Get announcements error:', err);
    res.status(500).json({ error: 'Failed to fetch announcements.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, message, priority, author, authorId } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'Title and message are required.' });

    const [result] = await db.query(
      'INSERT INTO announcements (title, content, priority, author, author_id) VALUES (?, ?, ?, ?, ?)',
      [title, message, priority || 'normal', author || 'System', authorId || null]
    );

    const [newRows] = await db.query('SELECT * FROM announcements WHERE id = ?', [result.insertId]);
    const r = newRows[0];
    res.status(201).json({
      id: r.id, title: r.title, message: r.content, priority: r.priority,
      author: r.author, date: r.date,
    });
  } catch (err) {
    console.error('Create announcement error:', err);
    res.status(500).json({ error: 'Failed to create announcement.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await db.query('SELECT id FROM announcements WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Announcement not found.' });
    await db.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    res.json({ message: 'Announcement deleted.' });
  } catch (err) {
    console.error('Delete announcement error:', err);
    res.status(500).json({ error: 'Failed to delete announcement.' });
  }
});

export default router;
