import { useState, useCallback } from 'react'
import './ShapeGame.css'

// Ship is divided into 4 sections. Each puzzle = 4 colored slots that must be filled
// with the matching colored piece.
const PIECES = [
  { id: 'nose',     label: 'Nariz',   shape: 'triangle', color: '#4cc9f0' },
  { id: 'body',     label: 'Cuerpo',  shape: 'rect',     color: '#c77dff' },
  { id: 'wings',    label: 'Alas',    shape: 'diamond',  color: '#f72585' },
  { id: 'engine',   label: 'Motor',   shape: 'hexagon',  color: '#ffd60a' },
  { id: 'shield',   label: 'Escudo',  shape: 'circle',   color: '#06d6a0' },
  { id: 'thruster', label: 'Empuje',  shape: 'arrow',    color: '#f9844a' },
]

function ShapeSVG({ shape, color, size = 44 }) {
  if (shape === 'triangle') return (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <polygon points="22,3 41,41 3,41" fill={color} />
    </svg>
  )
  if (shape === 'rect') return (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <rect x="6" y="10" width="32" height="24" rx="4" fill={color} />
    </svg>
  )
  if (shape === 'diamond') return (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <polygon points="22,3 41,22 22,41 3,22" fill={color} />
    </svg>
  )
  if (shape === 'hexagon') return (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <polygon points="22,3 39,13 39,31 22,41 5,31 5,13" fill={color} />
    </svg>
  )
  if (shape === 'circle') return (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="18" fill={color} />
    </svg>
  )
  if (shape === 'arrow') return (
    <svg width={size} height={size} viewBox="0 0 44 44">
      <polygon points="22,3 38,24 28,24 28,41 16,41 16,24 6,24" fill={color} />
    </svg>
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

function generatePuzzle() {
  const shuffled = [...PIECES].sort(() => Math.random() - 0.5)
  const slots    = shuffled.slice(0, 4)
  const decoys   = shuffled.slice(4, 6)
  const available = [...slots, ...decoys].sort(() => Math.random() - 0.5)
  return { slots, available }
}

export default function ShapeGame({ childName, onBack, onScore }) {
  const [phase, setPhase]         = useState('intro')
  const [score, setScore]         = useState(0)
  const [solved, setSolved]       = useState(0)
  const [selected, setSelected]   = useState(null)  // piece id
  const [placed, setPlaced]       = useState({})    // slotId → pieceId
  const [wrong, setWrong]         = useState(null)
  const [puzzle, setPuzzle]       = useState(null)
  const [celebrating, setCelebrating] = useState(false)

  const nextPuzzle = useCallback(() => {
    setPuzzle(generatePuzzle())
    setPlaced({})
    setSelected(null)
    setWrong(null)
    setCelebrating(false)
  }, [])

  const startGame = useCallback(() => {
    setSolved(0); setScore(0)
    setPhase('playing')
    nextPuzzle()
  }, [nextPuzzle])

  const handlePickPiece = useCallback((pieceId) => {
    if (celebrating) return
    setSelected(prev => prev === pieceId ? null : pieceId)
  }, [celebrating])

  const handleClickSlot = useCallback((slotId) => {
    if (!selected || celebrating) return
    const slot = puzzle.slots.find(s => s.id === slotId)
    if (!slot) return

    if (selected === slotId) {
      // Correct piece for this slot
      const newPlaced = { ...placed, [slotId]: selected }
      setPlaced(newPlaced)
      setSelected(null)
      setWrong(null)

      if (Object.keys(newPlaced).length === puzzle.slots.length) {
        // All slots filled!
        const pts = 20 + solved * 5
        setScore(s => s + pts)
        setSolved(s => s + 1)
        onScore?.(pts)
        setCelebrating(true)
        setTimeout(() => nextPuzzle(), 1400)
      }
    } else {
      // Wrong piece
      setWrong(slotId)
      setTimeout(() => setWrong(null), 600)
    }
  }, [selected, celebrating, puzzle, placed, solved, onScore, nextPuzzle])

  const isPlaced = (pieceId) => Object.values(placed).includes(pieceId)

  return (
    <div className="sg-container">
      <div className="sg-stars" />
      <header className="sg-header">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="sg-badge">Construye la nave</div>
        <div className="sg-score"><StarIcon /> {score}</div>
      </header>

      {phase === 'intro' && (
        <div className="sg-screen">
          <div className="sg-ship-preview">
            <ShapeSVG shape="triangle" color="#4cc9f0" size={38} />
            <ShapeSVG shape="rect"     color="#c77dff" size={38} />
            <ShapeSVG shape="diamond"  color="#f72585" size={38} />
            <ShapeSVG shape="hexagon"  color="#ffd60a" size={38} />
          </div>
          <div className="sg-intro-text">
            Las piezas de la nave están mezcladas. Toca una pieza y luego toca la ranura de la nave donde encaja. Completa la nave para ganar puntos.
          </div>
          <button className="btn-sg-start" onClick={startGame}>¡Construir!</button>
        </div>
      )}

      {phase === 'playing' && puzzle && (
        <>
          <div className="sg-hud">
            <div className="sg-solved-badge">Naves: {solved}</div>
            {selected && <div className="sg-hint">Ahora toca la ranura correcta</div>}
            {!selected && <div className="sg-hint">Toca una pieza para seleccionarla</div>}
          </div>

          {celebrating && <div className="sg-celebrate">¡Nave completa!</div>}

          {/* Ship slots */}
          <div className="sg-ship-area">
            <p className="sg-area-label">Tu nave</p>
            <div className="sg-slots">
              {puzzle.slots.map(slot => {
                const filledPiece = placed[slot.id] ? puzzle.slots.find(p => p.id === placed[slot.id]) : null
                return (
                  <button
                    key={slot.id}
                    className={`sg-slot${wrong === slot.id ? ' sg-wrong' : ''}${filledPiece ? ' sg-filled' : ''}`}
                    style={{ '--sc': slot.color }}
                    onClick={() => handleClickSlot(slot.id)}
                  >
                    {filledPiece
                      ? <ShapeSVG shape={filledPiece.shape} color={filledPiece.color} size={36} />
                      : <span className="sg-slot-label">{slot.label}</span>
                    }
                  </button>
                )
              })}
            </div>
          </div>

          {/* Available pieces */}
          <div className="sg-pieces-area">
            <p className="sg-area-label">Piezas disponibles</p>
            <div className="sg-pieces">
              {puzzle.available.map(piece => (
                <button
                  key={piece.id}
                  className={`sg-piece${selected === piece.id ? ' sg-selected' : ''}${isPlaced(piece.id) ? ' sg-placed' : ''}`}
                  style={{ '--pc': piece.color }}
                  onClick={() => !isPlaced(piece.id) && handlePickPiece(piece.id)}
                  disabled={isPlaced(piece.id)}
                >
                  <ShapeSVG shape={piece.shape} color={piece.color} size={38} />
                  <span className="sg-piece-name">{piece.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
