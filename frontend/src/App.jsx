import { useState, useCallback, useMemo } from 'react'
import Welcome           from './pages/Welcome'
import SolarSystem       from './pages/SolarSystem'
import MonsterGame       from './pages/MonsterGame'
import VerbumGame        from './pages/VerbumGame'
import TerraGame         from './pages/TerraGame'
import SonusGame         from './pages/SonusGame'
import PrismaGame        from './pages/PrismaGame'
import KinetisGame       from './pages/KinetisGame'
import NexusGame         from './pages/NexusGame'
import LumisGame         from './pages/LumisGame'
import MyPlanet          from './pages/MyPlanet'
import ParentalDashboard from './pages/ParentalDashboard'
import './App.css'

const API = 'http://localhost:3001'

const PLANET_NAMES = {
  espacial:'Prisma', musical:'Sonus', cinestetica:'Kinetis',
  naturalista:'Terra', interpersonal:'Nexus', intrapersonal:'Lumis',
}

const pr = (i,s) => Math.sin(i*s*2.399)*0.5+0.5
const CONFETTI_COLORS = ['#ffd60a','#4cc9f0','#f72585','#06d6a0','#c77dff','#ff6b6b','#f9844a','#80b918']

function Confetti() {
  const pieces = useMemo(() => Array.from({length:45},(_,i)=>({
    id:i, left:`${pr(i,1)*100}%`, color:CONFETTI_COLORS[i%CONFETTI_COLORS.length],
    delay:`${pr(i,2)*2.2}s`, duration:`${2.2+pr(i,3)*2}s`, size:`${6+pr(i,4)*9}px`, isCircle:i%3===0,
  })),[])
  return <>{pieces.map(p=><div key={p.id} className={`confetti-piece${p.isCircle?' circle':''}`} style={{left:p.left,top:'-20px',width:p.size,height:p.size,background:p.color,'--delay':p.delay,'--dur':p.duration}}/>)}</>
}

function UnlockToast({planets,onClose}) {
  return (<><Confetti/><div className="unlock-overlay"><div className="unlock-card"><OrbiCelebration/><h2 className="unlock-title">¡Planeta desbloqueado!</h2>{planets.map(p=><p key={p} className="unlock-planet">{PLANET_NAMES[p]||p}</p>)}<button className="unlock-btn" onClick={onClose}>¡Genial!</button></div></div></>)
}

function OrbiCelebration() {
  return (<svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="unlock-orbi"><defs><radialGradient id="oc-body" cx="34%" cy="34%"><stop offset="0%" stopColor="#eacfff"/><stop offset="55%" stopColor="#c77dff"/><stop offset="100%" stopColor="#4a0e8f"/></radialGradient></defs><circle cx="40" cy="42" r="27" fill="url(#oc-body)"/><ellipse cx="40" cy="42" rx="35" ry="8.5" stroke="rgba(255,215,80,0.65)" strokeWidth="3.5" fill="none"/><ellipse cx="30" cy="39" rx="7" ry="7.5" fill="white"/><ellipse cx="50" cy="39" rx="7" ry="7.5" fill="white"/><circle cx="32" cy="41" r="4" fill="#1a0533"/><circle cx="52" cy="41" r="4" fill="#1a0533"/><circle cx="33.5" cy="39" r="1.8" fill="white"/><circle cx="53.5" cy="39" r="1.8" fill="white"/><path d="M28 52 Q40 63 52 52" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/><line x1="32" y1="17" x2="28" y2="7" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/><circle cx="27" cy="5" r="3.5" fill="#ffd60a"/><line x1="48" y1="17" x2="52" y2="7" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/><circle cx="53" cy="5" r="3.5" fill="#ffd60a"/><path d="M10,22 L11.5,17 L13,22 L18,23.5 L13,25 L11.5,30 L10,25 L5,23.5 Z" fill="#ffd60a" opacity="0.9"/><path d="M65,18 L66.2,14 L67.5,18 L71.5,19.2 L67.5,20.5 L66.2,24.5 L65,20.5 L61,19.2 Z" fill="#ffd60a" opacity="0.8"/><path d="M70,58 L71,55 L72,58 L75,59 L72,60 L71,63 L70,60 L67,59 Z" fill="white" opacity="0.6"/></svg>)
}

function App() {
  const [player, setPlayer]               = useState(null)
  const [currentGame, setCurrentGame]     = useState(null)
  const [showProfile, setShowProfile]     = useState(false)
  const [unlockAlert, setUnlockAlert]     = useState(null)
  const [showDashboard, setShowDashboard] = useState(false)

  const handleStart = async (name) => {
    try {
      const res = await fetch(`${API}/api/player/${encodeURIComponent(name)}`)
      const data = await res.json()
      setPlayer(data)
    } catch {
      setPlayer({ name, scores:{}, unlockedPlanets:['matematica','linguistica'] })
    }
  }

  const addScore = useCallback(async (planet, points) => {
    if (!player) return
    try {
      const res = await fetch(`${API}/api/player/${encodeURIComponent(player.name)}/score`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ planet, points }),
      })
      const data = await res.json()
      setPlayer(data.player)
      if (data.newlyUnlocked?.length > 0) setUnlockAlert(data.newlyUnlocked)
    } catch {}
  }, [player])

  const back = () => setCurrentGame(null)

  if (!player) return <Welcome onStart={handleStart} />
  if (showProfile) return <MyPlanet player={player} onBack={() => setShowProfile(false)} />

  if (currentGame === 'matematica')    return <MonsterGame  childName={player.name} onBack={back} onScore={pts => addScore('matematica',    pts)} />
  if (currentGame === 'linguistica')   return <VerbumGame   childName={player.name} onBack={back} onScore={pts => addScore('linguistica',   pts)} />
  if (currentGame === 'naturalista')   return <TerraGame    childName={player.name} onBack={back} onScore={pts => addScore('naturalista',   pts)} />
  if (currentGame === 'musical')       return <SonusGame    childName={player.name} onBack={back} onScore={pts => addScore('musical',       pts)} />
  if (currentGame === 'espacial')      return <PrismaGame   childName={player.name} onBack={back} onScore={pts => addScore('espacial',      pts)} />
  if (currentGame === 'cinestetica')   return <KinetisGame  childName={player.name} onBack={back} onScore={pts => addScore('cinestetica',   pts)} />
  if (currentGame === 'interpersonal') return <NexusGame    childName={player.name} onBack={back} onScore={pts => addScore('interpersonal', pts)} />
  if (currentGame === 'intrapersonal') return <LumisGame    childName={player.name} onBack={back} onScore={pts => addScore('intrapersonal', pts)} />

  return (
    <>
      <SolarSystem
        childName={player.name}
        unlockedPlanets={player.unlockedPlanets}
        scores={player.scores}
        onSelectPlanet={id => setCurrentGame(id)}
        onOpenDashboard={() => setShowDashboard(true)}
        onOpenProfile={() => setShowProfile(true)}
      />
      {unlockAlert && <UnlockToast planets={unlockAlert} onClose={() => setUnlockAlert(null)} />}
      {showDashboard && <ParentalDashboard playerName={player.name} onClose={() => setShowDashboard(false)} />}
    </>
  )
}

export default App
