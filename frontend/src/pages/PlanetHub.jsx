import './PlanetHub.css'

const HUBS = {
  matematica: {
    name: 'Kalculu', color: '#4cc9f0', bgTop: '#001a2d',
    games: [
      { id: 'monsters', label: 'Retos matemáticos',  desc: 'Selecciona las figuras correctas según el color y cantidad que pide el monstruo' },
      { id: 'count',    label: 'Cuenta y clasifica',  desc: 'Agrupa objetos del cosmos por tipo' },
      { id: 'logic',    label: 'Retos lógicos',       desc: 'Próximamente', soon: true },
    ],
  },
  linguistica: {
    name: 'Verbum', color: '#06d6a0', bgTop: '#002d1a',
    games: [
      { id: 'stories',   label: 'Historias espaciales', desc: 'Lee y practica en voz alta con Orbi' },
      { id: 'wordmatch', label: 'Palabras nuevas',       desc: 'Aprende vocabulario del cosmos' },
      { id: 'wordcraft', label: 'Construye palabras',    desc: 'Próximamente', soon: true },
    ],
  },
  espacial: {
    name: 'Prisma', color: '#f72585', bgTop: '#2d0040',
    games: [
      { id: 'patterns', label: 'Completa el patrón', desc: 'Encuentra el color que falta en la cuadrícula' },
      { id: 'shapes',   label: 'Construye la nave',  desc: 'Ensambla piezas para armar tu nave espacial' },
      { id: 'design',   label: 'Diseña tu nave',     desc: 'Próximamente', soon: true },
    ],
  },
  cinestetica: {
    name: 'Kinetis', color: '#ff6b6b', bgTop: '#2d0020',
    games: [
      { id: 'bubbles', label: 'Atrapa las burbujas', desc: 'Toca las burbujas del color correcto' },
      { id: 'meteor',  label: 'Esquiva meteoritos',  desc: 'Mueve tu nave y esquiva los meteoritos' },
      { id: 'dance',   label: 'Baila con Orbi',      desc: 'Repite la secuencia de movimientos de Orbi' },
    ],
  },
  musical: {
    name: 'Sonus', color: '#c77dff', bgTop: '#1a002d',
    games: [
      { id: 'sequence', label: 'Repite la secuencia', desc: 'Memoriza y repite los sonidos del espacio' },
      { id: 'rhythm',   label: 'Sigue el ritmo',      desc: 'Toca al compás de la música espacial' },
      { id: 'melody',   label: 'Crea tu melodía',     desc: 'Próximamente', soon: true },
    ],
  },
  naturalista: {
    name: 'Terra', color: '#80b918', bgTop: '#0d2d00',
    games: [
      { id: 'facts',   label: 'Datos curiosos',      desc: 'Aprende curiosidades de la naturaleza' },
      { id: 'animals', label: 'Identifica animales', desc: 'Adivina qué animal se esconde' },
      { id: 'recycle', label: 'Cuida el planeta',    desc: 'Próximamente', soon: true },
    ],
  },
  interpersonal: {
    name: 'Nexus', color: '#f9844a', bgTop: '#2d1000',
    games: [
      { id: 'nexus',    label: 'Explora Nexus',       desc: 'Conecta con los habitantes del planeta' },
      { id: 'emotions', label: 'Lee emociones',       desc: 'Adivina cómo se sienten los personajes' },
      { id: 'team',     label: 'Trabajo en equipo',   desc: 'Próximamente', soon: true },
    ],
  },
  intrapersonal: {
    name: 'Lumis', color: '#ffd60a', bgTop: '#2d2500',
    games: [
      { id: 'lumis', label: 'Explora Lumis',       desc: 'Reflexiona sobre ti mismo con Orbi' },
      { id: 'goals', label: 'Metas espaciales',    desc: 'Establece tus metas de explorador' },
      { id: 'strengths', label: 'Tus fortalezas',  desc: 'Próximamente', soon: true },
    ],
  },
}

function NumberBadge({ n, color }) {
  return (
    <div className="hub-num" style={{ background: color }}>
      {n}
    </div>
  )
}

function GameCard({ game, color, index, onSelect }) {
  if (game.soon) {
    return (
      <div className="hub-card hub-soon">
        <NumberBadge n={index + 1} color="rgba(255,255,255,0.12)" />
        <div className="hub-card-body">
          <div className="hub-card-title">{game.label}</div>
          <div className="hub-card-desc hub-soon-label">Próximamente</div>
        </div>
        <div className="hub-card-arrow soon-lock">—</div>
      </div>
    )
  }
  return (
    <button
      className="hub-card hub-available"
      style={{ '--hc': color }}
      onClick={() => onSelect(game.id)}
    >
      <NumberBadge n={index + 1} color={color} />
      <div className="hub-card-body">
        <div className="hub-card-title">{game.label}</div>
        <div className="hub-card-desc">{game.desc}</div>
      </div>
      <div className="hub-card-arrow">→</div>
    </button>
  )
}

function PlanetHub({ planet, onSelect, onBack }) {
  const hub = HUBS[planet]
  if (!hub) return null

  return (
    <div
      className="hub-container"
      style={{ '--hub-color': hub.color, '--hub-bg': hub.bgTop }}
    >
      <div className="hub-stars" />

      <header className="hub-header">
        <button className="btn-back" onClick={onBack}>← Mapa</button>
        <div className="hub-badge" style={{ color: hub.color, borderColor: hub.color + '44' }}>
          {hub.name}
        </div>
        <div style={{ width: 70 }} />
      </header>

      <h2
        className="hub-title"
        style={{ textShadow: `0 0 30px ${hub.color}88` }}
      >
        Planeta {hub.name}
      </h2>
      <p className="hub-subtitle">Elige tu aventura</p>

      <div className="hub-cards">
        {hub.games.map((g, i) => (
          <GameCard
            key={g.id}
            game={g}
            color={hub.color}
            index={i}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

export default PlanetHub
