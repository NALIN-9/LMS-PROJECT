import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Bell, Shield, Palette, Globe, Database, Save, Check, Moon, Sun, Info, Phone } from 'lucide-react';

function SettingSection({ title, icon, children }) {
    return (
        <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(108,99,255,0.15)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
            </div>
            {children}
        </div>
    );
}

function Toggle({ value, onChange, label, desc }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
                {desc && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>}
            </div>
            <button
                onClick={() => onChange(!value)}
                style={{
                    width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                    background: value ? 'var(--primary)' : 'var(--bg-elevated)',
                    transition: 'all 0.2s', position: 'relative', flexShrink: 0,
                }}>
                <div style={{
                    width: 18, height: 18, borderRadius: 9, background: '#fff',
                    position: 'absolute', top: 3, left: value ? 23 : 3, transition: 'left 0.2s',
                }} />
            </button>
        </div>
    );
}

export default function SettingsPage() {
    const { currentUser, updateUser, updateUserAvatar, updateProfileName, platformSettings, updatePlatformSettings } = useApp();
    const [saved, setSaved] = useState(false);
    const [editingAvatar, setEditingAvatar] = useState(false);
    const [avatarInput, setAvatarInput] = useState(currentUser.avatar || '');
    const [settings, setSettings] = useState({
        platformName: 'Digital Black Board',
        contactEmail: platformSettings.contactEmail,
        contactPhone: platformSettings.contactPhone,
        aboutText: platformSettings.aboutText,
        maxStudents: 500,
        emailNotifications: true,
        pushNotifications: true,
        weeklyReports: false,
        twoFactor: true,
        publicCourses: true,
        guestEnroll: false,
        maintenanceMode: false,
        autoGrade: true,
        certificatesEnabled: true,
    });

    const [profile, setProfile] = useState({
        name: currentUser.name,
        email: currentUser.email,
        bio: currentUser.bio || 'Passionate about education and technology.',
        timezone: currentUser.timezone || 'UTC+5:30',
        language: currentUser.language || 'English',
    });

    const handleSave = () => {
        if (profile.name.trim() !== currentUser.name) {
            updateProfileName(profile.name.trim());
        }

        // Save the rest of the profile and settings to the global user object
        updateUser(currentUser.id, {
            bio: profile.bio,
            timezone: profile.timezone,
            language: profile.language,
            settingsOverrides: {
                emailNotifications: settings.emailNotifications,
                pushNotifications: settings.pushNotifications,
                weeklyReports: settings.weeklyReports,
                twoFactor: settings.twoFactor,
            }
        });

        // If admin, we already auto-save platformSettings but let's just make it explicit on button click
        if (currentUser.role === 'Admin') {
            updatePlatformSettings({
                contactEmail: settings.contactEmail,
                contactPhone: settings.contactPhone,
                aboutText: settings.aboutText,
                platformName: settings.platformName,
                maxStudents: settings.maxStudents,
                publicCourses: settings.publicCourses,
                guestEnroll: settings.guestEnroll,
                maintenanceMode: settings.maintenanceMode,
                autoGrade: settings.autoGrade,
                certificatesEnabled: settings.certificatesEnabled
            });
        }

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const isAdmin = currentUser.role === 'Admin';
    const isStudent = currentUser.role === 'Student';
    const nameLocked = isStudent && currentUser.nameChanged;

    return (
        <div className="animate-fadeIn" style={{ maxWidth: 760 }}>
            <div className="page-header">
                <div>
                    <div className="page-title">Settings</div>
                    <div className="page-subtitle">Manage your account and platform preferences</div>
                </div>
                <button className="btn btn-primary" onClick={handleSave}>
                    {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
                </button>
            </div>

            {/* Profile Settings */}
            <SettingSection title="Profile" icon={<Settings size={18} />}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
                    {currentUser.avatar ? (
                        <div className="avatar-placeholder animate-glow" style={{ width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, flexShrink: 0, border: '2px solid var(--border)' }}>
                            {currentUser.avatar}
                        </div>
                    ) : (
                        <div className="avatar-placeholder animate-glow" style={{ width: 72, height: 72, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: '#fff', fontSize: 22, fontWeight: 700, flexShrink: 0 }}>
                            {currentUser.initials}
                        </div>
                    )}
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{currentUser.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{currentUser.role}</div>
                        {editingAvatar ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input className="form-input" style={{ width: 70, padding: '4px 8px', textAlign: 'center' }} placeholder="Emoji" value={avatarInput} onChange={e => setAvatarInput(e.target.value)} maxLength={2} />
                                <button className="btn btn-primary btn-sm" onClick={() => { updateUserAvatar(currentUser.id, avatarInput); setEditingAvatar(false); }}>Save</button>
                            </div>
                        ) : (
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditingAvatar(true)}>Change Avatar</button>
                        )}
                    </div>
                </div>
                <div className="grid-2">
                    <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            Display Name
                            {nameLocked && <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>CANT CHANGE AGAIN</span>}
                        </label>
                        <input
                            className="form-input"
                            value={profile.name}
                            disabled={nameLocked}
                            style={{ opacity: nameLocked ? 0.6 : 1, cursor: nameLocked ? 'not-allowed' : 'text' }}
                            onChange={e => setProfile({ ...profile, name: e.target.value })}
                        />
                        {isStudent && !nameLocked && <div style={{ fontSize: 11, color: 'var(--warning)', marginTop: 4 }}>You can only change your name once.</div>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea className="form-textarea" value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} style={{ minHeight: 80 }} />
                </div>
                <div className="grid-2">
                    <div className="form-group">
                        <label className="form-label">Timezone</label>
                        <select className="form-select" value={profile.timezone} onChange={e => setProfile({ ...profile, timezone: e.target.value })}>
                            {['UTC+0:00', 'UTC+5:30', 'UTC-5:00', 'UTC-8:00', 'UTC+1:00'].map(tz => <option key={tz}>{tz}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Language</label>
                        <select className="form-select" value={profile.language} onChange={e => setProfile({ ...profile, language: e.target.value })}>
                            {['English', 'Spanish', 'French', 'German', 'Japanese'].map(l => <option key={l}>{l}</option>)}
                        </select>
                    </div>
                </div>
            </SettingSection>

            {/* Notifications */}
            <SettingSection title="Notifications" icon={<Bell size={18} />}>
                <Toggle value={settings.emailNotifications} onChange={v => setSettings({ ...settings, emailNotifications: v })} label="Email Notifications" desc="Receive updates via email" />
                <Toggle value={settings.pushNotifications} onChange={v => setSettings({ ...settings, pushNotifications: v })} label="Push Notifications" desc="Browser push notifications" />
                <Toggle value={settings.weeklyReports} onChange={v => setSettings({ ...settings, weeklyReports: v })} label="Weekly Reports" desc="Summary of your activity" />
            </SettingSection>

            {/* Security */}
            <SettingSection title="Security" icon={<Shield size={18} />}>
                <Toggle value={settings.twoFactor} onChange={v => setSettings({ ...settings, twoFactor: v })} label="Two-Factor Authentication" desc="Add an extra layer of security" />
                <div style={{ paddingTop: 16 }}>
                    <button className="btn btn-secondary">Change Password</button>
                </div>
            </SettingSection>

            {/* Platform Settings (Admin only) */}
            {isAdmin && (
                <>
                    <SettingSection title="Site Information" icon={<Info size={18} />}>
                        <div className="grid-2" style={{ marginBottom: 16 }}>
                            <div className="form-group">
                                <label className="form-label">Contact Email</label>
                                <input className="form-input" value={settings.contactEmail} onChange={e => setSettings({ ...settings, contactEmail: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Contact Phone</label>
                                <input className="form-input" value={settings.contactPhone} onChange={e => setSettings({ ...settings, contactPhone: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">About Us Text</label>
                            <textarea className="form-textarea" value={settings.aboutText} onChange={e => setSettings({ ...settings, aboutText: e.target.value })} style={{ minHeight: 100 }} />
                        </div>
                    </SettingSection>

                    <SettingSection title="Platform Configuration" icon={<Globe size={18} />}>
                        <div className="form-group" style={{ marginBottom: 16, maxWidth: 350 }}>
                            <label className="form-label">Platform Name</label>
                            <input className="form-input" value={settings.platformName} onChange={e => setSettings({ ...settings, platformName: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Max Students per Course</label>
                            <input className="form-input" type="number" value={settings.maxStudents} onChange={e => setSettings({ ...settings, maxStudents: e.target.value })} style={{ maxWidth: 160 }} />
                        </div>
                        <Toggle value={settings.publicCourses} onChange={v => setSettings({ ...settings, publicCourses: v })} label="Public Course Listings" desc="Allow anyone to browse courses" />
                        <Toggle value={settings.guestEnroll} onChange={v => setSettings({ ...settings, guestEnroll: v })} label="Guest Enrollment" desc="Allow trial access without account" />
                        <Toggle value={settings.maintenanceMode} onChange={v => setSettings({ ...settings, maintenanceMode: v })} label="Maintenance Mode" desc="Temporarily disable platform access" />
                    </SettingSection>

                    <SettingSection title="Learning Features" icon={<Database size={18} />}>
                        <Toggle value={settings.autoGrade} onChange={v => setSettings({ ...settings, autoGrade: v })} label="Auto-Grade Quizzes" desc="Automatically grade multiple choice" />
                        <Toggle value={settings.certificatesEnabled} onChange={v => setSettings({ ...settings, certificatesEnabled: v })} label="Certificates" desc="Enable course completion certificates" />
                    </SettingSection>
                </>
            )}
        </div>
    );
}
