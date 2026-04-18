import { useState, useCallback } from 'react'
import './WordMatchGame.css'

const WORDS = [
  { word:'Órbita',     def:'El camino circular que sigue un planeta alrededor del Sol.',              options:['Órbita','Galaxia','Asteroide','Constelación'] },
  { word:'Galaxia',    def:'Un enorme grupo de miles de millones de estrellas.',                       options:['Galaxia','Planeta','Satélite','Nebulosa']     },
  { word:'Asteroide',  def:'Roca espacial más pequeña que un planeta que orbita el Sol.',             options:['Asteroide','Meteorito','Cometa','Luna']        },
  { word:'Nebulosa',   def:'Nube gigante de gas y polvo en el espacio donde nacen las estrellas.',    options:['Nebulosa','Galaxia','Agujero negro','Supernova'] },
  { word:'Cometa',     def:'Objeto de hielo y roca que forma una cola brillante al acercarse al Sol.',options:['Cometa','Meteoro','Asteroide','Satélite']     },
  { word:'Satélite',   def:'Objeto que orbita alrededor de un planeta, como la Luna.',                options:['Satélite','Cometa','Estrella','Asteroide']    },
  { word:'Supernova',  def:'Explosión gigantesca de una estrella al final de su vida.',               options:['Supernova','Nebulosa','Pulsar','Quásar']      },
  { word:'Constelación',def:'Grupo de estrellas que forman una figura o dibujo en el cielo.',         options:['Constelación','Galaxia','Nebulosa','Cúmulo']  },
  { word:'Gravedad',   def:'Fuerza que atrae los objetos entre sí, como la Tierra atrae la Luna.',   options:['Gravedad','Inercia','Energía','Presión']      },
  { word:'Fotosíntesis',def:'Proceso por el que las plantas convierten la luz solar en alimento.',   options:['Fotosíntesis','Evaporación','Respiración','Germinación'] },
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

function generateChallenge(used) {
  const available = WORDS.filter((_, i) => !used.has(i))
  const pool = available.length > 0 ? available : WORDS
  const idx  = Math.floor(Math.random() * pool.length)
  const w    = pool[idx]
  return { ...w, idx: WORDS.indexOf(w), options: [...w.options].sort(() => Math.random() - 0.5) }
}

export default function WordMatchGame({ childName, onBack, onScore }) {
  const [phase, setPhase]     = useState('intro')
  const [score, setScore]     = useState(0)
  const [streak, setStreak]   = useState(0)
  const [round, setRound]     = useState(0)
  const [challenge, setChallenge] = useState(null)
  const [flash, setFlash]     = useState('')
  const [chosen, setChosen]   = useState(null)
  const usedRef               = useState(() => new Set())[0]

  const next = useCallback(() => {
    const c = generateChallenge(usedRef)
    usedRef.add(c.idx)
    if (usedRef.size >= WORDS.length) usedRef.clear()
    setChallenge(c)
    setFlash(''); setChosen(null)
    setRound(r => r + 1)
  }, [usedRef])

  const startGame = useCallback(() => {
    setScore(0); setStreak(0); setRound(0); usedRef.clear()
    setPhase('playing')
    const c = generateChallenge(usedRef)
    usedRef.add(c.idx)
    setChallenge(c); setRound(1)
  }, [usedRef])

  const handleAnswer = useCallback((answer) => {
    if (flash || !challenge) return
    setChosen(answer)
    if (answer === challenge.word) {
      const newStreak = streak + 1
      const pts = 12 + (newStreak >= 3 ? 6 : 0)
      setStreak(newStreak)
      setScore(s => s + pts)
      onScore?.(pts)
      setFlash('correct')
      setTimeout(next, 1100)
    } else {
      setStreak(0)
      setFlash('wrong')
      setTimeout(() => { setFlash(''); setChosen(null) }, 850)
    }
  }, [flash, challenge, streak, onScore, next])

  return (
    <div className="wm-container">
      <div className="wm-stars" />
      <header className="wm-header">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="wm-badge">Palabras nuevas</div>
        <div className="wm-score"><StarIcon /> {score}</div>
      </header>

      {phase === 'intro' && (
        <div className="wm-screen">
          <div className="wm-intro-icon">
            <svg width="70" height="70" viewBox="0 0 70 70">
              <rect x="8" y="14" width="54" height="44" rx="6" fill="none" stroke="#06d6a0" strokeWidth="3"/>
              <line x1="18" y1="27" x2="52" y2="27" stroke="#06d6a0" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="18" y1="36" x2="44" y2="36" stroke="#06d6a0" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="18" y1="45" x2="38" y2="45" stroke="#06d6a0" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="wm-intro-text">
            Lee la definición y elige la palabra correcta. Aprenderás vocabulario del cosmos y del mundo. Cada respuesta correcta suma puntos.
          </div>
          <button className="btn-wm-start" onClick={startGame}>¡Aprender!</button>
        </div>
      )}

      {phase === 'playing' && challenge && (
        <>
          <div className="wm-hud">
            <div className="wm-round">Ronda {round}</div>
            {streak >= 3 && <div className="wm-streak">Racha x{streak}</div>}
          </div>

          <div className="wm-def-card">
            <div className="wm-def-label">Definición</div>
            <div className="wm-def-text">{challenge.def}</div>
          </div>

          <div className="wm-question">¿Qué palabra describe esto?</div>

          {flash === 'correct' && <div className="wm-feedback correct">¡Exacto! La palabra es {challenge.word}</div>}
          {flash === 'wrong'   && <div className="wm-feedback wrong">¡Casi! Lee la definición con calma</div>}

          <div className="wm-options">
            {challenge.options.map(opt => {
              let cls = 'wm-opt'
              if (flash === 'correct' && opt === challenge.word) cls += ' wm-correct'
              if (flash === 'wrong'   && opt === chosen)         cls += ' wm-wrong'
              return (
                <button key={opt} className={cls} onClick={() => handleAnswer(opt)} disabled={!!flash}>
                  {opt}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
