import { useState, useEffect, useRef, useCallback } from 'react'
import './MeteorGame.css'

let _uid = 0
const LIVES = 3
const SHIP_W = 52
const METEOR_SIZE = 38

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

function Heart({ active }) {
  return (
    <svg width="22" height="20" viewBox="0 0 22 20">
      <path d="M11 18s-9-5.5-9-11A5 5 0 0 1 11 4a5 5 0 0 1 9 3c0 5.5-9 11-9 11z"
        fill={active ? '#ff4757' : 'rgba(255,255,255,0.15)'}
        stroke={active ? '#ff2233' : 'rgba(255,255,255,0.1)'}
        strokeWidth="1.5"
      />
    </svg>
  )
}

function MeteorGame({ childName, onBack, onScore }) {
  const [phase, setPhase]     = useState('intro')
  const [ship, setShip]       = useState(50)
  const [meteors, setMeteors] = useState([])
  const [lives, setLives]     = useState(LIVES)
  const [score, setScore]     = useState(0)
  const [level, setLevel]     = useState(1)
  const [flash, setFlash]     = useState(false)

  const arenaRef      = useRef(null)
  const livesRef      = useRef(LIVES)
  const scoreRef      = useRef(0)
  const levelRef      = useRef(1)
  const activeRef     = useRef(false)
  const spawnRef      = useRef(null)
  const scoreRef2     = useRef(null)
  const collRef       = useRef(null)

  const endGame = useCallback(() => {
    activeRef.current = false
    clearInterval(spawnRef.current)
    clearInterval(scoreRef2.current)
    clearInterval(collRef.current)
    setPhase('over')
  }, [])

  const spawnMeteor = useCallback(() => {
    if (!activeRef.current) return
    const x   = 5 + Math.random() * 88
    const id  = ++_uid
    const dur = Math.max(1.0, 3.2 - (levelRef.current - 1) * 0.35)
    setMeteors(prev => [...prev, { id, x, dur }])
    setTimeout(() => setMeteors(prev => prev.filter(m => m.id !== id)), (dur + 0.3) * 1000)
  }, [])

  const startGame = useCallback(() => {
    livesRef.current  = LIVES
    scoreRef.current  = 0
    levelRef.current  = 1
    activeRef.current = true
    setLives(LIVES)
    setScore(0)
    setLevel(1)
    setShip(50)
    setMeteors([])
    setPhase('playing')

    spawnRef.current   = setInterval(spawnMeteor, 1100)
    scoreRef2.current  = setInterval(() => {
      if (!activeRef.current) return
      scoreRef.current += 1
      setScore(s => s + 1)
      onScore?.(1)
      if (scoreRef.current % 12 === 0 && levelRef.current < 5) {
        levelRef.current += 1
        setLevel(levelRef.current)
        clearInterval(spawnRef.current)
        spawnRef.current = setInterval(spawnMeteor, Math.max(450, 1100 - (levelRef.current - 1) * 140))
      }
    }, 1000)

    collRef.current = setInterval(() => {
      const arena = arenaRef.current
      if (!arena || !activeRef.current) return
      const shipEl = arena.querySelector('.mg-ship')
      if (!shipEl) return
      const sRect = shipEl.getBoundingClientRect()
      arena.querySelectorAll('.mg-meteor').forEach(el => {
        const mRect = el.getBoundingClientRect()
        if (sRect.left < mRect.right && sRect.right > mRect.left &&
            sRect.top  < mRect.bottom && sRect.bottom > mRect.top) {
          const id = Number(el.dataset.id)
          setMeteors(prev => prev.filter(m => m.id !== id))
          livesRef.current -= 1
          setLives(livesRef.current)
          setFlash(true)
          setTimeout(() => setFlash(false), 350)
          if (livesRef.current <= 0) endGame()
        }
      })
    }, 80)
  }, [spawnMeteor, endGame, onScore])

  useEffect(() => () => {
    clearInterval(spawnRef.current)
    clearInterval(scoreRef2.current)
    clearInterval(collRef.current)
  }, [])

  const handleTap = useCallback((e) => {
    if (phase !== 'playing') return
    const arena = arenaRef.current
    if (!arena) return
    const rect = arena.getBoundingClientRect()
    const tapX = (e.clientX ?? e.touches?.[0]?.clientX ?? 0) - rect.left
    const step = 18
    setShip(prev => tapX / rect.width < 0.5
      ? Math.max(6, prev - step)
      : Math.min(94, prev + step))
  }, [phase])

  return (
    <div className={`mg-container${flash ? ' mg-flash' : ''}`}>
      <div className="mg-stars" />

      <header className="mg-header">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="mg-badge">Meteoritos</div>
        <div className="mg-score"><StarIcon /> {score}</div>
      </header>

      {phase === 'intro' && (
        <div className="mg-screen">
          <div className="mg-ship-preview" />
          <div className="mg-intro-text">
            ¡Los meteoritos caen del espacio! Toca la mitad izquierda de la pantalla para ir a la izquierda y la mitad derecha para ir a la derecha. Tienes 3 vidas.
          </div>
          <button className="btn-mg-start" onClick={startGame}>¡Esquivar!</button>
        </div>
      )}

      {phase === 'over' && (
        <div className="mg-screen">
          <div className="mg-over-title">¡Nave destruida!</div>
          <div className="mg-over-score">Sobreviviste {score} segundos</div>
          <div className="mg-over-level">Nivel máximo alcanzado: {level}</div>
          <button className="btn-mg-start" onClick={startGame}>¡Intentar de nuevo!</button>
          <button className="btn-mg-back" onClick={onBack}>Volver al hub</button>
        </div>
      )}

      {phase === 'playing' && (
        <div className="mg-hud">
          <div className="mg-hearts">
            {Array.from({ length: LIVES }, (_, i) => <Heart key={i} active={i < lives} />)}
          </div>
          <div className="mg-level-badge">Nivel {level}</div>
          <div className="mg-hint-row">
            <span className="mg-zone-label">← izquierda</span>
            <span className="mg-zone-label">derecha →</span>
          </div>
        </div>
      )}

      <div className="mg-arena" ref={arenaRef} onPointerDown={handleTap}>
        {phase === 'playing' && (
          <>
            <div className="mg-divider" />
            {meteors.map(m => (
              <div
                key={m.id}
                data-id={m.id}
                className="mg-meteor"
                style={{ left: `${m.x}%`, '--dur': `${m.dur}s` }}
              />
            ))}
            <div className="mg-ship" style={{ left: `${ship}%` }} />
          </>
        )}
      </div>
    </div>
  )
}

export default MeteorGame
