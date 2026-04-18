import { useState, useMemo, useCallback, useRef } from 'react'
import './SolarSystem.css'

const PLANETS = [
  { id: 'matematica',    name: 'Kalculu', color: '#4cc9f0', description: 'Lógico-Matemática' },
  { id: 'linguistica',   name: 'Verbum',  color: '#06d6a0', description: 'Lingüístico-Verbal' },
  { id: 'espacial',      name: 'Prisma',  color: '#f72585', description: 'Visual-Espacial' },
  { id: 'cinestetica',   name: 'Kinetis', color: '#ff6b6b', description: 'Corporal-Cinestésica' },
  { id: 'musical',       name: 'Sonus',   color: '#c77dff', description: 'Musical' },
  { id: 'naturalista',   name: 'Terra',   color: '#80b918', description: 'Naturalista' },
  { id: 'interpersonal', name: 'Nexus',   color: '#f9844a', description: 'Interpersonal' },
  { id: 'intrapersonal', name: 'Lumis',   color: '#ffd60a', description: 'Intrapersonal' },
]

const PLANET_INFO = {
  matematica:    { activities: ['Cuenta y clasifica objetos', 'Reconoce patrones y formas', 'Resuelve retos lógicos'] },
  linguistica:   { activities: ['Lee historias personalizadas', 'Practica tu lectura en voz alta', 'Aprende nuevas palabras'] },
  espacial:      { activities: ['Construye naves con piezas', 'Rota y encaja formas', 'Diseña tu nave espacial'] },
  cinestetica:   { activities: ['Muévete para atrapar estrellas', 'Esquiva meteoritos', 'Baila con Orbi'] },
  musical:       { activities: ['Repite secuencias de sonidos', 'Sigue el ritmo espacial', 'Crea tu melodía'] },
  naturalista:   { activities: ['Identifica animales con la cámara', 'Aprende datos curiosos', 'Cuida el planeta Terra'] },
  interpersonal: { activities: ['Juega con amigos', 'Lee emociones', 'Trabaja en equipo'] },
  intrapersonal: { activities: ['Reflexiona sobre ti', 'Establece metas espaciales', 'Conoce tus fortalezas'] },
}

function LockSVG({ size = 22 }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 14 17" fill="none">
      <rect x="2" y="7" width="10" height="9" rx="2" fill="rgba(255,255,255,0.55)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2"/>
      <path d="M4 7V5a3 3 0 0 1 6 0v2" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <circle cx="7" cy="12" r="1.5" fill="rgba(255,255,255,0.8)"/>
    </svg>
  )
}

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

