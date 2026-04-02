// ─────────────────────────────────────────────────────────────────────────────
// MySQL Connection Pool — database/db.js
// Uses mysql2/promise for async/await support
// Auto-creates tables on startup if they don't exist
// ─────────────────────────────────────────────────────────────────────────────
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Support both DATABASE_URL (cloud) and individual env vars (local)
let poolConfig;

if (process.env.DATABASE_URL) {
  // Cloud MySQL (Railway, PlanetScale, Aiven, etc.)
  poolConfig = {
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
} else {
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'digital_blackboard',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
}

const pool = mysql.createPool(poolConfig);

// Test connection on startup
export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL connected — database:', process.env.DB_NAME || 'digital_blackboard');
    conn.release();
    return true;
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('   Make sure MySQL is running and the database exists.');
    return false;
  }
}

// Auto-create all tables + seed demo users on startup
export async function initializeDatabase() {
  try {
    const ok = await testConnection();
    if (!ok) return;

    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        name            VARCHAR(255) NOT NULL,
        email           VARCHAR(255) NOT NULL UNIQUE,
        password        VARCHAR(255) NOT NULL,
        role            VARCHAR(50)  NOT NULL DEFAULT 'Student',
        initials        VARCHAR(10)  DEFAULT '',
        status          VARCHAR(20)  DEFAULT 'active',
        joined_date     DATE         DEFAULT (CURRENT_DATE),
        last_active     DATE         DEFAULT (CURRENT_DATE),
        courses_count   INT          DEFAULT 0,
        created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        title           VARCHAR(255) NOT NULL,
        category        VARCHAR(100) DEFAULT '',
        instructor      VARCHAR(255) DEFAULT '',
        instructor_id   INT          DEFAULT NULL,
        description     TEXT,
        duration        VARCHAR(100) DEFAULT '',
        lessons         INT          DEFAULT 0,
        rating          DECIMAL(3,1) DEFAULT 0.0,
        students        INT          DEFAULT 0,
        status          VARCHAR(20)  DEFAULT 'draft',
        tags            TEXT,
        created_by      INT          DEFAULT NULL,
        created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        course_id       INT NOT NULL,
        user_id         INT NOT NULL,
        enrolled_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_enrollment (course_id, user_id),
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        title           VARCHAR(255) NOT NULL,
        course_id       INT          DEFAULT NULL,
        course_name     VARCHAR(255) DEFAULT '',
        created_by      INT          DEFAULT NULL,
        due_date        VARCHAR(50)  DEFAULT '',
        max_score       INT          DEFAULT 100,
        description     TEXT,
        submissions     INT          DEFAULT 0,
        graded          INT          DEFAULT 0,
        status          VARCHAR(20)  DEFAULT 'active',
        created_at      DATE         DEFAULT (CURRENT_DATE),
        FOREIGN KEY (course_id)  REFERENCES courses(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id)   ON DELETE SET NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS assignment_files (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        assignment_id   INT NOT NULL,
        original_name   VARCHAR(500) NOT NULL,
        stored_name     VARCHAR(500) NOT NULL,
        mimetype        VARCHAR(100) DEFAULT '',
        size            BIGINT       DEFAULT 0,
        uploaded_by     INT          DEFAULT NULL,
        uploaded_by_name VARCHAR(255) DEFAULT '',
        url             VARCHAR(500) DEFAULT '',
        uploaded_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by)   REFERENCES users(id)       ON DELETE SET NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        assignment_id   INT NOT NULL,
        student_id      INT NOT NULL,
        student_name    VARCHAR(255) DEFAULT '',
        student_initials VARCHAR(10) DEFAULT '',
        assignment_title VARCHAR(255) DEFAULT '',
        course_name     VARCHAR(255) DEFAULT '',
        course_id       INT          DEFAULT NULL,
        max_score       INT          DEFAULT 100,
        answer          TEXT,
        submitted_at    DATE         DEFAULT (CURRENT_DATE),
        score           INT          DEFAULT NULL,
        feedback        TEXT,
        status          VARCHAR(20)  DEFAULT 'pending',
        UNIQUE KEY unique_submission (assignment_id, student_id),
        FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id)    REFERENCES users(id)       ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS submission_files (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        submission_id   INT NOT NULL,
        original_name   VARCHAR(500) NOT NULL,
        stored_name     VARCHAR(500) NOT NULL,
        mimetype        VARCHAR(100) DEFAULT '',
        size            BIGINT       DEFAULT 0,
        url             VARCHAR(500) DEFAULT '',
        uploaded_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        title           VARCHAR(255) NOT NULL,
        content         TEXT,
        author          VARCHAR(255) DEFAULT '',
        author_id       INT          DEFAULT NULL,
        priority        VARCHAR(20)  DEFAULT 'normal',
        date            DATE         DEFAULT (CURRENT_DATE),
        created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        title           VARCHAR(255) NOT NULL,
        course_id       INT          DEFAULT NULL,
        created_by      INT          DEFAULT NULL,
        allow_retake    BOOLEAN      DEFAULT TRUE,
        time_limit      INT          DEFAULT 0,
        due_date        VARCHAR(50)  DEFAULT NULL,
        questions       JSON,
        created_at      DATE         DEFAULT (CURRENT_DATE),
        FOREIGN KEY (course_id)  REFERENCES courses(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id)   ON DELETE SET NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        quiz_id         INT NOT NULL,
        user_id         INT NOT NULL,
        score           INT DEFAULT 0,
        total           INT DEFAULT 0,
        date            DATE DEFAULT (CURRENT_DATE),
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id)   ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        sender_id       INT NOT NULL,
        sender_name     VARCHAR(255) DEFAULT '',
        recipient_id    INT NOT NULL,
        recipient_name  VARCHAR(255) DEFAULT '',
        subject         VARCHAR(500) DEFAULT '',
        body            TEXT,
        is_read         BOOLEAN      DEFAULT FALSE,
        sender_deleted  BOOLEAN      DEFAULT FALSE,
        recipient_deleted BOOLEAN    DEFAULT FALSE,
        sent_at         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id)    REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS content (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        title           VARCHAR(255) NOT NULL,
        type            VARCHAR(50)  DEFAULT 'document',
        course_id       INT          DEFAULT NULL,
        course_name     VARCHAR(255) DEFAULT '',
        description     TEXT,
        content_body    TEXT,
        url             VARCHAR(500) DEFAULT '',
        created_by      INT          DEFAULT NULL,
        created_at      DATE         DEFAULT (CURRENT_DATE),
        FOREIGN KEY (course_id)  REFERENCES courses(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id)   ON DELETE SET NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        user_id         INT NOT NULL,
        message         VARCHAR(500) NOT NULL,
        type            VARCHAR(50)  DEFAULT 'info',
        is_read         BOOLEAN      DEFAULT FALSE,
        created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Seed demo users if none exist
    const [userCount] = await pool.query('SELECT COUNT(*) as cnt FROM users');
    if (userCount[0].cnt === 0) {
      console.log('🌱 Seeding demo users...');
      await pool.query(
        `INSERT INTO users (name, email, password, role, initials, status) VALUES
         ('Admin User', 'admin@gmail.com', 'Admin@123', 'Admin', 'AU', 'active'),
         ('Bhargav', 'ins@gmail.com', 'ins@123', 'Instructor', 'BH', 'active'),
         ('Prasanth', 'cc@gmail.com', 'cc@123', 'Content Creator', 'PR', 'active'),
         ('Kumar', 'st@gmail.com', 'st@123', 'Student', 'KU', 'active')`
      );
    }

    console.log('✅ Database tables initialized successfully');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
  }
}

export default pool;
