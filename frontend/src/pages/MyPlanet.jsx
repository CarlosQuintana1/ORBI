import { useState, useMemo } from 'react'
import './MyPlanet.css'

// ── Intelligence catalog ──────────────────────────────────────────
const INTELLIGENCES = [
  { id: 'matematica',    name: 'Lógica',     color: '#4cc9f0', rgb: '76,201,240',  emoji: '🔢', planet: 'Kalculu' },
  { id: 'linguistica',   name: 'Lenguaje',   color: '#06d6a0', rgb: '6,214,160',   emoji: '📖', planet: 'Verbum'  },
  { id: 'espacial',      name: 'Visual',     color: '#f72585', rgb: '247,37,133',  emoji: '🎨', planet: 'Prisma'  },
  { id: 'musical',       name: 'Musical',    color: '#c77dff', rgb: '199,125,255', emoji: '🎵', planet: 'Sonus'   },
  { id: 'cinestetica',   name: 'Movimiento', color: '#ff6b6b', rgb: '255,107,107', emoji: '🤸', planet: 'Kinetis' },
  { id: 'naturalista',   name: 'Naturaleza', color: '#80b918', rgb: '128,185,24',  emoji: '🌿', planet: 'Terra'   },
  { id: 'interpersonal', name: 'Social',     color: '#f9844a', rgb: '249,132,74',  emoji: '🤝', planet: 'Nexus'   },
  { id: 'intrapersonal', name: 'Interior',   color: '#ffd60a', rgb: '255,214,10',  emoji: '💫', planet: 'Lumis'   },
]

const RANKS = [
  { min: 0,   label: '⭐ Explorador Estelar',    color: '#aaa' },
  { min: 20,  label: '🚀 Viajero Cósmico',       color: '#4cc9f0' },
  { min: 60,  label: '🛸 Comandante Orbital',     color: '#c77dff' },
  { min: 120, label: '🌟 Maestro del Universo',   color: '#ffd60a' },
]

// ── Deterministic pseudo-random from name ─────────────────────────
function nameHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

function seededRandom(seed, index) {
  return Math.abs(Math.sin(seed * 9301 + index * 49297 + 233995)) % 1
}

// ── Planet Name Generator ─────────────────────────────────────────
function getPlanetName(childName, domIntel) {
  const suffixes = {
    matematica:    'Prime',  linguistica: 'Vox',
    espacial:      'Lux',    musical:     'Sono',
    cinestetica:   'Kin',    naturalista: 'Vera',
    interpersonal: 'Link',   intrapersonal: 'Sol',
  }
  const base = childName.slice(0, 3).toUpperCase()
  const suf  = suffixes[domIntel?.id] || 'Orbi'
  return `${base}-${suf}`
}

// ── Rank helper ───────────────────────────────────────────────────
function getRank(total) {
  return [...RANKS].reverse().find(r => total >= r.min) || RANKS[0]
}

// ── Starfield ─────────────────────────────────────────────────────
function StarField({ seed }) {
  const stars = useMemo(() =>
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x:    seededRandom(seed, i * 3)     * 100,
      y:    seededRandom(seed, i * 3 + 1) * 100,
      size: seededRandom(seed, i * 3 + 2) * 2 + 0.4,
      dur:  seededRandom(seed, i * 7)     * 3 + 2,
      del:  seededRandom(seed, i * 11)    * 5,
    }))
  , [seed])

  const shoots = useMemo(() => [
    { t: '12%', dur: '5s', del: '2s' },
    { t: '38%', dur: '4s', del: '9s' },
    { t: '65%', dur: '6s', del: '17s' },
  ], [])

  return (
    <div className="mp-stars">
      {stars.map(s => (
        <span key={s.id} className="mp-star" style={{
          left: `${s.x}%`, top: `${s.y}%`,
          width: `${s.size}px`, height: `${s.size}px`,
          '--dur': `${s.dur}s`, '--delay': `${s.del}s`,
        }} />
      ))}
      {shoots.map((s, i) => (
        <div key={i} className="mp-shoot" style={{
          '--t': s.t, '--dur': s.dur, '--delay': s.del,
        }} />
      ))}
    </div>
  )
}

