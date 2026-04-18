import { useState } from 'react'
import './SolarSystem.css'

const planets = [
  { id: 'matematica', name: 'Kálculo', emoji: '🔢', color: '#4cc9f0', description: 'Lógico-Matemática', unlocked: true },
  { id: 'linguistica', name: 'Verbum', emoji: '📖', color: '#06d6a0', description: 'Lingüístico-Verbal', unlocked: true },
  { id: 'espacial', name: 'Prisma', emoji: '🎨', color: '#f72585', description: 'Visual-Espacial', unlocked: false },
  { id: 'cinestetica', name: 'Kinetis', emoji: '🏃', color: '#ff6b6b', description: 'Corporal-Cinestésica', unlocked: false },
  { id: 'musical', name: 'Sonus', emoji: '🎵', color: '#c77dff', description: 'Musical', unlocked: false },
  { id: 'naturalista', name: 'Terra', emoji: '🌿', color: '#80b918', description: 'Naturalista', unlocked: false },
  { id: 'interpersonal', name: 'Nexus', emoji: '🤝', color: '#f9844a', description: 'Interpersonal', unlocked: false },
  { id: 'intrapersonal', name: 'Lumis', emoji: '🧘', color: '#ffd60a', description: 'Intrapersonal', unlocked: false },
]

function SolarSystem({ childName }) {
  const [selected, setSelected] = useState(null)

  return (
    <div className="solar-container">
      <div className="stars-bg" />

      <header className="solar-header">
        <div className="orbi-logo">🪐 Orbi</div>
        <div className="child-greeting">¡Hola, {childName}! ✨</div>
      </header>

      <h2 className="solar-title">Tu universo de inteligencia</h2>
      <p className="solar-subtitle">Toca un planeta para explorar</p>

      <div className="planets-grid">
        {planets.map((planet) => (
          <div
            key={planet.id}
            className={`planet-card ${planet.unlocked ? 'unlocked' : 'locked'}`}
            style={{ '--planet-color': planet.color }}
            onClick={() => planet.unlocked && setSelected(planet)}
          >
            <div className="planet-glow" />
            <div className="planet-emoji">{planet.unlocked ? planet.emoji : '🔒'}</div>
            <div className="planet-name">{planet.name}</div>
            <div className="planet-type">{planet.description}</div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-emoji">{selected.emoji}</div>
            <h2 style={{ color: selected.color }}>{selected.name}</h2>
            <p>{selected.description}</p>
            <button
              className="btn-play"
              style={{ background: selected.color }}
              onClick={() => setSelected(null)}
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

export default SolarSystem