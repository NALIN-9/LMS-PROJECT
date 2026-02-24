import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit2, Trash2, Search, UserCheck, UserX, Shield, Star, User, Palette, X, Check, Mail, Calendar } from 'lucide-react';

const ROLE_OPTIONS = ['Admin', 'Instructor', 'Student', 'Content Creator'];
const ROLE_ICONS = { Admin: <Shield size={14} />, Instructor: <Star size={14} />, Student: <User size={14} />, 'Content Creator': <Palette size={14} /> };
const ROLE_COLORS_MAP = {
    Admin: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
    Instructor: { bg: 'rgba(108,99,255,0.15)', color: '#a78bfa' },
    Student: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
    'Content Creator': { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
};

function UserModal({ user, onClose, onSave, error }) {
    const [form, setForm] = useState(user || { name: '', email: '', password: '', role: 'Student', status: 'active' });

    const isNew = !user;
    const canSave = form.name && form.email && (!isNew || form.password.length >= 6);

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 480 }}>
                <div className="modal-header">
                    <div className="modal-title">{user ? 'Edit User' : 'Add New User'}</div>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>

                <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input className="form-input" type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                {isNew && (
                    <div className="form-group">
                        <label className="form-label">Password * <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>(min 6 characters)</span></label>
                        <input className="form-input" type="password" placeholder="Set a login password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                        {form.password && form.password.length < 6 && (
                            <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>Password must be at least 6 characters</div>
                        )}
                    </div>
                )}
                <div className="form-group">
                    <label className="form-label">Role</label>
                    <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                        {ROLE_OPTIONS.map(r => <option key={r}>{r}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#f87171' }}>
                        ⚠️ {error}
                    </div>
                )}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" disabled={!canSave} onClick={() => { if (canSave) onSave(form); }}>
                        <Check size={15} /> {user ? 'Save Changes' : 'Add User'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function UsersPage({ searchQuery = '' }) {
    const { users, addUser, updateUser, deleteUser } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [filterRole, setFilterRole] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [addError, setAddError] = useState('');

    const filtered = users.filter(u => {
        if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase()) && !u.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (filterRole !== 'All' && u.role !== filterRole) return false;
        if (filterStatus !== 'All' && u.status !== filterStatus) return false;
        return true;
    });

    const roleCounts = ROLE_OPTIONS.reduce((acc, r) => ({ ...acc, [r]: users.filter(u => u.role === r).length }), {});

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <div className="page-title">User Management</div>
                    <div className="page-subtitle">{users.length} total users on the platform</div>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditUser(null); setShowModal(true); }}>
                    <Plus size={16} /> Add User
                </button>
            </div>

            {/* Role Summary Cards */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
                {ROLE_OPTIONS.map(role => {
                    const rc = ROLE_COLORS_MAP[role];
                    const isActive = filterRole === role;
                    return (
                        <div key={role} className="stat-card" style={{ cursor: 'pointer', outline: isActive ? `2px solid ${rc.color}` : 'none', outlineOffset: 2 }}
                            onClick={() => { setFilterRole(isActive ? 'All' : role); }}>
                            <div className="stat-icon" style={{ background: rc.bg, color: rc.color }}>{ROLE_ICONS[role]}</div>
                            <div className="stat-value">{roleCounts[role]}</div>
                            <div className="stat-label">{role}s</div>
                        </div>
                    );
                })}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <select className="form-select" style={{ width: 'auto', padding: '9px 14px' }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                    <option value="All">All Roles</option>
                    {ROLE_OPTIONS.map(r => <option key={r}>{r}</option>)}
                </select>
                <select className="form-select" style={{ width: 'auto', padding: '9px 14px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="All">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                {filterRole !== 'All' || filterStatus !== 'All' ? (
                    <button className="btn btn-secondary btn-sm" onClick={() => { setFilterRole('All'); setFilterStatus('All'); }}>Clear filters</button>
                ) : null}
                <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 13 }}>{filtered.length} of {users.length} users</div>
            </div>

            {/* Table */}
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Courses</th>
                            <th>Joined</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(user => {
                            const rc = ROLE_COLORS_MAP[user.role];
                            return (
                                <tr key={user.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div className="avatar-placeholder" style={{ width: 38, height: 38, background: `linear-gradient(135deg, ${rc.color}30, ${rc.color}60)`, color: rc.color, fontSize: 12, fontWeight: 700 }}>
                                                {user.initials}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{user.name}</div>
                                                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={10} /> {user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: rc.bg, color: rc.color, fontSize: 12, fontWeight: 600 }}>
                                            {ROLE_ICONS[user.role]} {user.role}
                                        </div>
                                    </td>
                                    <td>{user.courses}</td>
                                    <td>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {user.joined}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                                            {user.status === 'active' ? <UserCheck size={10} /> : <UserX size={10} />} {user.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn-icon btn-sm" title="Edit" onClick={() => { setEditUser(user); setShowModal(true); }}><Edit2 size={13} /></button>
                                            <button className="btn-icon btn-sm" title="Toggle Status"
                                                onClick={() => updateUser(user.id, { status: user.status === 'active' ? 'inactive' : 'active' })}
                                                style={{ color: user.status === 'active' ? 'var(--danger)' : 'var(--success)' }}>
                                                {user.status === 'active' ? <UserX size={13} /> : <UserCheck size={13} />}
                                            </button>
                                            <button className="btn-icon btn-sm" title="Delete" onClick={() => setDeleteConfirm(user.id)} style={{ color: 'var(--danger)' }}><Trash2 size={13} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    <User size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                    <div>No users found matching your criteria</div>
                </div>
            )}

            {showModal && (
                <UserModal
                    user={editUser}
                    onClose={() => { setShowModal(false); setEditUser(null); setAddError(''); }}
                    onSave={data => {
                        if (editUser) {
                            updateUser(editUser.id, data);
                            setShowModal(false); setEditUser(null);
                        } else {
                            // Check for duplicate email
                            const exists = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
                            if (exists) { setAddError('A user with this email already exists.'); return; }
                            if (!data.password || data.password.length < 6) { setAddError('Password must be at least 6 characters.'); return; }
                            addUser({ name: data.name, email: data.email.toLowerCase().trim(), password: data.password, role: data.role, status: data.status || 'active' });
                            setAddError('');
                            setShowModal(false);
                        }
                    }}
                    error={addError}
                />
            )}

            {deleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: 400, textAlign: 'center' }}>
                        <Trash2 size={40} style={{ color: 'var(--danger)', margin: '0 auto 16px' }} />
                        <div className="modal-title" style={{ marginBottom: 8 }}>Delete User?</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>This cannot be undone.</p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => { deleteUser(deleteConfirm); setDeleteConfirm(null); }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
