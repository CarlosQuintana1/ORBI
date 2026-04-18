import { useState, useCallback, useMemo } from 'react'
import './PrismaGame.css'

// ── Color palette ─────────────────────────────────────────────────
const COLORS = [
  { id: 'rojo',    hex: '#ff4757', label: 'Rojo' },
  { id: 'azul',    hex: '#4cc9f0', label: 'Azul' },
  { id: 'verde',   hex: '#06d6a0', label: 'Verde' },
  { id: 'amarillo',hex: '#ffd60a', label: 'Amarillo' },
  { id: 'morado',  hex: '#c77dff', label: 'Morado' },
  { id: 'naranja', hex: '#f9844a', label: 'Naranja' },
]

const pr = (i, s) => Math.sin(i * s * 2.399) * 0.5 + 0.5

// ── Challenge generator ────────────────────────────────────────────
// Returns { grid: colorId[][], hiddenIndex: number, gridSize: number, options: colorId[] }
function generateChallenge(level) {
  const gridSize = level === 1 ? 3 : level === 2 ? 3 : 4
  const colorsUsed = level === 1 ? 3 : level === 2 ? 4 : 5

  const palette = COLORS.slice(0, colorsUsed).map(c => c.id)

  // Build a pattern — alternating or repeating sequence
  const patternType = Math.floor(Math.random() * 3) // 0: row repeat, 1: checkerboard, 2: diagonal
  const total = gridSize * gridSize

  let grid = []

  if (patternType === 0) {
    // Each row repeats a color, rows cycle through palette
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        grid.push(palette[r % palette.length])
      }
    }
  } else if (patternType === 1) {
    // Checkerboard of 2 colors
    const c1 = palette[0], c2 = palette[1]
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        grid.push((r + c) % 2 === 0 ? c1 : c2)
      }
    }
  } else {
    // Each cell: palette[(row+col) % paletteLen]
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        grid.push(palette[(r + c) % palette.length])
      }
    }
  }

  // Pick a hidden cell (not the first or last)
  const hiddenIndex = 1 + Math.floor(Math.random() * (total - 2))
  const answer = grid[hiddenIndex]

  // Build options: answer + 2-3 distractors
  const wrongColors = palette.filter(c => c !== answer)
  const numDistractors = level === 1 ? 2 : 3
  const shuffledWrong = wrongColors.sort(() => Math.random() - 0.5).slice(0, numDistractors)
  const options = [answer, ...shuffledWrong].sort(() => Math.random() - 0.5)

  return { grid, hiddenIndex, gridSize, options, answer }
}

// ── Helpers ───────────────────────────────────────────────────────
function colorHex(id) {
  return COLORS.find(c => c.id === id)?.hex || '#888'
}

// ── Sub-components ────────────────────────────────────────────────
function PatternCell({ colorId, hidden, revealed, onClick, wrongFlash, correctFlash }) {
  const className = [
    'pattern-cell',
    hidden && !revealed ? 'hidden' : '',
    revealed ? 'reveal-anim' : '',
    wrongFlash ? 'wrong-flash' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={className}
      style={
        hidden && !revealed
          ? { background: 'transparent' }
          : { background: colorHex(colorId) }
      }
      onClick={hidden && !revealed ? onClick : undefined}
    >
      {hidden && !revealed && <div className="cell-question">?</div>}
      {(!hidden || revealed) && <div className="cell-shine" />}
    </div>
  )
}

function OptionCell({ colorId, onClick, flash }) {
  return (
    <div
      className={`option-cell${flash === 'correct' ? ' correct-flash' : flash === 'wrong' ? ' wrong-flash' : ''}`}
      style={{ background: colorHex(colorId) }}
      onClick={onClick}
    >
      <div className="cell-shine" />
    </div>
  )
}

