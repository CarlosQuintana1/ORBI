import { useState, useMemo, useCallback, useRef } from 'react'
import './SolarSystem.css'

const PLANETS = [
  { id: 'matematica',    name: 'Kálculo', color: '#4cc9f0', description: 'Lógico-Matemática' },
  { id: 'linguistica',   name: 'Verbum',  color: '#06d6a0', description: 'Lingüístico-Verbal' },
  { id: 'espacial',      name: 'Prisma',  color: '#f72585', description: 'Visual-Espacial' },
  { id: 'cinestetica',   name: 'Kinetis', color: '#ff6b6b', description: 'Corporal-Cinestésica' },
  { id: 'musical',       name: 'Sonus',   color: '#c77dff', description: 'Musical' },
  { id: 'naturalista',   name: 'Terra',   color: '#80b918', description: 'Naturalista' },
  { id: 'interpersonal', name: 'Nexus',   color: '#f9844a', description: 'Interpersonal' },
  { id: 'intrapersonal', name: 'Lumis',   color: '#ffd60a', description: 'Intrapersonal' },
]

function StarSVG({ size = 16, color = '#ffd60a' }) {
  const c = size / 2
  const r = size / 2 - 0.5
  const inner = r * 0.42
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5 - Math.PI / 2
    const rad = i % 2 === 0 ? r : inner
    return `${c + rad * Math.cos(a)},${c + rad * Math.sin(a)}`
  }).join(' ')
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 2 }}>
      <polygon points={pts} fill={color} />
    </svg>
  )
}

// Deterministic pseudo-random (no Math.random so positions are stable)
const pr = (i, s) => Math.sin(i * s * 2.399) * 0.5 + 0.5

const SHOOTS = [
  { top: '8%',  delay: '3s',  dur: '2.4s' },
  { top: '28%', delay: '10s', dur: '2s'   },
  { top: '58%', delay: '18s', dur: '3s'   },
  { top: '78%', delay: '25s', dur: '2.2s' },
]

function ShootingStars() {
  return (
    <div className="shooting-stars" aria-hidden="true">
      {SHOOTS.map((s, i) => (
        <div key={i} className="shooting-star" style={{
          '--ss-top': s.top,
          animationDelay: s.delay,
          animationDuration: s.dur,
        }} />
      ))}
    </div>
  )
}

function StarField() {
  const stars = useMemo(() =>
    Array.from({ length: 90 }, (_, i) => ({
      id: i,
      x: pr(i, 1) * 100,
      y: pr(i, 2) * 100,
      size: pr(i, 3) * 2.2 + 0.5,
      delay: pr(i, 4) * 5,
      duration: pr(i, 5) * 3.5 + 2,
    }))
  , [])

  return (
    <div className="starfield" aria-hidden="true">
      {stars.map(s => (
        <span
          key={s.id}
          className="star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            '--delay': `${s.delay}s`,
            '--dur': `${s.duration}s`,
          }}
        />
      ))}
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />
      <div className="nebula nebula-3" />
    </div>
  )
}

function SolarSystem({ childName, unlockedPlanets = [], scores = {}, onSelectPlanet, onOpenDashboard }) {
  const [selected, setSelected] = useState(null)
  const containerRef = useRef(null)

  // Parallax: direct DOM mutation to avoid re-renders on every mousemove
  const handleMouseMove = useCallback((e) => {
    const sf = containerRef.current?.querySelector('.starfield')
    if (!sf) return
    const x = (e.clientX / window.innerWidth - 0.5) * 28
    const y = (e.clientY / window.innerHeight - 0.5) * 28
    sf.style.transform = `translate(${x}px, ${y}px)`
  }, [])

  const planets = PLANETS.map(p => ({
    ...p,
    unlocked: unlockedPlanets.includes(p.id),
    score: scores[p.id] || 0,
  }))

  const totalStars = Object.values(scores).reduce((a, b) => a + b, 0)

  return (
    <div className="solar-container" ref={containerRef} onMouseMove={handleMouseMove}>
      <StarField />
      <ShootingStars />

      <header className="solar-header">
        <div className="orbi-logo">
          <OrbiMiniIcon />
          Orbi
        </div>
        <div className="child-greeting">¡Hola, {childName}!</div>
        <div className="solar-header-right">
          <div className="total-stars"><StarSVG /> {totalStars}</div>
          {onOpenDashboard && (
            <button className="btn-dashboard" onClick={onOpenDashboard}>
              Reporte
            </button>
          )}
        </div>
      </header>

      <h2 className="solar-title">Tu universo de inteligencia</h2>
      <p className="solar-subtitle">Toca un planeta para explorar</p>

      <div className="planets-grid">
        {planets.map(planet => (
          <div
            key={planet.id}
            data-planet={planet.id}
            className={`planet-card ${planet.unlocked ? 'unlocked' : 'locked'}`}
            style={{ '--planet-color': planet.color }}
            onClick={() => planet.unlocked && setSelected(planet)}
          >
            <div className="planet-visual">
              <div className="planet-halo" />
              <div className={`planet-sphere${planet.unlocked ? '' : ' locked-sphere'}`} />
            </div>
            <div className="planet-name">{planet.unlocked ? planet.name : '???'}</div>
            <div className="planet-type">{planet.unlocked ? planet.description : '🔒 Bloqueado'}</div>
            {planet.unlocked && planet.score > 0 && (
              <div className="planet-score"><StarSVG size={13} /> {planet.score}</div>
            )}
          </div>
        ))}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div
            className="modal-card"
            data-planet={selected.id}
            style={{ '--planet-color': selected.color }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-planet-wrap">
              <div className="planet-sphere modal-sphere" />
            </div>
            <h2 style={{ color: selected.color }}>{selected.name}</h2>
            <p>{selected.description}</p>
            {selected.score > 0 && (
              <p className="modal-score"><StarSVG size={16} /> {selected.score} puntos</p>
            )}
            <button
              className="btn-play"
              style={{ background: selected.color, boxShadow: `0 8px 30px ${selected.color}70` }}
              onClick={() => onSelectPlanet(selected.id)}
            >
              ¡Jugar! 🚀
            </button>
            <button className="btn-close" onClick={() => setSelected(null)}>✕</button>
          </div>
        </div>
      )}
    </div>
  )
}

// Small Orbi icon for the logo
function OrbiMiniIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <defs>
        <radialGradient id="mini-body" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#e8c4ff" />
          <stop offset="100%" stopColor="#7b2dcc" />
        </radialGradient>
      </defs>
      <circle cx="14" cy="14" r="10" fill="url(#mini-body)" />
      <ellipse cx="14" cy="14" rx="14" ry="4.5" stroke="rgba(255,210,80,0.6)" strokeWidth="2" fill="none" />
      <circle cx="10" cy="13" r="2.5" fill="white" opacity="0.9" />
      <circle cx="18" cy="13" r="2.5" fill="white" opacity="0.9" />
      <path d="M10 17.5 Q14 21 18 17.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export default SolarSystem
