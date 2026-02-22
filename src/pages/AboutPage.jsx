import { useApp } from '../context/AppContext';
import { Info } from 'lucide-react';

export default function AboutPage() {
    const { platformSettings } = useApp();

    return (
        <div className="animate-fadeIn" style={{ maxWidth: 800, margin: '0 auto' }}>
            <div className="page-header">
                <div>
                    <div className="page-title">About Us</div>
                    <div className="page-subtitle">Welcome to Digital Black Board</div>
                </div>
            </div>

            <div className="card" style={{ padding: 40, marginTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, borderBottom: '1px solid var(--border-light)', paddingBottom: 20 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(108,99,255,0.15)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Info size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>Our Vision</div>
                    </div>
                </div>

                <div style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                    {platformSettings.aboutText}
                </div>

                <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Developed By</div>
                    <ul style={{ listStyleType: 'none', padding: 0, margin: 0, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                        <li><strong>KANTAMANI NALIN KUMAR</strong> – 2400030332</li>
                        <li><strong>GHANTA NAGA PRASANTH BABU</strong> – 2400030196</li>
                        <li><strong>KARANAM BHARGAV</strong> – 2400031923</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
