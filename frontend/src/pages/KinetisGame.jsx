import { useState, useEffect, useRef, useCallback } from 'react'
import './KinetisGame.css'

// ── Bubble pool ───────────────────────────────────────────────────
const BUBBLE_TYPES = [
  { id: 'rojo',     color: '#ff4757', shadow: 'rgba(255,71,87,0.7)',   label: '🔴', tag: 'rojo'     },
  { id: 'azul',     color: '#4cc9f0', shadow: 'rgba(76,201,240,0.7)',  label: '🔵', tag: 'azul'     },
  { id: 'verde',    color: '#06d6a0', shadow: 'rgba(6,214,160,0.7)',   label: '🟢', tag: 'verde'    },
  { id: 'amarillo', color: '#ffd60a', shadow: 'rgba(255,214,10,0.7)',  label: '⭐', tag: 'amarillo' },
  { id: 'morado',   color: '#c77dff', shadow: 'rgba(199,125,255,0.7)', label: '🟣', tag: 'morado'   },
  { id: 'naranja',  color: '#f9844a', shadow: 'rgba(249,132,74,0.7)',  label: '🟠', tag: 'naranja'  },
]

// Each challenge: what to catch and how many
const CHALLENGES = [
  { text: '¡Atrapa las burbujas ROJAS!',     filter: b => b.id === 'rojo',     count: 5  },
  { text: '¡Atrapa las burbujas AZULES!',    filter: b => b.id === 'azul',     count: 5  },
  { text: '¡Atrapa las burbujas VERDES!',    filter: b => b.id === 'verde',    count: 5  },
  { text: '¡Atrapa las ESTRELLAS!',          filter: b => b.id === 'amarillo', count: 6  },
  { text: '¡Atrapa las MORADAS!',            filter: b => b.id === 'morado',   count: 5  },
  { text: '¡Atrapa 8 burbujas cualquiera!',  filter: () => true,               count: 8  },
  { text: '¡Atrapa las NARANJAS!',           filter: b => b.id === 'naranja',  count: 5  },
  { text: '¡Atrapa 6 de colores distintos!', filter: () => true,               count: 6, distinct: true },
]

const pr = (i, s) => Math.abs(Math.sin(i * s * 2.399))
let _uid = 0

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

