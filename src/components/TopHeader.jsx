import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Bell, Check, Sun, Moon, X, CheckCircle2, AlertCircle, Info, BookOpen, Megaphone, ClipboardCheck, Users } from 'lucide-react';

// ── Toast popup ───────────────────────────────────────────────────────────────
// We expose a global broadcaster so AppContext can trigger toasts via custom event
export function showToast(message, type = 'success') {
    window.dispatchEvent(new CustomEvent('dbb-toast', { detail: { message, type } }));
}

function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const handler = (e) => {
            const { message, type } = e.detail;
            const id = Date.now() + Math.random();
            setToasts(prev => [...prev, { id, message, type }]);
            setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
        };
        window.addEventListener('dbb-toast', handler);
        return () => window.removeEventListener('dbb-toast', handler);
    }, []);

    const icons = { success: <CheckCircle2 size={16} />, error: <AlertCircle size={16} />, info: <Info size={16} /> };
    const colors = {
        success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#34d399', icon: '#34d399' },
        error: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#f87171', icon: '#f87171' },
        info: { bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.25)', color: 'var(--primary-light)', icon: 'var(--primary-light)' },
    };

    return (
        <div style={{ position: 'fixed', top: 72, right: 20, zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
            {toasts.map(t => {
                const c = colors[t.type] || colors.info;
                return (
                    <div key={t.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: `var(--bg-card)`, border: `1px solid ${c.border}`,
                        borderLeft: `4px solid ${c.icon}`,
                        borderRadius: 10, padding: '10px 16px',
                        minWidth: 260, maxWidth: 360,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        animation: 'slideInRight 0.25s ease',
                        pointerEvents: 'auto',
                    }}>
                        <span style={{ color: c.icon, flexShrink: 0 }}>{icons[t.type] || icons.info}</span>
                        <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1, lineHeight: 1.4 }}>{t.message}</span>
                    </div>
                );
            })}
            <style>{`@keyframes slideInRight { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:none; } }`}</style>
        </div>
    );
}

// ── Notification icon helper ──────────────────────────────────────────────────
function NotifIcon({ text }) {
    if (text.includes('quiz') || text.includes('Quiz')) return <ClipboardCheck size={13} style={{ color: '#a78bfa', flexShrink: 0 }} />;
    if (text.includes('assignment') || text.includes('Assignment')) return <BookOpen size={13} style={{ color: '#fbbf24', flexShrink: 0 }} />;
    if (text.includes('enrolled') || text.includes('Enrolled')) return <Users size={13} style={{ color: '#34d399', flexShrink: 0 }} />;
    if (text.includes('graded') || text.includes('Graded') || text.includes('Score')) return <CheckCircle2 size={13} style={{ color: '#34d399', flexShrink: 0 }} />;
    if (text.includes('posted') || text.includes('announcement')) return <Megaphone size={13} style={{ color: '#60a5fa', flexShrink: 0 }} />;
    return <Info size={13} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />;
}