function PlanetDecorations({ id }) {
  if (id === 'matematica') return (
    <>
      <span className="kalculo-num" style={{ '--kn-delay': '0s',    '--kn-x': '-22px' }}>3</span>
      <span className="kalculo-num" style={{ '--kn-delay': '-1s',   '--kn-x': '18px'  }}>7</span>
      <span className="kalculo-num" style={{ '--kn-delay': '-2s',   '--kn-x': '-8px'  }}>+</span>
      <span className="kalculo-num" style={{ '--kn-delay': '-3s',   '--kn-x': '25px'  }}>2</span>
      <span className="kalculo-num" style={{ '--kn-delay': '-4s',   '--kn-x': '-18px' }}>∞</span>
    </>
  )
  if (id === 'linguistica') return (
    <>
      <span className="verbum-letter" style={{ '--orbit-delay': '0s' }}>A</span>
      <span className="verbum-letter" style={{ '--orbit-delay': '-2.3s' }}>B</span>
      <span className="verbum-letter" style={{ '--orbit-delay': '-4.6s' }}>C</span>
    </>
  )
  if (id === 'espacial') return (
    <>
      <span className="prisma-sparkle" style={{ '--sp-i': 0 }} />
      <span className="prisma-sparkle" style={{ '--sp-i': 1 }} />
      <span className="prisma-sparkle" style={{ '--sp-i': 2 }} />
      <span className="prisma-sparkle" style={{ '--sp-i': 3 }} />
      <span className="prisma-particle" style={{ '--pp-delay': '0s',    '--pp-color': '#f72585' }} />
      <span className="prisma-particle" style={{ '--pp-delay': '-1.5s', '--pp-color': '#4cc9f0' }} />
      <span className="prisma-particle" style={{ '--pp-delay': '-3s',   '--pp-color': '#ffd60a' }} />
      <span className="prisma-particle" style={{ '--pp-delay': '-4.5s', '--pp-color': '#c77dff' }} />
    </>
  )
  if (id === 'cinestetica') return (
    <>
      <span className="kinetis-trail" />
      <span className="kinetis-line" style={{ '--kl-i': 0 }} />
      <span className="kinetis-line" style={{ '--kl-i': 1 }} />
      <span className="kinetis-line" style={{ '--kl-i': 2 }} />
    </>
  )
  if (id === 'musical') return (
    <>
      <span className="sonus-wave" style={{ '--sw-i': 0 }} />
      <span className="sonus-wave" style={{ '--sw-i': 1 }} />
      <span className="sonus-wave" style={{ '--sw-i': 2 }} />
      <span className="sonus-note" style={{ '--sn-delay': '0s',    '--sn-x': '-20px' }}>♪</span>
      <span className="sonus-note" style={{ '--sn-delay': '-0.9s', '--sn-x': '22px'  }}>♪</span>
      <span className="sonus-note" style={{ '--sn-delay': '-1.8s', '--sn-x': '6px'   }}>♪</span>
    </>
  )
  if (id === 'naturalista') return (
    <>
      <span className="terra-moon" />
      <span className="terra-particle" style={{ '--tp-delay': '0s'    }} />
      <span className="terra-particle" style={{ '--tp-delay': '-1.4s' }} />
      <span className="terra-particle" style={{ '--tp-delay': '-2.8s' }} />
      <span className="terra-particle" style={{ '--tp-delay': '-4.2s' }} />
    </>
  )
  if (id === 'interpersonal') return (
    <>
      <span className="nexus-dot"  style={{ '--nd-i': 0 }} />
      <span className="nexus-dot"  style={{ '--nd-i': 1 }} />
      <span className="nexus-dot"  style={{ '--nd-i': 2 }} />
      <span className="nexus-dot"  style={{ '--nd-i': 3 }} />
      <span className="nexus-dot"  style={{ '--nd-i': 4 }} />
      <span className="nexus-line" style={{ '--nl-i': 0 }} />
      <span className="nexus-line" style={{ '--nl-i': 1 }} />
      <span className="nexus-line" style={{ '--nl-i': 2 }} />
      <span className="nexus-line" style={{ '--nl-i': 3 }} />
      <span className="nexus-line" style={{ '--nl-i': 4 }} />
    </>
  )
  if (id === 'intrapersonal') return (
    <>
      <span className="lumis-halo" />
      <span className="lumis-ray" style={{ '--lr-i': 0 }} />
      <span className="lumis-ray" style={{ '--lr-i': 1 }} />
      <span className="lumis-ray" style={{ '--lr-i': 2 }} />
      <span className="lumis-ray" style={{ '--lr-i': 3 }} />
      <span className="lumis-ray" style={{ '--lr-i': 4 }} />
      <span className="lumis-ray" style={{ '--lr-i': 5 }} />
      <span className="lumis-ray" style={{ '--lr-i': 6 }} />
      <span className="lumis-ray" style={{ '--lr-i': 7 }} />
    </>
  )
  return null
}

