import { useState } from 'react'
import './MonsterGame.css'

const OBJECTS = [
  { id: 1, color: 'rojo',     shape: 'círculo',   fill: '#ff4757', stroke: '#c0392b' },
  { id: 2, color: 'amarillo', shape: 'círculo',   fill: '#ffd60a', stroke: '#d4af00' },
  { id: 3, color: 'azul',     shape: 'cuadrado',  fill: '#4cc9f0', stroke: '#0ea5c8' },
  { id: 4, color: 'verde',    shape: 'cuadrado',  fill: '#80b918', stroke: '#5a8510' },
  { id: 5, color: 'rojo',     shape: 'triángulo', fill: '#ff4757', stroke: '#c0392b' },
  { id: 6, color: 'morado',   shape: 'círculo',   fill: '#c77dff', stroke: '#9b5de5' },
  { id: 7, color: 'naranja',  shape: 'círculo',   fill: '#ff9f43', stroke: '#e07b00' },
  { id: 8, color: 'azul',     shape: 'diamante',  fill: '#4cc9f0', stroke: '#0ea5c8' },
]

const CHALLENGES = {
  1: [
    { text: '¡Dame 1 rojo!',       check: (s) => s.some(o => o.color === 'rojo') && s.length === 1 },
    { text: '¡Dame 2 círculos!',   check: (s) => s.filter(o => o.shape === 'círculo').length === 2 && s.length === 2 },
    { text: '¡Dame 1 cuadrado!',   check: (s) => s.some(o => o.shape === 'cuadrado') && s.length === 1 },
    { text: '¡Dame 3 objetos!',    check: (s) => s.length === 3 },
    { text: '¡Dame 1 amarillo!',   check: (s) => s.some(o => o.color === 'amarillo') && s.length === 1 },
    { text: '¡Dame 1 triángulo!',  check: (s) => s.some(o => o.shape === 'triángulo') && s.length === 1 },
  ],
  2: [
    { text: '¡Dame 1 rojo y 1 azul!',          check: (s) => s.some(o => o.color === 'rojo') && s.some(o => o.color === 'azul') && s.length === 2 },
    { text: '¡Dame 2 cuadrados!',              check: (s) => s.filter(o => o.shape === 'cuadrado').length === 2 && s.length === 2 },
    { text: '¡Dame 1 triángulo y 1 círculo!',  check: (s) => s.some(o => o.shape === 'triángulo') && s.some(o => o.shape === 'círculo') && s.length === 2 },
    { text: '¡Dame 4 objetos!',                check: (s) => s.length === 4 },
    { text: '¡Dame 2 círculos distintos!',     check: (s) => s.filter(o => o.shape === 'círculo').length === 2 && new Set(s.map(o => o.color)).size === 2 && s.length === 2 },
    { text: '¡Dame 1 verde y 1 morado!',       check: (s) => s.some(o => o.color === 'verde') && s.some(o => o.color === 'morado') && s.length === 2 },
  ],
  3: [
    { text: '¡Dame 2 rojos y 1 azul!',           check: (s) => s.filter(o => o.color === 'rojo').length === 2 && s.some(o => o.color === 'azul') && s.length === 3 },
    { text: '¡Dame 3 formas diferentes!',        check: (s) => new Set(s.map(o => o.shape)).size === 3 && s.length === 3 },
    { text: '¡Dame 2 cuadrados y 1 triángulo!',  check: (s) => s.filter(o => o.shape === 'cuadrado').length === 2 && s.some(o => o.shape === 'triángulo') && s.length === 3 },
    { text: '¡Dame 5 objetos!',                  check: (s) => s.length === 5 },
    { text: '¡Dame 4 colores distintos!',        check: (s) => new Set(s.map(o => o.color)).size === 4 && s.length === 4 },
    { text: '¡Dame 3 círculos!',                 check: (s) => s.filter(o => o.shape === 'círculo').length === 3 && s.length === 3 },
  ],
}