// ── Main header ───────────────────────────────────────────────────────────────
export default function TopHeader({ activePage, setActivePage, searchQuery, setSearchQuery }) {
    const { currentUser, notifications, setNotifications } = useApp();
    const [showNotifs, setShowNotifs] = useState(false);
    const notifRef = useRef(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    const myNotifications = notifications.filter(n => !n.targetRoles || n.targetRoles.includes(currentUser.role));
    const unread = myNotifications.filter(n => !n.read).length;

    // Watch for new notifications and fire a toast
    const prevLen = useRef(myNotifications.length);
    useEffect(() => {
        if (myNotifications.length > prevLen.current) {
            const newest = myNotifications[0];
            if (newest && !newest.read) {
                showToast(newest.text, 'info');
            }
        }
        prevLen.current = myNotifications.length;
    }, [myNotifications.length]);

    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const clearAll = () => setNotifications([]);

    const pageLabels = {
        dashboard: 'Dashboard', users: 'User Management', courses: 'Courses',
        'my-courses': 'My Learning', assignments: 'Assignments', students: 'Students',
        analytics: 'Analytics', content: 'Content Library', announcements: 'Announcements',
        settings: 'Settings', games: 'Study Games', calendar: 'Calendar', quiz: 'Quizzes',
        about: 'About Us', contact: 'Contact Us',
    };

    return (
        <>
            <ToastContainer />
            <header className="top-header">
                <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {pageLabels[activePage] || 'Dashboard'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                        Welcome back, {currentUser.name} 👋
                    </div>
                </div>

                {/* Search */}
                <div className="search-bar" style={{ marginLeft: 'auto' }}>
                    <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <input
                        placeholder="Search courses, users..."
                        value={searchQuery}
                        onChange={e => {
                            const val = e.target.value;
                            setSearchQuery(val);
                            if (val && !['courses', 'my-courses', 'users', 'students', 'assignments'].includes(activePage)) {
                                setActivePage('courses');
                            }
                        }}
                    />
                </div>

                <div className="header-actions">
                    {/* Theme Toggle */}
                    <button className="notification-btn" onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {/* Notifications */}
                    <div className="dropdown" ref={notifRef}>
                        <button className="notification-btn" onClick={() => setShowNotifs(!showNotifs)}>
                            <Bell size={18} />
                            {unread > 0 && (
                                <span style={{
                                    position: 'absolute', top: -2, right: -2,
                                    width: 16, height: 16, borderRadius: '50%',
                                    background: 'var(--danger)', color: '#fff',
                                    fontSize: 9, fontWeight: 800,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {unread > 9 ? '9+' : unread}
                                </span>
                            )}
                        </button>

                        {showNotifs && (
                            <div className="dropdown-menu" style={{ width: 340, maxHeight: 480, overflowY: 'auto', right: 0 }}>
                                {/* Header */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 10px', borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700 }}>
                                        Notifications {unread > 0 && <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 800 }}>({unread} new)</span>}
                                    </span>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        {unread > 0 && (
                                            <button onClick={markAllRead} style={{ fontSize: 11, color: 'var(--primary-light)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                Mark all read
                                            </button>
                                        )}
                                        {myNotifications.length > 0 && (
                                            <button onClick={clearAll} style={{ fontSize: 11, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                Clear all
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {myNotifications.length === 0 ? (
                                    <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                                        <Bell size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                                        <div>No notifications yet</div>
                                    </div>
                                ) : myNotifications.map(n => (
                                    <div key={n.id}
                                        onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                                        style={{
                                            display: 'flex', alignItems: 'flex-start', gap: 10,
                                            padding: '10px 14px', cursor: 'pointer',
                                            borderBottom: '1px solid var(--border-light)',
                                            background: n.read ? 'transparent' : 'rgba(0,212,255,0.04)',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                                        onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(0,212,255,0.04)'}
                                    >
                                        {/* Unread dot */}
                                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: n.read ? 'transparent' : 'var(--primary)', marginTop: 5, flexShrink: 0, border: n.read ? '2px solid var(--border-light)' : 'none' }} />
                                        {/* Icon */}
                                        <NotifIcon text={n.text} />
                                        {/* Text */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 12.5, color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: n.read ? 400 : 500, lineHeight: 1.45 }}>
                                                {n.text}
                                            </div>
                                            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 3 }}>{n.time}</div>
                                        </div>
                                        {n.read && <Check size={11} style={{ color: 'var(--success)', marginTop: 4, flexShrink: 0 }} />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* User avatar */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                        borderRadius: 10, padding: '6px 12px',
                        color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500,
                    }}>
                        {currentUser.avatar ? (
                            <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                                {currentUser.avatar}
                            </div>
                        ) : (
                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                                {currentUser.initials}
                            </div>
                        )}
                        <span style={{ color: 'var(--text-primary)' }}>{currentUser.name.split(' ')[0]}</span>
                    </div>
                </div>
            </header>
        </>
    );
}
