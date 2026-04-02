import { useState } from 'react';

// ── Study words for games ────────────────────────────────────────────────────
const FLASHCARDS = [
    { term: 'Algorithm', def: 'A step-by-step procedure for solving a problem.' },
    { term: 'Variable', def: 'A named storage location for data in a program.' },
    { term: 'Loop', def: 'A programming construct that repeats code until a condition is met.' },
    { term: 'Function', def: 'A reusable block of code that performs a specific task.' },
    { term: 'Array', def: 'A collection of elements stored at contiguous memory locations.' },
    { term: 'Boolean', def: 'A data type with only two values: true or false.' },
    { term: 'Class', def: 'A blueprint for creating objects in object-oriented programming.' },
    { term: 'Recursion', def: 'A function that calls itself to solve a smaller version of a problem.' },
    { term: 'Debugging', def: 'The process of finding and fixing errors in code.' },
    { term: 'Inheritance', def: 'A mechanism where a class derives properties from another class.' },
    { term: 'API', def: 'Application Programming Interface – rules for how programs communicate.' },
    { term: 'Database', def: 'An organized collection of structured data, usually stored electronically.' },
];

const SCRAMBLE_WORDS = [
    { word: 'JAVASCRIPT', hint: 'Popular web programming language' },
    { word: 'ALGORITHM', hint: 'Step-by-step problem solving method' },
    { word: 'VARIABLE', hint: 'Stores a value in programming' },
    { word: 'FUNCTION', hint: 'Reusable block of code' },
    { word: 'DATABASE', hint: 'Stores organized data' },
    { word: 'NETWORK', hint: 'Connected computers that share data' },
    { word: 'BROWSER', hint: 'Software that opens websites' },
    { word: 'COMPILER', hint: 'Translates source code to machine code' },
    { word: 'RECURSION', hint: 'A function that calls itself' },
    { word: 'INTERFACE', hint: 'Point of interaction between systems' },
];

const MEMORY_PAIRS = [
    ['HTML', 'Structure of web pages'],
    ['CSS', 'Style and layout of web pages'],
    ['React', 'JavaScript UI library by Meta'],
    ['Node.js', 'JavaScript runtime for servers'],
    ['SQL', 'Language for databases'],
    ['Git', 'Version control system'],
    ['API', 'Interface for app communication'],
    ['JSON', 'Data interchange format'],
];

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function scramble(word) {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const s = arr.join('');
    return s === word ? scramble(word) : s;
}

// ── GAME 1: Flashcards ───────────────────────────────────────────────────────
function Flashcards() {
    const [cards] = useState(() => shuffle(FLASHCARDS));
    const [idx, setIdx] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [known, setKnown] = useState(0);
    const [done, setDone] = useState(false);

    const next = (ok) => {
        if (ok) setKnown(k => k + 1);
        if (idx + 1 >= cards.length) { setDone(true); return; }
        setIdx(i => i + 1);
        setFlipped(false);
    };

    if (done) return (
        <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🏆</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Session Complete!</div>
            <div style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 24 }}>
                You knew <strong>{known}</strong> out of <strong>{cards.length}</strong> cards.
            </div>
            <button className="btn btn-primary" onClick={() => { setIdx(0); setFlipped(false); setKnown(0); setDone(false); }}>
                Restart
            </button>
        </div>
    );

    const card = cards[idx];
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Card {idx + 1} of {cards.length}</span>
                <span style={{ fontSize: 13, color: 'var(--primary-light)' }}>{known} known</span>
            </div>
            <div onClick={() => setFlipped(f => !f)} style={{
                background: flipped ? 'var(--primary)' : 'var(--bg-card)',
                border: '2px solid var(--border-light)', borderRadius: 16, padding: '48px 32px',
                textAlign: 'center', cursor: 'pointer', transition: 'background 0.3s', minHeight: 200,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, opacity: 0.6, color: flipped ? '#fff' : 'var(--text-secondary)' }}>
                    {flipped ? 'Definition' : 'Term — click to flip'}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: flipped ? '#fff' : 'var(--text-primary)', lineHeight: 1.5 }}>
                    {flipped ? card.def : card.term}
                </div>
            </div>
            {flipped && (
                <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'center' }}>
                    <button className="btn btn-secondary" onClick={() => next(false)} style={{ minWidth: 120 }}>❌ Still Learning</button>
                    <button className="btn btn-primary" onClick={() => next(true)} style={{ minWidth: 120 }}>✅ Got It!</button>
                </div>
            )}
        </div>
    );
}

// ── GAME 2: Word Scramble ────────────────────────────────────────────────────
function WordScramble() {
    const [words] = useState(() => shuffle(SCRAMBLE_WORDS));
    const [idx, setIdx] = useState(0);
    const [scrambled] = useState(() => words.map(w => scramble(w.word)));
    const [input, setInput] = useState('');
    const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
    const [score, setScore] = useState(0);
    const [done, setDone] = useState(false);

    const check = () => {
        if (input.toUpperCase() === words[idx].word) {
            setFeedback('correct'); setScore(s => s + 1);
        } else { setFeedback('wrong'); }
    };

    const next = () => {
        setFeedback(null); setInput('');
        if (idx + 1 >= words.length) { setDone(true); return; }
        setIdx(i => i + 1);
    };

    if (done) return (
        <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Game Over!</div>
            <div style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 24 }}>Score: <strong>{score}/{words.length}</strong></div>
            <button className="btn btn-primary" onClick={() => { setIdx(0); setInput(''); setFeedback(null); setScore(0); setDone(false); }}>Play Again</button>
        </div>
    );

    const w = words[idx];
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Word {idx + 1} of {words.length}</span>
                <span style={{ fontSize: 13, color: 'var(--primary-light)' }}>Score: {score}</span>
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 16, padding: 32 }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Unscramble This Word</div>
                <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: 8, color: 'var(--primary-light)', marginBottom: 12 }}>
                    {scrambled[idx]}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, fontStyle: 'italic' }}>Hint: {w.hint}</div>
                {feedback === null ? (
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <input className="form-input" value={input} onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && input && check()}
                            placeholder="Type your answer..." style={{ maxWidth: 280 }} autoFocus />
                        <button className="btn btn-primary" onClick={check} disabled={!input}>Check</button>
                    </div>
                ) : (
                    <div>
                        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: feedback === 'correct' ? 'var(--success)' : 'var(--danger)' }}>
                            {feedback === 'correct' ? '✅ Correct!' : `❌ The answer was: ${w.word}`}
                        </div>
                        <button className="btn btn-primary" onClick={next}>Next Word →</button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── GAME 3: Memory Match ─────────────────────────────────────────────────────