function OrbiPrisma({ happy }) {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="orbi-prisma-svg">
      <defs>
        <radialGradient id="pb-body" cx="34%" cy="34%">
          <stop offset="0%"   stopColor="#ffb3d9" />
          <stop offset="55%"  stopColor="#f72585" />
          <stop offset="100%" stopColor="#7a0038" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="42" r="27" fill="url(#pb-body)" />
      <ellipse cx="40" cy="42" rx="35" ry="9" stroke="rgba(255,215,80,0.55)" strokeWidth="3" fill="none" />
      <ellipse cx="29" cy="40" rx="6" ry="7" fill="white" />
      <ellipse cx="51" cy="40" rx="6" ry="7" fill="white" />
      <circle cx="31" cy="42" r="4" fill="#3d001a" />
      <circle cx="53" cy="42" r="4" fill="#3d001a" />
      <circle cx="32.5" cy="40" r="1.8" fill="white" />
      <circle cx="54.5" cy="40" r="1.8" fill="white" />
      {happy
        ? <path d="M28 52 Q40 64 52 52 Q40 58 28 52" fill="white" />
        : <path d="M29 52 Q40 61 51 52" stroke="white" strokeWidth="2.8" fill="none" strokeLinecap="round" />
      }
      <line x1="32" y1="17" x2="28" y2="7" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="27" cy="5" r="3.5" fill="#ffd60a" />
      <line x1="48" y1="17" x2="52" y2="7" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="53" cy="5" r="3.5" fill="#ffd60a" />
      {/* Prismatic sparkles */}
      <path d="M7,28 L8.5,23 L10,28 L15,29.5 L10,31 L8.5,36 L7,31 L2,29.5 Z" fill="#ffd60a" opacity="0.9" />
      <path d="M68,22 L69.5,18 L71,22 L75,23.5 L71,25 L69.5,29 L68,25 L64,23.5 Z" fill="#4cc9f0" opacity="0.8" />
      <path d="M72,60 L73,57 L74,60 L77,61 L74,62 L73,65 L72,62 L69,61 Z" fill="#06d6a0" opacity="0.7" />
    </svg>
  )
}

function StarIcon({ size = 18 }) {
  const c = size / 2, r = size / 2 - 1, inner = r * 0.42
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5 - Math.PI / 2
    const rad = i % 2 === 0 ? r : inner
    return `${c + rad * Math.cos(a)},${c + rad * Math.sin(a)}`
  }).join(' ')
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <polygon points={pts} fill="#ffd60a" />
    </svg>
  )
}

