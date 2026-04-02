// ─────────────────────────────────────────────────────────────────────────────
// Submission Routes — Students submit work (MySQL)
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express';
import db from '../database/db.js';
import { uploadSubmissionFiles } from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Helper: get submission with its files
async function getSubmissionWithFiles(id) {
  const [rows] = await db.query('SELECT * FROM submissions WHERE id = ?', [id]);
  if (rows.length === 0) return null;
  const s = rows[0];
  const [files] = await db.query('SELECT * FROM submission_files WHERE submission_id = ?', [id]);
  return {
    id: s.id, assignmentId: s.assignment_id, studentId: s.student_id,
    studentName: s.student_name, studentInitials: s.student_initials,
    assignmentTitle: s.assignment_title, courseName: s.course_name,
    courseId: s.course_id, maxScore: s.max_score, answer: s.answer,
    submittedAt: s.submitted_at, score: s.score, feedback: s.feedback,
    status: s.status,
    files: files.map(f => ({
      id: f.id, originalName: f.original_name, storedName: f.stored_name,
      mimetype: f.mimetype, size: f.size, url: f.url, uploadedAt: f.uploaded_at,
    })),
  };
}

// ── GET all submissions ─────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { assignmentId, studentId, courseId } = req.query;
    let sql = 'SELECT * FROM submissions';
    const params = [];
    const conditions = [];

    if (assignmentId) { conditions.push('assignment_id = ?'); params.push(assignmentId); }
    if (studentId) { conditions.push('student_id = ?'); params.push(studentId); }
    if (courseId) { conditions.push('course_id = ?'); params.push(courseId); }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY submitted_at DESC';

    const [rows] = await db.query(sql, params);
    const results = await Promise.all(rows.map(s => getSubmissionWithFiles(s.id)));
    res.json(results);
  } catch (err) {
    console.error('Get submissions error:', err);
    res.status(500).json({ error: 'Failed to fetch submissions.' });
  }
});

// ── GET submissions for admin ───────────────────────────────────────────────
router.get('/admin/:adminId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.* FROM submissions s
       INNER JOIN assignments a ON a.id = s.assignment_id
       INNER JOIN courses c ON c.id = a.course_id
       WHERE c.created_by = ?
       ORDER BY s.submitted_at DESC`,
      [req.params.adminId]
    );
    const results = await Promise.all(rows.map(s => getSubmissionWithFiles(s.id)));
    res.json(results);
  } catch (err) {
    console.error('Get admin submissions error:', err);
    res.status(500).json({ error: 'Failed to fetch submissions.' });
  }
});

// ── GET single submission ───────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const sub = await getSubmissionWithFiles(Number(req.params.id));
    if (!sub) return res.status(404).json({ error: 'Submission not found.' });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submission.' });
  }
});

// ── POST submit assignment ──────────────────────────────────────────────────
router.post('/', uploadSubmissionFiles.array('files', 5), async (req, res) => {
  try {
    const { assignmentId, studentId, studentName, studentInitials, answer } = req.body;
    if (!assignmentId || !studentId) {
      return res.status(400).json({ error: 'assignmentId and studentId are required.' });
    }

    const aId = Number(assignmentId);
    const sId = Number(studentId);

    // Check for duplicate
    const [dup] = await db.query('SELECT id FROM submissions WHERE assignment_id = ? AND student_id = ?', [aId, sId]);
    if (dup.length > 0) {
      return res.status(409).json({ error: 'You have already submitted this assignment.' });
    }

    // Get assignment info
    const [aRows] = await db.query('SELECT * FROM assignments WHERE id = ?', [aId]);
    const assignment = aRows.length > 0 ? aRows[0] : null;

    const [result] = await db.query(
      `INSERT INTO submissions (assignment_id, student_id, student_name, student_initials,
       assignment_title, course_name, course_id, max_score, answer, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [aId, sId, studentName || '', studentInitials || '',
       assignment?.title || '', assignment?.course_name || '',
       assignment?.course_id || null, assignment?.max_score || 100, answer || '']
    );

    // Save uploaded files
    if (req.files && req.files.length > 0) {
      for (const f of req.files) {
        await db.query(
          `INSERT INTO submission_files (submission_id, original_name, stored_name, mimetype, size, url)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [result.insertId, f.originalname, f.filename, f.mimetype, f.size, `/uploads/submissions/${f.filename}`]
        );
      }
    }

    // Update assignment submission count
    await db.query('UPDATE assignments SET submissions = submissions + 1 WHERE id = ?', [aId]);

    const sub = await getSubmissionWithFiles(result.insertId);
    res.status(201).json(sub);
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: 'Failed to submit assignment.' });
  }
});

// ── PUT grade submission ────────────────────────────────────────────────────
router.put('/:id/grade', async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const [existing] = await db.query('SELECT * FROM submissions WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Submission not found.' });

    const wasGraded = existing[0].status === 'graded';
    await db.query('UPDATE submissions SET score = ?, feedback = ?, status = ? WHERE id = ?',
      [Number(score), feedback || '', 'graded', req.params.id]);

    if (!wasGraded) {
      await db.query('UPDATE assignments SET graded = graded + 1 WHERE id = ?', [existing[0].assignment_id]);
    }

    const sub = await getSubmissionWithFiles(Number(req.params.id));
    res.json(sub);
  } catch (err) {
    console.error('Grade error:', err);
    res.status(500).json({ error: 'Failed to grade submission.' });
  }
});

// ── DELETE submission ───────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const [files] = await db.query(
      'SELECT sf.stored_name FROM submission_files sf INNER JOIN submissions s ON s.id = sf.submission_id WHERE s.id = ?',
      [req.params.id]
    );
    files.forEach(f => {
      const filePath = path.join(__dirname, '..', 'uploads', 'submissions', f.stored_name);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await db.query('DELETE FROM submissions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Submission deleted.' });
  } catch (err) {
    console.error('Delete submission error:', err);
    res.status(500).json({ error: 'Failed to delete submission.' });
  }
});

export default router;