// ── SVG Shape icons (no emojis) ──────────────────────────────────
function ShapeIcon({ shape, fill, stroke, size = 52 }) {
  const c = size / 2
  const pad = 4
  const highlight = 'rgba(255,255,255,0.45)'

  if (shape === 'círculo') return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <circle cx={c} cy={c} r={c - pad} fill={fill} stroke={stroke} strokeWidth="2.5" />
      <ellipse cx={c - 6} cy={c - 6} rx={8} ry={5} fill={highlight} />
    </svg>
  )

  if (shape === 'cuadrado') return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <rect x={pad} y={pad} width={size - pad * 2} height={size - pad * 2} rx="7" fill={fill} stroke={stroke} strokeWidth="2.5" />
      <rect x={pad + 4} y={pad + 4} width={14} height={8} rx="4" fill={highlight} />
    </svg>
  )

  if (shape === 'triángulo') return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <polygon points={`${c},${pad} ${size - pad},${size - pad} ${pad},${size - pad}`} fill={fill} stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
      <ellipse cx={c} cy={c + 4} rx={7} ry={4} fill={highlight} />
    </svg>
  )

  if (shape === 'diamante') return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <polygon points={`${c},${pad} ${size - pad},${c} ${c},${size - pad} ${pad},${c}`} fill={fill} stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
      <ellipse cx={c} cy={c - 5} rx={7} ry={4} fill={highlight} />
    </svg>
  )

  return null
}

// ── 4-pointed sparkle (used in MonsterSVG) ───────────────────────
function Sparkle({ x, y, size = 11, color = '#ffd60a', opacity = 0.9 }) {
  const h = size / 2
  const t = size / 5
  return (
    <path
      d={`M${x},${y - h} L${x + t},${y - t} L${x + h},${y} L${x + t},${y + t} L${x},${y + h} L${x - t},${y + t} L${x - h},${y} L${x - t},${y - t} Z`}
      fill={color}
      opacity={opacity}
    />
  )
}

