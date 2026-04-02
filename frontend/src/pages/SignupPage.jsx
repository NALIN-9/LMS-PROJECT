import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ROLES } from '../utils/constants';
import {
    BookOpen, Eye, EyeOff, UserPlus, User, Shield, Star, Palette,
    AlertCircle, CheckCircle, ArrowLeft, Check,
} from 'lucide-react';

const ROLE_INFO = [
    { role: ROLES.STUDENT, icon: <User size={20} />, desc: 'Enroll in courses & track your progress', color: '#34d399', bg: 'rgba(16,185,129,0.15)' },
    { role: ROLES.INSTRUCTOR, icon: <Star size={20} />, desc: 'Create and manage course content', color: '#a78bfa', bg: 'rgba(108,99,255,0.15)' },
    { role: ROLES.CONTENT_CREATOR, icon: <Palette size={20} />, desc: 'Design learning materials', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
    { role: ROLES.ADMIN, icon: <Shield size={20} />, desc: 'Full platform control & management', color: '#f87171', bg: 'rgba(239,68,68,0.15)' },
];

function PasswordStrength({ password }) {
    const checks = [
        { label: 'At least 8 characters', ok: password.length >= 8 },
        { label: 'Uppercase letter (A–Z)', ok: /[A-Z]/.test(password) },
        { label: 'Lowercase letter (a–z)', ok: /[a-z]/.test(password) },
        { label: 'Number (0–9)', ok: /\d/.test(password) },
        { label: 'Special character (!@#...)', ok: /[^a-zA-Z0-9]/.test(password) },
    ];
    const passed = checks.filter(c => c.ok).length;
    const strength = passed <= 1 ? 'Weak' : passed <= 3 ? 'Fair' : passed === 4 ? 'Good' : 'Strong';
    const strengthColor = passed <= 1 ? '#f87171' : passed <= 3 ? '#fbbf24' : passed === 4 ? '#60a5fa' : '#34d399';
    if (!password) return null;
    return (
        <div style={{ marginTop: 10, padding: '12px 14px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{ width: 32, height: 4, borderRadius: 2, background: i <= passed ? strengthColor : 'var(--bg-elevated)', transition: 'background 0.3s' }} />
                    ))}
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: strengthColor }}>{strength}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                {checks.map(c => (
                    <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                        <Check size={11} style={{ color: c.ok ? '#34d399' : 'var(--text-muted)', flexShrink: 0 }} />
                        <span style={{ color: c.ok ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{c.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function SignupPage({ onSignup, onGoLogin }) {
    const { register, users } = useApp();
    const [step, setStep] = useState(1);
    const [selectedRole, setRole] = useState('');
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', adminCode: '' });
    const [showPass, setShowPass] = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const setField = (field) => (e) => { setForm(f => ({ ...f, [field]: e.target.value })); setError(''); };

    const validate = () => {
        if (!form.name.trim() || form.name.trim().length < 2) return 'Please enter your full name (at least 2 characters).';
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email address.';
        if (!form.password || form.password.length < 8) return 'Password must be at least 8 characters.';
        if (!/[A-Z]/.test(form.password)) return 'Password must contain at least one uppercase letter.';
        if (!/\d/.test(form.password)) return 'Password must contain at least one number.';
        if (form.password !== form.confirm) return 'Passwords do not match.';
        if (selectedRole !== ROLES.STUDENT && form.adminCode !== 'DBBLMS') return 'Invalid Staff Code.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) { setError(err); return; }
        setLoading(true);
        await new Promise(r => setTimeout(r, 800));
        const result = register({ name: form.name, email: form.email, password: form.password, role: selectedRole }, users);
        setLoading(false);
        if (result.error) { setError(result.error); return; }
        setSuccess(true);
        setTimeout(() => onSignup(), 1400);
    };

    if (success) {
        return (
            <div className="login-page">
                <div className="login-bg-orb" style={{ width: 400, height: 400, background: 'rgba(16,185,129,0.1)', top: -100, left: -100 }} />
                <div className="login-card" style={{ maxWidth: 400, textAlign: 'center' }}>
                    <div style={{ width: 72, height: 72, background: 'rgba(16,185,129,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }} className="animate-glow">
                        <CheckCircle size={36} style={{ color: '#34d399' }} />
                    </div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Account Created! 🎉</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 6 }}>
                        Welcome, <strong style={{ color: 'var(--text-primary)' }}>{form.name}</strong>!
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Redirecting to your dashboard…</p>
                    <div style={{ marginTop: 20 }}>
                        <span style={{ width: 20, height: 20, border: '2px solid rgba(52,211,153,0.4)', borderTopColor: '#34d399', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-bg-orb" style={{ width: 500, height: 500, background: 'rgba(108,99,255,0.1)', top: -150, left: -150 }} />
            <div className="login-bg-orb" style={{ width: 300, height: 300, background: 'rgba(6,182,212,0.07)', bottom: -80, right: -80 }} />

            <div className="login-card" style={{ maxWidth: 480 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
                    <div className="sidebar-logo-icon animate-glow"><BookOpen size={20} color="#fff" /></div>
                    <div>
                        <div style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>Digital Black Board</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '1.2px', textTransform: 'uppercase', marginTop: 2 }}>Learning Management System</div>
                    </div>
                </div>

                {/* Step indicator */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
                    {[1, 2].map(n => (
                        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step >= n ? 'var(--primary)' : 'var(--bg-elevated)', color: step >= n ? '#fff' : 'var(--text-muted)', fontSize: 12, fontWeight: 700, transition: 'all 0.3s', boxShadow: step === n ? '0 0 12px rgba(108,99,255,0.5)' : 'none' }}>
                                {step > n ? <Check size={13} /> : n}
                            </div>
                            <span style={{ fontSize: 12, color: step >= n ? 'var(--text-secondary)' : 'var(--text-muted)', fontWeight: step === n ? 600 : 400 }}>
                                {n === 1 ? 'Choose Role' : 'Your Details'}
                            </span>
                            {n < 2 && <div style={{ width: 40, height: 1, background: step > 1 ? 'var(--primary)' : 'var(--border-light)', transition: 'background 0.3s' }} />}
                        </div>
                    ))}
                </div>

                {/* ── STEP 1 ── */}
                {step === 1 && (
                    <div className="animate-fadeIn">
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Join as…</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Pick the role that best describes you</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
                            {ROLE_INFO.map(({ role, icon, desc, color, bg }) => (
                                <button key={role} onClick={() => setRole(role)}
                                    style={{ padding: '20px 16px', borderRadius: 14, cursor: 'pointer', textAlign: 'left', border: selectedRole === role ? `2px solid ${color}` : '2px solid var(--border-light)', background: selectedRole === role ? bg : 'var(--bg-surface)', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 10, transform: selectedRole === role ? 'translateY(-2px)' : 'none', boxShadow: selectedRole === role ? `0 6px 24px ${color}25` : 'none', position: 'relative' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: selectedRole === role ? `${color}25` : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedRole === role ? color : 'var(--text-muted)' }}>
                                        {icon}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: selectedRole === role ? 'var(--text-primary)' : 'var(--text-secondary)', marginBottom: 4 }}>{role}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
                                    </div>
                                    {selectedRole === role && (
                                        <div style={{ position: 'absolute', top: 10, right: 10 }}>
                                            <Check size={14} style={{ color }} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button onClick={() => { if (selectedRole) { setStep(2); setError(''); } else setError('Please select a role to continue.'); }}
                            className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={!selectedRole}>
                            Continue →
                        </button>
                        {error && <div style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginTop: 10 }}>{error}</div>}
                    </div>
                )}

                {/* ── STEP 2 ── */}
                {step === 2 && (
                    <div className="animate-fadeIn">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <button onClick={() => { setStep(1); setError(''); }} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontFamily: 'Inter' }}>
                                <ArrowLeft size={14} /> Back
                            </button>
                            <div>
                                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>Create Your Account</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Signing up as <strong style={{ color: 'var(--primary-light)' }}>{selectedRole}</strong></div>
                            </div>
                        </div>

                        {error && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '11px 14px', marginBottom: 18, animation: 'fadeIn 0.2s ease' }}>
                                <AlertCircle size={15} style={{ color: '#f87171', flexShrink: 0, marginTop: 1 }} />
                                <span style={{ fontSize: 13, color: '#f87171', lineHeight: 1.5 }}>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input id="signup-name" className="form-input" placeholder="e.g. Jane Smith" value={form.name} onChange={setField('name')} autoComplete="name" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address *</label>
                                <input id="signup-email" className="form-input" type="email" placeholder="jane@example.com" value={form.email} onChange={setField('email')} autoComplete="email" />
                            </div>
                            <div className="form-group" style={{ position: 'relative' }}>
                                <label className="form-label">Password *</label>
                                <input id="signup-password" className="form-input" type={showPass ? 'text' : 'password'} placeholder="Create a strong password" value={form.password} onChange={setField('password')} style={{ paddingRight: 44 }} autoComplete="new-password" />
                                <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: 38, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                <PasswordStrength password={form.password} />
                            </div>
                            <div className="form-group" style={{ position: 'relative' }}>
                                <label className="form-label">Confirm Password *</label>
                                <input id="signup-confirm" className="form-input" type={showConf ? 'text' : 'password'} placeholder="Re-enter your password" value={form.confirm} onChange={setField('confirm')} style={{ paddingRight: 44 }} autoComplete="new-password" />
                                <button type="button" onClick={() => setShowConf(s => !s)} style={{ position: 'absolute', right: 12, top: 38, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                    {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                {form.confirm && form.password !== form.confirm && (
                                    <div style={{ fontSize: 12, color: '#f87171', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={12} /> Passwords do not match</div>
                                )}
                                {form.confirm && form.password === form.confirm && form.confirm.length > 0 && (
                                    <div style={{ fontSize: 12, color: '#34d399', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12} /> Passwords match</div>
                                )}
                            </div>

                            {selectedRole !== ROLES.STUDENT && (
                                <div className="form-group" style={{ position: 'relative' }}>
                                    <label className="form-label">Staff Code *</label>
                                    <input id="signup-admincode" className="form-input" placeholder="Enter staff code" value={form.adminCode} onChange={setField('adminCode')} />
                                </div>
                            )}

                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18, lineHeight: 1.6 }}>
                                By creating an account you agree to our{' '}
                                <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--primary-light)', textDecoration: 'none' }}>Terms of Service</a> and{' '}
                                <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--primary-light)', textDecoration: 'none' }}>Privacy Policy</a>.
                            </div>

                            <button id="signup-submit" type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                        Creating account…
                                    </span>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><UserPlus size={16} /> Create Account</span>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 0' }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Already have an account?</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
                </div>
                <button onClick={onGoLogin} className="btn btn-secondary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 12, fontWeight: 600 }}>
                    Sign In Instead
                </button>
            </div>
        </div>
    );
}
