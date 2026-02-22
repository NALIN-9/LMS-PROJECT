import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ROLES } from '../utils/constants';
import {
    Plus, FileText, CheckCircle, Clock, AlertCircle, Star,
    X, Check, Edit3, Upload, Trash2, BookOpen, Send,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
function ScoreBadge({ score, maxScore }) {
    if (score === null || score === undefined)
        return <span className="badge badge-warning"><Clock size={10} /> Pending</span>;
    const pct = Math.round((score / (maxScore || 100)) * 100);
    const grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
    const cls = pct >= 90 ? 'badge-success' : pct >= 70 ? 'badge-primary' : pct >= 60 ? 'badge-warning' : 'badge-danger';
    return <span className={`badge ${cls}`}><Star size={10} /> {score}/{maxScore || 100} — {grade}</span>;
}

const STATUS_ICON = { active: <Edit3 size={20} />, upcoming: <Clock size={20} />, completed: <CheckCircle size={20} /> };
const STATUS_COLOR = {
    active: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
    upcoming: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
    completed: { bg: 'rgba(108,99,255,0.15)', color: '#a78bfa' },
};

// ── Admin: Create Assignment Modal ─────────────────────────────────────────────
function CreateAssignmentModal({ onClose, onSave, myCourses }) {
    const [form, setForm] = useState({
        title: '', courseId: myCourses[0]?.id || '', dueDate: '', maxScore: 100, description: '',
    });
    const [error, setError] = useState('');

    const handleSave = () => {
        if (!form.title.trim()) { setError('Assignment title is required.'); return; }
        if (!form.courseId) { setError('Please select a course.'); return; }
        if (!form.dueDate) { setError('Please set a due date.'); return; }
        onSave(form);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 520 }}>
                <div className="modal-header">
                    <div className="modal-title">Create Assignment</div>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#f87171', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertCircle size={14} /> {error}
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">Assignment Title *</label>
                    <input className="form-input" placeholder="e.g. Build a REST API" value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>

                <div className="grid-2">
                    <div className="form-group">
                        <label className="form-label">Course *</label>
                        {myCourses.length === 0
                            ? <div style={{ fontSize: 13, color: '#fbbf24', padding: '8px 0' }}>⚠ No published courses yet. Create and publish a course first.</div>
                            : <select className="form-select" value={form.courseId}
                                onChange={e => setForm({ ...form, courseId: Number(e.target.value) })}>
                                {myCourses.map(c => (
                                    <option key={c.id} value={c.id}>{c.title.slice(0, 38)}{c.title.length > 38 ? '…' : ''}</option>
                                ))}
                            </select>
                        }
                    </div>
                    <div className="form-group">
                        <label className="form-label">Max Score</label>
                        <input className="form-input" type="number" min="1" max="1000" value={form.maxScore}
                            onChange={e => setForm({ ...form, maxScore: e.target.value })} />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Due Date *</label>
                    <input className="form-input" type="date" value={form.dueDate}
                        onChange={e => setForm({ ...form, dueDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]} />
                </div>

                <div className="form-group">
                    <label className="form-label">Instructions for Students</label>
                    <textarea className="form-textarea"
                        placeholder="Describe what students need to submit, steps, requirements…"
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        style={{ minHeight: 100 }} />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={myCourses.length === 0}>
                        <Check size={15} /> Create Assignment
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Admin: Grade / Re-grade Modal ──────────────────────────────────────────────
function GradeModal({ submission, onClose, onGrade }) {
    const [score, setScore] = useState(submission.score ?? '');
    const [feedback, setFeedback] = useState(submission.feedback || '');

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 520 }}>
                <div className="modal-header">
                    <div className="modal-title">{submission.score !== null ? 'Re-grade Submission' : 'Grade Submission'}</div>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>

                {/* Meta */}
                <div style={{ background: 'var(--bg-surface)', borderRadius: 10, padding: 16, marginBottom: 20, border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{submission.assignmentTitle}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 10 }}>
                        <span>Student: <strong style={{ color: 'var(--text-secondary)' }}>{submission.studentName}</strong></span>
                        <span>• Submitted: {submission.submittedAt}</span>
                    </div>
                </div>

                {/* Student answer */}
                {submission.answer && (
                    <div style={{ marginBottom: 18 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                            Student's Answer
                        </div>
                        <div style={{ background: 'var(--bg-surface)', borderRadius: 8, padding: 14, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, border: '1px solid var(--border-light)', maxHeight: 180, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {submission.answer}
                        </div>
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">Score (out of {submission.maxScore || 100})</label>
                    <input className="form-input" type="number" min="0" max={submission.maxScore || 100}
                        value={score} onChange={e => setScore(e.target.value)} placeholder="e.g. 85" />
                </div>
                <div className="form-group">
                    <label className="form-label">Feedback for Student</label>
                    <textarea className="form-textarea" value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        placeholder="Write constructive feedback…" style={{ minHeight: 100 }} />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" disabled={score === ''}
                        onClick={() => { if (score !== '') { onGrade(submission.id, Number(score), feedback); onClose(); } }}>
                        <Check size={15} /> Submit Grade
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Student: Submit Assignment Modal ──────────────────────────────────────────
function SubmitModal({ assignment, onClose, onSubmit }) {
    const [answer, setAnswer] = useState('');

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 540 }}>
                <div className="modal-header">
                    <div className="modal-title">Submit Assignment</div>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>

                {/* Assignment info */}
                <div style={{ background: 'var(--bg-surface)', borderRadius: 10, padding: 16, marginBottom: 16, border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{assignment.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <span>{assignment.courseName}</span>
                        <span>• Due: {assignment.dueDate}</span>
                        <span>• Max: {assignment.maxScore} pts</span>
                    </div>
                </div>

                {/* Instructions */}
                {assignment.description && (
                    <div style={{ marginBottom: 18, padding: '12px 14px', background: 'rgba(108,99,255,0.08)', borderRadius: 8, border: '1px solid rgba(108,99,255,0.2)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        <strong style={{ color: 'var(--primary-light)', fontSize: 12, display: 'block', marginBottom: 4 }}>Instructions:</strong>
                        {assignment.description}
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">Your Answer / Submission *</label>
                    <textarea
                        className="form-textarea"
                        placeholder="Type your answer, paste your code, or describe your work here…"
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                        style={{ minHeight: 160 }}
                    />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" disabled={!answer.trim()}
                        onClick={() => { if (answer.trim()) { onSubmit(answer); onClose(); } }}>
                        <Send size={15} /> Submit Assignment
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AssignmentsPage() {
    const {
        currentUser,
        addAssignment, deleteAssignment,
        submitAssignment, gradeSubmission,
        getAdminCourses, getAdminAssignments, getAdminSubmissions,
        getStudentAssignments, submissions,
    } = useApp();

    const [activeTab, setActiveTab] = useState('assignments');
    const [showCreate, setShowCreate] = useState(false);
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [submittingAssignment, setSubmittingAssignment] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const isAdmin = currentUser.role === ROLES.ADMIN;
    const isStudent = currentUser.role === ROLES.STUDENT;

    // Scoped data
    const myCourses = isAdmin ? getAdminCourses(currentUser.id).filter(c => c.status === 'published') : [];
    const myAssignments = isAdmin
        ? getAdminAssignments(currentUser.id)
        : getStudentAssignments(currentUser.id);
    const mySubmissions = isAdmin
        ? getAdminSubmissions(currentUser.id)
        : submissions.filter(s => s.studentId === currentUser.id);

    const submittedIds = new Set(mySubmissions.filter(s => s.studentId === currentUser.id).map(s => s.assignmentId));
    const pendingCount = isAdmin ? mySubmissions.filter(s => s.status === 'pending').length : 0;

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="page-header">
                <div>
                    <div className="page-title">Assignments</div>
                    <div className="page-subtitle">
                        {isAdmin
                            ? `${myAssignments.length} assignment${myAssignments.length !== 1 ? 's' : ''} · ${pendingCount} pending review`
                            : `${myAssignments.length} available · ${mySubmissions.length} submitted`}
                    </div>
                </div>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                        <Plus size={16} /> Create Assignment
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>
                    Assignments ({myAssignments.length})
                </button>
                <button className={`tab ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>
                    {isStudent ? 'My Submissions' : 'Submissions'}
                    {pendingCount > 0 && <span className="nav-badge" style={{ marginLeft: 6 }}>{pendingCount}</span>}
                </button>
            </div>

            {/* ── Assignments Tab ── */}
            {activeTab === 'assignments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {myAssignments.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                            <FileText size={52} style={{ marginBottom: 16, opacity: 0.3 }} />
                            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>No assignments yet</div>
                            <div style={{ fontSize: 14 }}>
                                {isAdmin
                                    ? 'Click "Create Assignment" to add the first one. You must have a published course first.'
                                    : 'No assignments for your enrolled courses yet.'}
                            </div>
                        </div>
                    )}

                    {myAssignments.map(a => {
                        const alreadySubmitted = isStudent && submittedIds.has(a.id);
                        const sc = STATUS_COLOR[a.status] || STATUS_COLOR.active;
                        return (
                            <div key={a.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 20, padding: '20px 24px' }}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: sc.bg, color: sc.color }}>
                                    {STATUS_ICON[a.status] || STATUS_ICON.active}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{a.title}</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: a.description ? 8 : 0 }}>
                                        <span><BookOpen size={12} /> {a.courseName}</span>
                                        <span><Clock size={12} /> Due: {a.dueDate}</span>
                                        <span>Max: {a.maxScore} pts</span>
                                        {isAdmin && <span>{a.submissions} submitted · {a.graded} graded</span>}
                                    </div>
                                    {a.description && (
                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>{a.description}</div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                                    <span className={`badge ${a.status === 'active' ? 'badge-success' : a.status === 'completed' ? 'badge-primary' : 'badge-warning'}`}>{a.status}</span>
                                    {isStudent && (
                                        alreadySubmitted
                                            ? <span className="badge badge-primary"><CheckCircle size={10} /> Submitted</span>
                                            : <button className="btn btn-primary btn-sm" onClick={() => setSubmittingAssignment(a)}>
                                                <Upload size={13} /> Submit
                                            </button>
                                    )}
                                    {isAdmin && (
                                        <button className="btn-icon btn-sm" style={{ color: 'var(--danger)' }} title="Delete"
                                            onClick={() => setDeleteConfirmId(a.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Submissions Tab ── */}
            {activeTab === 'submissions' && (
                <div>
                    {mySubmissions.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                            <Upload size={52} style={{ marginBottom: 16, opacity: 0.3 }} />
                            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                                {isStudent ? 'No submissions yet' : 'No submissions received'}
                            </div>
                            <div style={{ fontSize: 14 }}>
                                {isStudent ? 'Go to the Assignments tab to submit your work.' : 'Student submissions will appear here once they submit.'}
                            </div>
                        </div>
                    )}

                    {mySubmissions.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {mySubmissions.map(s => (
                                <div key={s.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 20, padding: '18px 24px' }}>
                                    {isAdmin && (
                                        <div className="avatar-placeholder" style={{ width: 40, height: 40, background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: 13, flexShrink: 0 }}>
                                            {s.studentInitials}
                                        </div>
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {isAdmin && (
                                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{s.studentName}</div>
                                        )}
                                        <div style={{ fontSize: 13, fontWeight: isAdmin ? 400 : 600, color: isAdmin ? 'var(--text-secondary)' : 'var(--text-primary)', marginBottom: 4 }}>
                                            {s.assignmentTitle}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                            <span>{s.courseName}</span>
                                            <span>• Submitted: {s.submittedAt}</span>
                                        </div>
                                        {/* Answer preview */}
                                        {s.answer && (
                                            <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, maxHeight: 100, overflowY: 'auto', border: '1px solid var(--border-light)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                                {s.answer}
                                            </div>
                                        )}
                                        {/* Feedback */}
                                        {s.feedback && (
                                            <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(16,185,129,0.08)', borderRadius: 8, fontSize: 12, color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                                                <strong>Feedback:</strong> {s.feedback}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                                        <ScoreBadge score={s.score} maxScore={s.maxScore} />
                                        {isAdmin && (
                                            <button className="btn btn-primary btn-sm" onClick={() => setGradingSubmission(s)}>
                                                {s.status === 'graded' ? <><Edit3 size={12} /> Re-grade</> : <><Star size={12} /> Grade</>}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Modals ── */}
            {showCreate && (
                <CreateAssignmentModal
                    onClose={() => setShowCreate(false)}
                    myCourses={myCourses}
                    onSave={data => addAssignment(data)}
                />
            )}

            {submittingAssignment && (
                <SubmitModal
                    assignment={submittingAssignment}
                    onClose={() => setSubmittingAssignment(null)}
                    onSubmit={answer => submitAssignment(
                        submittingAssignment.id,
                        currentUser.id,
                        currentUser.name,
                        currentUser.initials,
                        answer,
                    )}
                />
            )}

            {gradingSubmission && (
                <GradeModal
                    submission={gradingSubmission}
                    onClose={() => setGradingSubmission(null)}
                    onGrade={gradeSubmission}
                />
            )}

            {deleteConfirmId && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: 400, textAlign: 'center' }}>
                        <Trash2 size={40} style={{ color: 'var(--danger)', margin: '0 auto 16px' }} />
                        <div className="modal-title" style={{ marginBottom: 8 }}>Delete Assignment?</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
                            All student submissions for this assignment will also be permanently deleted.
                        </p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={() => { deleteAssignment(deleteConfirmId); setDeleteConfirmId(null); }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