// ── SVG Monster ──────────────────────────────────────────────────
function MonsterSVG({ state }) {
  const isHappy = state === 'happy'
  const isSad   = state === 'sad'

  return (
    <svg width="130" height="115" viewBox="0 0 130 115" fill="none">
      <defs>
        <radialGradient id="m-body" cx="35%" cy="28%" r="70%">
          <stop offset="0%"   stopColor="#7de8ff" />
          <stop offset="55%"  stopColor="#4cc9f0" />
          <stop offset="100%" stopColor="#0e5f8a" />
        </radialGradient>
        <radialGradient id="m-glow" cx="50%" cy="60%">
          <stop offset="0%"   stopColor="rgba(76,201,240,0.5)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {isHappy && <ellipse cx="65" cy="78" rx="58" ry="52" fill="url(#m-glow)" />}

      <polygon points="26,62 38,22 50,62" fill="#2eadd4" />
      <polygon points="52,57 65,14 78,57" fill="#2eadd4" />
      <polygon points="80,62 92,22 104,62" fill="#2eadd4" />
      <polygon points="33,52 38,28 43,52" fill="rgba(255,255,255,0.2)" />
      <polygon points="60,48 65,20 70,48" fill="rgba(255,255,255,0.2)" />
      <polygon points="87,52 92,28 97,52" fill="rgba(255,255,255,0.2)" />

      <ellipse cx="65" cy="78" rx="50" ry="37" fill="url(#m-body)" />
      <ellipse cx="50" cy="64" rx="17" ry="10" fill="rgba(255,255,255,0.22)" />

      <ellipse cx="17" cy="83" rx="15" ry="9" fill="#2eadd4" transform="rotate(-22 17 83)" />
      <ellipse cx="113" cy="83" rx="15" ry="9" fill="#2eadd4" transform="rotate(22 113 83)" />
      <ellipse cx="15" cy="82" rx="8"  ry="5" fill="rgba(255,255,255,0.15)" transform="rotate(-22 15 82)" />
      <ellipse cx="115" cy="82" rx="8" ry="5" fill="rgba(255,255,255,0.15)" transform="rotate(22 115 82)" />

      {!isSad && (
        <>
          <ellipse cx="47" cy="76" rx="11" ry="12" fill="white" />
          <ellipse cx="83" cy="76" rx="11" ry="12" fill="white" />
          <circle cx="49" cy="78" r="6.5" fill={isHappy ? '#1a3060' : '#1a0533'} />
          <circle cx="85" cy="78" r="6.5" fill={isHappy ? '#1a3060' : '#1a0533'} />
          <circle cx="51.5" cy="75" r="2.5" fill="white" />
          <circle cx="87.5" cy="75" r="2.5" fill="white" />
          {isHappy && (
            <>
              <Sparkle x={30} y={60} size={13} color="#ffd60a" opacity={0.95} />
              <Sparkle x={98} y={56} size={10} color="#ffd60a" opacity={0.8} />
              <Sparkle x={110} y={88} size={8}  color="#fff"    opacity={0.6} />
            </>
          )}
        </>
      )}

      {isSad && (
        <>
          <line x1="38" y1="68" x2="56" y2="85" stroke="white" strokeWidth="5" strokeLinecap="round" />
          <line x1="56" y1="68" x2="38" y2="85" stroke="white" strokeWidth="5" strokeLinecap="round" />
          <line x1="74" y1="68" x2="92" y2="85" stroke="white" strokeWidth="5" strokeLinecap="round" />
          <line x1="92" y1="68" x2="74" y2="85" stroke="white" strokeWidth="5" strokeLinecap="round" />
          <path d="M60 90 Q57 97 60 101 Q63 97 60 90" fill="rgba(160,230,255,0.85)" />
        </>
      )}

      {!isHappy && !isSad && (
        <path d="M48 96 Q65 107 82 96" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      )}

      {isHappy && (
        <>
          <path d="M40 96 Q65 117 90 96 Q65 103 40 96" fill="white" />
          <rect x="48" y="96" width="9"  height="9" rx="2.5" fill="#2a9cc4" />
          <rect x="61" y="96" width="9"  height="9" rx="2.5" fill="#2a9cc4" />
          <rect x="74" y="96" width="9"  height="9" rx="2.5" fill="#2a9cc4" />
        </>
      )}

      {isSad && (
        <path d="M48 100 Q65 90 82 100" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      )}

      <rect x="41" y="109" width="20" height="9" rx="8" fill="#1f8ab0" />
      <rect x="69" y="109" width="20" height="9" rx="8" fill="#1f8ab0" />
    </svg>
  )
}

// ── Floating score badge ─────────────────────────────────────────
const pr = (i, s) => Math.sin(i * s * 2.399) * 0.5 + 0.5

function FloatingScore({ pts, id }) {
  return (
    <div className="floating-score" style={{ left: `${40 + pr(id, 3) * 20}%` }}>
      +{pts}
    </div>
  )
}

// ── Star SVG icon ────────────────────────────────────────────────
function StarIcon({ size = 18, color = '#ffd60a' }) {
  const c = size / 2
  const r = size / 2 - 1
  const inner = r * 0.42
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = (i * Math.PI) / 5 - Math.PI / 2
    const radius = i % 2 === 0 ? r : inner
    return `${c + radius * Math.cos(angle)},${c + radius * Math.sin(angle)}`
  }).join(' ')
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <polygon points={points} fill={color} />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────
function MonsterGame({ childName, onBack, onScore }) {
  const [level, setLevel]               = useState(1)
  const [challengeIndex, setChallengeIndex] = useState(0)
  const [challenge, setChallenge]       = useState(CHALLENGES[1][0])
  const [selected, setSelected]         = useState([])
  const [monsterState, setMonsterState] = useState('idle')
  const [score, setScore]               = useState(0)
  const [streak, setStreak]             = useState(0)
  const [message, setMessage]           = useState('')
  const [correctCount, setCorrectCount] = useState(0)
  const [showLevelUp, setShowLevelUp]   = useState(false)
  const [floats, setFloats]             = useState([])

  const visibleObjects = level === 1 ? OBJECTS.slice(0, 6) : OBJECTS

  const toggleObject = (obj) => {
    if (monsterState !== 'idle') return
    setSelected(prev =>
      prev.find(o => o.id === obj.id)
        ? prev.filter(o => o.id !== obj.id)
        : [...prev, obj]
    )
  }

  const feed = () => {
    if (selected.length === 0 || monsterState !== 'idle') return

    if (challenge.check(selected)) {
      const newStreak  = streak + 1
      const newCorrect = correctCount + 1
      const bonus      = newStreak >= 3 ? 5 : 0
      const pts        = 10 + bonus

      setMonsterState('happy')
      setStreak(newStreak)
      setScore(s => s + pts)
      setCorrectCount(newCorrect)
      onScore?.(pts)
      setMessage(newStreak >= 3 ? `¡Qué rico! Combo x${newStreak}` : '¡Qué rico!')

      const floatId = Date.now()
      setFloats(prev => [...prev, { id: floatId, pts }])
      setTimeout(() => setFloats(prev => prev.filter(f => f.id !== floatId)), 1200)

      let nextLevel = level
      if (newCorrect % 3 === 0 && level < 3) {
        nextLevel = level + 1
        setLevel(nextLevel)
        setShowLevelUp(true)
        setTimeout(() => setShowLevelUp(false), 2200)
      }

      setTimeout(() => {
        const next = challengeIndex + 1
        const pool = CHALLENGES[nextLevel]
        setChallengeIndex(next)
        setChallenge(pool[next % pool.length])
        setSelected([])
        setMonsterState('idle')
        setMessage('')
      }, 1500)
    } else {
      setMonsterState('sad')
      setStreak(0)
      setMessage('¡Eso no me gusta! Intenta de nuevo')
      setTimeout(() => {
        setSelected([])
        setMonsterState('idle')
        setMessage('')
      }, 1500)
    }
  }

  return (
    <div className="monster-container">
      <div className="stars-bg" />

      {showLevelUp && (
        <div className="level-up-toast">¡Nivel {level}! ¡Más difícil!</div>
      )}

      {floats.map(f => <FloatingScore key={f.id} pts={f.pts} id={f.id} />)}

      <header className="game-header">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="game-level">Nivel {level}</div>
        <div className="game-score"><StarIcon /> {score}</div>
      </header>

      <h2 className="game-title">Planeta Kálculo</h2>

      {streak >= 2 && (
        <div className="streak-badge">¡Racha x{streak}!</div>
      )}

      <div className={`monster ${monsterState}`}>
        <MonsterSVG state={monsterState} />
        <div className="monster-bubble">
          <span>{challenge.text}</span>
        </div>
      </div>

      {message && <div className="feedback-msg">{message}</div>}

      <div className={`objects-grid${level === 3 ? ' grid-4' : ''}`}>
        {visibleObjects.map(obj => (
          <div
            key={obj.id}
            className={`object-card ${selected.find(o => o.id === obj.id) ? 'selected' : ''}`}
            onClick={() => toggleObject(obj)}
          >
            <ShapeIcon shape={obj.shape} fill={obj.fill} stroke={obj.stroke} size={level === 3 ? 44 : 52} />
            <span className="object-label">{obj.color}</span>
          </div>
        ))}
      </div>

      <div className="selected-preview">
        {selected.length > 0 ? (
          <div className="selected-shapes">
            {selected.map((o, i) => (
              <ShapeIcon key={i} shape={o.shape} fill={o.fill} stroke={o.stroke} size={36} />
            ))}
          </div>
        ) : (
          <span className="preview-hint">Toca los objetos para el monstruo</span>
        )}
      </div>

      <button
        className="btn-feed"
        onClick={feed}
        disabled={selected.length === 0 || monsterState !== 'idle'}
      >
        ¡Dar de comer!
      </button>
    </div>
  )
}

export default MonsterGame
