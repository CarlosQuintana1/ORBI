import { useState, useCallback } from 'react'
import './GoalGame.css'

const QUESTIONS = [
  {
    text: '¿Qué te gusta hacer cuando tienes tiempo libre?',
    options: [
      { label: 'Leer libros y cuentos',      trait: 'Lingüística'     },
      { label: 'Resolver puzzles y acertijos', trait: 'Lógica'          },
      { label: 'Dibujar y crear cosas',        trait: 'Visual'          },
      { label: 'Bailar o hacer deporte',       trait: 'Cinestésica'     },
    ],
  },
  {
    text: '¿En qué eres muy bueno o buena?',
    options: [
      { label: 'Explicar cosas con palabras',  trait: 'Lingüística'     },
      { label: 'Encontrar patrones y series',   trait: 'Lógica'          },
      { label: 'Recordar cómo llegar a lugares', trait: 'Visual'         },
      { label: 'Escuchar música y cantar',       trait: 'Musical'        },
    ],
  },
  {
    text: '¿Cuál es tu lugar favorito para estar?',
    options: [
      { label: 'La biblioteca o leyendo en casa', trait: 'Lingüística'   },
      { label: 'El parque o la naturaleza',        trait: 'Naturalista'  },
      { label: 'Con mis amigos jugando juntos',     trait: 'Interpersonal'},
      { label: 'En mi cuarto pensando solo',        trait: 'Intrapersonal'},
    ],
  },
  {
    text: '¿Qué tipo de juegos prefieres?',
    options: [
      { label: 'Juegos de palabras y cuentos',     trait: 'Lingüística'  },
      { label: 'Juegos de estrategia y lógica',    trait: 'Lógica'       },
      { label: 'Juegos creativos y de arte',       trait: 'Visual'       },
      { label: 'Juegos de movimiento y equilibrio', trait: 'Cinestésica' },
    ],
  },
  {
    text: '¿Cómo te gustaría ayudar al mundo cuando seas grande?',
    options: [
      { label: 'Escribiendo libros o historias',   trait: 'Lingüística'   },
      { label: 'Descubriendo cómo funcionan las cosas', trait: 'Lógica'  },
      { label: 'Cuidando animales y la naturaleza', trait: 'Naturalista'  },
      { label: 'Ayudando y escuchando a las personas', trait: 'Interpersonal' },
    ],
  },
]

const TRAIT_COLORS = {
  Lingüística:   '#06d6a0',
  Lógica:        '#4cc9f0',
  Visual:        '#f72585',
  Cinestésica:   '#ff6b6b',
  Musical:       '#c77dff',
  Naturalista:   '#80b918',
  Interpersonal: '#f9844a',
  Intrapersonal: '#ffd60a',
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

export default function GoalGame({ childName, onBack, onScore }) {
  const [phase, setPhase]   = useState('intro')
  const [qIdx, setQIdx]     = useState(0)
  const [traits, setTraits] = useState({})
  const [chosen, setChosen] = useState(null)
  const [score, setScore]   = useState(0)

  const startGame = useCallback(() => {
    setQIdx(0); setTraits({}); setChosen(null); setScore(0)
    setPhase('playing')
  }, [])

  const handleAnswer = useCallback((trait) => {
    if (chosen) return
    setChosen(trait)
    setTraits(prev => ({ ...prev, [trait]: (prev[trait] || 0) + 1 }))
    const pts = 10
    setScore(s => s + pts)
    onScore?.(pts)

    setTimeout(() => {
      if (qIdx + 1 >= QUESTIONS.length) {
        setPhase('result')
      } else {
        setQIdx(i => i + 1)
        setChosen(null)
      }
    }, 700)
  }, [chosen, qIdx, onScore])

  const topTraits = Object.entries(traits)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  const progress = ((qIdx + (phase === 'result' ? 1 : 0)) / QUESTIONS.length) * 100

  return (
    <div className="gg-container">
      <div className="gg-stars" />
      <header className="gg-header">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="gg-badge">Metas espaciales</div>
        <div className="gg-score"><StarIcon /> {score}</div>
      </header>

      {phase === 'intro' && (
        <div className="gg-screen">
          <div className="gg-star-icon">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <polygon points="40,5 49,30 75,32 55,50 62,76 40,62 18,76 25,50 5,32 31,30" fill="#ffd60a" opacity="0.9"/>
            </svg>
          </div>
          <div className="gg-intro-text">
            Responde estas preguntas sobre ti mismo. Al final Orbi te revelará cuáles son tus constelaciones más brillantes: tus talentos únicos.
          </div>
          <button className="btn-gg-start" onClick={startGame}>¡Descubrir mis talentos!</button>
        </div>
      )}

      {phase === 'playing' && (
        <>
          {/* Progress bar */}
          <div className="gg-progress-wrap">
            <div className="gg-progress-track">
              <div className="gg-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="gg-progress-label">{qIdx + 1}/{QUESTIONS.length}</span>
          </div>

          <div className="gg-question-card">
            <div className="gg-q-num">Pregunta {qIdx + 1}</div>
            <div className="gg-q-text">{QUESTIONS[qIdx].text}</div>
          </div>

          <div className="gg-options">
            {QUESTIONS[qIdx].options.map(opt => {
              const color = TRAIT_COLORS[opt.trait]
              const isChosen = chosen === opt.trait
              return (
                <button
                  key={opt.label}
                  className={`gg-opt${isChosen ? ' gg-chosen' : ''}`}
                  style={{ '--oc': color }}
                  onClick={() => handleAnswer(opt.trait)}
                  disabled={!!chosen}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </>
      )}

      {phase === 'result' && (
        <div className="gg-result">
          <div className="gg-result-title">Tu constelación de talentos</div>
          <div className="gg-result-subtitle">¡Eres increíble, {childName}!</div>
          <div className="gg-constellation">
            {topTraits.map(([trait, count], i) => {
              const color = TRAIT_COLORS[trait]
              const size  = [80, 64, 52][i]
              return (
                <div key={trait} className="gg-trait-star" style={{ '--tc': color }}>
                  <svg width={size} height={size} viewBox="0 0 80 80">
                    <polygon points="40,5 49,30 75,32 55,50 62,76 40,62 18,76 25,50 5,32 31,30" fill={color} />
                  </svg>
                  <span className="gg-trait-name">{trait}</span>
                </div>
              )
            })}
          </div>
          <div className="gg-result-msg">
            Tus súper poderes son: {topTraits.map(([t]) => t).join(', ')}. ¡Sigue brillando!
          </div>
          <button className="btn-gg-start" onClick={startGame}>¡Volver a explorar!</button>
        </div>
      )}
    </div>
  )
}
