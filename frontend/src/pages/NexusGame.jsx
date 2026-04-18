import { useState, useCallback } from 'react'
import './NexusGame.css'

// ── Scenario bank ─────────────────────────────────────────────────
const SCENARIOS = [
  {
    illustration: '😢',
    text: 'Tu amigo Carlos llegó a la escuela llorando. Dice que perdió su perro favorito.',
    question: '¿Qué harías?',
    options: [
      { emoji: '🤗', label: 'Lo abrazo y le digo que lo entiendo', correct: true },
      { emoji: '😄', label: 'Le cuento chistes para que se ría', correct: false },
      { emoji: '🏃', label: 'Me voy a jugar con otros amigos', correct: false },
      { emoji: '🗣️', label: 'Le digo que no llore, que son solo mascotas', correct: false },
    ],
    feedback: '¡Un abrazo y escuchar es lo más poderoso cuando alguien está triste! Tú entiendes cómo se siente. 💛',
    wrongFeedback: 'Cuando un amigo está triste, lo más importante es hacerle saber que no está solo. Un abrazo dice mucho. 🤗',
  },
  {
    illustration: '😠',
    text: 'Sofía está muy enojada porque no ganó en el juego. Empieza a gritar y llorar.',
    question: '¿Cómo te sientes tú?',
    options: [
      { emoji: '😔', label: 'Me da pena por ella aunque yo gané', correct: true },
      { emoji: '😂', label: 'Me río porque es gracioso', correct: false },
      { emoji: '😤', label: 'Me enojo también porque grita mucho', correct: false },
      { emoji: '🙄', label: 'Me parece exagerada', correct: false },
    ],
    feedback: 'Sentir empatía aunque tú hayas ganado muestra que eres muy maduro/a. La victoria se disfruta más cuando cuidamos a los demás. 🌟',
    wrongFeedback: 'Entender que perder puede sentirse muy mal es una señal de inteligencia social. Todos hemos sentido eso alguna vez. 💛',
  },
  {
    illustration: '🆕',
    text: 'Llega un niño nuevo a tu clase. Se llama Mateo y no conoce a nadie. Está sentado solo.',
    question: '¿Qué haces?',
    options: [
      { emoji: '👋', label: 'Me acerco y le digo hola, que me llamo...', correct: true },
      { emoji: '👀', label: 'Lo miro pero no hablo, me da pena', correct: false },
      { emoji: '🤫', label: 'Les digo a mis amigos que lo ignoren', correct: false },
      { emoji: '⏰', label: 'Espero a que él hable primero', correct: false },
    ],
    feedback: '¡Dar el primer paso toma valentía y hace una gran diferencia! Mateo nunca olvidará quien fue amable con él ese primer día. 🤝',
    wrongFeedback: 'Imagina cómo se sentiría Mateo ese día. Un simple "hola" puede cambiar todo. ¡Tú puedes ser ese amigo! 👋',
  },
  {
    illustration: '🎂',
    text: 'Es el cumpleaños de tu mejor amiga Lucía pero tú no tienes dinero para un regalo.',
    question: '¿Qué puedes hacer?',
    options: [
      { emoji: '✍️', label: 'Le dibujo una tarjeta con un mensaje especial', correct: true },
      { emoji: '😶', label: 'No le digo nada y finjo que olvidé su cumpleaños', correct: false },
      { emoji: '😔', label: 'Me quedo en casa porque me da vergüenza', correct: false },
      { emoji: '😤', label: 'Me enojo porque no tengo dinero', correct: false },
    ],
    feedback: '¡Los gestos del corazón valen más que cualquier regalo! Una carta escrita con cariño es un tesoro. 💌',
    wrongFeedback: 'Lo que más importa no es el regalo sino estar ahí. Un dibujo o carta hecha con amor es algo único e irrepetible. ✍️',
  },
  {
    illustration: '😬',
    text: 'Tu compañero Leo rompió sin querer tu proyecto de arte. Ahora está muy asustado.',
    question: '¿Cómo reaccionas?',
    options: [
      { emoji: '😮‍💨', label: 'Respiro profundo y le digo "fue sin querer"', correct: true },
      { emoji: '😡', label: 'Le grito y le digo que es un torpe', correct: false },
      { emoji: '💧', label: 'Lloro y ya no le hablo', correct: false },
      { emoji: '🏃', label: 'Me voy para no decir nada malo', correct: false },
    ],
    feedback: 'Respirar antes de reaccionar es una habilidad muy poderosa. ¡Eres muy inteligente emocionalmente! 😮‍💨✨',
    wrongFeedback: 'Los accidentes pasan. Respirar y recordar que fue sin querer nos ayuda a responder con calma. Eso se llama autocontrol. 💪',
  },
  {
    illustration: '🏫',
    text: 'En el recreo ves a un grupo de niños burlándose de los lentes de una niña llamada Iris.',
    question: '¿Qué haces?',
    options: [
      { emoji: '🦸', label: 'Me acerco a Iris y me quedo con ella', correct: true },
      { emoji: '😶', label: 'Me hago el/la que no vi nada', correct: false },
      { emoji: '😅', label: 'Me río un poco para no quedar mal', correct: false },
      { emoji: '📢', label: 'Grito cosas malas al grupo', correct: false },
    ],
    feedback: 'Estar del lado de quien necesita ayuda es un acto de valentía real. Iris siempre recordará que alguien estuvo ahí. 🦸💛',
    wrongFeedback: 'Cuando alguien necesita un aliado, estar presente marca toda la diferencia. La empatía en acción es la verdadera valentía. 🦸',
  },
  {
    illustration: '🏆',
    text: 'Ganas un concurso de dibujo. Tu amiga Camila también participó y quedó en segundo lugar.',
    question: '¿Cómo celebras?',
    options: [
      { emoji: '🤝', label: 'La felicito a ella también por participar', correct: true },
      { emoji: '🥇', label: 'Presumo mucho delante de todos', correct: false },
      { emoji: '🤐', label: 'No digo nada para no hacerla sentir mal', correct: false },
      { emoji: '😏', label: 'Le digo que la próxima vez lo hará mejor', correct: false },
    ],
    feedback: 'Celebrar con humildad y reconocer a los demás muestra que eres un/a gran compañero/a. ¡Eso se llama deportividad! 🤝🏆',
    wrongFeedback: 'Ganar se siente mejor cuando cuidamos los sentimientos de los demás. Felicitar a quien también lo intentó es una señal de madurez. 💛',
  },
  {
    illustration: '😔',
    text: 'Tu abuelita está enferma y tu mamá está muy triste y preocupada.',
    question: '¿Cómo la ayudas?',
    options: [
      { emoji: '🫂', label: 'La abrazo y le digo que la quiero mucho', correct: true },
      { emoji: '📺', label: 'Prendo la tele fuerte para no escuchar', correct: false },
      { emoji: '🙋', label: 'Le pido permiso para salir a jugar', correct: false },
      { emoji: '😤', label: 'Me enojo porque no me presta atención', correct: false },
    ],
    feedback: 'Reconocer que los adultos también necesitan apoyo y cariño es una señal de gran madurez emocional. ¡Qué hermoso gesto! 🫂💛',
    wrongFeedback: 'Cuando alguien que amamos está triste, un abrazo y decirle "te quiero" es el mejor regalo. La empatía no tiene edad. 💛',
  },
]

