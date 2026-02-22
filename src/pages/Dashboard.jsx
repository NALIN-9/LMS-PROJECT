import { useApp } from '../context/AppContext';
import { ROLES } from '../utils/constants';
import { BookMarked, GraduationCap, FileText, Upload, Star, Clock } from 'lucide-react';

function StatCard({ icon, label, value, color, sub }) {
    return (
        <div className="stat-card">
            <div className="stat-icon" style={{ background: `${color}20` }}>
                <span style={{ color }}>{icon}</span>
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
        </div>
    );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard() {
    const {
        currentUser, users,
        getAdminCourses, getAdminAssignments, getAdminSubmissions,
    } = useApp();

    const myCourses = getAdminCourses(currentUser.id);
    const myAssignments = getAdminAssignments(currentUser.id);
    const mySubmissions = getAdminSubmissions(currentUser.id);
    const pendingGrading = mySubmissions.filter(s => s.status === 'pending').length;
    const students = users.filter(u => u.role === ROLES.STUDENT && u.status === 'active');

    return (
        <div className="animate-fadeIn">
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <StatCard icon={<BookMarked size={22} />} label="My Courses" value={myCourses.length} color="#6c63ff"
                    sub={`${myCourses.filter(c => c.status === 'published').length} published`} />
                <StatCard icon={<GraduationCap size={22} />} label="Active Students" value={students.length} color="#10b981" />
                <StatCard icon={<FileText size={22} />} label="My Assignments" value={myAssignments.length} color="#06b6d4" />
                <StatCard icon={<Upload size={22} />} label="Pending Review" value={pendingGrading} color="#f59e0b"
                    sub={`${mySubmissions.filter(s => s.status === 'graded').length} graded`} />
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                {/* My Courses summary */}
                <div className="card">
                    <div style={{ fontWeight: 600, marginBottom: 16 }}>My Courses</div>
                    {myCourses.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                            No courses yet. Go to <strong>My Courses</strong> to create one.
                        </div>
                    ) : (
                        myCourses.slice(0, 5).map(c => (
                            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                                <div style={{ width: 36, height: 36, background: c.thumb.gradient, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                                    {c.thumb.icon}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.students} students enrolled</div>
                                </div>
                                <span className={`badge ${c.status === 'published' ? 'badge-success' : 'badge-neutral'}`}>{c.status}</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Recent submissions */}
                <div className="card">
                    <div style={{ fontWeight: 600, marginBottom: 16 }}>Recent Submissions</div>
                    {mySubmissions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                            No submissions yet.
                        </div>
                    ) : (
                        mySubmissions.slice(0, 5).map(s => (
                            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                                {s.studentAvatar ? (
                                    <div className="avatar-placeholder" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                                        {s.studentAvatar}
                                    </div>
                                ) : (
                                    <div className="avatar-placeholder" style={{ width: 32, height: 32, background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: 11, flexShrink: 0 }}>
                                        {s.studentInitials}
                                    </div>
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.studentName}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.assignmentTitle}</div>
                                </div>
                                {s.status === 'graded'
                                    ? <span className="badge badge-success"><Star size={10} /> {s.score}</span>
                                    : <span className="badge badge-warning"><Clock size={10} /> Pending</span>}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* All registered users */}
            <div className="card">
                <div style={{ fontWeight: 600, marginBottom: 16 }}>Registered Users</div>
                {users.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                        No users registered yet.
                    </div>
                ) : (
                    users.slice(0, 6).map(u => (
                        <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                            {u.avatar ? (
                                <div className="avatar-placeholder" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                    {u.avatar}
                                </div>
                            ) : (
                                <div className="avatar-placeholder" style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: '#fff', fontSize: 12 }}>
                                    {u.initials}
                                </div>
                            )}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{u.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                            </div>
                            <span className={`badge ${u.role === ROLES.ADMIN ? 'badge-danger' : 'badge-success'}`}>{u.role}</span>
                            <span className={`badge ${u.status === 'active' ? 'badge-neutral' : 'badge-neutral'}`}>{u.status}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// ── Student Dashboard ─────────────────────────────────────────────────────────
function StudentDashboard() {
    const { currentUser, getEnrolledCourses, getStudentAssignments, submissions } = useApp();

    const enrolled = getEnrolledCourses(currentUser.id);
    const myAssignments = getStudentAssignments(currentUser.id);
    const mySubmissions = submissions.filter(s => s.studentId === currentUser.id);
    const graded = mySubmissions.filter(s => s.status === 'graded');
    const avgScore = graded.length > 0
        ? Math.round(graded.reduce((acc, s) => acc + s.score, 0) / graded.length)
        : null;
    const pendingSubmit = myAssignments.filter(a => !mySubmissions.find(s => s.assignmentId === a.id)).length;

    return (
        <div className="animate-fadeIn">
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <StatCard icon={<GraduationCap size={22} />} label="Enrolled Courses" value={enrolled.length} color="#6c63ff" />
                <StatCard icon={<FileText size={22} />} label="Assignments" value={myAssignments.length} color="#06b6d4"
                    sub={pendingSubmit > 0 ? `${pendingSubmit} to submit` : 'All submitted!'} />
                <StatCard icon={<Upload size={22} />} label="Submitted" value={mySubmissions.length} color="#10b981" />
                <StatCard icon={<Star size={22} />} label="Avg. Score" value={avgScore !== null ? `${avgScore}%` : '—'} color="#f59e0b"
                    sub={graded.length > 0 ? `${graded.length} graded` : 'Not graded yet'} />
            </div>

            {/* Enrolled courses */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 600, marginBottom: 16 }}>My Enrolled Courses</div>
                {enrolled.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        <GraduationCap size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Not enrolled in any course</div>
                        <div style={{ fontSize: 13 }}>Visit <strong>Browse Courses</strong> to enroll.</div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                        {enrolled.map(c => (
                            <div key={c.id} style={{ background: 'var(--bg-surface)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                                <div style={{ height: 80, background: c.thumb.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34 }}>
                                    {c.thumb.icon}
                                </div>
                                <div style={{ padding: '12px 14px' }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{c.title}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.category} · {c.level}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent submissions */}
            <div className="card">
                <div style={{ fontWeight: 600, marginBottom: 16 }}>My Submissions</div>
                {mySubmissions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)', fontSize: 14 }}>
                        No submissions yet. Go to <strong>Assignments</strong> to submit your work.
                    </div>
                ) : (
                    <div>
                        {mySubmissions.slice(0, 6).map(s => (
                            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.assignmentTitle}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.courseName} · Submitted {s.submittedAt}</div>
                                    {s.feedback && (
                                        <div style={{ fontSize: 11, color: '#34d399', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            Feedback: {s.feedback}
                                        </div>
                                    )}
                                </div>
                                {s.status === 'graded'
                                    ? <span className="badge badge-success"><Star size={10} /> {s.score}/100</span>
                                    : <span className="badge badge-warning"><Clock size={10} /> Pending</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Router ────────────────────────────────────────────────────────────────────
export default function Dashboard() {
    const { currentUser } = useApp();
    if (currentUser.role === ROLES.ADMIN) return <AdminDashboard />;
    return <StudentDashboard />;
}
