import { useState, useCallback } from 'react'
import './EmotionGame.css'

const EMOTIONS = [
  { emoji:'😊', name:'Feliz',        context:'Tu amigo acaba de recibir un regalo sorpresa.',         options:['Feliz','Triste','Asustado','Enojado']       },
  { emoji:'😢', name:'Triste',       context:'La mascota de tu amigo se fue de casa.',                 options:['Triste','Enojado','Sorprendido','Feliz']     },
  { emoji:'😠', name:'Enojado',      context:'Alguien tomó tu juguete favorito sin permiso.',          options:['Enojado','Triste','Feliz','Asustado']         },
  { emoji:'😲', name:'Sorprendido',  context:'Tus amigos gritaron "¡Feliz cumpleaños!" de repente.',   options:['Sorprendido','Feliz','Asustado','Enojado']    },
  { emoji:'😨', name:'Asustado',     context:'Escuchaste un ruido muy fuerte en la oscuridad.',        options:['Asustado','Triste','Enojado','Cansado']       },
  { emoji:'😴', name:'Cansado',      context:'Llevas todo el día jugando y no puedes abrir los ojos.', options:['Cansado','Aburrido','Triste','Feliz']         },
  { emoji:'🤩', name:'Emocionado',   context:'Mañana es el día de tu viaje espacial con Orbi.',        options:['Emocionado','Feliz','Sorprendido','Asustado'] },
  { emoji:'😔', name:'Decepcionado', context:'Tu equipo perdió el partido en el último segundo.',       options:['Decepcionado','Triste','Enojado','Cansado']   },
  { emoji:'😊', name:'Orgulloso',    context:'Terminaste tu proyecto y recibiste una estrella dorada.',  options:['Orgulloso','Feliz','Emocionado','Sorprendido'] },
  { emoji:'😅', name:'Avergonzado',  context:'Te olvidaste la letra de la canción frente a todos.',    options:['Avergonzado','Triste','Feliz','Asustado']     },
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
  const available = EMOTIONS.filter((_, i) => !used.has(i))
  const pool = available.length > 0 ? available : EMOTIONS
  const idx  = Math.floor(Math.random() * pool.length)
  const em   = pool[idx]
  return { ...em, options: [...em.options].sort(() => Math.random() - 0.5) }
}

export default function EmotionGame({ childName, onBack, onScore }) {
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
    const idx = EMOTIONS.findIndex(e => e.name === c.name)
    usedRef.add(idx)
    if (usedRef.size >= EMOTIONS.length) usedRef.clear()
    setChallenge(c)
    setFlash(''); setChosen(null)
    setRound(r => r + 1)
  }, [usedRef])

  const startGame = useCallback(() => {
    setScore(0); setStreak(0); setRound(0); usedRef.clear()
    setPhase('playing')
    const c = generateChallenge(usedRef)
    usedRef.add(EMOTIONS.findIndex(e => e.name === c.name))
    setChallenge(c); setRound(1)
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
      setTimeout(next, 1100)
    } else {
      setStreak(0)
      setFlash('wrong')
      setTimeout(() => { setFlash(''); setChosen(null) }, 850)
    }
  }, [flash, challenge, streak, onScore, next])

  return (
    <div className="eg-container">
      <div className="eg-stars" />
      <header className="eg-header">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="eg-badge">Lee emociones</div>
        <div className="eg-score"><StarIcon /> {score}</div>
      </header>

      {phase === 'intro' && (
        <div className="eg-screen">
          <div className="eg-emoji-preview">😊 😢 😠 😲</div>
          <div className="eg-intro-text">
            Lee la situación que vivió el personaje y elige la emoción correcta. Entender cómo se sienten los demás es una habilidad muy especial.
          </div>
          <button className="btn-eg-start" onClick={startGame}>¡Empezar!</button>
        </div>
      )}

      {phase === 'playing' && challenge && (
        <>
          <div className="eg-hud">
            <div className="eg-round">Ronda {round}</div>
            {streak >= 3 && <div className="eg-streak">Racha x{streak}</div>}
          </div>

          <div className="eg-face">{challenge.emoji}</div>

          <div className="eg-context-card">
            <div className="eg-ctx-label">¿Qué pasó?</div>
            <div className="eg-ctx-text">{challenge.context}</div>
          </div>

          <div className="eg-question">¿Cómo se siente?</div>

          {flash === 'correct' && <div className="eg-feedback correct">¡Muy bien! Es {challenge.name}</div>}
          {flash === 'wrong'   && <div className="eg-feedback wrong">¡Casi! Observa mejor</div>}

          <div className="eg-options">
            {challenge.options.map(opt => {
              let cls = 'eg-opt'
              if (flash === 'correct' && opt === challenge.name) cls += ' eg-correct'
              if (flash === 'wrong'   && opt === chosen)         cls += ' eg-wrong'
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
