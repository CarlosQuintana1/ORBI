import { useState, useCallback } from 'react'
import './LumisGame.css'

// ── Question bank ─────────────────────────────────────────────────
// Each question maps to a card field key + label
const QUESTIONS = [
  {
    key: 'color',
    emoji: '🎨',
    text: '¿Cuál es tu color favorito?',
    label: 'Color favorito',
    rowEmoji: '🎨',
    options: [
      { emoji: '🔴', label: 'Rojo' },
      { emoji: '🔵', label: 'Azul' },
      { emoji: '🟡', label: 'Amarillo' },
      { emoji: '🟢', label: 'Verde' },
    ],
  },
  {
    key: 'animal',
    emoji: '🦁',
    text: '¿Con qué animal te identificas más?',
    label: 'Animal interior',
    rowEmoji: '🦁',
    options: [
      { emoji: '🦁', label: 'León — soy valiente' },
      { emoji: '🦋', label: 'Mariposa — soy creativo/a' },
      { emoji: '🐬', label: 'Delfín — soy inteligente' },
      { emoji: '🐺', label: 'Lobo — soy leal' },
    ],
  },
  {
    key: 'superpower',
    emoji: '⚡',
    text: 'Si tuvieras un superpoder, ¿cuál sería?',
    label: 'Superpoder',
    rowEmoji: '⚡',
    options: [
      { emoji: '🦅', label: 'Volar' },
      { emoji: '🧠', label: 'Leer mentes' },
      { emoji: '⚡', label: 'Super velocidad' },
      { emoji: '🌀', label: 'Viajar en el tiempo' },
    ],
  },
  {
    key: 'feeling',
    emoji: '💭',
    text: '¿Cómo te sientes la mayor parte del tiempo?',
    label: 'Sentimiento usual',
    rowEmoji: '💭',
    options: [
      { emoji: '😄', label: 'Feliz y energético/a' },
      { emoji: '🤔', label: 'Curioso/a y pensativo/a' },
      { emoji: '😌', label: 'Tranquilo/a y relajado/a' },
      { emoji: '🤩', label: 'Emocionado/a y aventurero/a' },
    ],
  },
  {
    key: 'skill',
    emoji: '🏆',
    text: '¿En qué eres mejor que nadie?',
    label: 'Mi talento',
    rowEmoji: '🏆',
    options: [
      { emoji: '🎨', label: 'Dibujar y crear cosas' },
      { emoji: '📖', label: 'Inventar historias' },
      { emoji: '🧮', label: 'Resolver problemas' },
      { emoji: '🤝', label: 'Hacer amigos' },
    ],
  },
  {
    key: 'dream',
    emoji: '🌠',
    text: '¿Qué te gustaría hacer cuando seas grande?',
    label: 'Mi sueño',
    rowEmoji: '🌠',
    options: [
      { emoji: '🚀', label: 'Explorar el espacio' },
      { emoji: '🎭', label: 'Actuar o cantar' },
      { emoji: '🏥', label: 'Ayudar a los demás' },
      { emoji: '🔬', label: 'Inventar cosas nuevas' },
    ],
  },
]

const pr = (i, s) => Math.abs(Math.sin(i * s * 2.399))
let _fid = 0

function StarIcon({ size = 18 }) {
  const c = size / 2, r = size / 2 - 1, inner = r * 0.42
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5 - Math.PI / 2
    return `${c + (i % 2 ? inner : r) * Math.cos(a)},${c + (i % 2 ? inner : r) * Math.sin(a)}`
  }).join(' ')
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display:'inline-block', verticalAlign:'middle' }}>
      <polygon points={pts} fill="#ffd60a" />
    </svg>
  )
}

