import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ROLES } from '../utils/constants';
import { ChevronLeft, ChevronRight, BookOpen, Edit2, Check, X } from 'lucide-react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y, m) { return new Date(y, m, 1).getDay(); }

// ── Inline deadline editor ────────────────────────────────────────────────────
function DeadlineEditor({ item, onSave, onCancel }) {
    const [val, setVal] = useState(item.dueDate ?? item.dueDate ?? '');
    return (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 6 }}>
            <input type="date" value={val} onChange={e => setVal(e.target.value)}
                style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--primary)', borderRadius: 6, padding: '4px 8px', color: 'var(--text-primary)', fontSize: 12 }} />
            <button onClick={() => onSave(val)} style={{ background: 'var(--primary)', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#000' }}><Check size={12} /></button>
            <button onClick={onCancel} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={12} /></button>
        </div>
    );
}

export default function CalendarPage() {
    const { assignments, updateAssignment, quizzes, updateQuiz, currentUser, isEnrolled, courses } = useApp();
    const isAdmin = currentUser.role === ROLES.ADMIN;
    const isStudent = currentUser.role === ROLES.STUDENT;
    const canEdit = !isStudent;   // Admin + Instructor + CC can edit deadlines

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [selected, setSelected] = useState(null);
    const [editing, setEditing] = useState(null);   // { id, type:'assignment'|'quiz' }

    const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

    // Visible assignments
    const visibleAssignments = assignments.filter(a => {
        if (isAdmin) return true;
        const course = courses.find(c => c.id === a.courseId);
        if (!course) return false;
        if (isStudent) return isEnrolled(currentUser.id, a.courseId);
        return course.createdBy === currentUser.id;
    });

    // Visible quizzes
    const visibleQuizzes = quizzes.filter(q => {
        if (isAdmin) return true;
        if (isStudent) return !q.courseId || courses.find(c => c.id === q.courseId);
        return q.createdBy === currentUser.id;
    }).filter(q => q.dueDate);   // only quizzes with due dates appear on calendar

    // ── Build date → events map ─────────────────────────────────────────────────
    const byDate = {};
    const add = (date, item) => {
        if (!date) return;
        byDate[date] = byDate[date] ? [...byDate[date], item] : [item];
    };
    visibleAssignments.forEach(a => add(a.dueDate, { ...a, _type: 'assignment' }));
    visibleQuizzes.forEach(q => add(q.dueDate, { ...q, _type: 'quiz' }));

    const getDateStr = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const getTagColor = (dueDate) => {
        if (!dueDate || dueDate < todayStr) return 'var(--danger)';
        const diff = Math.ceil((new Date(dueDate) - today) / 86400000);
        return diff < 3 ? '#f59e0b' : 'var(--primary-light)';
    };

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDay(year, month);
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const selectedItems = selected ? (byDate[getDateStr(selected)] ?? []) : [];

    // Upcoming: assignments + quizzes with due dates coming up
    const upcoming = [
        ...visibleAssignments.filter(a => a.dueDate >= todayStr).map(a => ({ ...a, _type: 'assignment' })),
        ...visibleQuizzes.filter(q => q.dueDate >= todayStr).map(q => ({ ...q, _type: 'quiz' })),
    ].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 10);

    const handleSave = (item, newDate) => {
        if (item._type === 'assignment') updateAssignment(item.id, { dueDate: newDate });
        else updateQuiz(item.id, { dueDate: newDate });
        setEditing(null);
    };

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <div className="page-title">Assignment & Quiz Calendar</div>
                    <div className="page-subtitle">
                        Track deadlines at a glance{canEdit ? ' — click the pencil icon to update any deadline' : ''}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
                {/* Calendar grid */}
                <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 24, border: '1px solid var(--border-light)' }}>
                    {/* Month nav */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                        <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: 6 }}><ChevronLeft size={20} /></button>
                        <span style={{ fontSize: 18, fontWeight: 700 }}>{MONTHS[month]} {year}</span>
                        <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: 6 }}><ChevronRight size={20} /></button>
                    </div>

                    {/* Day headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                        {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', padding: '4px 0' }}>{d}</div>)}
                    </div>

                    {/* day cells */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                        {cells.map((d, i) => {
                            if (!d) return <div key={i} />;
                            const ds = getDateStr(d);
                            const evts = byDate[ds] ?? [];
                            const hasA = evts.some(e => e._type === 'assignment');
                            const hasQ = evts.some(e => e._type === 'quiz');
                            const isToday = ds === todayStr;
                            const isSel = selected === d;
                            return (
                                <div key={i} onClick={() => setSelected(isSel ? null : d)}
                                    style={{
                                        minHeight: 56, borderRadius: 10, padding: '6px 4px', cursor: 'pointer',
                                        background: isSel ? 'var(--primary)' : isToday ? 'rgba(0,212,255,0.1)' : 'var(--bg-surface)',
                                        border: `2px solid ${isSel ? 'var(--primary)' : isToday ? 'var(--primary)' : 'var(--border-light)'}`,
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all 0.15s'
                                    }}>
                                    <span style={{ fontSize: 13, fontWeight: isToday || isSel ? 700 : 400, color: isSel ? '#fff' : isToday ? 'var(--primary-light)' : 'var(--text-primary)' }}>{d}</span>
                                    <div style={{ display: 'flex', gap: 3 }}>
                                        {hasA && <div style={{ width: 7, height: 7, borderRadius: '50%', background: getTagColor(ds) }} title="Assignment" />}
                                        {hasQ && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#a78bfa' }} title="Quiz" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                        {[['var(--primary-light)', 'Assignment (upcoming)'], ['#f59e0b', 'Due soon (<3 days)'], ['var(--danger)', 'Overdue'], ['#a78bfa', 'Quiz']].map(([c, l]) => (
                            <div key={l} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <div style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
                                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{l}</span>
                            </div>
                        ))}
                    </div>

                    {/* Selected day detail */}
                    {selected && (
                        <div style={{ marginTop: 20, padding: 16, background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
                            <div style={{ fontWeight: 700, marginBottom: 10 }}>{MONTHS[month]} {selected}, {year}</div>
                            {selectedItems.length === 0
                                ? <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No deadlines on this day.</div>
                                : selectedItems.map(item => {
                                    const isEditingThis = editing?.id === item.id && editing?.type === item._type;
                                    return (
                                        <div key={`${item._type}-${item.id}`} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item._type === 'quiz' ? '#a78bfa' : getTagColor(item.dueDate), flexShrink: 0 }} />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                                        {item._type === 'quiz' ? 'Quiz' : 'Assignment'} · Due: {item.dueDate}
                                                        {item._type === 'assignment' && item.maxScore ? ` · ${item.maxScore} pts` : ''}
                                                    </div>
                                                </div>
                                                {canEdit && !isEditingThis && (
                                                    <button onClick={() => setEditing({ id: item.id, type: item._type })}
                                                        style={{ background: 'none', border: 'none', color: 'var(--primary-light)', cursor: 'pointer', padding: 4 }}
                                                        title="Edit deadline"><Edit2 size={13} /></button>
                                                )}
                                            </div>
                                            {isEditingThis && (
                                                <DeadlineEditor item={item}
                                                    onSave={(d) => handleSave(item, d)}
                                                    onCancel={() => setEditing(null)} />
                                            )}
                                        </div>
                                    );
                                })
                            }
                        </div>
                    )}
                </div>

                {/* Upcoming sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 20, border: '1px solid var(--border-light)' }}>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: 'var(--primary-light)' }}>Upcoming Deadlines</div>
                        {upcoming.length === 0
                            ? <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No upcoming deadlines.</div>
                            : upcoming.map(item => {
                                const diff = Math.ceil((new Date(item.dueDate) - today) / 86400000);
                                const isEditingThis = editing?.id === item.id && editing?.type === item._type;
                                return (
                                    <div key={`${item._type}-${item.id}`} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item._type === 'quiz' ? '#a78bfa' : getTagColor(item.dueDate), marginTop: 5, flexShrink: 0 }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 1 }}>{item.title}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                                    {item._type === 'quiz' ? '🟣 Quiz' : '📝 Assignment'} · {item.dueDate}
                                                </div>
                                                <div style={{ fontSize: 11, color: getTagColor(item.dueDate), fontWeight: 600, marginTop: 2 }}>
                                                    {diff === 0 ? 'Due Today!' : diff < 0 ? 'Overdue' : `${diff} day${diff !== 1 ? 's' : ''} left`}
                                                </div>
                                                {isEditingThis && (
                                                    <DeadlineEditor item={item}
                                                        onSave={(d) => handleSave(item, d)}
                                                        onCancel={() => setEditing(null)} />
                                                )}
                                            </div>
                                            {canEdit && !isEditingThis && (
                                                <button onClick={() => setEditing({ id: item.id, type: item._type })}
                                                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4, flexShrink: 0 }}
                                                    title="Edit deadline"><Edit2 size={12} /></button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