function KinetisGame({ childName, onBack, onScore, initialLevel = 1 }) {
  const [phase, setPhase]       = useState('intro')
  const [bubbles, setBubbles]   = useState([])
  const [popped, setPopped]     = useState([])   // {id, x, y, color}
  const [misses, setMisses]     = useState([])   // {id, x, y}
  const [floats, setFloats]     = useState([])
  const [particles, setParticles] = useState([])
  const [score, setScore]       = useState(0)
  const [streak, setStreak]     = useState(0)
  const [level, setLevel]       = useState(initialLevel)
  const [challengeIdx, setChallengeIdx] = useState(0)
  const [caught, setCaught]     = useState(0)    // correct catches this challenge
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [totalChallenges, setTotalChallenges] = useState(0)

  const arenaRef  = useRef(null)
  const spawnRef  = useRef(null)
  const challenge = CHALLENGES[challengeIdx % CHALLENGES.length]

  // Bubble size and speed per level
  const bubbleSize = level === 1 ? 70 : level === 2 ? 62 : 55
  const spawnRate  = level === 1 ? 1400 : level === 2 ? 1100 : 850
  const riseTime   = level === 1 ? 4.5  : level === 2 ? 3.5  : 2.8

  const spawnBubble = useCallback(() => {
    const arena = arenaRef.current
    if (!arena) return
    const w    = arena.clientWidth
    const type = BUBBLE_TYPES[Math.floor(Math.random() * BUBBLE_TYPES.length)]
    const x    = bubbleSize / 2 + Math.random() * (w - bubbleSize)
    const id   = ++_uid
    const rot  = `${-20 + Math.random() * 40}deg`
    const wobble = Math.sin(id * 0.7) * 18

    setBubbles(prev => [...prev, {
      id, type, x,
      bottom: -bubbleSize,
      size: bubbleSize,
      dur: riseTime,
      rot,
      wobble,
    }])

    // Auto-remove after rise animation ends (escaped)
    setTimeout(() => {
      setBubbles(prev => {
        const still = prev.find(b => b.id === id && !b.poppedAt)
        if (still && challenge.filter(still.type)) {
          // missed a target bubble
          setMisses(m => {
            const mid = ++_uid
            setTimeout(() => setMisses(ms => ms.filter(e => e.id !== mid)), 800)
            return [...m, { id: mid, x: still.x, y: 80 }]
          })
          setStreak(0)
        }
        return prev.filter(b => b.id !== id)
      })
    }, riseTime * 1000 + 100)
  }, [bubbleSize, riseTime, challenge])

  useEffect(() => {
    if (phase !== 'playing') return
    spawnRef.current = setInterval(spawnBubble, spawnRate)
    return () => clearInterval(spawnRef.current)
  }, [phase, spawnBubble, spawnRate])

  const handlePop = useCallback((e, bubble) => {
    e.stopPropagation()
    const arena  = arenaRef.current
    if (!arena) return
    const rect   = arena.getBoundingClientRect()
    const cx     = bubble.x
    const target = e.currentTarget
    const bRect  = target.getBoundingClientRect()
    const cy     = bRect.top - rect.top + bubble.size / 2

    const isTarget = challenge.filter(bubble.type)

    // Mark bubble as popped
    setBubbles(prev => prev.map(b => b.id === bubble.id ? { ...b, poppedAt: Date.now() } : b))
    setTimeout(() => setBubbles(prev => prev.filter(b => b.id !== bubble.id)), 380)

    if (isTarget) {
      // Check distinct mode
      let valid = true
      if (challenge.distinct) {
        setPopped(prev => {
          const usedColors = prev.map(p => p.type?.id)
          if (usedColors.includes(bubble.type.id)) { valid = false; return prev }
          return [...prev, { ...bubble, x: cx, y: cy }]
        })
        if (!valid) return
      }

      const newStreak = streak + 1
      const bonus     = newStreak >= 3 ? 3 : 0
      const pts       = 5 + bonus + (level - 1) * 2

      setStreak(newStreak)
      setScore(s => s + pts)
      onScore?.(pts)
      setCaught(c => {
        const newCaught = c + 1
        if (newCaught >= challenge.count) {
          // Challenge complete!
          setTimeout(() => {
            const nextIdx = challengeIdx + 1
            setChallengeIdx(nextIdx)
            setCaught(0)
            setPopped([])
            setTotalChallenges(t => t + 1)

            // Level up every 3 challenges
            if ((totalChallenges + 1) % 3 === 0 && level < 3) {
              setLevel(l => l + 1)
              setShowLevelUp(true)
              setTimeout(() => setShowLevelUp(false), 2200)
            }
          }, 400)
        }
        return newCaught
      })

      // Floating score
      const fid = ++_uid
      setFloats(prev => [...prev, { id: fid, pts, x: cx, y: cy }])
      setTimeout(() => setFloats(prev => prev.filter(f => f.id !== fid)), 1100)

      // Particles
      const newParticles = Array.from({ length: 7 }, (_, i) => {
        const angle = (i / 7) * Math.PI * 2
        const dist  = 30 + Math.random() * 40
        const pid   = ++_uid
        setTimeout(() => setParticles(prev => prev.filter(p => p.id !== pid)), 500)
        return {
          id: pid,
          x: cx, y: cy,
          px: `${Math.cos(angle) * dist}px`,
          py: `${Math.sin(angle) * dist}px`,
          color: bubble.type.color,
          size: `${4 + Math.random() * 5}px`,
          dur: `${0.35 + Math.random() * 0.2}s`,
        }
      })
      setParticles(prev => [...prev, ...newParticles])
    } else {
      // Wrong bubble
      setStreak(0)
    }
  }, [challenge, streak, level, challengeIdx, totalChallenges, onScore])

  const startGame = () => {
    setPhase('playing')
    setScore(0); setStreak(0); setLevel(1)
    setChallengeIdx(0); setCaught(0); setPopped([])
  }

  const progressPct = Math.round((caught / challenge.count) * 100)

  return (
    <div className="kinetis-container">
      <div className="kinetis-stars" />

      {showLevelUp && (
        <div className="k-levelup">🤸 ¡Nivel {level}!<br /><span style={{ fontSize:'1rem' }}>¡Más rápido!</span></div>
      )}

      {/* Floating scores */}
      {floats.map(f => (
        <div key={f.id} className="k-float-score" style={{ left: f.x, top: f.y }}>+{f.pts}</div>
      ))}

      {/* Pop particles */}
      {particles.map(p => (
        <div key={p.id} className="k-particle" style={{
          left: p.x, top: p.y,
          '--px': p.px, '--py': p.py,
          '--pc': p.color, '--ps': p.size, '--pd': p.dur,
        }} />
      ))}

      {/* Miss indicators */}
      {misses.map(m => (
        <div key={m.id} className="k-miss" style={{ left: m.x, top: m.y }}>¡Escapó!</div>
      ))}

      <header className="kinetis-header">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="kinetis-badge">Kinetis</div>
        <div className="kinetis-score"><StarIcon /> {score}</div>
      </header>

      {phase === 'intro' ? (
        <>
          <div className="kinetis-top">
            <h2 className="kinetis-title">¡Planeta Kinetis!</h2>
          </div>
          <div className="kinetis-intro">
            <div className="kinetis-intro-sphere" />
            <div className="kinetis-intro-text">
              ¡Toca rápido las burbujas del color correcto antes de que vuelen al espacio!<br />Cada ronda Orbi te dirá qué atrapar.
            </div>
            <button className="btn-kinetis-start" onClick={startGame}>
              ¡A atrapar!
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="kinetis-top">
            <h2 className="kinetis-title">Planeta Kinetis</h2>
            <div className="kinetis-challenge">{challenge.text}</div>
          </div>

          <div className="kinetis-stats">
            <div className="k-stat">Atrapadas: <span>{caught}/{challenge.count}</span></div>
            <div className="k-stat">Nivel: <span>{level}</span></div>
            {streak >= 3 && <div className="k-streak">🔥 Racha x{streak}</div>}
          </div>

          {/* Progress bar */}
          <div style={{
            width: 'calc(100% - 3rem)', maxWidth: 420, height: 6,
            background: 'rgba(255,255,255,0.07)', borderRadius: 6,
            margin: '0.4rem 0', position: 'relative', zIndex: 10, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 6,
              width: `${progressPct}%`,
              background: 'linear-gradient(to right, #ff6b6b, #ffd60a)',
              boxShadow: '0 0 8px rgba(255,107,107,0.6)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </>
      )}

      {/* Arena */}
      <div className="kinetis-arena" ref={arenaRef}>
        {phase === 'playing' && bubbles.map(bubble => (
          <div
            key={bubble.id}
            className={`k-bubble${bubble.poppedAt ? ' popped' : ''}`}
            style={{
              width:  bubble.size,
              height: bubble.size,
              left:   bubble.x - bubble.size / 2,
              bottom: bubble.bottom,
              background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${bubble.type.color} 60%, white), ${bubble.type.color})`,
              boxShadow: `0 0 20px ${bubble.type.shadow}, inset 0 0 15px rgba(0,0,0,0.1)`,
              '--bdur':  `${bubble.dur}s`,
              '--rise':  `-${arenaRef.current?.clientHeight + bubble.size + 20 || 700}px`,
              '--rot':   bubble.rot,
              '--bfont': `${bubble.size * 0.38}px`,
            }}
            onPointerDown={e => !bubble.poppedAt && handlePop(e, bubble)}
          >
            <span className="k-bubble-text">{bubble.type.tag}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default KinetisGame
