import { useState, useEffect, useRef, useCallback } from 'react'
import './VerbumGame.css'

const API = 'http://localhost:3001'

const TOPICS = [
  { id: 'dinosaurios',          label: 'Dinosaurios', emoji: '🦕',
    gradient: 'linear-gradient(135deg, #1a472a, #2d6a4f)',
    color: '#2d6a4f', colorDim: 'rgba(45,106,79,0.45)',
    circleColor: 'rgba(6,214,160,0.14)', glow: 'rgba(45,106,79,0.75)' },
  { id: 'piratas espaciales',   label: 'Piratas',     emoji: '☠️',
    gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    color: '#1e6aaa', colorDim: 'rgba(30,106,170,0.45)',
    circleColor: 'rgba(76,201,240,0.14)', glow: 'rgba(30,106,170,0.75)' },
  { id: 'dragones mágicos',     label: 'Dragones',    emoji: '🐲',
    gradient: 'linear-gradient(135deg, #4a0e0e, #7b1818)',
    color: '#c0392b', colorDim: 'rgba(192,57,43,0.45)',
    circleColor: 'rgba(255,107,107,0.14)', glow: 'rgba(192,57,43,0.75)' },
  { id: 'robots amigables',     label: 'Robots',      emoji: '🤖',
    gradient: 'linear-gradient(135deg, #0d1b2a, #1b2a4a)',
    color: '#2980b9', colorDim: 'rgba(41,128,185,0.45)',
    circleColor: 'rgba(76,201,240,0.14)', glow: 'rgba(41,128,185,0.75)' },
  { id: 'superhéroes niños',    label: 'Superhéroes', emoji: '🦸',
    gradient: 'linear-gradient(135deg, #1a0533, #3d0070)',
    color: '#8e44ad', colorDim: 'rgba(142,68,173,0.45)',
    circleColor: 'rgba(180,0,255,0.14)', glow: 'rgba(142,68,173,0.75)' },
  { id: 'animales del espacio', label: 'Animales',    emoji: '🐨',
    gradient: 'linear-gradient(135deg, #1a3300, #2d5500)',
    color: '#27ae60', colorDim: 'rgba(39,174,96,0.45)',
    circleColor: 'rgba(100,200,0,0.14)', glow: 'rgba(39,174,96,0.75)' },
]

const STAR_COLORS = ['#555','#ff6b6b','#f9844a','#ffd60a','#06d6a0','#4cc9f0']

function getSupportedMimeType() {
  const types = ['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus','audio/mp4']
  return types.find(t => { try { return MediaRecorder.isTypeSupported(t) } catch { return false } }) || ''
}

async function blobToBase64(blob) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.readAsDataURL(blob)
  })
}

async function playTTS(text) {
  try {
    const res  = await fetch(`${API}/api/story/speak`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) return null
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = new Audio(url)
    await a.play().catch(() => {})
    return a
  } catch { return null }
}

function StarRow({ count, total = 5 }) {
  return (
    <div className="vb-stars">
      {Array.from({ length: total }, (_, i) => (
        <svg key={i} width="28" height="28" viewBox="0 0 28 28" className={`vb-star${i < count ? ' lit' : ''}`}>
          <polygon
            points="14,2 17.5,10.5 27,11.5 20,18 22,27 14,22.5 6,27 8,18 1,11.5 10.5,10.5"
            fill={i < count ? STAR_COLORS[count] : 'rgba(255,255,255,0.12)'}
          />
        </svg>
      ))}
    </div>
  )
}

function MicIcon({ active }) {
  const c = active ? '#06d6a0' : 'rgba(255,255,255,0.85)'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="8" y="1" width="8" height="13" rx="4" fill={c}/>
      <path d="M4 11a8 8 0 0 0 16 0" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <line x1="12" y1="19" x2="12" y2="23" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="23" x2="16" y2="23" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.15)"/>
      <polygon points="10,8 18,12 10,16" fill="#05050f"/>
    </svg>
  )
}

function StopIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="6" y="6" width="12" height="12" rx="2" fill="white"/>
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M4 4v5h5" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 20v-5h-5" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 9A8 8 0 0 0 4.93 4.93L4 9M4 15a8 8 0 0 0 15.07 4.07L20 15" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function AudioBars() {
  return (
    <div className="audio-bars">
      {[1,2,3,4,5,6,5,4,3,2].map((h, i) => (
        <div key={i} className="audio-bar" style={{ '--i': i, '--base-h': `${h * 10}%` }} />
      ))}
    </div>
  )
}

function OrbiFace({ state }) {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <defs>
        <radialGradient id="vb-body" cx="34%" cy="34%">
          <stop offset="0%" stopColor="#7aedc9"/>
          <stop offset="60%" stopColor="#06d6a0"/>
          <stop offset="100%" stopColor="#025c42"/>
        </radialGradient>
      </defs>
      <circle cx="40" cy="42" r="28" fill="url(#vb-body)"/>
      <ellipse cx="40" cy="42" rx="35" ry="9" stroke="rgba(255,200,80,0.6)" strokeWidth="3" fill="none"/>
      <ellipse cx="29" cy="40" rx="6" ry="7" fill="white"/>
      <ellipse cx="51" cy="40" rx="6" ry="7" fill="white"/>
      {state === 'speaking' ? (
        <>
          <circle cx="31" cy="42" r="3.5" fill="#025c42"/>
          <circle cx="53" cy="42" r="3.5" fill="#025c42"/>
          <circle cx="32.5" cy="40" r="1.5" fill="white"/>
          <circle cx="54.5" cy="40" r="1.5" fill="white"/>
          <path d="M30 52 Q40 60 50 52" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        </>
      ) : state === 'listening' ? (
        <>
          <circle cx="31" cy="42" r="4" fill="#025c42"/>
          <circle cx="53" cy="42" r="4" fill="#025c42"/>
          <circle cx="32.5" cy="40" r="1.5" fill="white"/>
          <circle cx="54.5" cy="40" r="1.5" fill="white"/>
          <ellipse cx="40" cy="54" rx="8" ry="4" fill="white" opacity="0.8"/>
        </>
      ) : (
        <>
          <path d="M23 40 Q29 33 35 40" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="2"/>
          <path d="M45 40 Q51 33 57 40" fill="rgba(255,255,255,0.2)" stroke="white" strokeWidth="2"/>
          <circle cx="40" cy="30" r="3" fill="white" opacity="0.7"/>
          <circle cx="43" cy="24" r="2" fill="white" opacity="0.5"/>
          <path d="M31 53 Q40 49 49 53" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </>
      )}
      <line x1="32" y1="14" x2="28" y2="5" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="27" cy="3" r="3" fill="#06d6a0"/>
      <line x1="48" y1="14" x2="52" y2="5" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="53" cy="3" r="3" fill="#06d6a0"/>
    </svg>
  )
}

function OrbiNarrator({ loading, playing }) {
  if (!loading && !playing) return null
  return (
    <div className="orbi-narrator">
      {loading && (
        <>
          <div className="orbi-thinking"><OrbiFace state="thinking"/></div>
          <div className="loading-text">Orbi está escribiendo tu historia...</div>
        </>
      )}
      {playing && (
        <div className="orbi-playing-wrap">
          <AudioBars/>
          <div className="orbi-speaking"><OrbiFace state="speaking"/></div>
          <AudioBars/>
        </div>
      )}
    </div>
  )
}

