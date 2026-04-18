import { useState, useRef, useCallback, useEffect } from 'react'
import './SonusGame.css'

// ── 4 notas con frecuencias reales ───────────────────────────────
const NOTES = [
  { id: 0, label: 'Do',  emoji: '🔴', color: '#ff4757', freq: 261.63 },
  { id: 1, label: 'Re',  emoji: '🟡', color: '#ffd60a', freq: 293.66 },
  { id: 2, label: 'Mi',  emoji: '🟢', color: '#06d6a0', freq: 329.63 },
  { id: 3, label: 'Sol', emoji: '🔵', color: '#4cc9f0', freq: 392.00 },
]

const NOTE_EMOJIS = ['🎵', '🎶', '♪', '♫']

// ── Web Audio helper ──────────────────────────────────────────────
function playNote(freq, audioCtx, duration = 0.38) {
  if (!audioCtx) return
  const osc   = audioCtx.createOscillator()
  const gain  = audioCtx.createGain()
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.type      = 'sine'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, audioCtx.currentTime)
  gain.gain.linearRampToValueAtTime(0.45, audioCtx.currentTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration)
  osc.start(audioCtx.currentTime)
  osc.stop(audioCtx.currentTime + duration)
}

const pr = (i, s) => Math.sin(i * s * 2.399) * 0.5 + 0.5

// ── Floating score ────────────────────────────────────────────────
function FloatingScore({ pts, id }) {
  return (
    <div className="sonus-float-score" style={{ left: `${38 + pr(id, 3) * 22}%` }}>
      +{pts} ⭐
    </div>
  )
}

