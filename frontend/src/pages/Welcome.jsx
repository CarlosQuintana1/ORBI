import { useState } from 'react'
import './Welcome.css'

function OrbiMascot({ state = 'idle', size = 130 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ob" cx="34%" cy="34%" r="66%">
          <stop offset="0%"   stopColor="#eacfff" />
          <stop offset="55%"  stopColor="#c77dff" />
          <stop offset="100%" stopColor="#4a0e8f" />
        </radialGradient>
        <radialGradient id="og" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(199,125,255,0.3)" />
          <stop offset="100%" stopColor="rgba(199,125,255,0)" />
        </radialGradient>
        <clipPath id="ring-back">
          <rect x="0" y="0" width="130" height="68" />
        </clipPath>
        <clipPath id="ring-front">
          <rect x="0" y="68" width="130" height="130" />
        </clipPath>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Outer ambient glow */}
      <circle cx="65" cy="68" r="56" fill="url(#og)" />

      {/* Ring — back half (behind body) */}
      <ellipse cx="65" cy="68" rx="58" ry="14"
        stroke="rgba(255,215,80,0.45)" strokeWidth="4.5" fill="none"
        clipPath="url(#ring-back)" />

      {/* Body */}
      <circle cx="65" cy="68" r="44" fill="url(#ob)" />

      {/* Body highlight */}
      <ellipse cx="49" cy="52" rx="16" ry="11" fill="rgba(255,255,255,0.2)" />

      {/* Ring — front half (in front of body) */}
      <ellipse cx="65" cy="68" rx="58" ry="14"
        stroke="rgba(255,215,80,0.75)" strokeWidth="4.5" fill="none"
        clipPath="url(#ring-front)" />

      {/* Antennae */}
      <line x1="52" y1="26" x2="44" y2="10" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="43" cy="8" r="5" fill="#ffd60a" filter="url(#glow)" />
      <circle cx="43" cy="8" r="2.5" fill="white" opacity="0.9" />

      <line x1="78" y1="26" x2="86" y2="10" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="87" cy="8" r="5" fill="#ffd60a" filter="url(#glow)" />
      <circle cx="87" cy="8" r="2.5" fill="white" opacity="0.9" />

      {/* Eyes — idle / happy */}
      {state !== 'thinking' && (
        <>
          <ellipse cx="51" cy="65" rx="8" ry="9"   fill="white" />
          <ellipse cx="79" cy="65" rx="8" ry="9"   fill="white" />
          <circle  cx="53" cy="67" r="5"  fill="#1a0533" />
          <circle  cx="81" cy="67" r="5"  fill="#1a0533" />
          <circle  cx="55" cy="64" r="2"  fill="white" />
          <circle  cx="83" cy="64" r="2"  fill="white" />
        </>
      )}

      {/* Eyes — thinking */}
      {state === 'thinking' && (
        <>
          <path d="M43 66 Q51 58 59 66" stroke="white" strokeWidth="3" fill="rgba(255,255,255,0.12)" strokeLinecap="round"/>
          <path d="M71 66 Q79 58 87 66" stroke="white" strokeWidth="3" fill="rgba(255,255,255,0.12)" strokeLinecap="round"/>
          {/* Thought dots */}
          <circle cx="60" cy="52" r="3.5" fill="white" opacity="0.7" />
          <circle cx="65" cy="46" r="2.5" fill="white" opacity="0.5" />
          <circle cx="69" cy="41" r="1.8" fill="white" opacity="0.3" />
        </>
      )}

      {/* Mouth — happy */}
      {state === 'happy' && (
        <path d="M47 82 Q65 98 83 82" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      )}

      {/* Mouth — idle */}
      {state === 'idle' && (
        <path d="M50 82 Q65 91 80 82" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
      )}

      {/* Mouth — thinking */}
      {state === 'thinking' && (
        <path d="M52 84 Q65 79 78 84" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      )}

      {/* Star sparkles (happy state) — SVG paths, not emoji text */}
      {state === 'happy' && (
        <>
          <path d="M21,35 L23,29 L25,35 L31,37 L25,39 L23,45 L21,39 L15,37 Z" fill="#ffd60a" opacity="0.9" />
          <path d="M104,33 L106,28 L108,33 L113,35 L108,37 L106,42 L104,37 L99,35 Z" fill="#ffd60a" opacity="0.8" />
          <path d="M109,82 L110.5,78 L112,82 L116,83.5 L112,85 L110.5,89 L109,85 L105,83.5 Z" fill="white" opacity="0.55" />
        </>
      )}
    </svg>
  )
}

function Welcome({ onStart }) {
  const [name, setName]   = useState('')
  const [step, setStep]   = useState(0)

  const handleStart = () => {
    if (name.trim()) onStart(name.trim())
  }

  return (
    <div className="welcome">
      {/* Nebulas */}
      <div className="w-nebula w-nebula-1" />
      <div className="w-nebula w-nebula-2" />
      <div className="w-nebula w-nebula-3" />

      {/* Star dots */}
      <div className="w-stars" />

      <div className="welcome-content">
        <div className="orbi-mascot">
          <OrbiMascot state={step === 0 ? 'happy' : 'thinking'} size={140} />
        </div>

        <h1 className="welcome-title">
          ¡Hola! Soy <span>Orbi</span>
        </h1>

        {step === 0 && (
          <div className="welcome-card">
            <p>¿Listo para explorar tu universo de inteligencia?</p>
            <button className="btn-primary" onClick={() => setStep(1)}>
              ¡Vamos!
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="welcome-card">
            <p>¿Cómo te llamas, explorador?</p>
            <input
              className="name-input"
              type="text"
              placeholder="Escribe tu nombre..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              autoFocus
            />
            <button
              className="btn-primary"
              onClick={handleStart}
              disabled={!name.trim()}
            >
              ¡Explorar!
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Welcome
