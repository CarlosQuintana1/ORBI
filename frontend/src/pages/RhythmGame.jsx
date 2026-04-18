import { useState, useRef, useCallback, useEffect } from 'react'
import './RhythmGame.css'

const BPM = 80
const BEAT_MS = (60 / BPM) * 1000

function playBeep(ctx, freq = 440, dur = 0.08, vol = 0.3) {
  const osc  = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + dur)
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

export default function RhythmGame({ childName, onBack, onScore }) {
  const [phase, setPhase]     = useState('intro')
  const [pulse, setPulse]     = useState(false)
  const [score, setScore]     = useState(0)
  const [streak, setStreak]   = useState(0)
  const [feedback, setFeedback] = useState('')
  const [taps, setTaps]       = useState(0)

  const ctxRef       = useRef(null)
  const beatTimerRef = useRef(null)
  const lastBeatRef  = useRef(0)
  const activeRef    = useRef(false)
  const streakRef    = useRef(0)

  const stopGame = useCallback(() => {
    activeRef.current = false
    clearInterval(beatTimerRef.current)
    ctxRef.current?.close()
    ctxRef.current = null
  }, [])

  const startGame = useCallback(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ctxRef.current = ctx
    activeRef.current = true
    streakRef.current = 0
    setScore(0)
    setStreak(0)
    setTaps(0)
    setFeedback('')
    setPhase('playing')

    // Metronome beats
    beatTimerRef.current = setInterval(() => {
      if (!activeRef.current) return
      lastBeatRef.current = Date.now()
      playBeep(ctx, 880, 0.06, 0.25)
      setPulse(true)
      setTimeout(() => setPulse(false), 120)
    }, BEAT_MS)
  }, [])

  const handleTap = useCallback(() => {
    if (phase !== 'playing') return
    const now  = Date.now()
    const last = lastBeatRef.current
    if (!last) return

    // Closest beat (previous or next)
    const diff  = Math.abs(now - last)
    const diff2 = Math.abs(now - (last + BEAT_MS))
    const closest = Math.min(diff, diff2)

    let quality = ''
    let pts = 0
    if (closest < 80) {
      quality = 'Perfecto'
      pts = 15
      streakRef.current += 1
    } else if (closest < 160) {
      quality = 'Bien'
      pts = 8
      streakRef.current += 1
    } else {
      quality = 'Fallado'
      streakRef.current = 0
    }

    setStreak(streakRef.current)
    setTaps(t => t + 1)

    if (pts > 0) {
      const bonus = streakRef.current >= 5 ? 5 : 0
      setScore(s => s + pts + bonus)
      onScore?.(pts + bonus)
    }

    setFeedback(quality)
    setTimeout(() => setFeedback(''), 500)
  }, [phase, onScore])

  useEffect(() => () => stopGame(), [stopGame])

  return (
    <div className="rg-container">
      <div className="rg-stars" />
      <header className="rg-header">
        <button className="btn-back" onClick={() => { stopGame(); onBack() }}>← Volver</button>
        <div className="rg-badge">Ritmo espacial</div>
        <div className="rg-score"><StarIcon /> {score}</div>
      </header>

      {phase === 'intro' && (
        <div className="rg-screen">
          <div className="rg-pulse-preview" />
          <div className="rg-intro-text">
            Escucha el ritmo espacial y toca el botón grande al compás de los pulsos. Cuanto más preciso, más puntos. Consigue racha para bonus.
          </div>
          <button className="btn-rg-start" onClick={startGame}>¡Empezar!</button>
        </div>
      )}

      {phase === 'playing' && (
        <div className="rg-play-area">
          <div className="rg-stats-row">
            {streak >= 3 && <div className="rg-streak">Racha x{streak}</div>}
            <div className="rg-tap-count">Taps: {taps}</div>
          </div>

          <div className="rg-visual">
            <div className={`rg-ring rg-ring-3${pulse ? ' rg-pulse' : ''}`} />
            <div className={`rg-ring rg-ring-2${pulse ? ' rg-pulse' : ''}`} />
            <div className={`rg-ring rg-ring-1${pulse ? ' rg-pulse' : ''}`} />
            <div className={`rg-core${pulse ? ' rg-pulse' : ''}`} />
          </div>

          {feedback && (
            <div className={`rg-feedback rg-fb-${feedback === 'Perfecto' ? 'perfect' : feedback === 'Bien' ? 'good' : 'miss'}`}>
              {feedback}
            </div>
          )}

          <button className="rg-tap-btn" onPointerDown={handleTap}>
            TAP
          </button>

          <button className="btn-rg-stop" onClick={() => { stopGame(); setPhase('intro') }}>Parar</button>
        </div>
      )}
    </div>
  )
}
