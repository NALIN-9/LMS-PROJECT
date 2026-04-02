import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ROLES } from '../utils/constants';
import { Users, BookMarked, Search, Star } from 'lucide-react';

export default function StudentsPage() {
    const { users, courses, currentUser } = useApp();
    const [search, setSearch] = useState('');
    const [filterCourse, setFilterCourse] = useState('All');

    const myCourses = courses.filter(c => c.instructor === currentUser.name);
    const students = users.filter(u => u.role === ROLES.STUDENT);
    const filteredStudents = students.filter(s =>
        (search === '' || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <div className="page-title">My Students</div>
                    <div className="page-subtitle">{students.length} students enrolled in your courses</div>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(108,99,255,0.15)', color: '#a78bfa' }}><Users size={22} /></div>
                    <div className="stat-value">{students.length}</div>
                    <div className="stat-label">Total Students</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}><BookMarked size={22} /></div>
                    <div className="stat-value">{myCourses.length}</div>
                    <div className="stat-label">Your Courses</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}><Star size={22} /></div>
                    <div className="stat-value">4.8</div>
                    <div className="stat-label">Avg. Rating</div>
                </div>
            </div>

            {/* Filter Row */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <div className="search-bar" style={{ maxWidth: 280 }}>
                    <Search size={15} style={{ color: 'var(--text-muted)' }} />
                    <input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="form-select" style={{ width: 'auto', padding: '9px 14px' }} value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
                    <option value="All">All Courses</option>
                    {myCourses.map(c => <option key={c.id}>{c.title.slice(0, 35)}...</option>)}
                </select>
            </div>

            {/* Student Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {filteredStudents.map(s => (
                    <div key={s.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div className="avatar-placeholder" style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: '#fff', fontSize: 16, fontWeight: 700 }}>{s.initials}</div>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.email}</div>
                            </div>
                            <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-neutral'}`} style={{ marginLeft: 'auto' }}>{s.status}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <div style={{ background: 'var(--bg-surface)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary-light)' }}>{s.courses || 0}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Courses</div>
                            </div>
                            <div style={{ background: 'var(--bg-surface)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
                                <div style={{ fontSize: 18, fontWeight: 700, color: '#34d399' }}>{60 + (s.id % 40)}%</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Progress</div>
                            </div>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Joined: {s.joined}</div>
                    </div>
                ))}
            </div>

            {filteredStudents.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    <Users size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                    <div>No students found</div>
                </div>
            )}
        </div>
    );
}
