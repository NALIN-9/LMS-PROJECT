// ─────────────────────────────────────────────────────────────────────────────
// Course Routes — CRUD + Enrollment (MySQL)
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express';
import db from '../database/db.js';

const router = Router();

// Helper: map DB row to frontend shape
function mapCourse(r) {
  let tags = [];
  if (r.tags) {
    try { tags = JSON.parse(r.tags); } catch { tags = String(r.tags).split(',').map(t => t.trim()).filter(Boolean); }
  }
  return {
    id: r.id, title: r.title, category: r.category || '',
    instructor: r.instructor || '', instructorId: r.instructor_id,
    description: r.description || '', duration: r.duration || '',
    lessons: r.lessons || 0, rating: Number(r.rating) || 0,
    students: r.students || 0, status: r.status || 'draft',
    tags, createdBy: r.created_by, createdAt: r.created_at,
  };
}

// ── GET all courses ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { createdBy, status } = req.query;
    let sql = 'SELECT * FROM courses';
    const params = [];
    const conditions = [];

    if (createdBy) { conditions.push('created_by = ?'); params.push(createdBy); }
    if (status) { conditions.push('status = ?'); params.push(status); }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC';

    const [rows] = await db.query(sql, params);
    res.json(rows.map(mapCourse));
  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
});

// ── GET single course ───────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM courses WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Course not found.' });
    res.json(mapCourse(rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch course.' });
  }
});

// ── POST create course ──────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, category, status: courseStatus, description, createdBy, createdByName,
            duration, lessons, tags, level } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });

    const tagsStr = Array.isArray(tags) ? JSON.stringify(tags) : (tags || '[]');

    const [result] = await db.query(
      `INSERT INTO courses (title, category, instructor, status, description, created_by, duration, lessons, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, category || 'General', createdByName || '', courseStatus || 'draft',
       description || '', createdBy || null, duration || '', Number(lessons) || 0, tagsStr]
    );

    const [newRows] = await db.query('SELECT * FROM courses WHERE id = ?', [result.insertId]);
    res.status(201).json(mapCourse(newRows[0]));
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ error: 'Failed to create course.' });
  }
});

// ── PUT update course ───────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const [existing] = await db.query('SELECT id FROM courses WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Course not found.' });

    const updates = req.body;
    const fieldMap = {
      title: 'title', category: 'category', status: 'status',
      description: 'description', instructor: 'instructor',
      duration: 'duration', lessons: 'lessons',
    };

    const setClauses = [];
    const values = [];

    for (const [key, col] of Object.entries(fieldMap)) {
      if (updates[key] !== undefined) {
        setClauses.push(`${col} = ?`);
        values.push(key === 'lessons' ? Number(updates[key]) || 0 : updates[key]);
      }
    }

    // Handle tags separately (array → JSON string)
    if (updates.tags !== undefined) {
      setClauses.push('tags = ?');
      values.push(Array.isArray(updates.tags) ? JSON.stringify(updates.tags) : updates.tags);
    }

    if (setClauses.length > 0) {
      await db.query(`UPDATE courses SET ${setClauses.join(', ')} WHERE id = ?`, [...values, req.params.id]);
    }

    const [updated] = await db.query('SELECT * FROM courses WHERE id = ?', [req.params.id]);
    res.json(mapCourse(updated[0]));
  } catch (err) {
    console.error('Update course error:', err);
    res.status(500).json({ error: 'Failed to update course.' });
  }
});

// ── DELETE course ───────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await db.query('SELECT id FROM courses WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Course not found.' });
    await db.query('DELETE FROM courses WHERE id = ?', [req.params.id]);
    res.json({ message: 'Course and related data deleted.' });
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json({ error: 'Failed to delete course.' });
  }
});

// ── POST enroll student ─────────────────────────────────────────────────────
router.post('/:id/enroll', async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required.' });

    const [course] = await db.query('SELECT id FROM courses WHERE id = ?', [courseId]);
    if (course.length === 0) return res.status(404).json({ error: 'Course not found.' });

    await db.query('INSERT INTO enrollments (course_id, user_id) VALUES (?, ?)', [courseId, userId]);
    await db.query('UPDATE courses SET students = students + 1 WHERE id = ?', [courseId]);

    const [enrolled] = await db.query('SELECT user_id FROM enrollments WHERE course_id = ?', [courseId]);
    res.json({ message: 'Enrolled successfully.', enrollments: enrolled.map(e => e.user_id) });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Already enrolled.' });
    }
    console.error('Enroll error:', err);
    res.status(500).json({ error: 'Failed to enroll.' });
  }
});

// ── GET enrollment status ───────────────────────────────────────────────────
router.get('/:id/enrollment', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id FROM enrollments WHERE course_id = ?', [req.params.id]);
    res.json({ enrolled: rows.map(r => r.user_id) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch enrollments.' });
  }
});

export default router;
