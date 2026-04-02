// ─────────────────────────────────────────────────────────────────────────────
// Message Routes (MySQL)
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express';
import db from '../database/db.js';

const router = Router();

// ── GET inbox ───────────────────────────────────────────────────────────────
router.get('/inbox/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT m.*, s.name as sender_name_lookup, s.initials as sender_initials, s.role as sender_role
       FROM messages m
       LEFT JOIN users s ON s.id = m.sender_id
       WHERE m.recipient_id = ? AND m.recipient_deleted = FALSE
       ORDER BY m.sent_at DESC`,
      [req.params.userId]
    );
    const mapped = rows.map(r => ({
      id: r.id, fromId: r.sender_id, fromName: r.sender_name || r.sender_name_lookup,
      fromRole: r.sender_role || '', fromInitials: r.sender_initials || '',
      toId: r.recipient_id, toName: r.recipient_name,
      subject: r.subject, body: r.body,
      sentAt: r.sent_at, readByTo: !!r.is_read,
      deletedBySender: !!r.sender_deleted, deletedByRecipient: !!r.recipient_deleted,
    }));
    res.json(mapped);
  } catch (err) {
    console.error('Get inbox error:', err);
    res.status(500).json({ error: 'Failed to fetch inbox.' });
  }
});

// ── GET sent ────────────────────────────────────────────────────────────────
router.get('/sent/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT m.*, r.name as recipient_name_lookup
       FROM messages m
       LEFT JOIN users r ON r.id = m.recipient_id
       WHERE m.sender_id = ? AND m.sender_deleted = FALSE
       ORDER BY m.sent_at DESC`,
      [req.params.userId]
    );
    const mapped = rows.map(r => ({
      id: r.id, fromId: r.sender_id, fromName: r.sender_name,
      toId: r.recipient_id, toName: r.recipient_name || r.recipient_name_lookup,
      subject: r.subject, body: r.body,
      sentAt: r.sent_at, readByTo: !!r.is_read,
      deletedBySender: !!r.sender_deleted, deletedByRecipient: !!r.recipient_deleted,
    }));
    res.json(mapped);
  } catch (err) {
    console.error('Get sent error:', err);
    res.status(500).json({ error: 'Failed to fetch sent messages.' });
  }
});

// ── POST send message ───────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { fromId, toId, subject, body } = req.body;
    if (!fromId || !toId || !body) {
      return res.status(400).json({ error: 'fromId, toId, and body are required.' });
    }

    const [senderRows] = await db.query('SELECT name, initials, role FROM users WHERE id = ?', [fromId]);
    const [recipientRows] = await db.query('SELECT name FROM users WHERE id = ?', [toId]);
    const sender = senderRows[0] || {};
    const recipient = recipientRows[0] || {};

    const [result] = await db.query(
      `INSERT INTO messages (sender_id, sender_name, recipient_id, recipient_name, subject, body)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fromId, sender.name || 'Unknown', toId, recipient.name || 'Unknown', subject || '(No subject)', body]
    );

    res.status(201).json({
      id: result.insertId, fromId: Number(fromId), fromName: sender.name,
      fromRole: sender.role, fromInitials: sender.initials,
      toId: Number(toId), toName: recipient.name,
      subject: subject || '(No subject)', body,
      sentAt: new Date().toISOString(), readByTo: false,
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

// ── PUT mark as read ────────────────────────────────────────────────────────
router.put('/:id/read', async (req, res) => {
  try {
    await db.query('UPDATE messages SET is_read = TRUE WHERE id = ?', [req.params.id]);
    res.json({ message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read.' });
  }
});

// ── DELETE message ──────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { asSender } = req.query;
    if (asSender === 'true') {
      await db.query('UPDATE messages SET sender_deleted = TRUE WHERE id = ?', [req.params.id]);
    } else {
      await db.query('UPDATE messages SET recipient_deleted = TRUE WHERE id = ?', [req.params.id]);
    }
    res.json({ message: 'Message deleted.' });
  } catch (err) {
    console.error('Delete message error:', err);
    res.status(500).json({ error: 'Failed to delete message.' });
  }
});

export default router;