// ── Orbi SVG para Sonus ───────────────────────────────────────────
function OrbiSonus({ playing }) {
  return (
    <svg
      width="100" height="100"
      viewBox="0 0 100 100"
      fill="none"
      className={`sonus-orbi-svg${playing ? ' playing' : ''}`}
    >
      <defs>
        <radialGradient id="sb-body" cx="34%" cy="34%">
          <stop offset="0%"   stopColor="#e8c4ff" />
          <stop offset="55%"  stopColor="#c77dff" />
          <stop offset="100%" stopColor="#4a0e8f" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="52" r="34" fill="url(#sb-body)" />
      <ellipse cx="50" cy="52" rx="44" ry="11" stroke="rgba(255,215,80,0.6)" strokeWidth="3.5" fill="none" />
      {/* Eyes */}
      <ellipse cx="37" cy="50" rx="7" ry="8" fill="white" />
      <ellipse cx="63" cy="50" rx="7" ry="8" fill="white" />
      <circle cx="39" cy="52" r="4.5" fill="#1a0533" />
      <circle cx="65" cy="52" r="4.5" fill="#1a0533" />
      <circle cx="40.5" cy="50" r="2" fill="white" />
      <circle cx="66.5" cy="50" r="2" fill="white" />
      {/* Mouth: singing when playing */}
      {playing ? (
        <>
          <path d="M35 65 Q50 78 65 65" fill="white" />
          <ellipse cx="50" cy="70" rx="9" ry="5" fill="#7b2dcc" />
        </>
      ) : (
        <path d="M36 65 Q50 74 64 65" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      {/* Antennae */}
      <line x1="40" y1="20" x2="34" y2="8" stroke="rgba(255,255,255,0.5)" strokeWidth="2.2" strokeLinecap="round"/>
      <circle cx="33" cy="6" r="4.5" fill="#ffd60a" />
      <line x1="60" y1="20" x2="66" y2="8" stroke="rgba(255,255,255,0.5)" strokeWidth="2.2" strokeLinecap="round"/>
      <circle cx="67" cy="6" r="4.5" fill="#ffd60a" />
      {/* Music notes when playing */}
      {playing && (
        <>
          <text x="78" y="38" fontSize="16" fill="#c77dff" opacity="0.9">♪</text>
          <text x="6"  y="42" fontSize="14" fill="#ffd60a" opacity="0.8">♫</text>
          <text x="72" y="60" fontSize="11" fill="white"   opacity="0.6">♩</text>
        </>
      )}
    </svg>
  )
}

// ── StarIcon ──────────────────────────────────────────────────────
function StarIcon({ size = 18 }) {
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
      <polygon points={points} fill="#ffd60a" />
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────
function SonusGame({ childName, onBack, onScore }) {
  const [phase, setPhase]       = useState('intro')   // intro | watching | input | feedback
  const [sequence, setSequence] = useState([])
  const [playerSeq, setPlayerSeq] = useState([])
  const [activeNote, setActiveNote] = useState(null)
  const [litBtn, setLitBtn]     = useState(null)
  const [score, setScore]       = useState(0)
  const [streak, setStreak]     = useState(0)
  const [round, setRound]       = useState(0)
  const [level, setLevel]       = useState(1)
  const [status, setStatus]     = useState('')
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [floats, setFloats]     = useState([])
  const [notes, setNotes]       = useState([])  // floating music notes UI
  const [inputLocked, setInputLocked] = useState(false)

  const audioCtxRef = useRef(null)
  const noteIdRef   = useRef(0)

  // Lazily create AudioContext on first interaction
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }, [])

  // Spawn floating music note icon
  const spawnNote = useCallback(() => {
    const id   = noteIdRef.current++
    const note = {
      id,
      left:  `${25 + Math.random() * 50}%`,
      emoji: NOTE_EMOJIS[Math.floor(Math.random() * NOTE_EMOJIS.length)],
      dur:   `${0.9 + Math.random() * 0.6}s`,
      rot:   `${-20 + Math.random() * 40}deg`,
    }
    setNotes(prev => [...prev, note])
    setTimeout(() => setNotes(prev => prev.filter(n => n.id !== id)), 1200)
  }, [])

  // Play a single note with visual flash
  const flashNote = useCallback((noteId, duration = 380) => {
    const note = NOTES[noteId]
    setActiveNote(noteId)
    playNote(note.freq, getAudioCtx(), duration / 1000)
    spawnNote()
    return new Promise(res => setTimeout(() => { setActiveNote(null); res() }, duration))
  }, [getAudioCtx, spawnNote])

  // Play the full sequence
  const playSequence = useCallback(async (seq) => {
    setPhase('watching')
    setStatus('¡Mira y escucha el patrón! 🎵')
    await new Promise(r => setTimeout(r, 600))
    for (const noteId of seq) {
      await flashNote(noteId, 420)
      await new Promise(r => setTimeout(r, 180))
    }
    setActiveNote(null)
    setPhase('input')
    setStatus('¡Ahora repite el patrón!')
    setInputLocked(false)
  }, [flashNote])

  // Start a new round
  const nextRound = useCallback((currentSeq, currentLevel) => {
    const newNote  = Math.floor(Math.random() * NOTES.length)
    const newSeq   = [...currentSeq, newNote]
    setSequence(newSeq)
    setPlayerSeq([])
    setRound(r => r + 1)
    setTimeout(() => playSequence(newSeq), 400)
  }, [playSequence])

  const startGame = useCallback(() => {
    getAudioCtx() // unlock audio on click
    setScore(0); setStreak(0); setRound(0); setLevel(1)
    setSequence([]); setPlayerSeq([])
    nextRound([], 1)
  }, [nextRound, getAudioCtx])

  // Handle player tapping a note
  const handleNotePress = useCallback(async (noteId) => {
    if (phase !== 'input' || inputLocked) return

    // Flash the button
    setLitBtn(noteId)
    playNote(NOTES[noteId].freq, getAudioCtx(), 0.3)
    spawnNote()
    setTimeout(() => setLitBtn(null), 220)

    const newPlayerSeq = [...playerSeq, noteId]
    setPlayerSeq(newPlayerSeq)

    const pos = newPlayerSeq.length - 1

    // Wrong note
    if (newPlayerSeq[pos] !== sequence[pos]) {
      setInputLocked(true)
      setPhase('feedback')
      setStatus('¡Uy! Esa no era 😅 Volvemos a intentarlo')
      setStreak(0)

      // Play sad sound
      const ctx = getAudioCtx()
      playNote(185, ctx, 0.5)

      setTimeout(() => {
        setPlayerSeq([])
        setPhase('watching')
        setStatus('Te lo repito...')
        setTimeout(() => playSequence(sequence), 600)
      }, 1800)
      return
    }

    // Correct so far, check if sequence complete
    if (newPlayerSeq.length === sequence.length) {
      setInputLocked(true)
      const newStreak = streak + 1
      const bonus     = newStreak >= 3 ? 5 : 0
      const pts       = 10 + (level - 1) * 5 + bonus
      const newScore  = score + pts

      setStreak(newStreak)
      setScore(newScore)
      onScore?.(pts)

      // Floating score
      const fid = Date.now()
      setFloats(prev => [...prev, { id: fid, pts }])
      setTimeout(() => setFloats(prev => prev.filter(f => f.id !== fid)), 1300)

      setPhase('feedback')

      if (newStreak >= 3) {
        setStatus(`¡Increíble! Combo x${newStreak} 🔥`)
      } else {
        setStatus('¡Perfecto! 🎉')
      }

      // Level up every 4 correct
      let nextLevel = level
      if (round > 0 && round % 4 === 0 && level < 3) {
        nextLevel = level + 1
        setLevel(nextLevel)
        setShowLevelUp(true)
        setTimeout(() => setShowLevelUp(false), 2200)
      }

      setTimeout(() => {
        setStatus('')
        setPhase('watching')
        nextRound(sequence, nextLevel)
      }, 1600)
    }
  }, [phase, inputLocked, playerSeq, sequence, streak, score, level, round, getAudioCtx, spawnNote, playSequence, nextRound, onScore])

  const canPress = phase === 'input' && !inputLocked

  return (
    <div className="sonus-container">
      <div className="sonus-stars" />

      {showLevelUp && (
        <div className="sonus-levelup">🎶 ¡Nivel {level}!<br /><span style={{ fontSize: '1rem' }}>Patrones más largos</span></div>
      )}

      {floats.map(f => <FloatingScore key={f.id} pts={f.pts} id={f.id} />)}

      {/* Floating music notes UI */}
      <div style={{ position: 'absolute', top: '120px', width: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'hidden', height: '80px' }}>
        {notes.map(n => (
          <span
            key={n.id}
            className="music-note"
            style={{ '--dur': n.dur, '--left': n.left, '--rot': n.rot }}
          >
            {n.emoji}
          </span>
        ))}
      </div>

      <header className="game-header">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="sonus-level">Nivel {level}</div>
        <div className="game-score"><StarIcon /> {score}</div>
      </header>

      <h2 className="sonus-title">Planeta Sonus</h2>
      <p className="sonus-subtitle">
        {phase === 'intro'
          ? `¡Escucha y repite el patrón musical, ${childName}!`
          : `Ronda ${round} · ${sequence.length} nota${sequence.length !== 1 ? 's' : ''}`}
      </p>

      {/* Orbi */}
      <div className="sonus-orbi-wrap">
        <OrbiSonus playing={phase === 'watching' && activeNote !== null} />
        {streak >= 2 && <div className="sonus-streak">¡Racha x{streak}! 🔥</div>}
      </div>

      {/* Pattern dots */}
      {sequence.length > 0 && (
        <div className="pattern-display">
          {sequence.map((noteId, i) => (
            <div
              key={i}
              className={`pattern-dot${activeNote === noteId && phase === 'watching' ? ' active' : ''}${i < playerSeq.length ? ' shown' : ''}`}
              style={{ '--note-color': NOTES[noteId].color }}
            />
          ))}
        </div>
      )}

      {/* Progress dots (input phase) */}
      {phase === 'input' && (
        <div className="progress-dots">
          {sequence.map((_, i) => (
            <div key={i} className={`prog-dot${i < playerSeq.length ? ' filled' : ''}`} />
          ))}
        </div>
      )}

      {/* Status */}
      {status && <div className="sonus-status" key={status}>{status}</div>}

      {/* Intro */}
      {phase === 'intro' && (
        <div className="sonus-intro">
          <div className="sonus-intro-text">
            🎵 Orbi va a tocar una <strong>secuencia de notas</strong>.<br />
            ¡Memoriza el orden y repítelo tocando los botones!<br />
            Cada ronda el patrón se hace <strong>más largo</strong>.
          </div>
          <button className="btn-sonus-start" onClick={startGame}>
            ¡Escuchar!
          </button>
        </div>
      )}

      {/* Note buttons */}
      {phase !== 'intro' && (
        <div className="notes-grid">
          {NOTES.map(note => (
            <button
              key={note.id}
              className={`note-btn${litBtn === note.id ? ' lit' : ''}`}
              style={{ '--note-color': note.color }}
              onClick={() => handleNotePress(note.id)}
              disabled={!canPress}
            >
              <span className="note-btn-emoji">{note.emoji}</span>
              <span className="note-btn-label">{note.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SonusGame
