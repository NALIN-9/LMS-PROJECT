import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ROLES } from '../utils/constants';
import {
    BookOpen, Eye, EyeOff, Zap, UserPlus, User, Shield, Star, Palette,
    AlertCircle, CheckCircle, ArrowLeft, Check,
} from 'lucide-react';

/* ── Password strength ─────────────────────────────────────────────────────── */
function PwStr({ pw }) {
    const chks = [
        { l: '8+ chars', ok: pw.length >= 8 },
        { l: 'Uppercase', ok: /[A-Z]/.test(pw) },
        { l: 'Lowercase', ok: /[a-z]/.test(pw) },
        { l: 'Number', ok: /\d/.test(pw) },
        { l: 'Special', ok: /[^a-zA-Z0-9]/.test(pw) },
    ];
    const p = chks.filter(c => c.ok).length;
    const clr = p <= 1 ? '#f87171' : p <= 3 ? '#fbbf24' : p === 4 ? '#60a5fa' : '#34d399';
    const lbl = p <= 1 ? 'Weak' : p <= 3 ? 'Fair' : p === 4 ? 'Good' : 'Strong';
    if (!pw) return null;
    return (
        <div style={{ marginTop: 6, padding: '8px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', gap: 3 }}>
                    {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ width: 20, height: 3, borderRadius: 2, background: i <= p ? clr : 'rgba(255,255,255,0.15)', transition: '0.3s' }} />)}
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: clr, fontFamily: 'Poppins,sans-serif' }}>{lbl}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 10px' }}>
                {chks.map(c => (
                    <span key={c.l} style={{ fontSize: 10, color: c.ok ? '#34d399' : 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'Poppins,sans-serif' }}>
                        <Check size={8} />{c.l}
                    </span>
                ))}
            </div>
        </div>
    );
}

/* ── Role data ─────────────────────────────────────────────────────────────── */
const ROLE_INFO = [
    { role: ROLES.STUDENT, icon: <User size={16} />, desc: 'Enroll & track progress', color: '#34d399', bg: 'rgba(16,185,129,0.18)' },
    { role: ROLES.INSTRUCTOR, icon: <Star size={16} />, desc: 'Create course content', color: '#a78bfa', bg: 'rgba(108,99,255,0.18)' },
    { role: ROLES.CONTENT_CREATOR, icon: <Palette size={16} />, desc: 'Design learning materials', color: '#fbbf24', bg: 'rgba(245,158,11,0.18)' },
    { role: ROLES.ADMIN, icon: <Shield size={16} />, desc: 'Full platform management', color: '#f87171', bg: 'rgba(239,68,68,0.18)' },
];

/* ── Injected CSS ──────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

.AUTH_root {
  min-height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: #1a1a2e;
  padding: 20px;
  font-family: 'Poppins', sans-serif;
}

/* ── Outer box ── */
.AUTH_box {
  position: relative;
  width: 100%; max-width: 860px;
  min-height: 520px;
  border: 2px solid #00d4ff;
  box-shadow: 0 0 30px rgba(0,212,255,0.4);
  border-radius: 4px;
  display: flex;
  overflow: hidden;
}

/* ── Right panel gets a static subtle gradient ── */
.AUTH_panel {
  background: #1a1a2e;
}

.AUTH_welcome {
  background: linear-gradient(135deg, #0d1b2a 0%, rgba(0,212,255,0.12) 100%);
  border-left: 1px solid rgba(0,212,255,0.2);
}

/* ── Form panel (left) ── */
.AUTH_panel {
  position: relative;
  z-index: 2;           /* always above the wedge */
  width: 50%;
  padding: 28px 36px;
  display: flex; flex-direction: column; justify-content: center;
  overflow-y: auto;
  min-height: 520px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,212,255,0.3) transparent;
}

/* ── Welcome panel (right) ── */
.AUTH_welcome {
  position: relative;
  z-index: 2;
  width: 50%;
  display: flex; flex-direction: column; justify-content: center;
  padding: 0 40px;
}
.AUTH_welcome h2 {
  font-family: 'Poppins', sans-serif;
  font-size: 28px; font-weight: 800;
  color: #fff; text-transform: uppercase;
  line-height: 1.3; margin-bottom: 12px;
}
.AUTH_welcome p {
  font-size: 13px; color: rgba(255,255,255,0.65); line-height: 1.7;
}

