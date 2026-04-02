import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Megaphone, BookOpen, Wrench, AlertCircle, X, Check } from 'lucide-react';

const TYPE_CONFIG = {
    course: { icon: <BookOpen size={16} />, label: 'New Course', color: '#6c63ff', bg: 'rgba(108,99,255,0.15)' },
    maintenance: { icon: <Wrench size={16} />, label: 'Maintenance', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    assignment: { icon: <AlertCircle size={16} />, label: 'Assignment', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    general: { icon: <Megaphone size={16} />, label: 'General', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
};

function ComposeModal({ onClose, onSave }) {
    const [form, setForm] = useState({ title: '', message: '', type: 'general' });

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 540 }}>
                <div className="modal-header">
                    <div className="modal-title">New Announcement</div>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input className="form-input" placeholder="Announcement title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Type</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                            <button key={key} onClick={() => setForm({ ...form, type: key })}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, border: form.type === key ? `1.5px solid ${config.color}` : '1.5px solid var(--border-light)',
                                    background: form.type === key ? config.bg : 'var(--bg-surface)', color: form.type === key ? config.color : 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'Inter'
                                }}>
                                {config.icon} {config.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Message *</label>
                    <textarea className="form-textarea" placeholder="Write your announcement..." style={{ minHeight: 140 }} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => { if (form.title && form.message) { onSave(form); onClose(); } }}>
                        <Check size={15} /> Publish
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AnnouncementsPage() {
    const { announcements, addAnnouncement, currentUser } = useApp();
    const [showCompose, setShowCompose] = useState(false);
    const [filter, setFilter] = useState('all');

    const canPost = ['Admin', 'Instructor'].includes(currentUser.role);

    const filtered = announcements.filter(a => filter === 'all' || a.type === filter);

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <div className="page-title">Announcements</div>
                    <div className="page-subtitle">Stay up-to-date with platform news</div>
                </div>
                {canPost && (
                    <button className="btn btn-primary" onClick={() => setShowCompose(true)}>
                        <Plus size={16} /> Post Announcement
                    </button>
                )}
            </div>

            {/* Filter tabs */}
            <div className="tabs" style={{ maxWidth: 500 }}>
                {[['all', 'All'], ['general', 'General'], ['course', 'Courses'], ['assignment', 'Assignments'], ['maintenance', 'Maintenance']].map(([key, label]) => (
                    <button key={key} className={`tab ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>{label}</button>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {filtered.map(a => {
                    const config = TYPE_CONFIG[a.type] || TYPE_CONFIG.general;
                    return (
                        <div key={a.id} className="card" style={{ borderLeft: `3px solid ${config.color}`, borderRadius: '0 12px 12px 0' }}>
                            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                <div style={{ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: config.bg, color: config.color, flexShrink: 0 }}>
                                    {config.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                                        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{a.title}</div>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, background: config.bg, color: config.color, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                                            {config.label}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>{a.message}</p>
                                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                                        <span>Posted by <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{a.author}</span></span>
                                        <span>•</span>
                                        <span>{a.role}</span>
                                        <span>•</span>
                                        <span>{a.date}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                    <Megaphone size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <div style={{ fontSize: 18, fontWeight: 600 }}>No announcements yet</div>
                </div>
            )}

            {showCompose && (
                <ComposeModal onClose={() => setShowCompose(false)} onSave={addAnnouncement} />
            )}
        </div>
    );
}