// ── Orbi for Lumis ────────────────────────────────────────────────
function OrbiLumis({ celebrating }) {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <defs>
        <radialGradient id="lm-body" cx="34%" cy="34%">
          <stop offset="0%"   stopColor="#fff4b3" />
          <stop offset="55%"  stopColor="#ffd60a" />
          <stop offset="100%" stopColor="#7a5500" />
        </radialGradient>
      </defs>
      <circle cx="36" cy="38" r="25" fill="url(#lm-body)" />
      <ellipse cx="36" cy="38" rx="33" ry="8" stroke="rgba(199,125,255,0.6)" strokeWidth="2.5" fill="none" />
      <ellipse cx="26" cy="36" rx="6" ry="6.5" fill="white" />
      <ellipse cx="46" cy="36" rx="6" ry="6.5" fill="white" />
      <circle cx="27.5" cy="37.5" r="3.5" fill="#3a2800" />
      <circle cx="47.5" cy="37.5" r="3.5" fill="#3a2800" />
      <circle cx="28.5" cy="36" r="1.5" fill="white" />
      <circle cx="48.5" cy="36" r="1.5" fill="white" />
      {celebrating
        ? <path d="M21 48 Q36 60 51 48 Q36 56 21 48" fill="white" />
        : <path d="M22 48 Q36 56 50 48" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      }
      <line x1="29" y1="15" x2="25" y2="5" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="24" cy="3.5" r="3.2" fill="#c77dff" />
      <line x1="43" y1="15" x2="47" y2="5" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="48" cy="3.5" r="3.2" fill="#c77dff" />
      {celebrating && (
        <>
          <path d="M4,26 L5.2,22 L6.5,26 L10.5,27.2 L6.5,28.5 L5.2,32.5 L4,28.5 L0,27.2 Z" fill="#ffd60a" opacity="0.9" />
          <path d="M62,22 L63,19 L64,22 L67,23 L64,24 L63,27 L62,24 L59,23 Z" fill="#c77dff" opacity="0.8" />
          <path d="M66,54 L67,51 L68,54 L71,55 L68,56 L67,59 L66,56 L63,55 Z" fill="white" opacity="0.6" />
        </>
      )}
    </svg>
  )
}

// ── Planet name from child name (for card) ────────────────────────
function nameHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

