import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ROLES } from '../utils/constants';
import { Plus, Edit2, Trash2, Search, Users, Clock, BookOpen, PlayCircle, X, Check, Lock } from 'lucide-react';

// ── Admin: Create / Edit Course Modal ─────────────────────────────────────────
function CourseModal({ course, onClose, onSave }) {
    const [form, setForm] = useState(course || {
        title: '', category: 'Development', level: 'Beginner',
        duration: '', description: '', status: 'published', lessons: 0, tags: '',
    });

    const categories = ['Development', 'Design', 'Data Science', 'AI & ML', 'Mathematics', 'Science', 'Photography', 'Mobile', 'Business'];
    const levels = ['Beginner', 'Intermediate', 'Advanced'];

    const handleSave = () => {
        if (!form.title.trim()) return;
        const tagsArr = typeof form.tags === 'string'
            ? form.tags.split(',').map(t => t.trim()).filter(Boolean)
            : form.tags;
        onSave({ ...form, tags: tagsArr, lessons: Number(form.lessons) || 0 });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 600 }}>
                <div className="modal-header">
                    <div className="modal-title">{course ? 'Edit Course' : '+ Create New Course'}</div>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>

                <div className="form-group">
                    <label className="form-label">Course Title *</label>
                    <input className="form-input" placeholder="e.g. Full-Stack Web Development"
                        value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>

                <div className="grid-2">
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                            {categories.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Level</label>
                        <select className="form-select" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                            {levels.map(l => <option key={l}>{l}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid-2">
                    <div className="form-group">
                        <label className="form-label">Duration (e.g. 24h)</label>
                        <input className="form-input" placeholder="e.g. 32h" value={form.duration}
                            onChange={e => setForm({ ...form, duration: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">No. of Lessons</label>
                        <input className="form-input" type="number" min="0" placeholder="0" value={form.lessons}
                            onChange={e => setForm({ ...form, lessons: e.target.value })} />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Tags (comma separated)</label>
                    <input className="form-input" placeholder="e.g. React, Node.js"
                        value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags}
                        onChange={e => setForm({ ...form, tags: e.target.value })} />
                </div>

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" placeholder="What will students learn?"
                        value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>

                <div className="form-group">
                    <label className="form-label">Visibility</label>
                    <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                        <option value="published">Published — visible to enrolled students</option>
                        <option value="draft">Draft — hidden from students</option>
                    </select>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={!form.title.trim()}>
                        <Check size={15} /> {course ? 'Save Changes' : 'Create Course'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Student: Course Detail / Enroll Modal ─────────────────────────────────────
function CourseDetailModal({ course, enrolled, onEnroll, onClose }) {
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 620 }}>
                <div style={{ height: 180, background: course.thumb.gradient, borderRadius: 12, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72 }}>
                    {course.thumb.icon}
                </div>
                <div className="modal-header" style={{ marginBottom: 12 }}>
                    <div className="modal-title" style={{ fontSize: 20 }}>{course.title}</div>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    <span className="badge badge-primary">{course.category}</span>
                    <span className="badge badge-neutral">{course.level}</span>
                    {course.duration && <span className="badge badge-neutral"><Clock size={10} /> {course.duration}</span>}
                </div>

                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                    {course.description || 'No description provided.'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                    {[
                        { icon: <Users size={16} />, label: `${course.students} enrolled` },
                        { icon: <BookOpen size={16} />, label: `${course.lessons || 0} lessons` },
                        { icon: <Clock size={16} />, label: course.duration || '—' },
                    ].map((item, i) => (
                        <div key={i} style={{ background: 'var(--bg-surface)', borderRadius: 10, padding: 12, textAlign: 'center', border: '1px solid var(--border-light)' }}>
                            <div style={{ color: 'var(--primary-light)', marginBottom: 4, display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</div>
                        </div>
                    ))}
                </div>

                {course.tags?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                        {course.tags.map(t => <span key={t} className="badge badge-secondary">{t}</span>)}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                    {enrolled
                        ? <button className="btn btn-primary" onClick={onClose}><PlayCircle size={15} /> Continue Learning</button>
                        : <button className="btn btn-primary btn-lg" onClick={() => { onEnroll(); onClose(); }}>Enroll Now — It's Free!</button>
                    }
                </div>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CoursesPage({ activePage, searchQuery = '' }) {
    const {
        currentUser,
        addCourse, updateCourse, deleteCourse,
        getAdminCourses, getPublishedCourses, getEnrolledCourses,
        enrollStudent, isEnrolled,
    } = useApp();

    const [showModal, setShowModal] = useState(false);
    const [editCourse, setEditCourse] = useState(null);
    const [viewCourse, setViewCourse] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [filterCategory, setFilterCategory] = useState('All');

    // Default to 'enrolled' if navigated via the "My Learning" sidebar button
    const [activeTab, setActiveTab] = useState(activePage === 'my-courses' ? 'enrolled' : 'all');

    useEffect(() => {
        setActiveTab(activePage === 'my-courses' ? 'enrolled' : 'all');
    }, [activePage]);

    const isStaff = [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.CONTENT_CREATOR].includes(currentUser.role);
    const isStudent = currentUser.role === ROLES.STUDENT;

    // Staff see ONLY their own created courses; students see all published courses
    const visibleCourses = isStaff
        ? getAdminCourses(currentUser.id)
        : getPublishedCourses();

    const enrolledCourses = isStudent ? getEnrolledCourses(currentUser.id) : [];

    const displayCourses = visibleCourses.filter(c => {
        if (activeTab === 'enrolled' && !isEnrolled(currentUser.id, c.id)) return false;
        if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (filterCategory !== 'All' && c.category !== filterCategory) return false;
        return true;
    });

    const categories = ['All', ...new Set(visibleCourses.map(c => c.category))];

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="page-header">
                <div>
                    <div className="page-title">
                        {isStaff ? 'My Courses' : (activeTab === 'enrolled' ? '🎓 My Learning' : '📚 Browse Courses')}
                    </div>
                    <div className="page-subtitle">
                        {isStaff
                            ? `${visibleCourses.length} course${visibleCourses.length !== 1 ? 's' : ''} you created`
                            : activeTab === 'enrolled'
                                ? `${enrolledCourses.length} course${enrolledCourses.length !== 1 ? 's' : ''} you're enrolled in`
                                : `${visibleCourses.length} courses available · ${enrolledCourses.length} enrolled`}
                    </div>
                </div>
                {isStaff && (
                    <button className="btn btn-primary" onClick={() => { setEditCourse(null); setShowModal(true); }}>
                        <Plus size={16} /> New Course
                    </button>
                )}
            </div>

            {/* Tabs — student only */}
            {isStudent && (
                <div className="tabs">
                    <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                        📚 Browse All
                    </button>
                    <button className={`tab ${activeTab === 'enrolled' ? 'active' : ''}`} onClick={() => setActiveTab('enrolled')}>
                        🎓 My Learning ({enrolledCourses.length})
                    </button>
                </div>
            )}


            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {categories.slice(0, 7).map(cat => (
                        <button key={cat} onClick={() => setFilterCategory(cat)}
                            style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontFamily: 'Inter', cursor: 'pointer', border: filterCategory === cat ? 'none' : '1px solid var(--border-light)', background: filterCategory === cat ? 'var(--primary)' : 'var(--bg-card)', color: filterCategory === cat ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Empty state */}
            {displayCourses.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                    <BookOpen size={52} style={{ marginBottom: 16, opacity: 0.3 }} />
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                        {isStaff
                            ? 'No courses yet'
                            : activeTab === 'enrolled'
                                ? "You haven't enrolled in any courses"
                                : 'No courses available yet'}
                    </div>
                    <div style={{ fontSize: 14 }}>
                        {isStaff
                            ? 'Click "New Course" to create your first course.'
                            : activeTab === 'enrolled'
                                ? 'Browse all courses and click "Enroll Now".'
                                : 'Check back later — the admin will publish courses soon.'}
                    </div>
                    {isStaff && (
                        <button className="btn btn-primary" style={{ marginTop: 20 }}
                            onClick={() => { setEditCourse(null); setShowModal(true); }}>
                            <Plus size={16} /> Create First Course
                        </button>
                    )}
                </div>
            )}

            {/* Course Grid */}
            {displayCourses.length > 0 && (
                <div className="course-grid">
                    {displayCourses.map(course => {
                        const enrolled = isStudent && isEnrolled(currentUser.id, course.id);
                        return (
                            <div key={course.id} className="course-card" onClick={() => setViewCourse(course)}>
                                {/* Thumbnail */}
                                <div className="course-card-thumb">
                                    <div className="course-card-thumb-inner" style={{ background: course.thumb.gradient }}>
                                        <span style={{ fontSize: 48 }}>{course.thumb.icon}</span>
                                    </div>
                                    <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
                                        {isStaff && (
                                            <span className={`badge ${course.status === 'published' ? 'badge-success' : 'badge-neutral'}`}>
                                                {course.status}
                                            </span>
                                        )}
                                        {enrolled && <span className="badge badge-primary">Enrolled ✓</span>}
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="course-card-body">
                                    <div className="course-card-category" style={{ color: 'var(--primary-light)' }}>{course.category}</div>
                                    <div className="course-card-title">{course.title}</div>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                                        {course.tags?.slice(0, 2).map(t => (
                                            <span key={t} className="badge badge-secondary" style={{ fontSize: 10 }}>{t}</span>
                                        ))}
                                        <span className="badge badge-neutral" style={{ fontSize: 10 }}>{course.level}</span>
                                    </div>
                                    <div className="course-card-footer">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                                            <span><Users size={12} /> {course.students} students</span>
                                            {course.duration && <span><Clock size={12} /> {course.duration}</span>}
                                        </div>
                                        {isStaff && (
                                            <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                                                <button className="btn-icon btn-sm" title="Edit"
                                                    onClick={e => { e.stopPropagation(); setEditCourse(course); setShowModal(true); }}>
                                                    <Edit2 size={13} />
                                                </button>
                                                <button className="btn-icon btn-sm" title="Delete" style={{ color: 'var(--danger)' }}
                                                    onClick={e => { e.stopPropagation(); setDeleteConfirm(course.id); }}>
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        )}
                                        {isStudent && (
                                            <span style={{ fontSize: 12, color: enrolled ? '#34d399' : 'var(--text-muted)', fontWeight: 600 }}>
                                                {enrolled ? '✓ Enrolled' : 'Click to enroll'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Draft notice for admin */}
            {isStaff && visibleCourses.some(c => c.status === 'draft') && (
                <div style={{ marginTop: 16, padding: '10px 16px', background: 'rgba(245,158,11,0.1)', borderRadius: 10, border: '1px solid rgba(245,158,11,0.25)', fontSize: 13, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Lock size={14} /> Draft courses are only visible to you. Publish them for students to see.
                </div>
            )}

            {/* ── Modals ── */}
            {showModal && (
                <CourseModal
                    course={editCourse}
                    onClose={() => { setShowModal(false); setEditCourse(null); }}
                    onSave={data => editCourse ? updateCourse(editCourse.id, data) : addCourse(data)}
                />
            )}

            {viewCourse && !showModal && (
                isStaff ? (
                    <CourseModal
                        course={viewCourse}
                        onClose={() => setViewCourse(null)}
                        onSave={data => updateCourse(viewCourse.id, data)}
                    />
                ) : (
                    <CourseDetailModal
                        course={viewCourse}
                        enrolled={isEnrolled(currentUser.id, viewCourse.id)}
                        onEnroll={() => enrollStudent(currentUser.id, viewCourse.id)}
                        onClose={() => setViewCourse(null)}
                    />
                )
            )}

            {deleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: 420, textAlign: 'center' }}>
                        <Trash2 size={40} style={{ color: 'var(--danger)', margin: '0 auto 16px' }} />
                        <div className="modal-title" style={{ marginBottom: 8 }}>Delete Course?</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
                            All assignments and student submissions for this course will also be permanently deleted.
                        </p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => { deleteCourse(deleteConfirm); setDeleteConfirm(null); }}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