function MemoryMatch() {
    const [cards, setCards] = useState(() => {
        const flat = MEMORY_PAIRS.flatMap(([a, b]) => [
            { id: Math.random(), label: a, pair: a, flipped: false, matched: false },
            { id: Math.random(), label: b, pair: a, flipped: false, matched: false },
        ]);
        return shuffle(flat);
    });
    const [selected, setSelected] = useState([]);
    const [moves, setMoves] = useState(0);
    const [won, setWon] = useState(false);

    const flip = (idx) => {
        if (selected.length === 2 || cards[idx].flipped || cards[idx].matched) return;
        const newCards = cards.map((c, i) => i === idx ? { ...c, flipped: true } : c);
        const newSel = [...selected, idx];
        setCards(newCards);
        setSelected(newSel);
        if (newSel.length === 2) {
            setMoves(m => m + 1);
            const [a, b] = newSel;
            if (newCards[a].pair === newCards[b].pair && a !== b) {
                setTimeout(() => {
                    setCards(c => c.map((card, i) => newSel.includes(i) ? { ...card, matched: true } : card));
                    setSelected([]);
                    if (newCards.filter(c => !c.matched).length === 2) setWon(true);
                }, 500);
            } else {
                setTimeout(() => {
                    setCards(c => c.map((card, i) => newSel.includes(i) ? { ...card, flipped: false } : card));
                    setSelected([]);
                }, 1000);
            }
        }
    };

    const restart = () => {
        const flat = MEMORY_PAIRS.flatMap(([a, b]) => [
            { id: Math.random(), label: a, pair: a, flipped: false, matched: false },
            { id: Math.random(), label: b, pair: a, flipped: false, matched: false },
        ]);
        setCards(shuffle(flat)); setSelected([]); setMoves(0); setWon(false);
    };

    if (won) return (
        <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🎊</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>You Won!</div>
            <div style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 24 }}>Completed in <strong>{moves}</strong> moves.</div>
            <button className="btn btn-primary" onClick={restart}>Play Again</button>
        </div>
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Match the pairs — click two cards</span>
                <span style={{ fontSize: 13, color: 'var(--primary-light)' }}>Moves: {moves}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {cards.map((card, i) => (
                    <div key={card.id} onClick={() => flip(i)} style={{
                        height: 90, borderRadius: 10, cursor: card.matched ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 600, textAlign: 'center', padding: 8,
                        lineHeight: 1.3, transition: 'all 0.25s',
                        background: card.matched ? 'var(--success)' : card.flipped ? 'var(--primary)' : 'var(--bg-card)',
                        color: (card.flipped || card.matched) ? '#fff' : 'var(--text-secondary)',
                        border: `2px solid ${card.matched ? 'var(--success)' : card.flipped ? 'var(--primary)' : 'var(--border-light)'}`,
                        boxShadow: card.flipped && !card.matched ? '0 0 16px rgba(0,212,255,0.3)' : 'none',
                    }}>
                        {card.flipped || card.matched ? card.label : '?'}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
const GAMES = [
    { id: 'flashcards', label: 'Flashcards', icon: '🃏', desc: 'Flip cards to learn CS terms and definitions at your own pace.' },
    { id: 'scramble', label: 'Word Scramble', icon: '🔤', desc: 'Unscramble CS vocabulary words — test your tech knowledge.' },
    { id: 'memory', label: 'Memory Match', icon: '🧠', desc: 'Match pairs of CS concepts and definitions — train your memory.' },
];

export default function GamesPage() {
    const [active, setActive] = useState(null);

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <div>
                    <div className="page-title">Study Games</div>
                    <div className="page-subtitle">Learn while you play — educational games to sharpen your CS knowledge</div>
                </div>
                {active && (
                    <button className="btn btn-secondary" onClick={() => setActive(null)}>← Back to Games</button>
                )}
            </div>

            {!active ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                    {GAMES.map(g => (
                        <div key={g.id} onClick={() => setActive(g.id)}
                            style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 32, textAlign: 'center', cursor: 'pointer', border: '1px solid var(--border-light)', transition: 'all 0.2s', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                        >
                            <div style={{ fontSize: 56, marginBottom: 16 }}>{g.icon}</div>
                            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{g.label}</div>
                            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>{g.desc}</div>
                            <button className="btn btn-primary" style={{ width: '100%' }}>Play Now →</button>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 32, border: '1px solid var(--border-light)' }}>
                    <h2 style={{ marginBottom: 24, color: 'var(--primary-light)' }}>
                        {GAMES.find(g => g.id === active)?.icon} {GAMES.find(g => g.id === active)?.label}
                    </h2>
                    {active === 'flashcards' && <Flashcards />}
                    {active === 'scramble' && <WordScramble />}
                    {active === 'memory' && <MemoryMatch />}
                </div>
            )}
        </div>
    );
}
