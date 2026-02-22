import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Eye, EyeOff, Zap, AlertCircle } from 'lucide-react';

export default function LoginPage({ onLogin, onGoSignup }) {
    const { login } = useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!email.trim() || !password) { setError('Please enter both email and password.'); return; }
        setLoading(true);
        await new Promise(r => setTimeout(r, 600));
        const result = login(email.trim(), password);
        setLoading(false);
        if (result.error) { setError(result.error); return; }
        onLogin();
    };

    return (
        <div className="login-page">
            {/* Ambient orbs */}
            <div className="login-bg-orb" style={{ width: 500, height: 500, background: 'rgba(108,99,255,0.1)', top: -150, left: -150 }} />
            <div className="login-bg-orb" style={{ width: 350, height: 350, background: 'rgba(6,182,212,0.07)', bottom: -80, right: -80 }} />
            <div className="login-bg-orb" style={{ width: 200, height: 200, background: 'rgba(245,158,11,0.06)', top: '38%', right: '18%' }} />

            <div className="login-card" style={{ maxWidth: 440 }}>

                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
                    <div className="sidebar-logo-icon animate-glow">
                        <BookOpen size={20} color="#fff" />
                    </div>
                    <div>
                        <div style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                            Digital Black Board
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '1.2px', textTransform: 'uppercase', marginTop: 2 }}>
                            Learning Management System
                        </div>
                    </div>
                </div>

                {/* Heading */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Welcome back 👋</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Sign in to your account to continue</p>
                </div>

                {/* Error banner */}
                {error && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: 10, padding: '11px 14px', marginBottom: 20, animation: 'fadeIn 0.2s ease',
                    }}>
                        <AlertCircle size={16} style={{ color: '#f87171', flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: '#f87171' }}>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin} noValidate>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            id="login-email"
                            className="form-input"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError(''); }}
                            autoComplete="email"
                            autoFocus
                        />
                    </div>

                    <div className="form-group" style={{ position: 'relative' }}>
                        <label className="form-label">Password</label>
                        <input
                            id="login-password"
                            className="form-input"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError(''); }}
                            style={{ paddingRight: 44 }}
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(s => !s)}
                            style={{ position: 'absolute', right: 12, top: 38, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 22, marginTop: -4 }}>
                        <a href="#" style={{ fontSize: 13, color: 'var(--primary-light)', textDecoration: 'none' }} onClick={e => e.preventDefault()}>
                            Forgot password?
                        </a>
                    </div>

                    <button
                        id="login-submit"
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%', justifyContent: 'center' }}
                        disabled={loading}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                Signing in…
                            </span>
                        ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Zap size={16} /> Sign In
                            </span>
                        )}
                    </button>
                </form>

                {/* Divider + signup */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Don't have an account?</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
                </div>

                <button
                    onClick={onGoSignup}
                    className="btn btn-secondary btn-lg"
                    style={{ width: '100%', justifyContent: 'center', fontWeight: 600 }}
                >
                    Create a Free Account
                </button>
            </div>
        </div>
    );
}
