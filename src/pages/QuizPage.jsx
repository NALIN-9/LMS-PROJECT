import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ROLES } from '../utils/constants';
import { Plus, Trash2, X, Check, BookOpen, Clock, Eye } from 'lucide-react';

// ── Create/Edit Quiz Modal ────────────────────────────────────────────────────
function QuizModal({ quiz, courses, onClose, onSave }) {
    const [title, setTitle] = useState(quiz?.title ?? '');
    const [courseId, setCourseId] = useState(quiz?.courseId ?? '');
    const [allowRetake, setAllowRetake] = useState(quiz?.allowRetake ?? true);
    const [timeLimit, setTimeLimit] = useState(quiz?.timeLimit ?? 0);   // 0 = no limit; else minutes
    const [dueDate, setDueDate] = useState(quiz?.dueDate ?? '');
    const [questions, setQuestions] = useState(quiz?.questions ?? [
        { q: '', options: ['', '', '', ''], answer: 0 }
    ]);

    const addQ = () => setQuestions(prev => [...prev, { q: '', options: ['', '', '', ''], answer: 0 }]);
    const removeQ = (i) => setQuestions(prev => prev.filter((_, j) => j !== i));
    const updateQ = (i, field, val) => setQuestions(prev => prev.map((q, j) => j === i ? { ...q, [field]: val } : q));
    const updateOpt = (qi, oi, val) => setQuestions(prev => prev.map((q, j) => j === qi ? { ...q, options: q.options.map((o, k) => k === oi ? val : o) } : q));

    const valid = title.trim() && questions.every(q => q.q.trim() && q.options.every(o => o.trim()));

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 700, maxHeight: '88vh', overflowY: 'auto' }}>
                <div className="modal-header">
                    <div className="modal-title">{quiz ? 'Edit Quiz' : 'Create Quiz'}</div>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>

                {/* Basic info */}
                <div className="form-group">
                    <label className="form-label">Quiz Title *</label>
                    <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. JavaScript Basics Quiz" />
                </div>
                <div className="grid-2">
                    <div className="form-group">
                        <label className="form-label">Associated Course</label>
                        <select className="form-select" value={courseId} onChange={e => setCourseId(e.target.value)}>
                            <option value="">-- General --</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Due Date (optional)</label>
                        <input className="form-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                    </div>
                </div>

                {/* Settings */}
                <div className="grid-2" style={{ marginBottom: 16 }}>
                    <div style={{ background: 'var(--bg-surface)', borderRadius: 10, padding: 14, border: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Retake Mode</div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginBottom: 6 }}>
                            <input type="radio" checked={allowRetake} onChange={() => setAllowRetake(true)} style={{ accentColor: 'var(--primary)' }} />
                            <span>Allow Retakes (unlimited)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                            <input type="radio" checked={!allowRetake} onChange={() => setAllowRetake(false)} style={{ accentColor: 'var(--danger)' }} />
                            <span style={{ color: 'var(--danger)' }}>One-Time Only — no retakes</span>
                        </label>
                    </div>
                    <div style={{ background: 'var(--bg-surface)', borderRadius: 10, padding: 14, border: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Time Limit</div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginBottom: 6 }}>
                            <input type="radio" checked={timeLimit === 0} onChange={() => setTimeLimit(0)} style={{ accentColor: 'var(--primary)' }} />
                            No Time Limit
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                            <input type="radio" checked={timeLimit > 0} onChange={() => setTimeLimit(10)} style={{ accentColor: 'var(--primary)' }} />
                            Timed:&nbsp;
                            <input type="number" min="1" max="180"
                                value={timeLimit > 0 ? timeLimit : ''}
                                onChange={e => setTimeLimit(Number(e.target.value) || 1)}
                                style={{ width: 55, background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 6, padding: '3px 6px', color: 'var(--text-primary)', fontSize: 13 }}
                                disabled={timeLimit === 0}
                            />
                            &nbsp;min
                        </label>
                    </div>
                </div>

                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: 'var(--primary-light)' }}>Questions ({questions.length})</div>
                {questions.map((q, qi) => (
                    <div key={qi} style={{ background: 'var(--bg-surface)', borderRadius: 12, padding: 16, marginBottom: 12, border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-light)' }}>Q{qi + 1}</span>
                            {questions.length > 1 && <button onClick={() => removeQ(qi)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={14} /></button>}
                        </div>
                        <input className="form-input" style={{ marginBottom: 10 }} value={q.q} onChange={e => updateQ(qi, 'q', e.target.value)} placeholder="Question text..." />
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Options (select the correct answer):</div>
                        {q.options.map((opt, oi) => (
                            <div key={oi} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                                <input type="radio" name={`q${qi}`} checked={q.answer === oi} onChange={() => updateQ(qi, 'answer', oi)} style={{ accentColor: 'var(--primary)', cursor: 'pointer' }} />
                                <input className="form-input" style={{ flex: 1 }} value={opt} onChange={e => updateOpt(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`} />
                            </div>
                        ))}
                    </div>
                ))}

                <button className="btn btn-secondary" onClick={addQ} style={{ width: '100%', marginBottom: 16 }}><Plus size={14} /> Add Question</button>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" disabled={!valid} onClick={() => {
                        onSave({ title, courseId: courseId || null, questions, allowRetake, timeLimit: Number(timeLimit), dueDate: dueDate || null });
                        onClose();
                    }}>
                        <Check size={14} /> {quiz ? 'Save Changes' : 'Create Quiz'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Take Quiz Modal (Student) with timer ─────────────────────────────────────
function TakeQuizModal({ quiz, onClose, onSubmit, isRetake }) {
    const totalSec = (quiz.timeLimit ?? 0) * 60;
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [secsLeft, setSecsLeft] = useState(totalSec || null);
    const timerRef = useRef(null);

    // Start countdown
    useEffect(() => {
        if (!totalSec || submitted) return;
        timerRef.current = setInterval(() => {
            setSecsLeft(s => {
                if (s <= 1) { clearInterval(timerRef.current); doSubmit(true); return 0; }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const doSubmit = (autoSubmit = false) => {
        clearInterval(timerRef.current);
        let s = 0;
        quiz.questions.forEach((q, i) => { if (answers[i] === q.answer) s++; });
        setScore(s); setSubmitted(true);
        onSubmit(s, quiz.questions.length);
    };

    const fmtTime = (s) => {
        const m = Math.floor(s / 60), ss = s % 60;
        return `${m}:${String(ss).padStart(2, '0')}`;
    };

    const urgentTimer = secsLeft !== null && secsLeft < 30;

    return (
        <div className="modal-overlay" onClick={e => !submitted && e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="modal-title">{quiz.title}</div>
                        {!quiz.allowRetake && <span style={{ fontSize: 11, background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>ONE-TIME</span>}
                        {isRetake && <span style={{ fontSize: 11, background: 'rgba(251,191,36,0.15)', color: '#fbbf24', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>RETAKE</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Timer */}
                        {secsLeft !== null && !submitted && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 700, color: urgentTimer ? 'var(--danger)' : 'var(--primary-light)', background: urgentTimer ? 'rgba(239,68,68,0.1)' : 'rgba(0,212,255,0.08)', padding: '4px 12px', borderRadius: 20, border: `1px solid ${urgentTimer ? 'rgba(239,68,68,0.3)' : 'rgba(0,212,255,0.2)'}` }}>
                                <Clock size={14} />
                                {fmtTime(secsLeft)}
                            </div>
                        )}
                        <button className="modal-close" onClick={onClose}><X size={16} /></button>
                    </div>
                </div>

                {!submitted ? (
                    <>
                        {quiz.questions.map((q, qi) => (
                            <div key={qi} style={{ background: 'var(--bg-surface)', borderRadius: 12, padding: 16, marginBottom: 12, border: '1px solid var(--border-light)' }}>
                                <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Q{qi + 1}: {q.q}</div>
                                {q.options.map((opt, oi) => (
                                    <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 6, background: answers[qi] === oi ? 'rgba(0,212,255,0.1)' : 'var(--bg-card)', border: `1px solid ${answers[qi] === oi ? 'var(--primary)' : 'var(--border-light)'}`, transition: 'all 0.15s' }}>
                                        <input type="radio" name={`q${qi}`} checked={answers[qi] === oi} onChange={() => setAnswers(a => ({ ...a, [qi]: oi }))} style={{ accentColor: 'var(--primary)' }} />
                                        <span style={{ fontSize: 13 }}>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        ))}
                        <button className="btn btn-primary" style={{ width: '100%' }} disabled={Object.keys(answers).length < quiz.questions.length} onClick={() => doSubmit()}>
                            Submit Quiz
                        </button>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: 32 }}>
                        <div style={{ fontSize: 56, marginBottom: 16 }}>{score / quiz.questions.length >= 0.7 ? '🎉' : '📖'}</div>
                        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{score} / {quiz.questions.length}</div>
                        <div style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 16 }}>
                            {Math.round(score / quiz.questions.length * 100)}% — {score / quiz.questions.length >= 0.7 ? 'Great job!' : 'Keep practicing!'}
                        </div>
                        <div style={{ textAlign: 'left', marginBottom: 20 }}>
                            {quiz.questions.map((q, i) => (
                                <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                    <span style={{ color: answers[i] === q.answer ? 'var(--success)' : 'var(--danger)', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                                        {answers[i] === q.answer ? '✓' : '✗'}
                                    </span>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{q.q}</div>
                                        <div style={{ fontSize: 12, color: answers[i] === q.answer ? 'var(--success)' : 'var(--danger)', marginTop: 2 }}>
                                            Correct: {q.options[q.answer]}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="btn btn-primary" onClick={onClose}>Done</button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Admin: Retake / Attempt detail dialog ─────────────────────────────────────
function AttemptsModal({ quiz, allAttempts, users, onClose }) {
    const attempts = allAttempts.filter(a => a.quizId === quiz.id);
    const byUser = {};
    attempts.forEach(a => {
        if (!byUser[a.userId]) byUser[a.userId] = [];
        byUser[a.userId].push(a);
    });

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 560 }}>
                <div className="modal-header">
                    <div className="modal-title">Attempts — {quiz.title}</div>
                    <button className="modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                {Object.keys(byUser).length === 0 ? (
                    <div style={{ color: 'var(--text-secondary)', fontSize: 14, padding: 16 }}>No attempts yet.</div>
                ) : Object.entries(byUser).map(([uid, atts]) => {
                    const user = users.find(u => u.id === Number(uid));
                    const best = atts.reduce((b, a) => (!b || a.score / a.total > b.score / b.total ? a : b), null);
                    return (
                        <div key={uid} style={{ padding: 16, borderBottom: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>
                                    {user?.name ?? 'Unknown'}&nbsp;
                                    {atts.length > 1 && <span style={{ fontSize: 11, background: 'rgba(251,191,36,0.15)', color: '#fbbf24', padding: '1px 7px', borderRadius: 20, fontWeight: 700 }}>Retaken {atts.length - 1}×</span>}
                                </div>
                                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{atts.length} attempt{atts.length !== 1 ? 's' : ''}</span>
                            </div>
                            {atts.map((a, i) => (
                                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', padding: '3px 0' }}>
                                    <span>Attempt {i + 1}: <strong style={{ color: 'var(--text-primary)' }}>{a.score}/{a.total} ({Math.round(a.score / a.total * 100)}%)</strong></span>
                                    <span>{a.date}</span>
                                </div>
                            ))}
                            <div style={{ fontSize: 12, color: 'var(--primary-light)', marginTop: 4 }}>Best: {best.score}/{best.total} ({Math.round(best.score / best.total * 100)}%)</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function QuizPage() {
    const {
        currentUser, users,
        quizzes, addQuiz, updateQuiz, deleteQuiz,
        submitQuizAttempt, getQuizAttempts, quizAttempts,
        courses, getPublishedCourses,
    } = useApp();

    const isStaff = [ROLES.ADMIN, ROLES.INSTRUCTOR, ROLES.CONTENT_CREATOR].includes(currentUser.role);
    const isStudent = currentUser.role === ROLES.STUDENT;

    const [showCreate, setShowCreate] = useState(false);
    const [editQuiz, setEditQuiz] = useState(null);
    const [takeQuiz, setTakeQuiz] = useState(null);
    const [viewAttempts, setViewAttempts] = useState(null);

    const myCourses = isStaff
        ? courses.filter(c => c.createdBy === currentUser.id || currentUser.role === ROLES.ADMIN)
        : courses;

    // Students see ALL quizzes (general + course-specific).
    // Staff see only their own quizzes (admin sees all).
    const visibleQuizzes = isStudent
        ? quizzes   // all quizzes visible to students
        : quizzes.filter(q => currentUser.role === ROLES.ADMIN || q.createdBy === currentUser.id);

    const getCourseName = (id) => courses.find(c => c.id === id)?.title ?? 'General';
    const getBestAttempt = (quizId) => {
        const attempts = getQuizAttempts(quizId, currentUser.id);
        if (!attempts.length) return null;
        return attempts.reduce((b, a) => (!b || a.score / a.total > b.score / b.total ? a : b), null);
    };
    const attemptCount = (quizId) => getQuizAttempts(quizId, currentUser.id).length;

    const isOverdue = (q) => q.dueDate && q.dueDate < new Date().toISOString().split('T')[0];

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <div className="page-title">Quizzes</div>
                    <div className="page-subtitle">
                        {isStudent ? 'Test your knowledge with multiple-choice quizzes' : `${visibleQuizzes.length} quiz${visibleQuizzes.length !== 1 ? 'zes' : ''} total`}
                    </div>
                </div>
                {isStaff && (
                    <button className="btn btn-primary" onClick={() => { setEditQuiz(null); setShowCreate(true); }}>
                        <Plus size={16} /> Create Quiz
                    </button>
                )}
            </div>

            {visibleQuizzes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
                    <BookOpen size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No Quizzes Yet</div>
                    <div style={{ fontSize: 14 }}>{isStaff ? 'Create your first quiz using the button above.' : 'No quizzes available yet.'}</div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                    {visibleQuizzes.map(quiz => {
                        const best = isStudent ? getBestAttempt(quiz.id) : null;
                        const attempts = isStudent ? attemptCount(quiz.id) : 0;
                        const pct = best ? Math.round(best.score / best.total * 100) : null;
                        const blocked = isStudent && !quiz.allowRetake && attempts > 0;
                        const overdue = isOverdue(quiz);

                        // Count unique students who attempted (admin view)
                        const totalAttempts = quizAttempts.filter(a => a.quizId === quiz.id);
                        const retakers = Object.values(totalAttempts.reduce((acc, a) => { acc[a.userId] = (acc[a.userId] || 0) + 1; return acc; }, {})).filter(c => c > 1).length;

                        return (
                            <div key={quiz.id} style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 24, border: `1px solid ${overdue ? 'rgba(239,68,68,0.3)' : 'var(--border-light)'}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {/* Title row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                    <div style={{ fontSize: 16, fontWeight: 700, flex: 1 }}>{quiz.title}</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
                                        {!quiz.allowRetake && <span style={{ fontSize: 10, background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>ONE-TIME</span>}
                                        {quiz.timeLimit > 0 && (
                                            <span style={{ fontSize: 10, background: 'rgba(0,212,255,0.1)', color: 'var(--primary-light)', padding: '2px 7px', borderRadius: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                                                <Clock size={9} /> {quiz.timeLimit} min
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Badges */}
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    <span className="badge badge-primary">{getCourseName(quiz.courseId)}</span>
                                    <span className="badge badge-neutral">{quiz.questions.length} questions</span>
                                    {quiz.dueDate && (
                                        <span className="badge" style={{ background: overdue ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.1)', color: overdue ? '#f87171' : 'var(--success)' }}>
                                            Due: {quiz.dueDate}
                                        </span>
                                    )}
                                </div>

                                {/* Student progress */}
                                {isStudent && pct !== null && (
                                    <div style={{ fontSize: 13, color: pct >= 70 ? 'var(--success)' : '#fbbf24', fontWeight: 600 }}>
                                        Best: {best.score}/{best.total} ({pct}%)
                                        {attempts > 1 && <span style={{ fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 6 }}>({attempts} attempts)</span>}
                                    </div>
                                )}
                                {blocked && (
                                    <div style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>
                                        One-time quiz — already submitted.
                                    </div>
                                )}

                                {/* Admin stats */}
                                {isStaff && (
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 12 }}>
                                        <span>{totalAttempts.length} total attempt{totalAttempts.length !== 1 ? 's' : ''}</span>
                                        {retakers > 0 && <span style={{ color: '#fbbf24', fontWeight: 600 }}>{retakers} retaker{retakers !== 1 ? 's' : ''}</span>}
                                        <span>Created: {quiz.createdAt}</span>
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                                    {isStudent && !blocked && (
                                        <button className="btn btn-primary" style={{ flex: 1 }} disabled={overdue} onClick={() => setTakeQuiz(quiz)}>
                                            {pct !== null ? 'Retake' : 'Take Quiz'}
                                        </button>
                                    )}
                                    {isStudent && blocked && (
                                        <button className="btn btn-secondary" style={{ flex: 1 }} disabled>Submitted</button>
                                    )}
                                    {isStaff && (
                                        <>
                                            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setEditQuiz(quiz); setShowCreate(true); }}>Edit</button>
                                            <button className="btn-icon" title="View Attempts" style={{ color: 'var(--primary-light)' }} onClick={() => setViewAttempts(quiz)}><Eye size={15} /></button>
                                            <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => deleteQuiz(quiz.id)}><Trash2 size={15} /></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modals */}
            {showCreate && (
                <QuizModal quiz={editQuiz} courses={myCourses}
                    onClose={() => { setShowCreate(false); setEditQuiz(null); }}
                    onSave={data => {
                        // Coerce courseId to Number to avoid string/number type mismatch
                        const normalized = { ...data, courseId: data.courseId ? Number(data.courseId) : null };
                        editQuiz ? updateQuiz(editQuiz.id, normalized) : addQuiz(normalized);
                    }} />
            )}
            {takeQuiz && (
                <TakeQuizModal
                    quiz={takeQuiz}
                    isRetake={attemptCount(takeQuiz.id) > 0}
                    onClose={() => setTakeQuiz(null)}
                    onSubmit={(s, t) => submitQuizAttempt(takeQuiz.id, s, t)} />
            )}
            {viewAttempts && (
                <AttemptsModal quiz={viewAttempts} allAttempts={quizAttempts} users={users} onClose={() => setViewAttempts(null)} />
            )}
        </div>
    );
}
