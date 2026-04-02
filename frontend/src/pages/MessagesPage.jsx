import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Send, Inbox, Trash2, X, Plus, ChevronRight, Reply, User } from 'lucide-react';

// ── Compose Modal ────────────────────────────────────────────────────────────
function ComposeModal({ defaultTo, onClose, onSend, users, currentUserId }) {
    const [toId, setToId] = useState(defaultTo ?? '');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const valid = toId && body.trim();

    const otherUsers = users.filter(u => u.id !== currentUserId && u.status !== 'inactive');

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 540 }}>
                <div className="modal-header">
                    <div className="modal-title">New Message</div>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>

                <div className="form-group">
                    <label className="form-label">To *</label>
                    <select className="form-select" value={toId} onChange={e => setToId(Number(e.target.value))}>
                        <option value="">Select recipient…</option>
                        {otherUsers.map(u => (
                            <option key={u.id} value={u.id}>
                                {u.name} — {u.role}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input className="form-input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="What is this about?" />
                </div>

                <div className="form-group">
                    <label className="form-label">Message *</label>
                    <textarea className="form-textarea" rows={6} value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message here…" style={{ resize: 'vertical', minHeight: 120 }} />
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" disabled={!valid} onClick={() => { onSend(Number(toId), subject, body); onClose(); }}>
                        <Send size={14} /> Send Message
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── View Message Modal ───────────────────────────────────────────────────────
function ViewModal({ msg, currentUserId, onClose, onReply, onDelete, isSent }) {
    const fmt = (iso) => {
        const d = new Date(iso);
        return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 560 }}>
                <div className="modal-header">
                    <div className="modal-title" style={{ fontSize: 16 }}>{msg.subject}</div>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>

                {/* Meta */}
                <div style={{ background: 'var(--bg-surface)', borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13 }}>
                    <div style={{ display: 'flex', gap: 32 }}>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 2 }}>FROM</div>
                            <div style={{ fontWeight: 600 }}>{msg.fromName}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{msg.fromRole}</div>
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 2 }}>TO</div>
                            <div style={{ fontWeight: 600 }}>{msg.toName}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 2 }}>SENT</div>
                            <div style={{ fontSize: 12 }}>{fmt(msg.sentAt)}</div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', minHeight: 80, padding: '4px 0', marginBottom: 20 }}>
                    {msg.body}
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
                    <button className="btn btn-secondary" style={{ color: 'var(--danger)' }} onClick={() => { onDelete(); onClose(); }}>
                        <Trash2 size={13} /> Delete
                    </button>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-secondary" onClick={onClose}>Close</button>
                        {!isSent && (
                            <button className="btn btn-primary" onClick={() => { onReply(msg.fromId); onClose(); }}>
                                <Reply size={13} /> Reply
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function MessagesPage() {
    const { currentUser, users, sendMessage, markMessageRead, deleteMessage, getInbox, getSent } = useApp();
    const [tab, setTab] = useState('inbox');  // 'inbox' | 'sent'
    const [compose, setCompose] = useState(false);
    const [defaultTo, setDefaultTo] = useState(null);
    const [viewing, setViewing] = useState(null);

    const inbox = getInbox();
    const sent = getSent();
    const list = tab === 'inbox' ? inbox : sent;
    const unread = inbox.filter(m => !m.readByTo).length;

    const openMsg = (msg) => {
        setViewing(msg);
        if (tab === 'inbox' && !msg.readByTo) markMessageRead(msg.id);
    };

    const reply = (toId) => {
        setDefaultTo(toId);
        setCompose(true);
    };

    const fmt = (iso) => {
        const d = new Date(iso);
        const now = new Date();
        const diffMs = now - d;
        const diffH = diffMs / 3600000;
        if (diffH < 1) return `${Math.max(1, Math.floor(diffMs / 60000))}m ago`;
        if (diffH < 24) return `${Math.floor(diffH)}h ago`;
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const roleColors = {
        Admin: '#f87171', Instructor: '#a78bfa', Student: '#34d399', 'Content Creator': '#fbbf24',
    };

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <div className="page-title">Messages</div>
                    <div className="page-subtitle">Internal messaging — contact any user on the platform</div>
                </div>
                <button className="btn btn-primary" onClick={() => { setDefaultTo(null); setCompose(true); }}>
                    <Plus size={16} /> Compose
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Tabs */}
                    {[
                        { id: 'inbox', label: 'Inbox', icon: <Inbox size={15} />, count: unread },
                        { id: 'sent', label: 'Sent', icon: <Send size={15} />, count: null },
                    ].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                                borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter',
                                background: tab === t.id ? 'var(--primary)' : 'var(--bg-card)',
                                color: tab === t.id ? '#000' : 'var(--text-primary)',
                                fontWeight: tab === t.id ? 700 : 400, fontSize: 13,
                            }}>
                            {t.icon} {t.label}
                            {t.count > 0 && (
                                <span style={{ marginLeft: 'auto', background: tab === t.id ? 'rgba(0,0,0,0.2)' : 'var(--danger)', color: '#fff', borderRadius: 20, fontSize: 10, fontWeight: 800, padding: '1px 6px' }}>
                                    {t.count}
                                </span>
                            )}
                        </button>
                    ))}

                    {/* Quick contacts */}
                    <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
                            Quick Contact
                        </div>
                        {users.filter(u => u.id !== currentUser.id && u.status !== 'inactive').map(u => (
                            <div key={u.id}
                                onClick={() => { setDefaultTo(u.id); setCompose(true); }}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', cursor: 'pointer', borderBottom: '1px solid var(--border-light)' }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, var(--primary), var(--primary-dark))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                    {u.initials}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                                    <div style={{ fontSize: 10, color: roleColors[u.role] ?? 'var(--text-muted)' }}>{u.role}</div>
                                </div>
                                <ChevronRight size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Message List */}
                <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-light)', overflow: 'hidden' }}>
                    {/* List header */}
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {tab === 'inbox' ? `Inbox — ${inbox.length} message${inbox.length !== 1 ? 's' : ''}` : `Sent — ${sent.length} message${sent.length !== 1 ? 's' : ''}`}
                    </div>

                    {list.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                            <Mail size={44} style={{ opacity: 0.3, marginBottom: 12 }} />
                            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
                                {tab === 'inbox' ? 'Your inbox is empty' : 'No sent messages'}
                            </div>
                            <div style={{ fontSize: 13 }}>
                                {tab === 'inbox' ? 'When someone sends you a message, it appears here.' : 'Messages you send will appear here.'}
                            </div>
                            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => { setDefaultTo(null); setCompose(true); }}>
                                <Plus size={14} /> Compose a Message
                            </button>
                        </div>
                    ) : (
                        list.map(msg => {
                            const isUnread = tab === 'inbox' && !msg.readByTo;
                            const person = tab === 'inbox' ? { name: msg.fromName, role: msg.fromRole, initials: msg.fromInitials } : { name: msg.toName };
                            return (
                                <div key={msg.id}
                                    onClick={() => openMsg(msg)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                                        borderBottom: '1px solid var(--border-light)', cursor: 'pointer',
                                        background: isUnread ? 'rgba(0,212,255,0.04)' : 'transparent',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                                    onMouseLeave={e => e.currentTarget.style.background = isUnread ? 'rgba(0,212,255,0.04)' : 'transparent'}
                                >
                                    {/* Unread indicator */}
                                    <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: isUnread ? 'var(--primary)' : 'transparent' }} />
                                    {/* Avatar */}
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                        {person.initials ?? person.name?.[0] ?? '?'}
                                    </div>
                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                            <span style={{ fontSize: 13, fontWeight: isUnread ? 700 : 500, color: 'var(--text-primary)' }}>
                                                {person.name}
                                                {person.role && <span style={{ fontSize: 11, color: roleColors[person.role] ?? 'var(--text-muted)', marginLeft: 6, fontWeight: 600 }}>{person.role}</span>}
                                            </span>
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>{fmt(msg.sentAt)}</span>
                                        </div>
                                        <div style={{ fontSize: 13, fontWeight: isUnread ? 600 : 400, color: isUnread ? 'var(--text-primary)' : 'var(--text-secondary)', marginBottom: 2 }}>
                                            {msg.subject}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {msg.body}
                                        </div>
                                    </div>
                                    <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Modals */}
            {compose && (
                <ComposeModal
                    defaultTo={defaultTo}
                    users={users}
                    currentUserId={currentUser.id}
                    onClose={() => { setCompose(false); setDefaultTo(null); }}
                    onSend={(toId, subject, body) => sendMessage(toId, subject, body)}
                />
            )}
            {viewing && (
                <ViewModal
                    msg={viewing}
                    currentUserId={currentUser.id}
                    isSent={tab === 'sent'}
                    onClose={() => setViewing(null)}
                    onReply={reply}
                    onDelete={() => deleteMessage(viewing.id, tab === 'sent')}
                />
            )}
        </div>
    );
}
