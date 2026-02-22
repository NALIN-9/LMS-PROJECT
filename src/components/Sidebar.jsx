import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ROLES } from '../utils/constants';
import { BookOpen, LayoutDashboard, Users, BookMarked, FileText, Megaphone, BarChart2, Settings, LogOut, ChevronRight, GraduationCap, Star, Info, Phone } from 'lucide-react';

const NAV_CONFIG = {
    [ROLES.ADMIN]: [
        {
            label: 'Overview', items: [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'users', label: 'User Management', icon: Users, badge: null },
                { id: 'courses', label: 'All Courses', icon: BookMarked },
                { id: 'assignments', label: 'Assignments', icon: FileText },
                { id: 'announcements', label: 'Announcements', icon: Megaphone },
                { id: 'analytics', label: 'Analytics', icon: BarChart2 },
            ],
        },
        {
            label: 'System', items: [
                { id: 'settings', label: 'Platform Settings', icon: Settings },
                { id: 'about', label: 'About Us', icon: Info },
                { id: 'contact', label: 'Contact Us', icon: Phone },
            ],
        },
    ],
    [ROLES.STUDENT]: [
        {
            label: 'Learning', items: [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'courses', label: 'Browse Courses', icon: BookMarked },
                { id: 'my-courses', label: 'My Learning', icon: GraduationCap },
                { id: 'assignments', label: 'Assignments', icon: FileText },
            ],
        },
        {
            label: 'Community', items: [
                { id: 'announcements', label: 'Announcements', icon: Megaphone },
                { id: 'analytics', label: 'My Progress', icon: BarChart2 },
                { id: 'about', label: 'About Us', icon: Info },
                { id: 'contact', label: 'Contact Us', icon: Phone },
            ],
        },
    ],
    Instructor: [
        {
            label: 'Teaching', items: [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'courses', label: 'My Courses', icon: BookMarked },
                { id: 'assignments', label: 'Assignments', icon: FileText },
            ],
        },
        {
            label: 'Community', items: [
                { id: 'announcements', label: 'Announcements', icon: Megaphone },
                { id: 'about', label: 'About Us', icon: Info },
                { id: 'contact', label: 'Contact Us', icon: Phone },
            ],
        },
    ],
    'Content Creator': [
        {
            label: 'Creation', items: [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'content', label: 'Content Library', icon: FileText },
            ],
        },
        {
            label: 'Analytics & Support', items: [
                { id: 'analytics', label: 'Performance', icon: BarChart2 },
                { id: 'about', label: 'About Us', icon: Info },
                { id: 'contact', label: 'Contact Us', icon: Phone },
            ],
        },
    ],
};

const ROLE_BADGE_COLORS = {
    [ROLES.ADMIN]: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
    [ROLES.STUDENT]: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
    Instructor: { bg: 'rgba(108,99,255,0.15)', color: '#a78bfa' },
    'Content Creator': { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
};

export default function Sidebar({ activePage, setActivePage, onLogout }) {
    const { currentUser } = useApp();
    const [mobileOpen, setMobileOpen] = useState(false);
    const navSections = NAV_CONFIG[currentUser.role] || NAV_CONFIG[ROLES.STUDENT];
    const roleColor = ROLE_BADGE_COLORS[currentUser.role] || ROLE_BADGE_COLORS[ROLES.STUDENT];

    const handleNav = (id) => { setActivePage(id); setMobileOpen(false); };

    return (
        <>
            {/* Mobile hamburger button */}
            <button className="mob-ham" onClick={() => setMobileOpen(o => !o)} aria-label="Open menu">
                <span /><span /><span />
            </button>
            {/* Overlay */}
            {mobileOpen && <div className="mob-overlay" onClick={() => setMobileOpen(false)} />}
            <aside className={`sidebar${mobileOpen ? ' mob-open' : ''}`}>
                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <BookOpen size={20} color="#fff" />
                    </div>
                    <div>
                        <div className="sidebar-logo-text">Digital Black Board</div>
                        <div className="sidebar-logo-sub">LMS Platform</div>
                    </div>
                </div>

                {/* Role Badge */}
                <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '5px 12px', borderRadius: 20,
                        background: roleColor.bg, color: roleColor.color,
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
                    }}>
                        <Star size={10} fill="currentColor" />
                        {currentUser.role}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navSections.map(section => (
                        <div key={section.label}>
                            <div className="sidebar-section-label">{section.label}</div>
                            {section.items.map(({ id, label, icon: Icon, badge }) => (
                                <div
                                    key={id}
                                    className={`sidebar-nav-item ${activePage === id ? 'active' : ''}`}
                                    onClick={() => handleNav(id)}
                                >
                                    {Icon && <Icon size={16} />}
                                    {label}
                                    {badge && <span className="nav-badge">{badge}</span>}
                                </div>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    <div className="sidebar-user" onClick={() => setActivePage('settings')}>
                        {currentUser.avatar ? (
                            <div className="avatar-placeholder" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                                {currentUser.avatar}
                            </div>
                        ) : (
                            <div className="avatar-placeholder" style={{ width: 36, height: 36, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: '#fff', fontSize: 13 }}>
                                {currentUser.initials}
                            </div>
                        )}
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{currentUser.name}</div>
                            <div className="sidebar-user-role">{currentUser.email}</div>
                        </div>
                        <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <button
                        onClick={onLogout}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                            padding: '9px 12px', borderRadius: 8, marginTop: 4,
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-muted)', fontSize: 13, fontWeight: 500,
                            fontFamily: 'Inter', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                        <LogOut size={15} /> Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}
