import { useState, useEffect } from 'react'
import './ParentalDashboard.css'

function OrbiMiniDash() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
      <defs>
        <radialGradient id="dmb" cx="34%" cy="34%">
          <stop offset="0%"   stopColor="#eacfff" />
          <stop offset="55%"  stopColor="#c77dff" />
          <stop offset="100%" stopColor="#4a0e8f" />
        </radialGradient>
      </defs>
      <circle cx="28" cy="30" r="19" fill="url(#dmb)" />
      <ellipse cx="28" cy="30" rx="25" ry="6" stroke="rgba(255,215,80,0.6)" strokeWidth="2.5" fill="none" />
      <ellipse cx="21" cy="28" rx="5.5" ry="6" fill="white" />
      <ellipse cx="35" cy="28" rx="5.5" ry="6" fill="white" />
      <circle  cx="22.5" cy="30" r="3.2" fill="#1a0533" />
      <circle  cx="36.5" cy="30" r="3.2" fill="#1a0533" />
      <circle  cx="23.5" cy="28.5" r="1.3" fill="white" />
      <circle  cx="37.5" cy="28.5" r="1.3" fill="white" />
      <path d="M19 38 Q28 45 37 38" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <line x1="22" y1="13" x2="19" y2="5"  stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="18.5" cy="3.5" r="2.8" fill="#ffd60a" />
      <line x1="34" y1="13" x2="37" y2="5"  stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="37.5" cy="3.5" r="2.8" fill="#ffd60a" />
    </svg>
  )
}

const PLANET_COLORS = {
  matematica:    '#4cc9f0', linguistica: '#06d6a0', naturalista: '#80b918',
  espacial:      '#f72585', musical:     '#c77dff', cinestetica: '#ff6b6b',
  interpersonal: '#f9844a', intrapersonal: '#ffd60a',
}

function ParentalDashboard({ playerName, onClose }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  useEffect(() => {
    fetch(`http://localhost:3001/api/player/${encodeURIComponent(playerName)}/report`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [playerName])

  const maxScore = data
    ? Math.max(...Object.values(data.player.scores || {}), 30)
    : 30

  const activeScores = data
    ? Object.entries(data.player.scores || {}).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a)
    : []

  return (
    <div className="dash-overlay" onClick={onClose}>
      <div className="dash-card" onClick={e => e.stopPropagation()}>
        <button className="dash-close" onClick={onClose}>✕</button>

        <div className="dash-header">
          <div className="dash-avatar"><OrbiMiniDash /></div>
          <div>
            <h2 className="dash-name">{data?.player?.name || playerName}</h2>
            <p className="dash-subtitle">Reporte de inteligencias · Orbi</p>
          </div>
        </div>

        {/* Unlock badges */}
        {data && (
          <div className="dash-unlocked">
            {data.player.unlockedPlanets?.map(id => (
              <span key={id} className="dash-planet-badge" style={{ '--c': PLANET_COLORS[id] }}>
                {data.planetLabels?.[id]?.emoji} {data.planetLabels?.[id]?.name}
              </span>
            ))}
          </div>
        )}

        {/* Score bars */}
        {activeScores.length > 0 && (
          <div className="dash-bars">
            <h3 className="dash-section-title">Puntajes por inteligencia</h3>
            {activeScores.map(([id, score]) => {
              const label = data.planetLabels?.[id]
              const pct   = Math.round((score / maxScore) * 100)
              return (
                <div key={id} className="dash-bar-row">
                  <div className="dash-bar-label">
                    <span>{label?.emoji}</span>
                    <span>{label?.name}</span>
                  </div>
                  <div className="dash-bar-track">
                    <div
                      className="dash-bar-fill"
                      style={{ width: `${pct}%`, '--c': PLANET_COLORS[id] }}
                    />
                  </div>
                  <span className="dash-bar-score">{score}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* AI Report */}
        <div className="dash-report">
          <h3 className="dash-section-title">Análisis de Orbi</h3>
          {loading && (
            <div className="dash-loading">
              <span />
              <span />
              <span />
            </div>
          )}
          {error && (
            <p className="dash-error">No se pudo generar el reporte. Verifica la conexión.</p>
          )}
          {!loading && !error && data?.report && (
            <p className="dash-report-text">{data.report}</p>
          )}
          {!loading && !error && activeScores.length === 0 && (
            <p className="dash-report-text">
              ¡{playerName} acaba de empezar su aventura en Orbi! Juega más para ver su análisis de inteligencias.
            </p>
          )}
        </div>

        <p className="dash-footer">
          Generado con Gemini AI · Basado en las Inteligencias Múltiples de Howard Gardner
        </p>
      </div>
    </div>
  )
}

export default ParentalDashboard
