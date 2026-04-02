// ─────────────────────────────────────────────────────────────────────────────
// Assignment Routes — CRUD + File Upload (MySQL)
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express';
import db from '../database/db.js';
import { uploadAssignmentFiles } from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Helper: get assignment with its files
async function getAssignmentWithFiles(id) {
  const [rows] = await db.query('SELECT * FROM assignments WHERE id = ?', [id]);
  if (rows.length === 0) return null;
  const a = rows[0];
  const [files] = await db.query('SELECT * FROM assignment_files WHERE assignment_id = ?', [id]);
  return {
    id: a.id, title: a.title, courseId: a.course_id, courseName: a.course_name,
    createdBy: a.created_by, dueDate: a.due_date, maxScore: a.max_score,
    description: a.description, submissions: a.submissions, graded: a.graded,
    status: a.status, createdAt: a.created_at,
    files: files.map(f => ({
      id: f.id, originalName: f.original_name, storedName: f.stored_name,
      mimetype: f.mimetype, size: f.size, uploadedBy: f.uploaded_by,
      uploadedByName: f.uploaded_by_name, url: f.url, uploadedAt: f.uploaded_at,
    })),
  };
}

// ── GET all assignments ─────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { courseId, createdBy } = req.query;
    let sql = 'SELECT * FROM assignments';
    const params = [];
    const conditions = [];

    if (courseId) { conditions.push('course_id = ?'); params.push(courseId); }
    if (createdBy) {
      conditions.push('course_id IN (SELECT id FROM courses WHERE created_by = ?)');
      params.push(createdBy);
    }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC';

    const [rows] = await db.query(sql, params);
    // Attach files for each assignment
    const results = await Promise.all(rows.map(a => getAssignmentWithFiles(a.id)));
    res.json(results);
  } catch (err) {
    console.error('Get assignments error:', err);
    res.status(500).json({ error: 'Failed to fetch assignments.' });
  }
});

// ── GET assignments for a student (enrolled courses) ────────────────────────
router.get('/student/:studentId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.* FROM assignments a
       INNER JOIN enrollments e ON e.course_id = a.course_id
       WHERE e.user_id = ?
       ORDER BY a.created_at DESC`,
      [req.params.studentId]
    );
    const results = await Promise.all(rows.map(a => getAssignmentWithFiles(a.id)));
    res.json(results);
  } catch (err) {
    console.error('Get student assignments error:', err);
    res.status(500).json({ error: 'Failed to fetch assignments.' });
  }
});

// ── GET single assignment ───────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const assignment = await getAssignmentWithFiles(Number(req.params.id));
    if (!assignment) return res.status(404).json({ error: 'Assignment not found.' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignment.' });
  }
});

// ── POST create assignment ──────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, courseId, dueDate, maxScore, description, createdBy } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });
    if (!courseId) return res.status(400).json({ error: 'Course is required.' });

    // Get course name
    const [courseRows] = await db.query('SELECT title FROM courses WHERE id = ?', [courseId]);
    const courseName = courseRows.length > 0 ? courseRows[0].title : '';

    const [result] = await db.query(
      `INSERT INTO assignments (title, course_id, course_name, created_by, due_date, max_score, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [title, courseId, courseName, createdBy || null, dueDate || '', Number(maxScore) || 100, description || '']
    );

    const assignment = await getAssignmentWithFiles(result.insertId);
    res.status(201).json(assignment);
  } catch (err) {
    console.error('Create assignment error:', err);
    res.status(500).json({ error: 'Failed to create assignment.' });
  }
});

// ── PUT update assignment ───────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const [existing] = await db.query('SELECT id FROM assignments WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Assignment not found.' });

    const fieldMap = { title: 'title', dueDate: 'due_date', maxScore: 'max_score', description: 'description', status: 'status' };
    const updates = req.body;
    const fields = Object.keys(updates).filter(k => fieldMap[k]);
    if (fields.length > 0) {
      const setClause = fields.map(f => `${fieldMap[f]} = ?`).join(', ');
      const values = fields.map(f => updates[f]);
      await db.query(`UPDATE assignments SET ${setClause} WHERE id = ?`, [...values, req.params.id]);
    }

    const assignment = await getAssignmentWithFiles(Number(req.params.id));
    res.json(assignment);
  } catch (err) {
    console.error('Update assignment error:', err);
    res.status(500).json({ error: 'Failed to update assignment.' });
  }
});

// ── DELETE assignment ───────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    // Clean up files from disk
    const [files] = await db.query('SELECT stored_name FROM assignment_files WHERE assignment_id = ?', [req.params.id]);
    files.forEach(f => {
      const filePath = path.join(__dirname, '..', 'uploads', 'assignments', f.stored_name);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await db.query('DELETE FROM assignments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Assignment deleted.' });
  } catch (err) {
    console.error('Delete assignment error:', err);
    res.status(500).json({ error: 'Failed to delete assignment.' });
  }
});

// ── POST upload files to assignment ─────────────────────────────────────────
router.post('/:id/files', uploadAssignmentFiles.array('files', 10), async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);

    // Auto-create assignment if it doesn't exist
    const [existing] = await db.query('SELECT id FROM assignments WHERE id = ?', [assignmentId]);
    if (existing.length === 0) {
      await db.query(
        `INSERT INTO assignments (id, title, created_by, status) VALUES (?, ?, ?, 'active')`,
        [assignmentId, req.body.assignmentTitle || 'Assignment', req.body.uploadedBy || null]
      );
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    const uploadedBy = req.body.uploadedBy ? Number(req.body.uploadedBy) : null;
    const uploadedByName = req.body.uploadedByName || 'Unknown';

    for (const f of req.files) {
      await db.query(
        `INSERT INTO assignment_files (assignment_id, original_name, stored_name, mimetype, size, uploaded_by, uploaded_by_name, url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [assignmentId, f.originalname, f.filename, f.mimetype, f.size, uploadedBy, uploadedByName, `/uploads/assignments/${f.filename}`]
      );
    }

    const assignment = await getAssignmentWithFiles(assignmentId);
    res.status(201).json({ message: 'Files uploaded.', assignment });
  } catch (err) {
    console.error('Upload files error:', err);
    res.status(500).json({ error: 'Failed to upload files.' });
  }
});

// ── DELETE a specific file from an assignment ──────────────────────────────
router.delete('/:id/files/:fileId', async (req, res) => {
  try {
    const [files] = await db.query('SELECT * FROM assignment_files WHERE id = ? AND assignment_id = ?', [req.params.fileId, req.params.id]);
    if (files.length === 0) return res.status(404).json({ error: 'File not found.' });

    const filePath = path.join(__dirname, '..', 'uploads', 'assignments', files[0].stored_name);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await db.query('DELETE FROM assignment_files WHERE id = ?', [req.params.fileId]);
    const assignment = await getAssignmentWithFiles(Number(req.params.id));
    res.json({ message: 'File deleted.', assignment });
  } catch (err) {
    console.error('Delete file error:', err);
    res.status(500).json({ error: 'Failed to delete file.' });
  }
});

export default router;
