import { useState, useRef, useCallback, useEffect } from 'react'
import './DanceGame.css'

const MOVES = [
  { id: 'up',    label: '↑', color: '#4cc9f0', name: 'Arriba'   },
  { id: 'down',  label: '↓', color: '#ff4757', name: 'Abajo'    },
  { id: 'left',  label: '←', color: '#06d6a0', name: 'Izquierda'},
  { id: 'right', label: '→', color: '#ffd60a', name: 'Derecha'  },
]

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

function DanceGame({ childName, onBack, onScore }) {
  const [phase, setPhase]       = useState('intro')
  const [sequence, setSequence] = useState([])
  const [input, setInput]       = useState([])
  const [showing, setShowing]   = useState(null)   // index in sequence being shown
  const [activeBtn, setActiveBtn] = useState(null)  // which button is lit
  const [round, setRound]       = useState(0)
  const [score, setScore]       = useState(0)
  const [feedback, setFeedback] = useState('')  // 'correct' | 'wrong' | ''
  const [showingSeq, setShowingSeq] = useState(false)
  const timeoutsRef = useRef([])
  const inputRef    = useRef([])

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }

  const scheduleTimeout = (fn, delay) => {
    const t = setTimeout(fn, delay)
    timeoutsRef.current.push(t)
    return t
  }

  const showSequence = useCallback((seq) => {
    setShowingSeq(true)
    setInput([])
    inputRef.current = []
    setFeedback('')
    let delay = 500

    seq.forEach((id, i) => {
      scheduleTimeout(() => setShowing(i), delay)
      scheduleTimeout(() => {
        setActiveBtn(id)
      }, delay + 100)
      scheduleTimeout(() => {
        setActiveBtn(null)
        setShowing(null)
      }, delay + 650)
      delay += 800
    })

    scheduleTimeout(() => {
      setShowingSeq(false)
    }, delay + 200)
  }, [])

  const startGame = useCallback(() => {
    const first = [MOVES[Math.floor(Math.random() * 4)].id]
    setSequence(first)
    setScore(0)
    setRound(1)
    setPhase('playing')
    scheduleTimeout(() => showSequence(first), 300)
  }, [showSequence])

  const handlePress = useCallback((id) => {
    if (showingSeq || phase !== 'playing') return
    const next = [...inputRef.current, id]
    inputRef.current = next
    setInput([...next])
    setActiveBtn(id)
    scheduleTimeout(() => setActiveBtn(null), 250)

    const pos = next.length - 1
    if (next[pos] !== sequence[pos]) {
      // Wrong
      setFeedback('wrong')
      scheduleTimeout(() => {
        setFeedback('')
        setInput([])
        inputRef.current = []
        showSequence(sequence)
      }, 900)
      return
    }

    if (next.length === sequence.length) {
      // Correct full sequence
      const pts = sequence.length * 5
      setScore(s => s + pts)
      onScore?.(pts)
      setFeedback('correct')
      const newSeq = [...sequence, MOVES[Math.floor(Math.random() * 4)].id]
      scheduleTimeout(() => {
        setFeedback('')
        setSequence(newSeq)
        setRound(r => r + 1)
        showSequence(newSeq)
      }, 1000)
    }
  }, [showingSeq, phase, sequence, showSequence, onScore])

  useEffect(() => () => clearTimeouts(), [])

  const progress = sequence.length > 0 ? input.length / sequence.length : 0

  return (
    <div className="dg-container">
      <div className="dg-stars" />

      <header className="dg-header">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="dg-badge">Baila con Orbi</div>
        <div className="dg-score"><StarIcon /> {score}</div>
      </header>

      {phase === 'intro' && (
        <div className="dg-screen">
          <div className="dg-orbi-preview">
            {MOVES.map(m => (
              <div key={m.id} className="dg-preview-btn" style={{ '--mc': m.color }}>{m.label}</div>
            ))}
          </div>
          <div className="dg-intro-text">
            Orbi te mostrará una secuencia de movimientos. Cuando terminen de brillar, repítelos tocando los botones en el mismo orden.
          </div>
          <button className="btn-dg-start" onClick={startGame}>¡A bailar!</button>
        </div>
      )}

      {phase === 'playing' && (
        <>
          <div className="dg-status-row">
            <div className="dg-round-badge">Ronda {round}</div>
            {showingSeq && <div className="dg-orbi-msg">¡Mira bien!</div>}
            {!showingSeq && <div className="dg-orbi-msg">¡Tu turno!</div>}
          </div>

          {/* Progress dots */}
          <div className="dg-dots">
            {sequence.map((id, i) => {
              const move = MOVES.find(m => m.id === id)
              const filled = i < input.length
              const active  = i === showing
              return (
                <div
                  key={i}
                  className={`dg-dot${active ? ' active' : ''}${filled ? ' filled' : ''}`}
                  style={{ '--dc': move.color }}
                />
              )
            })}
          </div>

          {feedback === 'correct' && <div className="dg-feedback correct">¡Perfecto!</div>}
          {feedback === 'wrong'   && <div className="dg-feedback wrong">¡Inténtalo de nuevo!</div>}

          {/* Control buttons */}
          <div className="dg-grid">
            <div /> {/* empty top-left */}
            <button
              className={`dg-btn${activeBtn === 'up' ? ' lit' : ''}`}
              style={{ '--mc': '#4cc9f0' }}
              onPointerDown={() => handlePress('up')}
            >↑</button>
            <div />
            <button
              className={`dg-btn${activeBtn === 'left' ? ' lit' : ''}`}
              style={{ '--mc': '#06d6a0' }}
              onPointerDown={() => handlePress('left')}
            >←</button>
            <div className="dg-center-orbi" />
            <button
              className={`dg-btn${activeBtn === 'right' ? ' lit' : ''}`}
              style={{ '--mc': '#ffd60a' }}
              onPointerDown={() => handlePress('right')}
            >→</button>
            <div />
            <button
              className={`dg-btn${activeBtn === 'down' ? ' lit' : ''}`}
              style={{ '--mc': '#ff4757' }}
              onPointerDown={() => handlePress('down')}
            >↓</button>
            <div />
          </div>
        </>
      )}
    </div>
  )
}

export default DanceGame