function ExpansionPanel({ planet, open, onPlay }) {
  const info = planet ? PLANET_INFO[planet.id] : null
  return (
    <div
      className={`expansion-panel${open ? ' open' : ''}`}
      style={{ '--planet-color': planet?.color ?? 'white', order: 'inherit' }}
    >
      <div className="ep-inner">
        {open && planet && (
          <>
            <div className="ep-sphere-wrap" data-planet={planet.id}>
              <div className="planet-sphere ep-sphere" />
            </div>
            {planet.unlocked ? (
              <>
                <div className="ep-info">
                  <h3 className="ep-title" style={{ color: planet.color }}>{planet.name}</h3>
                  <ul className="ep-activities">
                    {info.activities.map((act, i) => (
                      <li key={i} className="ep-activity">
                        <span className="ep-bullet" style={{ background: planet.color }} />
                        {act}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="ep-actions">
                  {planet.score > 0 && (
                    <div className="ep-score">
                      <StarSVG size={14} color={planet.color} /> {planet.score} pts
                    </div>
                  )}
                  <button
                    className="btn-ep-play"
                    onClick={e => { e.stopPropagation(); onPlay(planet.id) }}
                  >
                    ¡Jugar!
                  </button>
                </div>
              </>
            ) : (
              <div className="ep-info">
                <p className="ep-locked-msg">Sigue explorando para desbloquear este planeta...</p>
                <p className="ep-locked-hint">Juega más planetas para llegar aquí</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const pr = (i, s) => Math.sin(i * s * 2.399) * 0.5 + 0.5

const SHOOTS = [
  { top: '6%',  delay: '0s',   dur: '2.2s', angle: '18deg' },
  { top: '22%', delay: '4s',   dur: '1.9s', angle: '25deg' },
  { top: '38%', delay: '8s',   dur: '2.5s', angle: '14deg' },
  { top: '54%', delay: '12s',  dur: '2.0s', angle: '30deg' },
  { top: '70%', delay: '16s',  dur: '2.6s', angle: '20deg' },
  { top: '13%', delay: '20s',  dur: '2.1s', angle: '8deg'  },
  { top: '47%', delay: '24s',  dur: '1.8s', angle: '35deg' },
  { top: '83%', delay: '28s',  dur: '2.3s', angle: '22deg' },
]

function ShootingStars() {
  return (
    <div className="shooting-stars" aria-hidden="true">
      {SHOOTS.map((s, i) => (
        <div key={i} className="shooting-star" style={{
          '--ss-top': s.top,
          '--ss-angle': s.angle,
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
      <div className="nebula nebula-4" />
    </div>
  )
}

function PlanetProgressBar({ planets, unlockedPlanets }) {
  return (
    <div className="planet-progress-wrap">
      <div className="planet-progress-track">
        {planets.map(p => (
          <div
            key={p.id}
            className={`planet-progress-seg${unlockedPlanets.includes(p.id) ? ' active' : ''}`}
            style={{ '--seg-color': p.color }}
            title={p.name}
          />
        ))}
      </div>
      <span className="planet-progress-label">{unlockedPlanets.length}/8 planetas</span>
    </div>
  )
}

function SolarSystem({ childName, unlockedPlanets = [], scores = {}, onSelectPlanet, onOpenDashboard, onOpenProfile }) {
  const [expanded, setExpanded] = useState(null)
  const containerRef = useRef(null)

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

  const expandedIdx    = expanded ? planets.findIndex(p => p.id === expanded) : -1
  const expandedRow    = expandedIdx >= 0 ? Math.floor(expandedIdx / 4) : -1
  const expandedPlanet = expandedIdx >= 0 ? planets[expandedIdx] : null

  const totalStars  = Object.values(scores).reduce((a, b) => a + b, 0)
  const displayName = childName.charAt(0).toUpperCase() + childName.slice(1).toLowerCase()

  const UNLOCK_THRESHOLD = 100
  const nextLockedId = planets.find(p => !p.unlocked)?.id || null
  const ptsNeeded    = Math.max(0, UNLOCK_THRESHOLD - totalStars)

  const toggle = (id) => setExpanded(prev => prev === id ? null : id)

  return (
    <div className="solar-container" ref={containerRef} onMouseMove={handleMouseMove}>
      <StarField />
      <ShootingStars />

      <header className="solar-header">
        <div className="orbi-logo">
          <div className="orbi-logo-icon">
            <img src="/orbi-logo.png" height="44" alt="Orbi" style={{ display: 'block' }} />
          </div>
        </div>
        <div className="child-greeting">
          <img src="/orbi-cohete.png" alt="" className="cohete-icon" />
          ¡Hola, <span className="greeting-name">{displayName}</span>!
        </div>
        <div className="solar-header-right">
          <div className="total-stars">⭐ {totalStars}</div>
          {onOpenProfile && (
            <button className="btn-dashboard btn-profile" onClick={onOpenProfile}>
              🪐 Mi Planeta
            </button>
          )}
          {onOpenDashboard && (
            <button className="btn-dashboard btn-report" onClick={onOpenDashboard}>
              📊 Reporte
            </button>
          )}
        </div>
      </header>

      <PlanetProgressBar planets={PLANETS} unlockedPlanets={unlockedPlanets} />

      <h2 className="solar-title">
        <span className="title-star" aria-hidden="true">✦</span>
        Tu <span className="solar-title-highlight">universo</span> de inteligencia
        <span className="title-star" aria-hidden="true">✦</span>
      </h2>
      <p className="solar-subtitle">Toca un planeta para explorar</p>

      <div className={`planets-grid${expanded ? ' has-expanded' : ''}`}>

        {/* ── Row 0: cards 0-3, order 0-3 ── */}
        {planets.slice(0, 4).map((planet, i) => (
          <div
            key={planet.id}
            data-planet={planet.id}
            className={`planet-card ${planet.unlocked ? 'unlocked' : 'locked'}${expanded === planet.id ? ' selected' : ''}`}
            style={{ '--planet-color': planet.color, '--card-idx': i, order: i }}
            onClick={() => toggle(planet.id)}
          >
            <div className="planet-visual">
              <div className="planet-halo" />
              <div className={`planet-sphere${planet.unlocked ? '' : ' locked-sphere'}`} />
              {!planet.unlocked && <div className="planet-lock-overlay"><LockSVG size={22} /></div>}
              <PlanetDecorations id={planet.id} />
            </div>
            <div className="planet-name">{planet.name}</div>
            <div className="planet-type" style={planet.unlocked ? { color: planet.color, opacity: 0.8 } : undefined}>
              {planet.unlocked ? planet.description : '???'}
            </div>
            {planet.unlocked && planet.score > 0 && (
              <div className="planet-score"><StarSVG size={13} /> {planet.score}</div>
            )}
            {!planet.unlocked && planet.id === nextLockedId && ptsNeeded > 0 && (
              <div className="planet-pts-needed">Necesitas {ptsNeeded} pts más</div>
            )}
          </div>
        ))}

        {/* ── Panel after row 0, order 4 ── */}
        <div style={{ order: 4, gridColumn: '1 / -1' }}>
          <ExpansionPanel planet={expandedPlanet} open={expandedRow === 0} onPlay={onSelectPlanet} />
        </div>

        {/* ── Row 1: cards 4-7, order 5-8 ── */}
        {planets.slice(4, 8).map((planet, i) => {
          const idx = i + 4
          return (
            <div
              key={planet.id}
              data-planet={planet.id}
              className={`planet-card ${planet.unlocked ? 'unlocked' : 'locked'}${expanded === planet.id ? ' selected' : ''}`}
              style={{ '--planet-color': planet.color, '--card-idx': idx, order: i + 5 }}
              onClick={() => toggle(planet.id)}
            >
              <div className="planet-visual">
                <div className="planet-halo" />
                <div className={`planet-sphere${planet.unlocked ? '' : ' locked-sphere'}`} />
                {!planet.unlocked && <div className="planet-lock-overlay"><LockSVG size={22} /></div>}
                <PlanetDecorations id={planet.id} />
              </div>
              <div className="planet-name">{planet.name}</div>
              <div className="planet-type" style={planet.unlocked ? { color: planet.color, opacity: 0.8 } : undefined}>
                {planet.unlocked ? planet.description : '???'}
              </div>
              {planet.unlocked && planet.score > 0 && (
                <div className="planet-score"><StarSVG size={13} /> {planet.score}</div>
              )}
              {!planet.unlocked && planet.id === nextLockedId && ptsNeeded > 0 && (
                <div className="planet-pts-needed">Necesitas {ptsNeeded} pts más</div>
              )}
            </div>
          )
        })}

        {/* ── Panel after row 1, order 9 ── */}
        <div style={{ order: 9, gridColumn: '1 / -1' }}>
          <ExpansionPanel planet={expandedPlanet} open={expandedRow === 1} onPlay={onSelectPlanet} />
        </div>

      </div>
    </div>
  )
}

export default SolarSystem