const pr = (i, s) => Math.abs(Math.sin(i * s * 2.399))
let _fid = 0

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

// ── Orbi for Nexus ────────────────────────────────────────────────
function OrbiNexus({ state }) {
  const isHappy = state === 'happy'
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
      <defs>
        <radialGradient id="nx-body" cx="34%" cy="34%">
          <stop offset="0%"   stopColor="#ffd4b3" />
          <stop offset="55%"  stopColor="#f9844a" />
          <stop offset="100%" stopColor="#7a2d00" />
        </radialGradient>
      </defs>
      <circle cx="34" cy="36" r="23" fill="url(#nx-body)" />
      <ellipse cx="34" cy="36" rx="30" ry="7.5" stroke="rgba(255,215,80,0.55)" strokeWidth="2.5" fill="none" />
      <ellipse cx="24.5" cy="34" rx="5.5" ry="6" fill="white" />
      <ellipse cx="43.5" cy="34" rx="5.5" ry="6" fill="white" />
      <circle cx="26" cy="35.5" r="3.5" fill="#3d1200" />
      <circle cx="45" cy="35.5" r="3.5" fill="#3d1200" />
      <circle cx="27" cy="34" r="1.5" fill="white" />
      <circle cx="46" cy="34" r="1.5" fill="white" />
      {isHappy
        ? <path d="M21 45 Q34 55 47 45 Q34 51 21 45" fill="white" />
        : <path d="M22 45 Q34 52 46 45" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      }
      <line x1="27" y1="14" x2="23" y2="5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="22" cy="4" r="3" fill="#ffd60a" />
      <line x1="41" y1="14" x2="45" y2="5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="46" cy="4" r="3" fill="#ffd60a" />
      {isHappy && (
        <>
          <path d="M4,16 L5.2,12 L6.5,16 L10.5,17.2 L6.5,18.5 L5.2,22.5 L4,18.5 L0,17.2 Z" fill="#ffd60a" opacity="0.9" />
          <path d="M58,12 L59,9 L60,12 L63,13 L60,14 L59,17 L58,14 L55,13 Z" fill="#ffd60a" opacity="0.8" />
        </>
      )}
    </svg>
  )
}

