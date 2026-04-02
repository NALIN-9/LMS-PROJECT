import { useApp } from '../context/AppContext';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function ContactPage() {
    const { platformSettings } = useApp();

    return (
        <div className="animate-fadeIn" style={{ maxWidth: 800, margin: '0 auto' }}>
            <div className="page-header">
                <div>
                    <div className="page-title">Contact Us</div>
                    <div className="page-subtitle">We would love to hear from you</div>
                </div>
            </div>

            <div className="grid-2" style={{ marginTop: 20, gap: 24 }}>
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ width: 64, height: 64, margin: '0 auto 20px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Phone size={28} />
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Call Us</div>
                    <div style={{ fontSize: 15, color: 'var(--text-secondary)' }}>{platformSettings.contactPhone}</div>
                </div>

                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ width: 64, height: 64, margin: '0 auto 20px', borderRadius: '50%', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Mail size={28} />
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Email Us</div>
                    <div style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
                        <a href={`mailto:${platformSettings.contactEmail}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {platformSettings.contactEmail}
                        </a>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: 24, padding: 40, textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, margin: '0 auto 20px', borderRadius: '50%', background: 'rgba(108,99,255,0.15)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={28} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Headquarters</div>
                <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    KLEF Vaddeswaram,<br />
                    Guntur district, Andhra Pradesh
                </div>
            </div>
        </div>
    );
}
