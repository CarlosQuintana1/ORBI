import { useState, useEffect } from 'react'
import './VerbumGame.css'

const TOPICS = [
  { id: 'dinosaurios',      emoji: '🦕', label: 'Dinosaurios' },
  { id: 'piratas espaciales', emoji: '🏴‍☠️', label: 'Piratas' },
  { id: 'dragones mágicos', emoji: '🐉', label: 'Dragones' },
  { id: 'robots amigables', emoji: '🤖', label: 'Robots' },
]

// ── Audio visualizer bars ─────────────────────────────────────────
function AudioBars() {
  return (
    <div className="audio-bars">
      {[1, 2, 3, 4, 5, 6, 5, 4, 3, 2].map((h, i) => (
        <div key={i} className="audio-bar" style={{ '--i': i, '--base-h': `${h * 10}%` }} />
      ))}
    </div>
  )
}

// ── Orbi narrator animation ───────────────────────────────────────
function OrbiNarrator({ loading, playing }) {
  if (!loading && !playing) return null
  return (
    <div className="orbi-narrator">
      {loading && (
        <>
          <div className="orbi-thinking">
            <OrbiFace state="thinking" />
          </div>
          <div className="loading-text">Orbi está escribiendo tu historia...</div>
        </>
      )}
      {playing && (
        <div className="orbi-playing-wrap">
          <AudioBars />
          <div className="orbi-speaking">
            <OrbiFace state="speaking" />
          </div>
          <AudioBars />
        </div>
      )}
    </div>
  )
}

function OrbiFace({ state }) {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <defs>
        <radialGradient id="vb-body" cx="34%" cy="34%">
          <stop offset="0%" stopColor="#7aedc9" />
          <stop offset="60%" stopColor="#06d6a0" />
          <stop offset="100%" stopColor="#025c42" />
        </radialGradient>
      </defs>
      <circle cx="40" cy="42" r="28" fill="url(#vb-body)" />
      <ellipse cx="40" cy="42" rx="35" ry="9" stroke="rgba(255,200,80,0.6)" strokeWidth="3" fill="none" />
      <ellipse cx="29" cy="40" rx="6" ry="7" fill="white" />
      <ellipse cx="51" cy="40" rx="6" ry="7" fill="white" />
      {state === 'speaking' ? (
        <>
          <circle cx="31" cy="42" r="3.5" fill="#025c42" />
          <circle cx="53" cy="42" r="3.5" fill="#025c42" />
          <circle cx="32.5" cy="40" r="1.5" fill="white" />
          <circle cx="54.5" cy="40" r="1.5" fill="white" />
          <path d="M30 52 Q40 60 50 52" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M23 40 Q29 33 35 40" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="2" />
          <path d="M45 40 Q51 33 57 40" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="2" />
          <circle cx="40" cy="30" r="3"   fill="white" opacity="0.7" />
          <circle cx="43" cy="24" r="2"   fill="white" opacity="0.5" />
          <circle cx="45" cy="19" r="1.5" fill="white" opacity="0.3" />
          <path d="M31 53 Q40 49 49 53" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
      <line x1="32" y1="14" x2="28" y2="5" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="27" cy="3" r="3" fill="#06d6a0" />
      <line x1="48" y1="14" x2="52" y2="5" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="53" cy="3" r="3" fill="#06d6a0" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────
function VerbumGame({ childName, onBack, onScore }) {
  const [topic, setTopic]               = useState(null)
  const [story, setStory]               = useState('')
  const [displayedStory, setDisplayedStory] = useState('')
  const [isTyping, setIsTyping]         = useState(false)
  const [loading, setLoading]           = useState(false)
  const [playing, setPlaying]           = useState(false)
  const [audio, setAudio]               = useState(null)
  const [storiesCount, setStoriesCount] = useState(0)

  useEffect(() => {
    if (!story) return
    setDisplayedStory('')
    setIsTyping(true)
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayedStory(story.slice(0, i))
      if (i >= story.length) { clearInterval(interval); setIsTyping(false) }
    }, 25)
    return () => clearInterval(interval)
  }, [story])

  const generateStory = async () => {
    if (!topic) return
    setLoading(true)
    setStory('')
    setDisplayedStory('')
    stopAudio()
    try {
      const res  = await fetch('http://localhost:3001/api/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childName, topic: topic.id }),
      })
      const data = await res.json()
      setStory(data.story)
      setStoriesCount(c => c + 1)
      onScore?.(10)
    } catch {
      setStory('¡Ups! No pude crear la historia. Intenta de nuevo.')
    }
    setLoading(false)
  }

  const playStory = async () => {
    if (!story || isTyping) return
    setPlaying(true)
    try {
      const res  = await fetch('http://localhost:3001/api/story/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: story }),
      })
      const blob     = await res.blob()
      const url      = URL.createObjectURL(blob)
      const newAudio = new Audio(url)
      setAudio(newAudio)
      newAudio.play()
      newAudio.onended = () => setPlaying(false)
    } catch { setPlaying(false) }
  }

  const stopAudio = () => {
    if (audio) { audio.pause(); audio.currentTime = 0 }
    setPlaying(false)
  }

  const resetStory = () => { stopAudio(); setStory(''); setDisplayedStory(''); setTopic(null) }

  return (
    <div className="verbum-container">
      <div className="stars-bg" />

      <header className="game-header">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="planet-badge">Verbum</div>
        {storiesCount > 0 && <div className="stories-count">{storiesCount} {storiesCount === 1 ? 'historia' : 'historias'}</div>}
      </header>

      <h2 className="verbum-title">¡Tu historia espacial!</h2>
      <p className="verbum-subtitle">
        {story
          ? `Una aventura de ${topic?.label || ''} para ${childName}`
          : `¿De qué quieres que sea tu historia, ${childName}?`}
      </p>

      {!story && !loading && (
        <>
          <div className="topics-grid">
            {TOPICS.map(t => (
              <button
                key={t.id}
                className={`topic-btn ${topic?.id === t.id ? 'selected' : ''}`}
                onClick={() => setTopic(t)}
              >
                <span className="topic-emoji">{t.emoji}</span>
                <span className="topic-label">{t.label}</span>
              </button>
            ))}
          </div>
          <button className="btn-generate" onClick={generateStory} disabled={!topic}>
            ¡Crear mi historia!
          </button>
        </>
      )}

      <OrbiNarrator loading={loading} playing={playing} />

      {(story || isTyping) && (
        <div className="story-card">
          <p className="story-text">
            {displayedStory}
            {isTyping && <span className="typing-cursor">|</span>}
          </p>
          {!isTyping && (
            <div className="story-actions">
              {!playing
                ? <button className="btn-listen" onClick={playStory}>Escuchar con Orbi</button>
                : <button className="btn-stop"   onClick={stopAudio}>Detener</button>
              }
              <button className="btn-new" onClick={resetStory}>Nueva historia</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VerbumGame