function NexusGame({ childName, onBack, onScore }) {
  const [phase, setPhase]       = useState('intro')
  const [qIdx, setQIdx]         = useState(0)
  const [answered, setAnswered] = useState(null)   // option index chosen
  const [correct, setCorrect]   = useState(null)   // true/false
  const [score, setScore]       = useState(0)
  const [streak, setStreak]     = useState(0)
  const [orbiState, setOrbiState] = useState('idle')
  const [floats, setFloats]     = useState([])
  const [shuffled] = useState(() =>
    [...SCENARIOS].sort(() => Math.random() - 0.5).slice(0, 6)
  )

  const scenario = shuffled[qIdx]
  const isEnd    = qIdx >= shuffled.length

  const handleAnswer = useCallback((optIdx) => {
    if (answered !== null) return
    const opt = scenario.options[optIdx]
    setAnswered(optIdx)
    setCorrect(opt.correct)

    if (opt.correct) {
      const newStreak = streak + 1
      const bonus = newStreak >= 3 ? 5 : 0
      const pts   = 15 + bonus
      setStreak(newStreak)
      setScore(s => s + pts)
      onScore?.(pts)
      setOrbiState('happy')

      const fid = ++_fid
      setFloats(prev => [...prev, { id: fid, pts }])
      setTimeout(() => setFloats(prev => prev.filter(f => f.id !== fid)), 1100)
    } else {
      setStreak(0)
      setOrbiState('idle')
    }

    setTimeout(() => {
      setAnswered(null); setCorrect(null); setOrbiState('idle')
      setQIdx(i => i + 1)
    }, 2400)
  }, [answered, scenario, streak, onScore])

  const restart = () => { setQIdx(0); setScore(0); setStreak(0); setPhase('playing') }

  const progressPct = Math.round((qIdx / shuffled.length) * 100)

  if (phase === 'intro') return (
    <div className="nexus-container">
      <div className="nexus-stars" />
      <header className="game-header">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="nexus-badge">Nexus</div>
        <div className="game-score"><StarIcon /> 0</div>
      </header>
      <h2 className="nexus-title">Planeta Nexus</h2>
      <p className="nexus-subtitle">¡Inteligencia social!</p>
      <div style={{ fontSize: '5rem', margin: '0.8rem 0', animation: 'nx-bounce 2s ease-in-out infinite' }}>🤝</div>
      <div className="nexus-intro">
        <div className="nexus-intro-text">
          Orbi te mostrará situaciones de la vida real.<br />
          Elige la respuesta más <strong>empática y amable</strong>.<br />
          ¡No hay trampa — solo piensa en los sentimientos de los demás! 💛
        </div>
        <button className="btn-nexus-start" onClick={() => setPhase('playing')}>
          ¡Empezar!
        </button>
      </div>
    </div>
  )

  if (isEnd) return (
    <div className="nexus-container">
      <div className="nexus-stars" />
      <header className="game-header">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="nexus-badge">Nexus</div>
        <div className="game-score"><StarIcon /> {score}</div>
      </header>
      <div className="nexus-end">
        <div className="nexus-end-card">
          <div className="nexus-end-emoji">🤝</div>
          <h2 className="nexus-end-title">¡{childName}, eres increíble!</h2>
          <p className="nexus-end-sub">
            Tienes una gran inteligencia social.<br />
            Entiendes los sentimientos de los demás<br />y sabes cómo ayudar. ¡El mundo te necesita! 💛
          </p>
          <div className="nexus-end-score"><StarIcon size={22} /> {score} puntos</div>
        </div>
        <button className="btn-nexus" onClick={restart}>¡Jugar de nuevo!</button>
        <button className="btn-back" onClick={onBack} style={{ marginTop: '0.5rem' }}>← Volver al mapa</button>
      </div>
    </div>
  )

  return (
    <div className="nexus-container">
      <div className="nexus-stars" />

      {floats.map(f => (
        <div key={f.id} className="nexus-float" style={{ left: `${40 + pr(f.id, 3) * 20}%`, top: '35%' }}>
          +{f.pts} 💛
        </div>
      ))}

      <header className="game-header">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="nexus-badge">Nexus</div>
        <div className="game-score"><StarIcon /> {score}</div>
      </header>

      <h2 className="nexus-title">Planeta Nexus</h2>
      <p className="nexus-subtitle">{qIdx + 1} de {shuffled.length} · {streak >= 3 && `¡Racha x${streak}! 🔥`}</p>

      <div className="nexus-progress">
        <div className="nexus-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Orbi */}
      <div style={{ marginBottom: '0.6rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', position: 'relative', zIndex: 1 }}>
        <OrbiNexus state={orbiState} />
        {streak >= 3 && <div className="nexus-streak">¡Racha x{streak}! 🔥</div>}
      </div>

      {/* Scenario */}
      <div className="scenario-card" key={qIdx}>
        <div className="scenario-scene">
          <div className="scenario-illustration">{scenario.illustration}</div>
          <div>
            <div className="scenario-text">{scenario.text}</div>
            <div className="scenario-question">{scenario.question}</div>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="nexus-options">
        {scenario.options.map((opt, i) => {
          const cls = answered !== null
            ? opt.correct
              ? 'correct'
              : i === answered
                ? 'wrong'
                : 'disabled'
            : ''
          return (
            <button
              key={i}
              className={`nexus-option ${cls}`}
              onClick={() => handleAnswer(i)}
              disabled={answered !== null}
            >
              <span className="opt-emoji">{opt.emoji}</span>
              <span className="opt-label">{opt.label}</span>
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {answered !== null && (
        <div className={`nexus-feedback ${correct ? 'good' : 'bad'}`}>
          {correct ? `✅ ${scenario.feedback}` : `💡 ${scenario.wrongFeedback}`}
        </div>
      )}
    </div>
  )
}

export default NexusGame
