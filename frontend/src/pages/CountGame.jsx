import { useState, useCallback, useMemo } from 'react'
import './CountGame.css'

const OBJECTS = [
  { type: 'star',   label: 'estrellas',  color: '#ffd60a' },
  { type: 'planet', label: 'planetas',   color: '#4cc9f0' },
  { type: 'comet',  label: 'cometas',    color: '#c77dff' },
  { type: 'moon',   label: 'lunas',      color: '#e0e0e0' },
  { type: 'rocket', label: 'cohetes',    color: '#ff6b6b' },
]

const pr = (i, s) => Math.abs(Math.sin(i * s * 2.399))

function SpaceObject({ type, color, x, y }) {
  if (type === 'star') return (
    <div className="cg-object" style={{ left: `${x}%`, top: `${y}%` }}>
      <svg width="32" height="32" viewBox="0 0 32 32">
        <polygon points="16,2 19.5,12.5 30,13 22,20 24.5,30 16,24.5 7.5,30 10,20 2,13 12.5,12.5" fill={color} />
      </svg>
    </div>
  )
  if (type === 'planet') return (
    <div className="cg-object" style={{ left: `${x}%`, top: `${y}%` }}>
      <svg width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="10" fill={color} />
        <ellipse cx="16" cy="16" rx="15" ry="5" stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" />
      </svg>
    </div>
  )
  if (type === 'comet') return (
    <div className="cg-object" style={{ left: `${x}%`, top: `${y}%` }}>
      <svg width="36" height="18" viewBox="0 0 36 18">
        <circle cx="28" cy="9" r="7" fill={color} />
        <polygon points="0,9 22,3 22,15" fill={color} opacity="0.4" />
      </svg>
    </div>
  )
  if (type === 'moon') return (
    <div className="cg-object" style={{ left: `${x}%`, top: `${y}%` }}>
      <svg width="28" height="28" viewBox="0 0 28 28">
        <path d="M14 2 A12 12 0 1 0 14 26 A7 7 0 0 1 14 2Z" fill={color} />
      </svg>
    </div>
  )
  if (type === 'rocket') return (
    <div className="cg-object" style={{ left: `${x}%`, top: `${y}%` }}>
      <svg width="20" height="32" viewBox="0 0 20 32">
        <polygon points="10,0 18,18 2,18" fill={color} />
        <rect x="5" y="18" width="10" height="8" fill={color} opacity="0.8" />
        <polygon points="2,26 5,20 5,26" fill={color} opacity="0.6" />
        <polygon points="18,26 15,20 15,26" fill={color} opacity="0.6" />
      </svg>
    </div>
  )
  return null
}

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

function generateChallenge(level) {
  const maxCount = level === 1 ? 6 : level === 2 ? 10 : 15
  const minCount = level === 1 ? 1 : level === 2 ? 4 : 7
  const count    = minCount + Math.floor(Math.random() * (maxCount - minCount + 1))
  const objTypes = level === 1 ? 2 : level === 2 ? 3 : OBJECTS.length
  const obj      = OBJECTS[Math.floor(Math.random() * objTypes)]

  // Place objects in non-overlapping grid-ish positions
  const positions = Array.from({ length: count }, (_, i) => ({
    x: 8 + pr(i, 1) * 76,
    y: 8 + pr(i, 2) * 76,
  }))

  // Wrong answers
  const wrong = new Set()
  while (wrong.size < 3) {
    const w = Math.max(0, count + Math.floor((Math.random() - 0.5) * 6))
    if (w !== count && w >= 0) wrong.add(w)
  }
  const options = [count, ...[...wrong]].sort(() => Math.random() - 0.5)

  return { obj, count, positions, options }
}

export default function CountGame({ childName, onBack, onScore }) {
  const [phase, setPhase]       = useState('intro')
  const [level, setLevel]       = useState(1)
  const [score, setScore]       = useState(0)
  const [streak, setStreak]     = useState(0)
  const [solved, setSolved]     = useState(0)
  const [flash, setFlash]       = useState('')   // 'correct' | 'wrong'
  const [challenge, setChallenge] = useState(null)

  const next = useCallback((lv = level) => {
    setChallenge(generateChallenge(lv))
    setFlash('')
  }, [level])

  const startGame = useCallback(() => {
    setSolved(0); setScore(0); setStreak(0); setLevel(1)
    setPhase('playing')
    setChallenge(generateChallenge(1))
  }, [])

  const handleAnswer = useCallback((answer) => {
    if (flash || !challenge) return
    if (answer === challenge.count) {
      const newStreak = streak + 1
      const newSolved = solved + 1
      const pts  = 10 + (level - 1) * 5 + (newStreak >= 3 ? 5 : 0)
      setStreak(newStreak)
      setSolved(newSolved)
      setScore(s => s + pts)
      onScore?.(pts)
      setFlash('correct')

      let nextLevel = level
      if (newSolved % 4 === 0 && level < 3) nextLevel = level + 1
      setLevel(nextLevel)

      setTimeout(() => next(nextLevel), 900)
    } else {
      setStreak(0)
      setFlash('wrong')
      setTimeout(() => setFlash(''), 700)
    }
  }, [flash, challenge, streak, solved, level, onScore, next])

  return (
    <div className="cg-container">
      <div className="cg-stars" />
      <header className="cg-header">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="cg-badge">Cuenta y clasifica</div>
        <div className="cg-score"><StarIcon /> {score}</div>
      </header>

      {phase === 'intro' && (
        <div className="cg-screen">
          <div className="cg-intro-icon">
            <svg width="64" height="64" viewBox="0 0 64 64">
              <polygon points="32,4 39,24 60,26 44,40 49,60 32,50 15,60 20,40 4,26 25,24" fill="#ffd60a" />
            </svg>
          </div>
          <div className="cg-intro-text">
            Cuenta los objetos espaciales que aparecen en la pantalla y elige la respuesta correcta.<br />Cada nivel tiene más objetos.
          </div>
          <button className="btn-cg-start" onClick={startGame}>¡Contar!</button>
        </div>
      )}

      {phase === 'playing' && challenge && (
        <>
          <div className="cg-hud">
            <div className="cg-level-badge">Nivel {level}</div>
            {streak >= 3 && <div className="cg-streak">Racha x{streak}</div>}
          </div>

          <div className="cg-question">
            ¿Cuántas <span style={{ color: challenge.obj.color }}>{challenge.obj.label}</span> hay?
          </div>

          <div className={`cg-field${flash === 'wrong' ? ' cg-shake' : ''}`}>
            {challenge.positions.map((p, i) => (
              <SpaceObject key={i} type={challenge.obj.type} color={challenge.obj.color} x={p.x} y={p.y} />
            ))}
            {flash === 'correct' && <div className="cg-correct-overlay" />}
          </div>

          <div className="cg-options">
            {challenge.options.map(opt => (
              <button
                key={opt}
                className={`cg-opt-btn${flash === 'correct' && opt === challenge.count ? ' cg-correct' : ''}`}
                onClick={() => handleAnswer(opt)}
                disabled={!!flash}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
