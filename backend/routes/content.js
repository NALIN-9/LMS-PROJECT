// ─────────────────────────────────────────────────────────────────────────────
// Content Routes (MySQL)
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express';
import db from '../database/db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { createdBy } = req.query;
    let sql = 'SELECT * FROM content';
    const params = [];
    if (createdBy) { sql += ' WHERE created_by = ?'; params.push(createdBy); }
    sql += ' ORDER BY created_at DESC';

    const [rows] = await db.query(sql, params);
    const mapped = rows.map(r => ({
      id: r.id, title: r.title, type: r.type, courseId: r.course_id,
      courseName: r.course_name, description: r.description,
      content: r.content_body, url: r.url, createdBy: r.created_by,
      createdAt: r.created_at,
    }));
    res.json(mapped);
  } catch (err) {
    console.error('Get content error:', err);
    res.status(500).json({ error: 'Failed to fetch content.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, type, courseId, courseName, description, content, url, createdBy } = req.body;

    const [result] = await db.query(
      'INSERT INTO content (title, type, course_id, course_name, description, content_body, url, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, type || 'document', courseId || null, courseName || '', description || '', content || '', url || '', createdBy || null]
    );

    const [newRows] = await db.query('SELECT * FROM content WHERE id = ?', [result.insertId]);
    const r = newRows[0];
    res.status(201).json({
      id: r.id, title: r.title, type: r.type, courseId: r.course_id,
      courseName: r.course_name, description: r.description,
      content: r.content_body, url: r.url, createdBy: r.created_by,
      createdAt: r.created_at,
    });
  } catch (err) {
    console.error('Create content error:', err);
    res.status(500).json({ error: 'Failed to create content.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [existing] = await db.query('SELECT id FROM content WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Content not found.' });

    const fieldMap = { title: 'title', type: 'type', description: 'description', content: 'content_body', url: 'url' };
    const updates = req.body;
    const fields = Object.keys(updates).filter(k => fieldMap[k]);
    if (fields.length > 0) {
      const setClause = fields.map(f => `${fieldMap[f]} = ?`).join(', ');
      const values = fields.map(f => updates[f]);
      await db.query(`UPDATE content SET ${setClause} WHERE id = ?`, [...values, req.params.id]);
    }

    const [updated] = await db.query('SELECT * FROM content WHERE id = ?', [req.params.id]);
    const r = updated[0];
    res.json({
      id: r.id, title: r.title, type: r.type, courseId: r.course_id,
      courseName: r.course_name, description: r.description,
      content: r.content_body, url: r.url, createdBy: r.created_by, createdAt: r.created_at,
    });
  } catch (err) {
    console.error('Update content error:', err);
    res.status(500).json({ error: 'Failed to update content.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await db.query('SELECT id FROM content WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Content not found.' });
    await db.query('DELETE FROM content WHERE id = ?', [req.params.id]);
    res.json({ message: 'Content deleted.' });
  } catch (err) {
    console.error('Delete content error:', err);
    res.status(500).json({ error: 'Failed to delete content.' });
  }
});

export default router;
