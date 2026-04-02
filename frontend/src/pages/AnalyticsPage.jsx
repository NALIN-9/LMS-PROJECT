import { useApp } from '../context/AppContext';
import { ROLES } from '../utils/constants';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrendingUp, Users, BookMarked, Star, Award, Clock, Target, Zap } from 'lucide-react';

const STUDENT_PROGRESS = [
    { subject: 'Assignments', score: 87 },
    { subject: 'Quizzes', score: 92 },
    { subject: 'Projects', score: 78 },
    { subject: 'Participation', score: 95 },
    { subject: 'Tests', score: 83 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
            {payload.map(p => (
                <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {typeof p.value === 'number' && p.value > 1000 ? `$${p.value.toLocaleString()}` : p.value}</div>
            ))}
        </div>
    );
};

function MetricsCard({ icon, label, value, sub, color }) {
    return (
        <div className="stat-card">
            <div className="stat-icon" style={{ background: `${color}20`, color }}>{icon}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>}
        </div>
    );
}

function StaffAnalytics() {
    const { currentUser, users, courses, submissions, contentItems = [], getAdminCourses, getAdminSubmissions } = useApp();

    const isAdmin = currentUser.role === 'Admin';
    const isInstructor = currentUser.role === 'Instructor';
    const isCreator = currentUser.role === 'Content Creator';

    // Scope data based on role
    const relevantCourses = isAdmin ? courses : (isInstructor ? getAdminCourses(currentUser.id) : []);
    const relevantSubmissions = isAdmin ? submissions : (isInstructor ? getAdminSubmissions(currentUser.id) : []);
    const relevantContent = isAdmin ? contentItems : (isCreator ? contentItems.filter(c => c.createdBy === currentUser.id) : []);

    const activeCourses = relevantCourses.filter(c => c.status === 'published').length;

    // Calculate role distribution (Admins only)
    const rolesDist = isAdmin ? users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, {}) : { Students: 0 };
    const roleData = Object.keys(rolesDist).map(role => ({ role, count: rolesDist[role] }));

    // Calculate content distribution by type
    const contentDist = relevantContent.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
    }, {});
    const contentData = Object.keys(contentDist).map(type => ({ type: type.charAt(0).toUpperCase() + type.slice(1), count: contentDist[type] }));

    return (
        <div className="animate-fadeIn">
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
                <MetricsCard icon={<Users size={22} />} label="Total Users" value={isAdmin ? users.length : 'N/A'} sub="Registered platform wide" color="#6c63ff" />
                <MetricsCard icon={<BookMarked size={22} />} label="Active Courses" value={activeCourses} sub={isAdmin ? "Published globally" : "Your published courses"} color="#06b6d4" />
                <MetricsCard icon={<Award size={22} />} label="Total Deliverables" value={relevantSubmissions.length} sub="Completed assignments" color="#10b981" />
                <MetricsCard icon={<Zap size={22} />} label="Total Content" value={relevantContent.length} sub="Items in the library" color="#f59e0b" />
            </div>

            <div className="grid-2" style={{ marginBottom: 24, gridTemplateColumns: isAdmin ? '1fr 1fr' : '1fr' }}>
                {isAdmin && (
                    <div className="card">
                        <div style={{ fontWeight: 600, marginBottom: 20 }}>Users By Role</div>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={roleData}>
                                <XAxis dataKey="role" tick={{ fill: '#6366a0', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#6366a0', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" fill="#6c63ff" radius={[4, 4, 0, 0]} name="Users" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                <div className="card">
                    <div style={{ fontWeight: 600, marginBottom: 20 }}>Content By Type</div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={contentData.length > 0 ? contentData : [{ type: 'None', count: 0 }]}>
                            <XAxis dataKey="type" tick={{ fill: '#6366a0', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#6366a0', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Content Items" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card">
                <div style={{ fontWeight: 600, marginBottom: 16 }}>Detailed Content Performance</div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ minWidth: 500 }}>
                        <thead>
                            <tr>
                                <th>Content Title</th>
                                <th>Content Type</th>
                                <th>Assigned Course</th>
                                <th>Total Views</th>
                                <th>Performance Indicator</th>
                            </tr>
                        </thead>
                        <tbody>
                            {relevantContent.map(item => (
                                <tr key={item.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</td>
                                    <td>{item.type}</td>
                                    <td>{item.courseName || 'Unassigned'}</td>
                                    <td>{item.views.toLocaleString()}</td>
                                    <td style={{ width: 160 }}>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${Math.min((item.views / 200) * 100, 100)}%` }} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {relevantContent.length === 0 && (
                        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No content items exist yet to track performance.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StudentAnalytics() {
    const { currentUser, submissions, getEnrolledCourses } = useApp();

    const mySubmissions = submissions.filter(s => s.studentId === currentUser.id);
    const myCourses = getEnrolledCourses(currentUser.id);

    const totalGraded = mySubmissions.filter(s => s.status === 'graded');
    const avgScore = totalGraded.length > 0
        ? Math.round(totalGraded.reduce((acc, sub) => acc + (sub.score || 0), 0) / totalGraded.length)
        : 0;

    const recentActivity = mySubmissions.slice(0, 7).map(sub => ({
        day: new Date(sub.submittedAt).toLocaleDateString('en-US', { weekday: 'short' }),
        hours: (sub.id % 3) + 1 // Deterministic mock for study hours as there is no time-tracking metric yet
    }));

    // Generate radar chart data from top 5 courses based on submissions
    const courseScores = mySubmissions.reduce((acc, sub) => {
        if (!acc[sub.courseName]) {
            acc[sub.courseName] = { total: 0, count: 0 };
        }
        if (sub.score) {
            acc[sub.courseName].total += sub.score;
            acc[sub.courseName].count += 1;
        }
        return acc;
    }, {});

    const studentProgressData = Object.keys(courseScores).map(course => ({
        subject: course.length > 15 ? course.substring(0, 15) + '...' : course,
        score: Math.round(courseScores[course].total / courseScores[course].count) || 0
    })).slice(0, 5);

    return (
        <div className="animate-fadeIn">
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
                <MetricsCard icon={<Award size={22} />} label="Total Deliverables" value={mySubmissions.length} sub="Completed assignments" color="#6c63ff" />
                <MetricsCard icon={<Target size={22} />} label="Avg Score" value={`${avgScore}%`} sub="Across all graded work" color="#10b981" />
                <MetricsCard icon={<Zap size={22} />} label="Enrolled Courses" value={myCourses.length} sub="Active learning modules" color="#f59e0b" />
                <MetricsCard icon={<BookMarked size={22} />} label="Completed Grading" value={totalGraded.length} sub="Received feedback" color="#06b6d4" />
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                <div className="card">
                    <div style={{ fontWeight: 600, marginBottom: 20 }}>Performance by Course</div>
                    <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={studentProgressData.length > 0 ? studentProgressData : [{ subject: 'No Data Yet', score: 0 }]}>
                            <PolarGrid stroke="var(--border-light)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#6366a0', fontSize: 12 }} />
                            <PolarRadiusAxis tick={{ fill: '#6366a0', fontSize: 10 }} domain={[0, 100]} />
                            <Radar name="Avg Score" dataKey="score" stroke="#6c63ff" fill="#6c63ff" fillOpacity={0.3} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="card">
                    <div style={{ fontWeight: 600, marginBottom: 20 }}>Recent Submission Activity</div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={recentActivity.length > 0 ? recentActivity : [{ day: 'Mon', hours: 0 }]}>
                            <XAxis dataKey="day" tick={{ fill: '#6366a0', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#6366a0', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="hours" fill="#10b981" radius={[4, 4, 0, 0]} name="Est. Hours" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card">
                <div style={{ fontWeight: 600, marginBottom: 16 }}>Enrolled Courses Overview</div>
                {myCourses.map(c => (
                    <div key={c.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{c.title || 'Untitled Course'}</div>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Instructor: {c.createdByName}</span>
                                <span className="badge badge-success"><Star size={10} /> Enrolled</span>
                            </div>
                        </div>
                    </div>
                ))}
                {myCourses.length === 0 && (
                    <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                        You are not enrolled in any courses yet.
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
    const { currentUser } = useApp();

    if (currentUser.role === ROLES.STUDENT) return (
        <div className="animate-fadeIn">
            <div className="page-header"><div className="page-title">My Progress</div><div className="page-subtitle">Track your learning journey</div></div>
            <StudentAnalytics />
        </div>
    );

    return (
        <div className="animate-fadeIn">
            <div className="page-header"><div className="page-title">Analytics</div><div className="page-subtitle">Platform performance insights</div></div>
            <StaffAnalytics />
        </div>
    );
}