/* ── Slide-in animations ── */
@keyframes AUTH_inL { from { opacity:0; transform: translateX(-35px); } to { opacity:1; transform: translateX(0); } }
@keyframes AUTH_inR { from { opacity:0; transform: translateX(35px);  } to { opacity:1; transform: translateX(0); } }
.sl { animation-duration: .4s; animation-timing-function: ease; animation-fill-mode: both; }
.sl.L { animation-name: AUTH_inL; }
.sl.R { animation-name: AUTH_inR; }
.sl:nth-child(1)  { animation-delay: .04s; }
.sl:nth-child(2)  { animation-delay: .08s; }
.sl:nth-child(3)  { animation-delay: .12s; }
.sl:nth-child(4)  { animation-delay: .16s; }
.sl:nth-child(5)  { animation-delay: .20s; }
.sl:nth-child(6)  { animation-delay: .24s; }
.sl:nth-child(7)  { animation-delay: .28s; }
.sl:nth-child(8)  { animation-delay: .32s; }
.sl:nth-child(9)  { animation-delay: .36s; }
.sl:nth-child(10) { animation-delay: .40s; }

/* ── Brand ── */
.AUTH_brand {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 16px;
}
.AUTH_brand_icon {
  width: 34px; height: 34px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 16px rgba(249,115,22,0.5);
  flex-shrink: 0;
}
.AUTH_brand_name { font-size: 15px; font-weight: 800; color: #fff; line-height: 1; }
.AUTH_brand_sub  { font-size: 8px; color: rgba(255,255,255,0.4); letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }

/* ── Field row ── */
.AUTH_field { margin-top: 14px; }
.AUTH_field > label {
  display: block;
  font-size: 11px; font-weight: 600;
  color: rgba(255,255,255,0.5);
  margin-bottom: 5px;
  letter-spacing: 0.5px; text-transform: uppercase;
}
.AUTH_field_wrap { position: relative; }
.AUTH_field input {
  width: 100%;
  background: transparent;
  border: none; border-bottom: 2px solid rgba(255,255,255,0.3);
  outline: none;
  font-size: 14px; color: #fff;
  font-family: 'Poppins', sans-serif;
  padding: 8px 0;
  transition: border-color .3s;
  box-sizing: border-box;
}
.AUTH_field input.pw { padding-right: 30px; }
.AUTH_field input:focus { border-bottom-color: #00d4ff; }
.AUTH_field input::placeholder { color: rgba(255,255,255,0.2); font-size: 13px; }
.AUTH_eye {
  position: absolute;
  right: 2px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: rgba(255,255,255,0.4);
  display: flex; align-items: center;
  padding: 4px;
  transition: color .2s;
  line-height: 1;
}
.AUTH_eye:hover { color: #00d4ff; }

/* ── Submit button ── */
.AUTH_btn {
  position: relative;
  width: 100%; height: 42px;
  margin-top: 20px;
  background: transparent;
  border: 2px solid #00d4ff; border-radius: 40px;
  color: #fff;
  font-family: 'Poppins', sans-serif;
  font-size: 14px; font-weight: 600;
  cursor: pointer; overflow: hidden; z-index: 1;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  letter-spacing: 0.3px;
  transition: color .3s;
}
.AUTH_btn::before {
  content: '';
  position: absolute;
  height: 300%; width: 100%;
  background: linear-gradient(#1a1a2e, #00d4ff, #1a1a2e, #00d4ff);
  top: -100%; left: 0;
  z-index: -1; transition: .5s;
}
.AUTH_btn:hover::before { top: 0; }
.AUTH_btn:disabled { opacity: .5; cursor: not-allowed; }
.AUTH_btn:disabled::before { display: none; }

/* ── Switch link ── */
.AUTH_switch {
  margin-top: 14px;
  font-size: 12px; color: rgba(255,255,255,0.5); text-align: center;
}
.AUTH_switch button {
  background: none; border: none; cursor: pointer;
  color: #00d4ff; font-weight: 700; font-size: 12px;
  font-family: 'Poppins', sans-serif; padding: 0 2px;
}
.AUTH_switch button:hover { text-decoration: underline; }

/* ── Error ── */
.AUTH_err {
  display: flex; align-items: flex-start; gap: 6px;
  background: rgba(239,68,68,.12);
  border: 1px solid rgba(239,68,68,.35);
  border-radius: 8px; padding: 8px 12px;
  font-size: 12px; color: #f87171;
  margin-top: 10px;
}

/* ── Role grid ── */
.AUTH_roles { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
.AUTH_role {
  padding: 10px 12px; border-radius: 10px; cursor: pointer;
  text-align: left; position: relative;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.04);
  transition: all .2s;
  font-family: 'Poppins', sans-serif;
}
.AUTH_role:hover { border-color: rgba(0,212,255,.4); }
.AUTH_role.on { border-width: 2px; }
.AUTH_role_icon { width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; margin-bottom: 6px; }
.AUTH_role_name { font-size: 12px; font-weight: 700; color: #fff; margin-bottom: 2px; }
.AUTH_role_desc { font-size: 10px; color: rgba(255,255,255,.45); line-height: 1.35; }

/* ── Spinner ── */
.AUTH_spin {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
  border-radius: 50%; animation: spin .7s linear infinite;
  display: inline-block; flex-shrink: 0;
}

/* ── Footer ── */
.AUTH_footer { margin-top: 20px; font-size: 12px; color: rgba(255,255,255,.35); font-family: 'Poppins', sans-serif; }

/* ── Mobile ── */
@media (max-width: 680px) {
  .AUTH_box { flex-direction: column; min-height: auto; }
  .AUTH_panel { width: 100%; min-height: auto; }
  .AUTH_welcome { display: none; }
  .AUTH_wedge { display: none; }
}
`;

/* ── Brand component ───────────────────────────────────────────────────────── */
function Brand({ dir }) {
    return (
        <div className={`AUTH_brand sl ${dir}`}>
            <div className="AUTH_brand_icon"><BookOpen size={15} color="#fff" /></div>
            <div>
                <div className="AUTH_brand_name">Digital Black Board</div>
                <div className="AUTH_brand_sub">Learning Management System</div>
            </div>
        </div>
    );
}

/* ── Input with optional eye toggle ───────────────────────────────────────── */
function Field({ label, type, placeholder, value, onChange, showToggle, show, onToggle, extra, dir }) {
    return (
        <div className={`AUTH_field sl ${dir}`}>
            <label>{label}</label>
            <div className="AUTH_field_wrap">
                <input
                    type={show != null ? (show ? 'text' : type) : type}
                    className={showToggle ? 'pw' : ''}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    autoComplete={type === 'password' ? (label.toLowerCase().includes('confirm') || label.toLowerCase().includes('create') ? 'new-password' : 'current-password') : (type === 'email' ? 'email' : 'name')}
                />
                {showToggle && (
                    <button type="button" className="AUTH_eye" onClick={onToggle} tabIndex={-1}>
                        {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                )}
            </div>
            {extra}
        </div>
    );
}

/* ── Main component ────────────────────────────────────────────────────────── */
export default function AuthPage({ onLogin, onSignup }) {
    const { login, register } = useApp();
    const [isSignup, setIsSignup] = useState(false);

    /* Login state */
    const [lEmail, setLEmail] = useState('');
    const [lPass, setLPass] = useState('');
    const [showLP, setShowLP] = useState(false);
    const [lLoad, setLLoad] = useState(false);
    const [lErr, setLErr] = useState('');

    /* Signup state */
    const [step, setStep] = useState(1);
    const [selRole, setSelRole] = useState('');
    const [sName, setSName] = useState('');
    const [sEmail, setSEmail] = useState('');
    const [sPass, setSPass] = useState('');
    const [sConf, setSConf] = useState('');
    const [sCode, setSCode] = useState('');
    const [showSP, setShowSP] = useState(false);
    const [showCP, setShowCP] = useState(false);
    const [sLoad, setSLoad] = useState(false);
    const [sErr, setSErr] = useState('');
    const [success, setSuccess] = useState(false);

    /* ── Login ── */
    const doLogin = async (e) => {
        e.preventDefault(); setLErr('');
        if (!lEmail.trim() || !lPass) { setLErr('Please enter both email and password.'); return; }
        setLLoad(true);
        await new Promise(r => setTimeout(r, 500));
        const res = login(lEmail.trim(), lPass);
        setLLoad(false);
        if (res.error) { setLErr(res.error); } else { onLogin(); }
    };

    /* ── Signup validation ── */
    const validate = () => {
        if (!sName.trim() || sName.trim().length < 2) return 'Full name must be at least 2 characters.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sEmail)) return 'Enter a valid email address.';
        if (sPass.length < 8) return 'Password must be at least 8 characters.';
        if (!/[A-Z]/.test(sPass)) return 'Password needs at least one uppercase letter.';
        if (!/\d/.test(sPass)) return 'Password needs at least one number.';
        if (sPass !== sConf) return 'Passwords do not match.';
        if (selRole !== ROLES.STUDENT && sCode !== 'DBBLMS') return 'Invalid Staff Code.';
        return null;
    };

    const doSignup = async (e) => {
        e.preventDefault(); setSErr('');
        const err = validate();
        if (err) { setSErr(err); return; }
        setSLoad(true);
        await new Promise(r => setTimeout(r, 700));
        const res = register({ name: sName, email: sEmail, password: sPass, role: selRole });
        setSLoad(false);
        if (res.error) { setSErr(res.error); return; }
        setSuccess(true);
        setTimeout(() => onSignup(), 1200);
    };

    const goSignup = () => { setIsSignup(true); setLErr(''); };
    const goLogin = () => {
        setIsSignup(false); setSErr(''); setStep(1); setSelRole('');
        setSName(''); setSEmail(''); setSPass(''); setSConf(''); setSCode('');
    };

    /* ── Success splash ── */
    if (success) return (
        <div className="AUTH_root">
            <style>{CSS}</style>
            <div className="AUTH_box" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: 40 }}>
                    <div style={{ width: 64, height: 64, background: 'rgba(16,185,129,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 28px rgba(16,185,129,.4)' }}>
                        <CheckCircle size={32} color="#34d399" />
                    </div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8, fontFamily: 'Poppins,sans-serif' }}>Account Created! 🎉</h2>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', fontFamily: 'Poppins,sans-serif' }}>
                        Welcome, <strong style={{ color: '#00d4ff' }}>{sName}</strong>! Redirecting…
                    </p>
                    <div style={{ marginTop: 20 }}>
                        <span className="AUTH_spin" style={{ borderColor: 'rgba(52,211,153,.3)', borderTopColor: '#34d399' }} />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="AUTH_root">
            <style>{CSS}</style>
            <div className={`AUTH_box${isSignup ? ' su' : ''}`}>
                {/* ═══ LEFT: Form panel ═══════════════════════════════════════════ */}
                <div className="AUTH_panel" key={isSignup ? (step === 1 ? 'su1' : 'su2') : 'li'}>

                    {/* ── LOGIN ─────────────────────────────────────────────────── */}
                    {!isSignup && (<>
                        <Brand dir="L" />
                        <h2 className="sl L" style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 2, fontFamily: 'Poppins,sans-serif' }}>Welcome Back 👋</h2>
                        <p className="sl L" style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginBottom: 4, fontFamily: 'Poppins,sans-serif' }}>Sign in to your account</p>

                        {lErr && (
                            <div className="AUTH_err sl L">
                                <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />{lErr}
                            </div>
                        )}

                        <form onSubmit={doLogin} noValidate>
                            <Field dir="L" label="Email Address" type="email" placeholder="you@example.com"
                                value={lEmail} onChange={e => { setLEmail(e.target.value); setLErr(''); }} />
                            <Field dir="L" label="Password" type="password" placeholder="••••••••"
                                value={lPass} onChange={e => { setLPass(e.target.value); setLErr(''); }}
                                showToggle show={showLP} onToggle={() => setShowLP(s => !s)} />
                            <button type="submit" className="AUTH_btn sl L" disabled={lLoad}>
                                {lLoad ? <><span className="AUTH_spin" />Signing in…</> : <><Zap size={14} />Sign In</>}
                            </button>
                        </form>

                        <div className="AUTH_switch sl L">
                            Don't have an account?{' '}
                            <button type="button" onClick={goSignup}>Create one</button>
                        </div>
                    </>)}

                    {/* ── SIGNUP STEP 1: Choose Role ─────────────────────────────── */}
                    {isSignup && step === 1 && (<>
                        <Brand dir="R" />
                        <h2 className="sl R" style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 2, fontFamily: 'Poppins,sans-serif' }}>Join As…</h2>
                        <p className="sl R" style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', fontFamily: 'Poppins,sans-serif' }}>Pick the role that best describes you</p>

                        <div className="AUTH_roles sl R">
                            {ROLE_INFO.map(({ role, icon, desc, color, bg }) => (
                                <button key={role} type="button"
                                    className={`AUTH_role${selRole === role ? ' on' : ''}`}
                                    style={{ borderColor: selRole === role ? color : undefined, background: selRole === role ? bg : undefined, color }}
                                    onClick={() => setSelRole(role)}>
                                    <div className="AUTH_role_icon" style={{ background: selRole === role ? `${color}25` : 'rgba(255,255,255,.07)', color }}>
                                        {icon}
                                    </div>
                                    <div className="AUTH_role_name">{role}</div>
                                    <div className="AUTH_role_desc">{desc}</div>
                                    {selRole === role && <div style={{ position: 'absolute', top: 7, right: 8 }}><Check size={12} color={color} /></div>}
                                </button>
                            ))}
                        </div>

                        {sErr && <div className="AUTH_err sl R"><AlertCircle size={13} style={{ flexShrink: 0 }} />{sErr}</div>}

                        <button type="button" className="AUTH_btn sl R" disabled={!selRole}
                            onClick={() => { if (selRole) { setStep(2); setSErr(''); } else setSErr('Please select a role to continue.'); }}>
                            Continue →
                        </button>

                        <div className="AUTH_switch sl R">
                            Already have an account?{' '}
                            <button type="button" onClick={goLogin}>Sign In</button>
                        </div>
                    </>)}

                    {/* ── SIGNUP STEP 2: Account Details ─────────────────────────── */}
                    {isSignup && step === 2 && (<>
                        <div className="sl R" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <button type="button" onClick={() => { setStep(1); setSErr(''); }}
                                style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: 'Poppins,sans-serif' }}>
                                <ArrowLeft size={12} />Back
                            </button>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'Poppins,sans-serif' }}>Create Your Account</div>
                                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontFamily: 'Poppins,sans-serif' }}>
                                    Signing up as <strong style={{ color: '#00d4ff' }}>{selRole}</strong>
                                </div>
                            </div>
                        </div>

                        {sErr && <div className="AUTH_err sl R"><AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />{sErr}</div>}

                        <form onSubmit={doSignup} noValidate>
                            <Field dir="R" label="Full Name" type="text" placeholder="Jane Smith"
                                value={sName} onChange={e => { setSName(e.target.value); setSErr(''); }} />
                            <Field dir="R" label="Email Address" type="email" placeholder="jane@example.com"
                                value={sEmail} onChange={e => { setSEmail(e.target.value); setSErr(''); }} />
                            <Field dir="R" label="Password" type="password" placeholder="Create a strong password"
                                value={sPass} onChange={e => { setSPass(e.target.value); setSErr(''); }}
                                showToggle show={showSP} onToggle={() => setShowSP(s => !s)}
                                extra={<PwStr pw={sPass} />} />
                            <Field dir="R" label="Confirm Password" type="password" placeholder="Re-enter password"
                                value={sConf} onChange={e => { setSConf(e.target.value); setSErr(''); }}
                                showToggle show={showCP} onToggle={() => setShowCP(s => !s)}
                                extra={
                                    sConf ? (
                                        sPass !== sConf
                                            ? <div style={{ fontSize: 10, color: '#f87171', marginTop: 3 }}>✗ Passwords do not match</div>
                                            : <div style={{ fontSize: 10, color: '#34d399', marginTop: 3 }}>✓ Passwords match</div>
                                    ) : null
                                } />
                            {selRole !== ROLES.STUDENT && (
                                <Field dir="R" label="Staff Code" type="text" placeholder="Enter staff code"
                                    value={sCode} onChange={e => { setSCode(e.target.value); setSErr(''); }} />
                            )}
                            <button type="submit" className="AUTH_btn sl R" disabled={sLoad}>
                                {sLoad ? <><span className="AUTH_spin" />Creating account…</> : <><UserPlus size={14} />Create Account</>}
                            </button>
                        </form>

                        <div className="AUTH_switch sl R">
                            Already have an account?{' '}
                            <button type="button" onClick={goLogin}>Sign In</button>
                        </div>
                    </>)}
                </div>

                {/* ═══ RIGHT: Welcome panel ═══════════════════════════════════════ */}
                <div className="AUTH_welcome" key={isSignup ? 'w-su' : 'w-li'}>
                    {!isSignup ? (<>
                        <h2 className="sl R">WELCOME<br />BACK!</h2>
                        <p className="sl R">Sign in to continue your journey and access all your courses and materials.</p>
                    </>) : (<>
                        <h2 className="sl L">JOIN US<br />TODAY!</h2>
                        <p className="sl L">Create an account to start learning, teaching, or managing the platform.</p>
                    </>)}
                </div>
            </div>

            <div className="AUTH_footer">
                Made by <strong style={{ color: '#00d4ff' }}>TEAM 18</strong> · Digital Black Board LMS
            </div>
        </div>
    );
}
