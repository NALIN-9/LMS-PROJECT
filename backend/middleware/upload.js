// ─────────────────────────────────────────────────────────────────────────────
// Multer configuration for file uploads
// ─────────────────────────────────────────────────────────────────────────────
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directories exist
const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');
const ASSIGNMENT_DIR = path.join(UPLOAD_ROOT, 'assignments');
const SUBMISSION_DIR = path.join(UPLOAD_ROOT, 'submissions');

[UPLOAD_ROOT, ASSIGNMENT_DIR, SUBMISSION_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Storage for assignment files (admin/instructor/CC uploads) ──────────────
const assignmentStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, ASSIGNMENT_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `assignment-${uniqueSuffix}${ext}`);
  },
});

// ── Storage for submission files (student uploads) ─────────────────────────
const submissionStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, SUBMISSION_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `submission-${uniqueSuffix}${ext}`);
  },
});

// File filter — allow common document and image types
const fileFilter = (_req, file, cb) => {
  const allowed = [
    // Documents
    '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx',
    '.txt', '.rtf', '.odt', '.ods', '.odp', '.csv',
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
    // Code files
    '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.html', '.css',
    // Archives
    '.zip', '.rar', '.7z', '.tar', '.gz',
  ];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} is not allowed. Allowed: ${allowed.join(', ')}`), false);
  }
};

// Max file size: 25 MB
const limits = { fileSize: 25 * 1024 * 1024 };

export const uploadAssignmentFiles = multer({ storage: assignmentStorage, fileFilter, limits });
export const uploadSubmissionFiles = multer({ storage: submissionStorage, fileFilter, limits });