function VerbumGame({ childName, onBack, onScore, initialLevel = 1 }) {
  const [topic, setTopic]                   = useState(null)
  const [story, setStory]                   = useState('')
  const [displayedStory, setDisplayedStory] = useState('')
  const [isTyping, setIsTyping]             = useState(false)
  const [loading, setLoading]               = useState(false)
  const [playing, setPlaying]               = useState(false)
  const [audio, setAudio]                   = useState(null)
  const [storiesCount, setStoriesCount]     = useState(0)
  const [level, setLevel]                   = useState(initialLevel)
  const [celebrating, setCelebrating]       = useState(false)
  const [wordTimings, setWordTimings]       = useState([])
  const [activeWordIdx, setActiveWordIdx]   = useState(-1)
  const [countdown, setCountdown]           = useState(null)

  // Reading evaluation
  const [readPhase, setReadPhase]     = useState(null)
  // null | 'ready' | 'recording' | 'transcribing' | 'evaluating' | 'result'
  const [readResult, setReadResult]   = useState(null)
  const [feedbackAudio, setFeedbackAudio] = useState(null)
  const recorderRef = useRef(null)
  const chunksRef   = useRef([])
  const storyRef    = useRef(story)

  useEffect(() => { storyRef.current = story }, [story])

  useEffect(() => {
    if (!story) return
    setDisplayedStory('')
    setIsTyping(true)
    setReadPhase(null)
    setReadResult(null)
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayedStory(story.slice(0, i))
      if (i >= story.length) { clearInterval(interval); setIsTyping(false) }
    }, 25)
    return () => clearInterval(interval)
  }, [story])

  const generateStory = async (lvl = level) => {
    if (!topic) return
    setLoading(true)
    setStory('')
    setDisplayedStory('')
    setReadPhase(null)
    setReadResult(null)
    setCelebrating(false)
    stopPlayback()
    try {
      const res  = await fetch(`${API}/api/story/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childName, topic: topic.id, level: lvl }),
      })
      const data = await res.json()
      if (data.story) {
        setStory(data.story)
        setStoriesCount(c => c + 1)
        onScore?.(10)
      } else {
        console.error('generate error:', data)
        setStory('¡Ups! No pude crear la historia. Intenta de nuevo.')
      }
    } catch (err) {
      console.error('generateStory fetch error:', err)
      setStory('¡Ups! No pude crear la historia. Intenta de nuevo.')
    }
    setLoading(false)
  }

  const nextStory = async () => {
    const nextLevel = Math.min(level + 1, 3)
    setLevel(nextLevel)
    await generateStory(nextLevel)
  }

  const playStory = async () => {
    if (!story || isTyping) return
    setPlaying(true)
    setActiveWordIdx(-1)
    setWordTimings([])
    try {
      const res  = await fetch(`${API}/api/story/speak-with-timing`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: story }),
      })
      if (!res.ok) { setPlaying(false); return }
      const data = await res.json()

      const timings = data.words || []
      setWordTimings(timings)

      // Decode base64 audio
      const binary = atob(data.audio)
      const bytes  = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      const url      = URL.createObjectURL(new Blob([bytes], { type: 'audio/mpeg' }))
      const newAudio = new Audio(url)

      newAudio.addEventListener('timeupdate', () => {
        const t = newAudio.currentTime
        let idx = -1
        for (let i = 0; i < timings.length; i++) {
          if (t >= timings[i].start) idx = i
          else break
        }
        setActiveWordIdx(idx)
      })
      newAudio.onended = () => { setPlaying(false); setActiveWordIdx(-1) }
      newAudio.onerror = () => { setPlaying(false); setActiveWordIdx(-1) }
      setAudio(newAudio)
      await newAudio.play().catch(() => { setPlaying(false); setActiveWordIdx(-1) })
    } catch { setPlaying(false) }
  }

  const stopPlayback = () => {
    if (audio) { audio.pause(); audio.currentTime = 0 }
    setPlaying(false)
    setActiveWordIdx(-1)
  }

  const resetStory = () => {
    stopPlayback()
    stopRecording()
    feedbackAudio?.pause()
    setStory(''); setDisplayedStory(''); setTopic(null)
    setReadPhase(null); setReadResult(null); setCelebrating(false)
    setWordTimings([]); setCountdown(null)
  }

  // ── Countdown before recording ───────────────────────────────
  const startCountdown = useCallback(() => {
    setReadPhase('countdown')
    setCountdown(3)
    let n = 3
    const tick = setInterval(() => {
      n -= 1
      if (n <= 0) {
        clearInterval(tick)
        setCountdown(null)
        startRecording()
      } else {
        setCountdown(n)
      }
    }, 1000)
  }, [])

  // ── ElevenLabs STT recording ──────────────────────────────────
  const startRecording = useCallback(async () => {
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = getSupportedMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const mType = mimeType || 'audio/webm'
        const blob  = new Blob(chunksRef.current, { type: mType })
        await transcribeAndEvaluate(blob, mType)
      }
      recorderRef.current = recorder
      recorder.start()
      setReadPhase('recording')
    } catch {
      setReadPhase(null)
    }
  }, [story, childName])

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
    recorderRef.current = null
  }, [])

  const transcribeAndEvaluate = async (blob, mimeType) => {
    if (!blob || blob.size === 0) { setReadPhase(null); return }
    setReadPhase('transcribing')
    try {
      const base64 = await blobToBase64(blob)

      const sttRes  = await fetch(`${API}/api/story/transcribe`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64, mimeType }),
      })
      if (!sttRes.ok) throw new Error(`STT ${sttRes.status}`)
      const sttData = await sttRes.json()
      const spoken  = sttData.text?.trim()

      if (!spoken) {
        setReadPhase('no-audio')
        setTimeout(() => setReadPhase(null), 2200)
        return
      }

      setReadPhase('evaluating')

      const currentStory = storyRef.current
      const evalRes  = await fetch(`${API}/api/story/evaluate-reading`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original: currentStory, spoken, childName }),
      })
      if (!evalRes.ok) throw new Error(`Eval ${evalRes.status}`)
      const evalData = await evalRes.json()
      setReadResult(evalData)
      setReadPhase('result')

      const pts = evalData.stars >= 4 ? 20 : evalData.stars >= 3 ? 12 : evalData.stars >= 2 ? 6 : 0
      if (pts > 0) onScore?.(pts)
      if (evalData.stars >= 4) setCelebrating(true)

      const a = await playTTS(evalData.feedback)
      if (a) setFeedbackAudio(a)
    } catch (err) {
      console.error('transcribeAndEvaluate error:', err)
      setReadPhase('error')
      setTimeout(() => setReadPhase(null), 2500)
    }
  }

  return (
    <div className="verbum-container">
      <div className="stars-bg"/>
      <div className="verbum-nebula"/>

      <header className="game-header">
        <button className="btn-back" onClick={onBack}>← Volver</button>
        <div className="planet-badge">Verbum</div>
        {storiesCount > 0 && (
          <div className="stories-count">{storiesCount} {storiesCount === 1 ? 'historia' : 'historias'}</div>
        )}
      </header>

      <h2 className="verbum-title">¡Tu historia espacial!</h2>
      <p className="verbum-subtitle">
        {story
          ? <>Una aventura de {topic?.label || ''} para <span className="child-name-highlight">{childName}</span></>
          : <>¿De qué quieres que sea tu historia, <span className="child-name-highlight">{childName}</span>?</>}
      </p>

      {!story && !loading && (
        <>
          <div className="topics-grid">
            {TOPICS.map(t => (
              <button
                key={t.id}
                className={`topic-btn${topic?.id === t.id ? ' selected' : ''}`}
                onClick={() => setTopic(t)}
                style={{
                  background: t.gradient,
                  border: `2px solid ${topic?.id === t.id ? t.color : t.colorDim}`,
                  '--glow': t.glow,
                }}
              >
                <div className="topic-icon-circle" style={{ background: t.circleColor, borderColor: t.color }}>
                  <span className="topic-emoji-icon">{t.emoji}</span>
                </div>
                <span className="topic-label">{t.label}</span>
              </button>
            ))}
          </div>
          <button className="btn-generate" onClick={() => generateStory(level)} disabled={!topic}>
            ¡Crear mi historia!
          </button>
        </>
      )}

      <OrbiNarrator loading={loading} playing={playing}/>

      {/* Recording/transcribing indicator */}
      {(readPhase === 'recording' || readPhase === 'transcribing' || readPhase === 'evaluating' || readPhase === 'no-audio' || readPhase === 'error') && (
        <div className="vb-reading-orbi">
          <OrbiFace state={readPhase === 'recording' ? 'listening' : readPhase === 'no-audio' || readPhase === 'error' ? 'speaking' : 'thinking'}/>
          <div className="vb-recording-label">
            {readPhase === 'recording'    ? 'Orbi te escucha...'
            : readPhase === 'transcribing' ? 'Procesando tu voz...'
            : readPhase === 'evaluating'   ? 'Evaluando tu lectura...'
            : readPhase === 'no-audio'     ? '¡No te escuché! Intenta de nuevo.'
            : '¡Ups! Algo salió mal. Intenta de nuevo.'}
          </div>
        </div>
      )}

      {readPhase === 'countdown' && countdown !== null && (
        <div className="vb-countdown-overlay">
          <div className="vb-countdown-box">
            <p className="vb-countdown-label">¿Listo?</p>
            <div className="vb-countdown-number" key={countdown}>{countdown}</div>
          </div>
        </div>
      )}

      {(story || isTyping) && (
        <div className="story-card">
          <p className="story-text">
            {!isTyping && wordTimings.length > 0
              ? (() => {
                  let wIdx = 0
                  return story.split(/(\s+)/).map((token, i) => {
                    if (/^\s+$/.test(token)) return <span key={i}>{token}</span>
                    const idx = wIdx++
                    return (
                      <span key={i} className={`story-word${idx === activeWordIdx ? ' word-active' : ''}`}>
                        {token}
                      </span>
                    )
                  })
                })()
              : <>{displayedStory}{isTyping && <span className="typing-cursor">|</span>}</>
            }
          </p>

          {/* Reading result */}
          {readPhase === 'result' && readResult && (
            <div className={`vb-read-result${celebrating ? ' celebrating' : ''}`}>
              {celebrating && <div className="confetti-row">🌟✨⭐🌟✨⭐🌟</div>}
              <StarRow count={readResult.stars}/>
              <p className="vb-accuracy">{readResult.score}% de precisión</p>
              <p className="vb-feedback">"{readResult.feedback}"</p>
              <div className="vb-result-actions">
                {celebrating ? (
                  <button className="vb-btn-next" onClick={nextStory}>
                    ¡Siguiente historia! →
                  </button>
                ) : (
                  <button className="vb-btn-retry" onClick={() => setReadPhase(null)}>
                    Leer de nuevo
                  </button>
                )}
                {!celebrating && (
                  <button className="vb-btn-retry secondary" onClick={() => setReadPhase(null)}>
                    Intentar otra vez
                  </button>
                )}
              </div>
            </div>
          )}

          {!isTyping && !['result','recording','transcribing','evaluating','countdown','no-audio','error'].includes(readPhase) && (
            <div className="story-actions">
              {!playing
                ? <button className="btn-listen" onClick={playStory}><PlayIcon/> Escuchar</button>
                : <button className="btn-stop"   onClick={stopPlayback}><StopIcon/> Detener</button>
              }

              {readPhase === null && (
                <button className="btn-read-aloud" onClick={startCountdown}>
                  <MicIcon active={false}/> Leer en voz alta
                </button>
              )}

              <button className="btn-new" onClick={resetStory}><RefreshIcon/> Nueva</button>
            </div>
          )}

          {readPhase === 'recording' && (
            <div className="story-actions">
              <button className="btn-read-stop" onClick={stopRecording}>
                Listo, terminé
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VerbumGame