function FloatingScore({ pts, id }) {
  return (
    <div className="prisma-float-score" style={{ left: `${38 + pr(id, 4) * 22}%` }}>
      +{pts}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────
function PrismaGame({ childName, onBack, onScore }) {
  const [phase, setPhase]   = useState('intro') // intro | playing | feedback
  const [challenge, setChallenge] = useState(null)
  const [revealed, setRevealed]   = useState(false)
  const [optionFlash, setOptionFlash] = useState(null) // { id, type }
  const [orbiHappy, setOrbiHappy]     = useState(false)
  const [score, setScore]   = useState(0)
  const [streak, setStreak] = useState(0)
  const [level, setLevel]   = useState(1)
  const [solved, setSolved] = useState(0)
  const [status, setStatus] = useState('')
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [floats, setFloats] = useState([])
  const [locked, setLocked] = useState(false)

  const loadChallenge = useCallback((lv) => {
    const c = generateChallenge(lv)
    setChallenge(c)
    setRevealed(false)
    setOptionFlash(null)
    setStatus('')
    setLocked(false)
    setOrbiHappy(false)
  }, [])

  const startGame = useCallback(() => {
    setScore(0); setStreak(0); setSolved(0); setLevel(1)
    setPhase('playing')
    loadChallenge(1)
  }, [loadChallenge])

  const handleAnswer = useCallback((colorId) => {
    if (locked || !challenge) return
    setLocked(true)

    if (colorId === challenge.answer) {
      const newStreak = streak + 1
      const newSolved = solved + 1
      const bonus = newStreak >= 3 ? 5 : 0
      const pts   = 10 + (level - 1) * 5 + bonus

      setOptionFlash({ id: colorId, type: 'correct' })
      setOrbiHappy(true)
      setStreak(newStreak)
      setSolved(newSolved)
      setScore(s => s + pts)
      onScore?.(pts)
      setRevealed(true)

      if (newStreak >= 3) setStatus(`¡Brillante! Combo x${newStreak}`)
      else setStatus('¡Correcto!')

      // Floating score
      const fid = Date.now()
      setFloats(prev => [...prev, { id: fid, pts }])
      setTimeout(() => setFloats(prev => prev.filter(f => f.id !== fid)), 1300)

      // Level up every 3 correct
      let nextLevel = level
      if (newSolved % 3 === 0 && level < 3) {
        nextLevel = level + 1
        setLevel(nextLevel)
        setShowLevelUp(true)
        setTimeout(() => setShowLevelUp(false), 2200)
      }

      setTimeout(() => loadChallenge(nextLevel), 1600)
    } else {
      setOptionFlash({ id: colorId, type: 'wrong' })
      setStreak(0)
      setStatus('¡Inténtalo de nuevo!')
      setTimeout(() => {
        setOptionFlash(null)
        setLocked(false)
        setStatus('')
      }, 900)
    }
  }, [locked, challenge, streak, solved, level, onScore, loadChallenge])

  if (phase === 'intro') {
    return (
      <div className="prisma-container">
        <div className="prisma-stars" />
        <div className="prisma-shimmer" />
        <header className="game-header">
          <button className="btn-back" onClick={onBack}>← Volver</button>
          <div className="prisma-badge">Prisma</div>
          <div className="game-score"><StarIcon /> 0</div>
        </header>
        <h2 className="prisma-title">Planeta Prisma</h2>
        <p className="prisma-subtitle">¡Descubre el patrón visual!</p>
        <div className="orbi-prisma-wrap" style={{ margin: '1rem 0' }}>
          <OrbiPrisma happy={false} />
        </div>
        <div className="prisma-intro">
          <div className="prisma-intro-text">
            Mira la cuadrícula de colores.<br />
            ¡Hay una celda <strong>vacía con ?</strong>!<br />
            Encuentra el color que <strong>completa el patrón</strong> y tócalo.
          </div>
          <button className="btn-prisma-start" onClick={startGame}>
            ¡Descubrir patrones!
          </button>
        </div>
      </div>
    )
  }

  if (!challenge) return null

  const { grid, hiddenIndex, gridSize, options, answer } = challenge
  const cols = gridSize === 4 ? 'grid-cols-4' : 'grid-cols-3'

  return (
    <div className="prisma-container">
      <div className="prisma-stars" />
      <div className="prisma-shimmer" />

      {showLevelUp && (
        <div className="prisma-levelup">¡Nivel {level}!<br /><span style={{ fontSize: '1rem' }}>Patrones más complejos</span></div>
      )}

      {floats.map(f => <FloatingScore key={f.id} pts={f.pts} id={f.id} />)}

      <header className="game-header">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="prisma-level">Nivel {level}</div>
        <div className="game-score"><StarIcon /> {score}</div>
      </header>

      <h2 className="prisma-title">Planeta Prisma</h2>
      <p className="prisma-subtitle">
        {solved > 0 ? `${solved} ${solved === 1 ? 'patrón resuelto' : 'patrones resueltos'}` : '¡Encuentra el patrón!'}
      </p>

      <div className="orbi-prisma-wrap">
        <OrbiPrisma happy={orbiHappy} />
        {streak >= 2 && <div className="prisma-streak">¡Racha x{streak}!</div>}
      </div>

      {status && <div className="prisma-status" key={status}>{status}</div>}

      <div className="prisma-challenge">
        ¿Qué color va en el lugar del <span style={{ color: '#f72585' }}>?</span>
      </div>

      <div className="pattern-grid-wrap">
        <span className="pattern-label">Patrón</span>
        <div className={`pattern-grid ${cols}`}>
          {grid.map((colorId, i) => (
            <PatternCell
              key={i}
              colorId={colorId}
              hidden={i === hiddenIndex}
              revealed={revealed && i === hiddenIndex}
              onClick={() => {/* hint: clicking the cell itself does nothing, pick from palette */}}
              wrongFlash={optionFlash?.type === 'wrong'}
            />
          ))}
        </div>
      </div>

      <p className="options-label">Elige el color correcto</p>
      <div className="options-row">
        {options.map((colorId) => (
          <OptionCell
            key={colorId}
            colorId={colorId}
            onClick={() => handleAnswer(colorId)}
            flash={optionFlash?.id === colorId ? optionFlash.type : null}
          />
        ))}
      </div>
    </div>
  )
}

export default PrismaGame