// ── Generative Planet SVG ─────────────────────────────────────────
function PlanetSVG({ domColor, domRgb, childName, totalScore, scores, unlockedPlanets }) {
  const seed = nameHash(childName)
  const size = 150

  // Surface spots — deterministic from name
  const spots = useMemo(() =>
    Array.from({ length: 5 }, (_, i) => ({
      cx:  30 + seededRandom(seed, i * 7)     * 90,
      cy:  40 + seededRandom(seed, i * 7 + 1) * 80,
      rx:  4  + seededRandom(seed, i * 7 + 2) * 14,
      ry:  3  + seededRandom(seed, i * 7 + 3) * 9,
      rot: seededRandom(seed, i * 7 + 4) * 60 - 30,
      op:  0.12 + seededRandom(seed, i * 7 + 5) * 0.18,
    }))
  , [seed])

  // Surface bands — 2 horizontal stripes
  const bands = useMemo(() =>
    Array.from({ length: 2 }, (_, i) => ({
      y:   50 + seededRandom(seed, 200 + i) * 60,
      h:   6  + seededRandom(seed, 210 + i) * 12,
      op:  0.10 + seededRandom(seed, 220 + i) * 0.12,
    }))
  , [seed])

  const hasRings  = totalScore >= 40
  const hasClouds = totalScore >= 10
  const gradId    = `planet-grad-${seed % 9999}`
  const cloudId   = `cloud-clip-${seed % 9999}`

  return (
    <svg width={size} height={size} viewBox="0 0 150 150" fill="none">
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="70%">
          <stop offset="0%"   stopColor={`color-mix(in srgb, ${domColor} 30%, white)`} />
          <stop offset="45%"  stopColor={domColor} />
          <stop offset="100%" stopColor={`color-mix(in srgb, ${domColor} 60%, #050510)`} />
        </radialGradient>
        <radialGradient id={`atm-${seed}`} cx="50%" cy="50%">
          <stop offset="60%"  stopColor="transparent" />
          <stop offset="100%" stopColor={`rgba(${domRgb},0.35)`} />
        </radialGradient>
        <clipPath id={cloudId}>
          <circle cx="75" cy="75" r="56" />
        </clipPath>
      </defs>

      {/* Atmosphere glow */}
      <circle cx="75" cy="75" r="68" fill={`url(#atm-${seed})`} />

      {/* Rings (back) */}
      {hasRings && (
        <ellipse cx="75" cy="75" rx="80" ry="18"
          stroke={`rgba(${domRgb},0.55)`} strokeWidth="5"
          fill="none"
          clipPath={`url(#ring-back-${seed})`}
        />
      )}

      {/* Main sphere */}
      <circle cx="75" cy="75" r="56" fill={`url(#${gradId})`} />

      {/* Surface bands */}
      <g clipPath={`url(#${cloudId})`}>
        {bands.map((b, i) => (
          <rect key={i}
            x="19" y={b.y} width="112" height={b.h}
            fill="rgba(0,0,0,1)" opacity={b.op}
            rx="4"
          />
        ))}

        {/* Surface spots */}
        {spots.map((s, i) => (
          <ellipse key={i}
            cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry}
            fill="rgba(0,0,0,1)" opacity={s.op}
            transform={`rotate(${s.rot} ${s.cx} ${s.cy})`}
          />
        ))}

        {/* Clouds / highlight wisps */}
        {hasClouds && (
          <>
            <ellipse cx="52" cy="52" rx="22" ry="11"
              fill="rgba(255,255,255,0.12)" />
            <ellipse cx="95" cy="88" rx="18" ry="9"
              fill="rgba(255,255,255,0.08)" />
          </>
        )}

        {/* Main highlight */}
        <ellipse cx="53" cy="50" rx="20" ry="14"
          fill="rgba(255,255,255,0.22)" />
      </g>

      {/* Rings (front) */}
      {hasRings && (
        <>
          <defs>
            <clipPath id={`ring-back-${seed}`}>
              <rect x="0" y="0" width="150" height="75" />
            </clipPath>
            <clipPath id={`ring-front-${seed}`}>
              <rect x="0" y="75" width="150" height="75" />
            </clipPath>
          </defs>
          <ellipse cx="75" cy="75" rx="80" ry="18"
            stroke={`rgba(${domRgb},0.75)`} strokeWidth="5"
            fill="none"
            clipPath={`url(#ring-front-${seed})`}
          />
          {/* Second thinner ring */}
          <ellipse cx="75" cy="75" rx="70" ry="14"
            stroke={`rgba(${domRgb},0.25)`} strokeWidth="2.5"
            fill="none"
          />
        </>
      )}
    </svg>
  )
}

