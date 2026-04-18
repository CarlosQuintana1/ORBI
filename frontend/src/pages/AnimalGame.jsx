import { useState, useCallback } from 'react'
import './AnimalGame.css'

const ANIMALS = [
  { name:'León',       hint:'El rey de la selva, con gran melena y rugido poderoso.',    options:['León','Tigre','Jaguar','Leopardo']         },
  { name:'Delfín',     hint:'Nada en el océano, es muy inteligente y juguetón.',         options:['Delfín','Tiburón','Ballena','Foca']          },
  { name:'Mariposa',   hint:'Empieza como oruga y se transforma. Tiene alas de colores.',options:['Mariposa','Libélula','Abeja','Polilla']       },
  { name:'Pingüino',   hint:'Ave que no vuela, vive en zonas muy frías y adora nadar.',  options:['Pingüino','Flamenco','Pato','Gaviota']        },
  { name:'Jirafa',     hint:'El animal con el cuello más largo de todos. Vive en África.',options:['Jirafa','Elefante','Cebra','Rinoceronte']     },
  { name:'Pulpo',      hint:'Tiene 8 tentáculos, puede cambiar de color y vive en el mar.',options:['Pulpo','Medusa','Calamar','Cangrejo']       },
  { name:'Camaleón',   hint:'Pequeño reptil que puede cambiar de color para esconderse.', options:['Camaleón','Iguana','Gecko','Salamandra']      },
  { name:'Murciélago', hint:'El único mamífero que vuela. Duerme colgado de cabeza.',     options:['Murciélago','Cuervo','Lechuza','Halcón']      },
  { name:'Tortuga',    hint:'Lleva su casa a cuestas y puede vivir más de 100 años.',     options:['Tortuga','Cocodrilo','Lagarto','Salamandra']  },
  { name:'Canguro',    hint:'Salta muy alto y lleva a sus crías en una bolsa especial.',  options:['Canguro','Koala','Ualabí','Ornitorrinco']    },
]

const ANIMAL_COLORS = {
  León:'#ffd60a', Delfín:'#4cc9f0', Mariposa:'#f72585', Pingüino:'#e0e0e0',
  Jirafa:'#f9844a', Pulpo:'#c77dff', Camaleón:'#06d6a0', Murciélago:'#8b5cf6',
  Tortuga:'#80b918', Canguro:'#ff6b6b',
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

function generateChallenge(usedIndices) {
  let idx
  do { idx = Math.floor(Math.random() * ANIMALS.length) } while (usedIndices.has(idx) && usedIndices.size < ANIMALS.length)
  const animal = ANIMALS[idx]
  return { ...animal, idx, options: [...animal.options].sort(() => Math.random() - 0.5) }
}

export default function AnimalGame({ childName, onBack, onScore }) {
  const [phase, setPhase]     = useState('intro')
  const [score, setScore]     = useState(0)
  const [streak, setStreak]   = useState(0)
  const [round, setRound]     = useState(0)
  const [challenge, setChallenge] = useState(null)
  const [flash, setFlash]     = useState('')  // '' | 'correct' | 'wrong'
  const [chosen, setChosen]   = useState(null)
  const usedRef               = useState(() => new Set())[0]

  const next = useCallback(() => {
    const c = generateChallenge(usedRef)
    usedRef.add(c.idx)
    if (usedRef.size >= ANIMALS.length) usedRef.clear()
    setChallenge(c)
    setFlash('')
    setChosen(null)
    setRound(r => r + 1)
  }, [usedRef])

  const startGame = useCallback(() => {
    setScore(0); setStreak(0); setRound(0)
    usedRef.clear()
    setPhase('playing')
    const c = generateChallenge(usedRef)
    usedRef.add(c.idx)
    setChallenge(c)
    setRound(1)
  }, [usedRef])

  const handleAnswer = useCallback((answer) => {
    if (flash || !challenge) return
    setChosen(answer)
    if (answer === challenge.name) {
      const newStreak = streak + 1
      const pts = 10 + (newStreak >= 3 ? 5 : 0)
      setStreak(newStreak)
      setScore(s => s + pts)
      onScore?.(pts)
      setFlash('correct')
      setTimeout(next, 1200)
    } else {
      setStreak(0)
      setFlash('wrong')
      setTimeout(() => { setFlash(''); setChosen(null) }, 900)
    }
  }, [flash, challenge, streak, onScore, next])

  const color = challenge ? (ANIMAL_COLORS[challenge.name] || '#4cc9f0') : '#4cc9f0'

  return (
    <div className="ag-container">
      <div className="ag-stars" />
      <header className="ag-header">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="ag-badge">Identifica animales</div>
        <div className="ag-score"><StarIcon /> {score}</div>
      </header>

      {phase === 'intro' && (
        <div className="ag-screen">
          <div className="ag-paw">
            <svg width="70" height="70" viewBox="0 0 70 70">
              <ellipse cx="35" cy="42" rx="20" ry="18" fill="#80b918" />
              <ellipse cx="18" cy="25" rx="8" ry="10" fill="#80b918" />
              <ellipse cx="52" cy="25" rx="8" ry="10" fill="#80b918" />
              <ellipse cx="10" cy="40" rx="7" ry="9" fill="#80b918" />
              <ellipse cx="60" cy="40" rx="7" ry="9" fill="#80b918" />
            </svg>
          </div>
          <div className="ag-intro-text">
            Lee la pista de Orbi y adivina de qué animal se trata. Toca la respuesta correcta para ganar puntos.
          </div>
          <button className="btn-ag-start" onClick={startGame}>¡Explorar!</button>
        </div>
      )}

      {phase === 'playing' && challenge && (
        <>
          <div className="ag-hud">
            <div className="ag-round">Ronda {round}</div>
            {streak >= 3 && <div className="ag-streak">Racha x{streak}</div>}
          </div>

          <div className="ag-hint-card" style={{ borderColor: color + '44' }}>
            <div className="ag-hint-label">Pista de Orbi</div>
            <div className="ag-hint-text">{challenge.hint}</div>
          </div>

          <div
            className="ag-mystery"
            style={{
              background: `radial-gradient(circle at 35% 30%, ${color}33, ${color}11)`,
              borderColor: color + '55',
            }}
          >
            <span className="ag-question-mark" style={{ color }}>?</span>
          </div>

          {flash === 'correct' && <div className="ag-feedback correct">¡Correcto! Es el {challenge.name}</div>}
          {flash === 'wrong'   && <div className="ag-feedback wrong">¡Inténtalo de nuevo!</div>}

          <div className="ag-options">
            {challenge.options.map(opt => {
              const isCorrect = opt === challenge.name
              const isChosen  = opt === chosen
              let cls = 'ag-opt'
              if (flash === 'correct' && isCorrect) cls += ' ag-opt-correct'
              if (flash === 'wrong'   && isChosen)  cls += ' ag-opt-wrong'
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
