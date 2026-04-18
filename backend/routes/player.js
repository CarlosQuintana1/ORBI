const express = require('express')
const router  = express.Router()
const Player  = require('../models/Player')

// Thresholds bajos para demo — fácil de alcanzar en presentación
const UNLOCK_RULES = [
  { planet: 'naturalista',   requires: 'matematica',    threshold: 10 }, // 1 acierto en Kálculo
  { planet: 'espacial',      requires: 'matematica',    threshold: 20 },
  { planet: 'musical',       requires: 'linguistica',   threshold: 20 },
  { planet: 'cinestetica',   requires: 'espacial',      threshold: 20 },
  { planet: 'interpersonal', requires: 'naturalista',   threshold: 20 },
  { planet: 'intrapersonal', requires: 'interpersonal', threshold: 20 },
]

const PLANET_LABELS = {
  matematica:    { name: 'Kalculu', emoji: '🔢', intelligence: 'Lógico-Matemática' },
  linguistica:   { name: 'Verbum',  emoji: '📖', intelligence: 'Lingüístico-Verbal' },
  naturalista:   { name: 'Terra',   emoji: '🌿', intelligence: 'Naturalista' },
  espacial:      { name: 'Prisma',  emoji: '🎨', intelligence: 'Visual-Espacial' },
  musical:       { name: 'Sonus',   emoji: '🎵', intelligence: 'Musical' },
  cinestetica:   { name: 'Kinetis', emoji: '🏃', intelligence: 'Corporal-Cinestésica' },
  interpersonal: { name: 'Nexus',   emoji: '🤝', intelligence: 'Interpersonal' },
  intrapersonal: { name: 'Lumis',   emoji: '🧘', intelligence: 'Intrapersonal' },
}

function checkUnlocks(player) {
  const newlyUnlocked = []
  for (const rule of UNLOCK_RULES) {
    if (!player.unlockedPlanets.includes(rule.planet) &&
        (player.scores[rule.requires] || 0) >= rule.threshold) {
      player.unlockedPlanets.push(rule.planet)
      newlyUnlocked.push(rule.planet)
    }
  }
  return newlyUnlocked
}

// GET /api/player/:name — obtener o crear jugador
router.get('/:name', async (req, res) => {
  try {
    const name = req.params.name.trim().toLowerCase()
    let player = await Player.findOne({ name })
    if (!player) player = await Player.create({ name })
    res.json(player)
  } catch {
    res.status(500).json({ error: 'Error al obtener jugador' })
  }
})

// POST /api/player/:name/score — sumar puntos
router.post('/:name/score', async (req, res) => {
  const { planet, points } = req.body
  if (!planet || typeof points !== 'number') {
    return res.status(400).json({ error: 'Faltan planet o points' })
  }
  try {
    const name = req.params.name.trim().toLowerCase()
    let player = await Player.findOne({ name })
    if (!player) player = await Player.create({ name })

    player.scores[planet] = (player.scores[planet] || 0) + points
    const newlyUnlocked = checkUnlocks(player)
    await player.save()
    res.json({ player, newlyUnlocked })
  } catch {
    res.status(500).json({ error: 'Error al guardar puntaje' })
  }
})

// GET /api/player/:name/report — reporte parental con Gemini
router.get('/:name/report', async (req, res) => {
  try {
    const name   = req.params.name.trim().toLowerCase()
    const player = await Player.findOne({ name })
    if (!player) return res.status(404).json({ error: 'Jugador no encontrado' })

    const activeScores = Object.entries(player.scores)
      .filter(([, v]) => v > 0)
      .map(([id, score]) => {
        const label = PLANET_LABELS[id]
        return `${label?.intelligence || id} (${score} puntos)`
      })
      .join(', ')

    const unlocked = player.unlockedPlanets
      .map(id => PLANET_LABELS[id]?.name || id)
      .join(', ')

    const prompt = activeScores.length > 0
      ? `Eres un psicólogo educativo experto en las Inteligencias Múltiples de Howard Gardner.
El niño se llama ${player.name}. En la app Orbi obtuvo: ${activeScores}.
Planetas desbloqueados: ${unlocked}.
Escribe un reporte de 3-4 oraciones para sus padres que:
1. Destaque la(s) inteligencia(s) donde muestra más fortaleza
2. Sugiera 1-2 actividades concretas del mundo real para potenciar esas habilidades
3. Use un tono cálido, positivo y motivador
Solo el reporte, sin títulos.`
      : `El niño se llama ${player.name} y acaba de comenzar a usar Orbi, la app de Inteligencias Múltiples.
Escribe un mensaje motivador de 2-3 oraciones para sus padres diciéndoles qué pueden esperar del proceso.`

    const gemini = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 250 }
        })
      }
    )

    const gData  = await gemini.json()
    const report = gData.candidates?.[0]?.content?.parts?.[0]?.text || ''

    res.json({ player, report, planetLabels: PLANET_LABELS })
  } catch (err) {
    console.error('REPORT ERROR:', err)
    res.status(500).json({ error: 'Error generando reporte' })
  }
})

module.exports = router
