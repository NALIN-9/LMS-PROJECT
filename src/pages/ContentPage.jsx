import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Trash2, Eye, Video, FileText, HelpCircle, Package, Filter, Check, X } from 'lucide-react';

const CONTENT_TYPES = {
    video: { icon: <Video size={16} />, label: 'Video', color: '#6c63ff', bg: 'rgba(108,99,255,0.15)' },
    article: { icon: <FileText size={16} />, label: 'Article', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
    quiz: { icon: <HelpCircle size={16} />, label: 'Quiz', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    resource: { icon: <Package size={16} />, label: 'Resource', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
};

function ContentModal({ item, onClose, onSave, courses }) {
    const [form, setForm] = useState(item || { title: '', type: 'video', courseId: courses[0]?.id || '', status: 'draft', duration: '' });

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 520 }}>
                <div className="modal-header">
                    <div className="modal-title">{item ? 'Edit Content' : 'Add Content'}</div>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input className="form-input" placeholder="Content title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="grid-2">
                    <div className="form-group">
                        <label className="form-label">Type</label>
                        <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                            {Object.keys(CONTENT_TYPES).map(t => <option key={t} value={t}>{CONTENT_TYPES[t].label}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                            {['draft', 'review', 'published'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Course</label>
                    <select className="form-select" value={form.courseId} onChange={e => setForm({ ...form, courseId: Number(e.target.value) })}>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title.slice(0, 40)}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Duration / Length</label>
                    <input className="form-input" placeholder="e.g. 15:30 or 10 min read" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => {
                        if (form.title) {
                            const course = courses.find(c => c.id === Number(form.courseId));
                            onSave({ ...form, courseName: course?.title || '' });
                            onClose();
                        }
                    }}>
                        <Check size={15} /> {item ? 'Save' : 'Add Content'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ContentPage() {
    const { contentItems, addContent, updateContent, deleteContent, courses } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [search, setSearch] = useState('');

    const filtered = contentItems.filter(c => {
        if (filterType !== 'all' && c.type !== filterType) return false;
        if (filterStatus !== 'all' && c.status !== filterStatus) return false;
        if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const statusColors = {
        published: 'badge-success', draft: 'badge-neutral', review: 'badge-warning'
    };

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <div className="page-title">Content Library</div>
                    <div className="page-subtitle">{contentItems.length} items across {courses.length} courses</div>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowModal(true); }}>
                    <Plus size={16} /> Add Content
                </button>
            </div>

            {/* Summary Cards */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
                {Object.entries(CONTENT_TYPES).map(([key, config]) => (
                    <div key={key} className="stat-card" style={{ cursor: 'pointer', border: filterType === key ? `1px solid ${config.color}` : undefined }}
                        onClick={() => setFilterType(filterType === key ? 'all' : key)}>
                        <div className="stat-icon" style={{ background: config.bg, color: config.color }}>{config.icon}</div>
                        <div className="stat-value">{contentItems.filter(c => c.type === key).length}</div>
                        <div className="stat-label">{config.label}s</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                    <input className="form-input" style={{ paddingLeft: 36, width: 260 }} placeholder="Search content..." value={search} onChange={e => setSearch(e.target.value)} />
                    <Filter size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
                <select className="form-select" style={{ width: 'auto', padding: '9px 14px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    {['published', 'draft', 'review'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Content Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {filtered.map(item => {
                    const config = CONTENT_TYPES[item.type];
                    return (
                        <div key={item.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            {/* Card Header */}
                            <div style={{ padding: '16px 20px', background: config.bg, display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${config.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: config.color }}>
                                    {config.icon}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.courseName}</div>
                                </div>
                                <span className={`badge ${statusColors[item.status]}`}>{item.status}</span>
                            </div>

                            {/* Card Body */}
                            <div style={{ padding: '16px 20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={13} /> {item.views.toLocaleString()} views</span>
                                        <span>{item.duration}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.createdAt}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}
                                        onClick={() => updateContent(item.id, { status: item.status === 'published' ? 'draft' : 'published' })}>
                                        {item.status === 'published' ? 'Unpublish' : 'Publish'}
                                    </button>
                                    <button className="btn-icon btn-sm" onClick={() => { setEditItem(item); setShowModal(true); }}><Edit2 size={13} /></button>
                                    <button className="btn-icon btn-sm" onClick={() => setDeleteConfirm(item.id)} style={{ color: 'var(--danger)' }}><Trash2 size={13} /></button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                    <Package size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <div style={{ fontSize: 18, fontWeight: 600 }}>No content found</div>
                </div>
            )}

            {showModal && (
                <ContentModal
                    item={editItem}
                    courses={courses}
                    onClose={() => { setShowModal(false); setEditItem(null); }}
                    onSave={data => editItem ? updateContent(editItem.id, data) : addContent(data)}
                />
            )}

            {deleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: 380, textAlign: 'center' }}>
                        <Trash2 size={36} style={{ color: 'var(--danger)', margin: '0 auto 16px' }} />
                        <div className="modal-title" style={{ marginBottom: 8 }}>Delete Content?</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>This cannot be undone.</p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => { deleteContent(deleteConfirm); setDeleteConfirm(null); }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