// ── Orbiting moons ────────────────────────────────────────────────
const ORBIT_RADII = [110, 128, 112, 130, 115, 125, 108, 132]
const ORBIT_DURS  = ['14s','18s','11s','22s','16s','20s','13s','25s']
const MOON_SIZES  = ['22px','20px','24px','18px','22px','20px','24px','20px']

function OrbitingMoons({ unlockedPlanets, scores }) {
  const unlocked = INTELLIGENCES.filter(i => unlockedPlanets.includes(i.id))
  const [hoveredId, setHoveredId] = useState(null)

  if (unlocked.length === 0) return null

  return (
    <>
      {unlocked.map((intel, idx) => {
        const radius    = ORBIT_RADII[idx % ORBIT_RADII.length]
        const dur       = ORBIT_DURS[idx % ORBIT_DURS.length]
        const moonSize  = MOON_SIZES[idx % MOON_SIZES.length]
        const startAngle = `${(idx / unlocked.length) * 360}deg`
        const score     = scores[intel.id] || 0

        return (
          <div key={intel.id} style={{ position: 'absolute', inset: 0, borderRadius: '50%' }}>
            {/* Orbit track */}
            <div className="mp-orbit-ring" style={{
              width:  `${radius * 2}px`,
              height: `${radius * 2}px`,
              top:    `${150 - radius}px`,
              left:   `${150 - radius}px`,
            }} />
            {/* Moon */}
            <div className="mp-moon-orbit" style={{
              '--orbit-dur':   dur,
              '--orbit-delay': `${-idx * 1.5}s`,
              '--start-angle': startAngle,
              width:  `${radius * 2}px`,
              height: `${radius * 2}px`,
              top:    `${150 - radius}px`,
              left:   `${150 - radius}px`,
            }}>
              <div
                className="mp-moon"
                style={{
                  '--moon-color': intel.color,
                  '--moon-size':  moonSize,
                }}
                onMouseEnter={() => setHoveredId(intel.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {intel.emoji}
                <div className="mp-moon-tooltip">
                  {intel.planet} · {score} ⭐
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

// ── Intelligence Radar (SVG spider chart) ─────────────────────────
function RadarChart({ scores, maxScore }) {
  const N    = INTELLIGENCES.length
  const cx   = 110
  const cy   = 110
  const r    = 80
  const step = (2 * Math.PI) / N

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1]

  const axisPoints = INTELLIGENCES.map((_, i) => {
    const angle = -Math.PI / 2 + i * step
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  })

  const scorePoints = INTELLIGENCES.map((intel, i) => {
    const angle = -Math.PI / 2 + i * step
    const pct   = maxScore > 0 ? Math.min((scores[intel.id] || 0) / maxScore, 1) : 0
    const rad   = r * (0.08 + pct * 0.92)
    return { x: cx + rad * Math.cos(angle), y: cy + rad * Math.sin(angle) }
  })

  const polygon = scorePoints.map(p => `${p.x},${p.y}`).join(' ')

  // Label positions (slightly further out)
  const labelPoints = INTELLIGENCES.map((_, i) => {
    const angle = -Math.PI / 2 + i * step
    return { x: cx + (r + 22) * Math.cos(angle), y: cy + (r + 22) * Math.sin(angle) }
  })

  return (
    <svg width="220" height="220" viewBox="0 0 220 220" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="radar-fill" cx="50%" cy="50%">
          <stop offset="0%"   stopColor="rgba(199,125,255,0.5)" />
          <stop offset="100%" stopColor="rgba(76,201,240,0.15)" />
        </radialGradient>
      </defs>

      {/* Grid rings */}
      {rings.map((pct, ri) => {
        const ringPts = INTELLIGENCES.map((_, i) => {
          const angle = -Math.PI / 2 + i * step
          const rad   = r * pct
          return `${cx + rad * Math.cos(angle)},${cy + rad * Math.sin(angle)}`
        }).join(' ')
        return (
          <polygon key={ri} points={ringPts}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1"
          />
        )
      })}

      {/* Axis lines */}
      {axisPoints.map((pt, i) => (
        <line key={i}
          x1={cx} y1={cy} x2={pt.x} y2={pt.y}
          stroke="rgba(255,255,255,0.08)" strokeWidth="1"
        />
      ))}

      {/* Score polygon */}
      <polygon
        points={polygon}
        fill="url(#radar-fill)"
        stroke="rgba(199,125,255,0.8)"
        strokeWidth="2"
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 8px rgba(199,125,255,0.5))' }}
      />

      {/* Score dots */}
      {scorePoints.map((pt, i) => (
        <circle key={i}
          cx={pt.x} cy={pt.y} r="4"
          fill={INTELLIGENCES[i].color}
          stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"
          style={{ filter: `drop-shadow(0 0 6px ${INTELLIGENCES[i].color})` }}
        />
      ))}

      {/* Labels */}
      {labelPoints.map((pt, i) => (
        <text key={i}
          x={pt.x} y={pt.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="9"
          fontFamily="Nunito, sans-serif"
          fontWeight="700"
          fill="rgba(255,255,255,0.5)"
        >
          {INTELLIGENCES[i].emoji}
        </text>
      ))}
    </svg>
  )
}

// ── Star icon ─────────────────────────────────────────────────────
function StarIcon({ size = 16 }) {
  const c = size / 2, r = size / 2 - 1, inner = r * 0.42
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5 - Math.PI / 2
    return `${c + (i % 2 ? inner : r) * Math.cos(a)},${c + (i % 2 ? inner : r) * Math.sin(a)}`
  }).join(' ')
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <polygon points={pts} fill="#ffd60a" />
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────
function MyPlanet({ player, onBack }) {
  const { name, scores = {}, unlockedPlanets = [] } = player

  const totalScore = useMemo(() =>
    Object.values(scores).reduce((a, b) => a + b, 0)
  , [scores])

  const maxScore = useMemo(() =>
    Math.max(...Object.values(scores), 1)
  , [scores])

  // Dominant intelligence (highest score among unlocked)
  const domIntel = useMemo(() => {
    const withScores = INTELLIGENCES
      .filter(i => unlockedPlanets.includes(i.id) && (scores[i.id] || 0) > 0)
      .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
    return withScores[0] || INTELLIGENCES[0]
  }, [scores, unlockedPlanets])

  const childAge = useMemo(() => {
    try {
      const d = JSON.parse(localStorage.getItem(`orbi_user_${name.toLowerCase()}`) || '{}')
      return d.age || null
    } catch { return null }
  }, [name])

  const planetName = getPlanetName(name, domIntel)
  const rank       = getRank(totalScore)
  const seed       = nameHash(name)

  // Sorted intelligences for bar list
  const sortedIntel = useMemo(() =>
    INTELLIGENCES
      .filter(i => unlockedPlanets.includes(i.id))
      .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
  , [unlockedPlanets, scores])

  const lockedCount = INTELLIGENCES.length - unlockedPlanets.length

  return (
    <div
      className="myplanet-container"
      style={{
        '--dom-color': domIntel.color,
        '--dom-rgb':   domIntel.rgb,
      }}
    >
      <StarField seed={seed} />

      {/* Header */}
      <header className="mp-header">
        <button className="mp-back" onClick={onBack}>← Volver</button>
        <span className="mp-header-title">Mi Planeta</span>
        <div className="mp-stars-count">
          <StarIcon /> {totalScore}
        </div>
      </header>

      {/* Planet stage */}
      <div className="mp-stage">
        <div className="mp-planet-name">{planetName}</div>

        {/* Orbit system */}
        <div className="mp-orbit-system">
          <OrbitingMoons unlockedPlanets={unlockedPlanets} scores={scores} />
          <div className="mp-planet-wrap">
            <PlanetSVG
              domColor={domIntel.color}
              domRgb={domIntel.rgb}
              childName={name}
              totalScore={totalScore}
              scores={scores}
              unlockedPlanets={unlockedPlanets}
            />
          </div>
        </div>

        {/* Name & rank */}
        <div className="mp-name-card">
          <div className="mp-child-name">{name}</div>
          {childAge && (
            <div className="mp-age-badge">
              <StarIcon size={13} /> Explorador de {childAge} años
            </div>
          )}
          <div className="mp-rank-badge" style={{ color: rank.color, borderColor: `${rank.color}55`, background: `${rank.color}18` }}>
            {rank.label}
          </div>
        </div>
      </div>

      {/* Intelligence radar */}
      {sortedIntel.length > 0 && (
        <div className="mp-section">
          <div className="mp-section-title">Mapa de inteligencias</div>
          <div className="mp-radar-wrap">
            <RadarChart scores={scores} maxScore={maxScore} />
          </div>
        </div>
      )}

      {/* Intelligence bars */}
      {sortedIntel.length > 0 && (
        <div className="mp-section" style={{ marginTop: '0.8rem' }}>
          <div className="mp-section-title">Tus poderes</div>
          <div className="mp-intel-list">
            {sortedIntel.map((intel, idx) => {
              const sc  = scores[intel.id] || 0
              const pct = maxScore > 0 ? (sc / maxScore) * 100 : 0
              return (
                <div key={intel.id} className="mp-intel-row" style={{ '--i': idx }}>
                  <span className="mp-intel-emoji">{intel.emoji}</span>
                  <span className="mp-intel-label">{intel.name}</span>
                  <div className="mp-intel-track">
                    <div
                      className="mp-intel-fill"
                      style={{
                        width: `${pct}%`,
                        '--bar-color': intel.color,
                        '--i': idx,
                      }}
                    />
                  </div>
                  <span className="mp-intel-score">{sc}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Unlocked planets section */}
      {unlockedPlanets.length > 0 && (
        <div className="mp-section" style={{ marginTop: '1.2rem' }}>
          <div className="mp-section-title">Planetas visitados</div>
          <div className="mp-unlocked-grid">
            {INTELLIGENCES.filter(i => unlockedPlanets.includes(i.id)).map((intel, ci) => (
              <div
                key={intel.id}
                className="mp-planet-chip"
                style={{
                  '--chip-color': intel.color,
                  '--chip-rgb':   intel.rgb,
                  '--ci':         ci,
                }}
              >
                {intel.emoji} {intel.planet}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked planets hint */}
      {lockedCount > 0 && (
        <div className="mp-locked-hint">
          🔒 Tienes <strong>{lockedCount} {lockedCount === 1 ? 'planeta' : 'planetas'}</strong> por descubrir.<br />
          ¡Sigue explorando para hacer crecer tu mundo!
        </div>
      )}

      <div className="mp-bottom-pad" />
    </div>
  )
}

export default MyPlanet
