import { useState, useRef, useEffect } from 'react'
import './TerraGame.css'

function NoCameraIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ marginBottom: '0.5rem' }}>
      <rect x="8" y="20" width="56" height="38" rx="8" fill="rgba(128,185,24,0.15)" stroke="rgba(128,185,24,0.5)" strokeWidth="2.5" />
      <circle cx="36" cy="39" r="12" fill="none" stroke="rgba(128,185,24,0.4)" strokeWidth="2" />
      <rect x="28" y="14" width="16" height="8" rx="4" fill="rgba(128,185,24,0.3)" stroke="rgba(128,185,24,0.5)" strokeWidth="2" />
      <line x1="14" y1="58" x2="58" y2="14" stroke="#ff6b6b" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  )
}

function TerraGame({ childName, onBack, onScore }) {
  const videoRef  = useRef(null)
  const streamRef = useRef(null)

  const [phase, setPhase]           = useState('camera') // camera | analyzing | result
  const [result, setResult]         = useState(null)
  const [collection, setCollection] = useState([])
  const [flash, setFlash]           = useState(false)
  const [camError, setCamError]     = useState(false)

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }
      })
      streamRef.current = s
      if (videoRef.current) videoRef.current.srcObject = s
    } catch {
      setCamError(true)
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
  }

  const capture = async () => {
    if (!videoRef.current) return

    // Flash animation
    setFlash(true)
    setTimeout(() => setFlash(false), 300)

    // Capture frame as base64
    const canvas = document.createElement('canvas')
    const v = videoRef.current
    canvas.width  = v.videoWidth  || 640
    canvas.height = v.videoHeight || 480
    canvas.getContext('2d').drawImage(v, 0, 0)
    const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1]

    setPhase('analyzing')

    try {
      const res  = await fetch('http://localhost:3001/api/terra/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, childName }),
      })
      const data = await res.json()

      if (data.found) {
        setCollection(prev => {
          const dup = prev.find(a => a.animal?.toLowerCase() === data.animal?.toLowerCase())
          return dup ? prev : [...prev, data]
        })
        onScore?.(15)
      }

      setResult(data)
      setPhase('result')
    } catch {
      setResult({ found: false, message: '¡Ups! Algo falló. Intenta de nuevo.' })
      setPhase('result')
    }
  }

  const scanAgain = () => { setResult(null); setPhase('camera') }

  return (
    <div className="terra-container">
      <div className="terra-bg" />
      {flash && <div className="camera-flash" />}

      <header className="game-header">
        <button className="btn-back" onClick={() => { stopCamera(); onBack() }}>← Volver</button>
        <div className="terra-badge">Terra</div>
        {collection.length > 0 && (
          <div className="collection-count">
            {collection.length} {collection.length === 1 ? 'ser vivo' : 'seres vivos'}
          </div>
        )}
      </header>

      <h2 className="terra-title">¡Explorador de Naturaleza!</h2>
      <p className="terra-subtitle">Apunta la cámara a un animal o planta y ¡descúbrelo!</p>

      {/* ── Camera error ── */}
      {camError && (
        <div className="no-cam-card">
          <NoCameraIcon />
          <h3>Sin acceso a cámara</h3>
          <p>Activa los permisos de cámara en tu navegador y recarga la página para explorar con Terra.</p>
        </div>
      )}

      {/* ── Camera + scanner ── */}
      {!camError && phase === 'camera' && (
        <div className="scanner-wrap">
          <div className="scanner-frame">
            <video
              ref={videoRef}
              className="camera-feed"
              autoPlay
              playsInline
              muted
            />
            <div className="scanner-overlay">
              <div className="scanner-corner tl" />
              <div className="scanner-corner tr" />
              <div className="scanner-corner bl" />
              <div className="scanner-corner br" />
              <div className="scanner-line" />
            </div>
          </div>
          <button className="btn-capture" onClick={capture}>
            <span className="capture-ring" />
            ¡Escanear!
          </button>
          {collection.length > 0 && (
            <div className="mini-collection">
              {collection.map((a, i) => (
                <span key={i} className="mini-animal" title={a.animal}>{a.emoji}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Analyzing ── */}
      {phase === 'analyzing' && (
        <div className="analyzing-wrap">
          <div className="analyzing-orbi">🌿</div>
          <p className="analyzing-text">Orbi está identificando...</p>
          <div className="analyzing-dots">
            <span /><span /><span />
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {phase === 'result' && result && (
        <div className="result-wrap">
          {result.found ? (
            <div className="animal-card">
              <div className="animal-emoji-big">{result.emoji}</div>
              <h3 className="animal-name">{result.animal}</h3>
              <p className="animal-fact">{result.fact}</p>
              <div className="discovered-badge">
                ✨ {collection.length} {collection.length === 1 ? 'ser vivo descubierto' : 'seres vivos descubiertos'}
              </div>
            </div>
          ) : (
            <div className="no-animal-card">
              <div style={{ fontSize: '3.5rem', marginBottom: '0.8rem' }}>🔍</div>
              <p>{result.message}</p>
            </div>
          )}

          <button className="btn-scan-again" onClick={scanAgain}>
            Escanear otro
          </button>

          {collection.length > 0 && (
            <div className="mini-collection large">
              {collection.map((a, i) => (
                <div key={i} className="collection-item">
                  <span className="mini-animal">{a.emoji}</span>
                  <span className="mini-label">{a.animal}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TerraGame