// ── Identity Card ─────────────────────────────────────────────────
function IdentityCard({ childName, answers, score }) {
  const hash    = nameHash(childName)
  const starCount = Math.min(Math.ceil(score / 20), 5)

  return (
    <div className="identity-card">
      <div className="id-header">
        <div className="id-orbi-logo">
          <span>💫</span> Orbi · Carta de Identidad <span>💫</span>
        </div>
        <div className="id-name">{childName}</div>
        <div className="id-planet-name">Explorador/a del Planeta Lumis</div>
      </div>

      <div className="id-rows">
        {QUESTIONS.map((q, i) => {
          const ans = answers[q.key]
          if (!ans) return null
          return (
            <div key={q.key} className="id-row" style={{ '--ri': i }}>
              <span className="id-row-emoji">{q.rowEmoji}</span>
              <div style={{ flex: 1 }}>
                <div className="id-row-label">{q.label}</div>
                <div className="id-row-value">{ans.emoji} {ans.label.split(' — ')[0]}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="id-star-bar">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className="id-star"
            style={{
              '--si': i,
              opacity: i < starCount ? 1 : 0.2,
            }}
          >⭐</span>
        ))}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────
function LumisGame({ childName, onBack, onScore }) {
  const [phase, setPhase]       = useState('intro')
  const [qIdx, setQIdx]         = useState(0)
  const [answers, setAnswers]   = useState({})
  const [selected, setSelected] = useState(null)
  const [score, setScore]       = useState(0)
  const [floats, setFloats]     = useState([])
  const [orbiCelebrating, setOrbiCelebrating] = useState(false)

  const question  = QUESTIONS[qIdx]
  const isEnd     = qIdx >= QUESTIONS.length
  const progressPct = Math.round((qIdx / QUESTIONS.length) * 100)

  const handleSelect = useCallback((opt) => {
    if (selected !== null) return
    setSelected(opt)
    setOrbiCelebrating(true)

    const pts = 10
    setScore(s => s + pts)
    onScore?.(pts)
    setAnswers(prev => ({ ...prev, [question.key]: opt }))

    const fid = ++_fid
    setFloats(prev => [...prev, { id: fid, pts }])
    setTimeout(() => setFloats(prev => prev.filter(f => f.id !== fid)), 1100)

    setTimeout(() => {
      setSelected(null)
      setOrbiCelebrating(false)
      setQIdx(i => i + 1)
    }, 1200)
  }, [selected, question, onScore])

  const restart = () => {
    setQIdx(0); setAnswers({}); setScore(0); setSelected(null); setPhase('playing')
  }

  if (phase === 'intro') return (
    <div className="lumis-container">
      <div className="lumis-stars" />
      <div className="lumis-shimmer" />
      <header className="game-header">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="lumis-badge">Lumis</div>
        <div className="game-score"><StarIcon /> 0</div>
      </header>
      <h2 className="lumis-title">Planeta Lumis</h2>
      <p className="lumis-subtitle">¡Conócete a ti mismo!</p>
      <div style={{ margin: '0.8rem 0', position: 'relative', zIndex: 1 }}>
        <OrbiLumis celebrating={false} />
      </div>
      <div className="lumis-intro">
        <div className="lumis-intro-text">
          ✨ Orbi quiere conocerte mejor.<br />
          Responde <strong>{QUESTIONS.length} preguntas</strong> sobre ti mismo/a.<br />
          Al final crearás tu <strong>Carta de Identidad</strong> espacial única. 🪐
        </div>
        <button className="btn-lumis-start" onClick={() => setPhase('playing')}>
          ¡Descubrirme!
        </button>
      </div>
    </div>
  )

  if (isEnd) return (
    <div className="lumis-container">
      <div className="lumis-stars" />
      <div className="lumis-shimmer" />
      <header className="game-header">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="lumis-badge">Lumis</div>
        <div className="game-score"><StarIcon /> {score}</div>
      </header>
      <h2 className="lumis-title">¡Tu carta está lista!</h2>
      <p className="lumis-subtitle" style={{ marginBottom: '1rem' }}>
        ¡{childName}, así eres tú! 💫
      </p>
      <div style={{ marginBottom: '0.8rem', position: 'relative', zIndex: 1 }}>
        <OrbiLumis celebrating={true} />
      </div>
      <div className="lumis-card-wrap">
        <IdentityCard childName={childName} answers={answers} score={score} />
        <button className="btn-lumis" onClick={restart}>¡Hacerla de nuevo!</button>
        <button className="btn-back" onClick={onBack} style={{ marginTop: '0.4rem' }}>← Volver al mapa</button>
      </div>
      <div style={{ height: '2rem' }} />
    </div>
  )

  return (
    <div className="lumis-container">
      <div className="lumis-stars" />
      <div className="lumis-shimmer" />

      {floats.map(f => (
        <div key={f.id} className="lumis-float" style={{ left: `${38 + pr(f.id, 5) * 22}%`, top: '32%' }}>
          +{f.pts} ✨
        </div>
      ))}

      <header className="game-header">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="lumis-badge">Lumis</div>
        <div className="game-score"><StarIcon /> {score}</div>
      </header>

      <h2 className="lumis-title">Planeta Lumis</h2>
      <p className="lumis-subtitle">Pregunta {qIdx + 1} de {QUESTIONS.length}</p>

      {/* Progress */}
      <div className="lumis-progress">
        <div className="lumis-progress-track">
          <div className="lumis-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="lumis-progress-label">{progressPct}% completado</div>
      </div>

      {/* Orbi */}
      <div style={{ marginBottom: '0.8rem', position: 'relative', zIndex: 1 }}>
        <OrbiLumis celebrating={orbiCelebrating} />
      </div>

      {/* Question */}
      <div className="lumis-question-card" key={qIdx}>
        <div className="lumis-q-emoji">{question.emoji}</div>
        <div className="lumis-q-text">{question.text}</div>
      </div>

      {/* Options */}
      <div className="lumis-options">
        {question.options.map((opt, i) => (
          <button
            key={i}
            className={`lumis-option${selected?.label === opt.label ? ' selected' : ''}`}
            onClick={() => handleSelect(opt)}
            disabled={selected !== null}
          >
            <span className="lm-opt-emoji">{opt.emoji}</span>
            <span className="lm-opt-label">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default LumisGame
