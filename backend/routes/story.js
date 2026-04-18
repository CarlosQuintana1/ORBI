const express = require('express')
const router = express.Router()

async function callGemini(prompt, temperature = 0.7, maxTokens = 300, disableThinking = false) {
  const generationConfig = { temperature, maxOutputTokens: maxTokens }
  if (disableThinking) generationConfig.thinkingConfig = { thinkingBudget: 0 }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig,
      }),
    }
  )
  const data = await res.json()
  if (!data.candidates?.length) throw new Error('Sin respuesta de Gemini')
  const parts = data.candidates[0].content.parts
  const textPart = parts.find(p => !p.thought) || parts[0]
  return textPart.text.trim()
}

// ── Story generation ──────────────────────────────────────────────
router.post('/generate', async (req, res) => {
  const { childName, topic = 'aventura espacial', level = 1 } = req.body
  const sentences = level === 1 ? 2 : level === 2 ? 3 : 4
  const wordLimit = level === 1 ? '10 a 16 palabras en total' : level === 2 ? '25 a 35 palabras en total' : '45 a 60 palabras en total'
  const vocab     = level === 1
    ? `palabras MUY simples (colores, animales, acciones básicas). Ejemplo: "${childName} vio una estrella. Era muy brillante."`
    : level === 2
    ? `palabras que un niño de 8 años conoce. Ejemplo: "${childName} encontró un cohete azul. Voló hasta la luna. Allí saludó a un robot."`
    : `vocabulario variado e interesante. Ejemplo: "${childName} descubrió un planeta oculto. Las estrellas iluminaban su camino. Encontró criaturas de luz. Juntos exploraron el universo."`
  try {
    const story = await callGemini(
      `Escribe EXACTAMENTE ${sentences} oraciones sobre: ${topic}, en un mundo espacial, con el personaje ${childName}. Usa ${vocab} Total: ${wordLimit}. REGLAS: ${sentences} oraciones con punto, sin títulos ni asteriscos, devuelve SOLO las oraciones.`,
      0.75, 2500
    )
    res.json({ story })
  } catch (err) {
    console.log('ERROR story/generate:', err)
    res.status(500).json({ error: 'Error generando historia' })
  }
})

// ── ElevenLabs TTS with word timestamps ──────────────────────────
router.post('/speak-with-timing', async (req, res) => {
  const { text } = req.body
  if (!text) return res.status(400).json({ error: 'Falta texto' })
  try {
    const response = await fetch(
      'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM/with-timestamps',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'xi-api-key': process.env.ELEVENLABS_API_KEY },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true },
          speed: 0.85,
        }),
      }
    )
    if (!response.ok) {
      const errText = await response.text()
      console.error('ElevenLabs timing error', response.status, errText.slice(0, 200))
      return res.status(500).json({ error: `ElevenLabs ${response.status}` })
    }
    const data = await response.json()
    const { characters, character_start_times_seconds, character_end_times_seconds } = data.alignment

    // Build word-level timings from character alignment
    const words = []
    let word = '', wordStart = null, lastEnd = 0
    for (let i = 0; i < characters.length; i++) {
      const ch = characters[i]
      if (ch === ' ' || ch === '\n') {
        if (word) { words.push({ word, start: wordStart, end: lastEnd }); word = ''; wordStart = null }
      } else {
        if (!word) wordStart = character_start_times_seconds[i]
        word += ch
        lastEnd = character_end_times_seconds[i]
      }
    }
    if (word) words.push({ word, start: wordStart, end: lastEnd })

    res.json({ audio: data.audio_base64, words })
  } catch (err) {
    console.error('ERROR speak-with-timing:', err)
    res.status(500).json({ error: 'Error generando audio con tiempos' })
  }
})

// ── ElevenLabs STT — transcribe audio blob ────────────────────────
router.post('/transcribe', async (req, res) => {
  const { audio, mimeType = 'audio/webm' } = req.body
  if (!audio) return res.status(400).json({ error: 'Falta audio' })
  try {
    const buffer   = Buffer.from(audio, 'base64')
    const formData = new FormData()
    formData.append('file', new Blob([buffer], { type: mimeType }), 'recording.webm')
    formData.append('model_id', 'scribe_v1')
    formData.append('language_code', 'es')

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY },
      body: formData,
    })
    const data = await response.json()
    console.log('STT response:', JSON.stringify(data).slice(0, 200))
    res.json({ text: data.text || '' })
  } catch (err) {
    console.error('STT error:', err)
    res.status(500).json({ error: 'Error transcribiendo audio' })
  }
})

// ── ElevenLabs TTS ────────────────────────────────────────────────
router.post('/speak', async (req, res) => {
  const { text } = req.body
  if (!text) return res.status(400).json({ error: 'Falta texto' })
  try {
    const response = await fetch(
      'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'xi-api-key': process.env.ELEVENLABS_API_KEY },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true },
          speed: 0.85,
        }),
      }
    )
    if (!response.ok) {
      const errText = await response.text()
      console.error('ElevenLabs TTS error', response.status, errText.slice(0, 300))
      return res.status(500).json({ error: `ElevenLabs ${response.status}`, detail: errText.slice(0, 200) })
    }
    const audioBuffer = await response.arrayBuffer()
    res.set('Content-Type', 'audio/mpeg')
    res.send(Buffer.from(audioBuffer))
  } catch (err) {
    console.error('ERROR elevenlabs speak:', err)
    res.status(500).json({ error: 'Error generando audio' })
  }
})

// ── Reading evaluation ────────────────────────────────────────────
router.post('/evaluate-reading', async (req, res) => {
  const { original, spoken, childName } = req.body
  if (!original || !spoken) return res.status(400).json({ error: 'Faltan datos' })

  const origWords   = original.toLowerCase().replace(/[^a-záéíóúüñ\s]/gi, '').split(/\s+/).filter(Boolean)
  const spokenWords = spoken.toLowerCase().replace(/[^a-záéíóúüñ\s]/gi, '').split(/\s+/).filter(Boolean)
  const matched     = spokenWords.filter(w => origWords.includes(w)).length
  const accuracy    = Math.min(100, Math.round((matched / origWords.length) * 100))
  const stars       = accuracy >= 90 ? 5 : accuracy >= 75 ? 4 : accuracy >= 55 ? 3 : accuracy >= 35 ? 2 : 1

  try {
    const level = stars === 5
      ? `PERFECTO (${accuracy}%). Reacción: EXPLOSIVA de emoción. Usa el nombre "${childName}" mínimo 2 veces. Empieza con una exclamación impactante tipo "¡¡INCREÍBLE!!", "¡¡ASOMBROSO!!" o "¡¡WOW WOW WOW!!". Dile que es el mejor lector del universo, que las estrellas tiemblan de emoción. Muy exagerado y divertido.`
      : stars === 4
      ? `MUY BIEN (${accuracy}%). Reacción: muy emocionada. Usa el nombre "${childName}". Empieza con "¡GENIAL!" o "¡FANTÁSTICO!". Dile que lo hizo súper bien y que está muy orgulloso de él/ella.`
      : stars === 3
      ? `BIEN (${accuracy}%). Reacción: animada y positiva. Usa el nombre "${childName}". Celébralo pero anímalo a intentarlo una vez más para hacerlo aún mejor.`
      : `BAJO (${accuracy}%). Reacción: súper dulce y alentadora. Usa el nombre "${childName}". Dile que está bien, que todos aprenden poco a poco, y que juntos lo van a lograr.`
    const feedback = await callGemini(
      `Eres Orbi, el robot espacial amigo de ${childName} (niño de 6-10 años). Escribe EXACTAMENTE 2 oraciones de feedback sobre su lectura. ${level} Tono: infantil, divertido, con energía espacial. Sin títulos, solo las 2 oraciones.`,
      0.85, 300, true
    )
    res.json({ score: accuracy, stars, feedback, wordsCorrect: matched, totalWords: origWords.length })
  } catch {
    res.json({ score: accuracy, stars, feedback: `¡Increíble, ${childName}! ¡Eres un lector espacial de otro planeta!`, wordsCorrect: matched, totalWords: origWords.length })
  }
})

// ── Orbi conversation ─────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  const { message, childName, unlockedPlanets = [], scores = {}, history = [] } = req.body
  if (!message) return res.status(400).json({ error: 'Falta mensaje' })

  const totalStars    = Object.values(scores).reduce((a, b) => a + b, 0)
  const planetCount   = unlockedPlanets.length
  const PLANET_NAMES  = {
    matematica: 'Kalculu', linguistica: 'Verbum', naturalista: 'Terra',
    espacial: 'Prisma', musical: 'Sonus', cinestetica: 'Kinetis',
    interpersonal: 'Nexus', intrapersonal: 'Lumis',
  }
  const planetList = unlockedPlanets.map(p => PLANET_NAMES[p] || p).join(', ')

  const topPlanet = Object.entries(scores).sort(([,a],[,b]) => b - a)[0]
  const topStr    = topPlanet ? ` Su inteligencia más fuerte es ${PLANET_NAMES[topPlanet[0]] || topPlanet[0]}.` : ''
  const systemCtx = `Eres Orbi, un pequeño planeta-robot amigable, sabio y juguetón. Hablas con ${childName}, un niño/a de 6-10 años. REGLAS ABSOLUTAS: (1) NUNCA empieces con saludos como "¡Hola!", "¡Hola ${childName}!" o similares — ya saludaste al inicio, no repitas el saludo. (2) Ve directo a responder la pregunta con la respuesta CORRECTA y COMPLETA. (3) Escribe EXACTAMENTE 2-3 oraciones completas, nunca menos. (4) Usa lenguaje simple, divertido y espacial. (5) NUNCA respondas con una sola letra, número suelto o frase incompleta. (6) Termina SIEMPRE con una frase corta y motivadora sobre lo importante que es aprender. ${childName} tiene ${planetCount} planetas desbloqueados (${planetList || 'aún explorando'}) y ${totalStars} estrellas.${topStr}`

  const historyText = history.slice(-6).map(m =>
    `${m.from === 'user' ? childName : 'Orbi'}: ${m.text}`
  ).join('\n')

  const fullPrompt = `${systemCtx}\n\nConversación reciente:\n${historyText}\n\n${childName}: ${message}\nOrbi:`

  try {
    const reply = await callGemini(fullPrompt, 0.8, 2000, true)
    res.json({ reply })
  } catch (err) {
    console.log('ERROR chat:', err)
    res.status(500).json({ error: 'Error en conversación' })
  }
})

// ── Adaptive session tip ──────────────────────────────────────────
router.post('/session-tip', async (req, res) => {
  const { childName, planet, pointsEarned, totalScore, accuracy = null } = req.body
  const PLANET_INTEL = {
    matematica: 'lógico-matemática', linguistica: 'lingüístico-verbal',
    naturalista: 'naturalista', espacial: 'visual-espacial',
    musical: 'musical', cinestetica: 'corporal-cinestésica',
    interpersonal: 'interpersonal', intrapersonal: 'intrapersonal',
  }
  const intel = PLANET_INTEL[planet] || planet
  const performance = pointsEarned >= 40 ? 'excelente' : pointsEarned >= 20 ? 'buena' : 'en progreso'
  const accuracyLine = accuracy !== null ? ` con ${accuracy}% de precisión` : ''

  try {
    const tip = await callGemini(
      `Eres Orbi. ${childName} acaba de terminar una sesión de inteligencia ${intel} con desempeño ${performance}${accuracyLine} (${pointsEarned} pts, total: ${totalScore} pts). Escribe UN consejo muy corto (1 oración) y motivador para que ${childName} siga mejorando esta inteligencia. Diríjete directamente al niño. Tono: alegre y espacial.`,
      0.75, 200, true
    )
    res.json({ tip })
  } catch {
    res.json({ tip: `¡Sigue explorando ${intel}, ${childName}!` })
  }
})

// ── Parent report (structured JSON) ──────────────────────────────
router.post('/parent-report', async (req, res) => {
  const { childName, scores = {}, unlockedPlanets = [], totalStars = 0, sessionHistory = [] } = req.body

  const LABELS = {
    matematica: 'Lógico-Matemática', linguistica: 'Lingüístico-Verbal',
    naturalista: 'Naturalista',       espacial:    'Visual-Espacial',
    musical:     'Musical',           cinestetica: 'Corporal-Cinestésica',
    interpersonal: 'Interpersonal',   intrapersonal: 'Intrapersonal',
  }

  const sorted      = Object.entries(scores).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a)
  const top3        = sorted.slice(0, 3).map(([k, v]) => `${LABELS[k]}: ${v} pts`)
  const weak        = sorted.slice(-2).filter(([, v]) => v < (sorted[0]?.[1] || 1) * 0.4)
                             .map(([k, v]) => `${LABELS[k]}: ${v} pts`)
  const notStarted  = Object.keys(LABELS).filter(k => !scores[k] || scores[k] === 0)
                             .map(k => LABELS[k])

  const totalSessions = sessionHistory.length
  const recentSess    = sessionHistory.slice(-20)
  const avgPts        = recentSess.length > 0
    ? Math.round(recentSess.reduce((a, s) => a + (s.pointsEarned || 0), 0) / recentSess.length) : 0
  const maxLevel      = recentSess.length > 0 ? Math.max(...recentSess.map(s => s.level || 1)) : 1

  const planetFreq = {}
  recentSess.forEach(s => { planetFreq[s.planet] = (planetFreq[s.planet] || 0) + 1 })
  const favPlanet   = Object.entries(planetFreq).sort(([, a], [, b]) => b - a)[0]
  const favLabel    = favPlanet ? `${LABELS[favPlanet[0]] || favPlanet[0]} (${favPlanet[1]} sesiones)` : null

  // Level progression: did the child advance levels?
  const levelsByPlanet = {}
  recentSess.forEach(s => {
    if (!levelsByPlanet[s.planet] || s.level > levelsByPlanet[s.planet]) levelsByPlanet[s.planet] = s.level
  })
  const advancedPlanets = Object.entries(levelsByPlanet).filter(([, l]) => l >= 2)
    .map(([k]) => LABELS[k] || k)

  const hasData = sorted.length > 0

  const context = hasData ? `
Niño/a: ${childName}
Estrellas totales acumuladas: ${totalStars}
Planetas desbloqueados: ${unlockedPlanets.length} de 8
Sesiones totales jugadas: ${totalSessions}
Promedio de puntos por sesión: ${avgPts}
Nivel máximo alcanzado: ${maxLevel} de 3
Planeta favorito (más jugado): ${favLabel || 'N/A'}
${advancedPlanets.length > 0 ? `Inteligencias donde avanzó de nivel: ${advancedPlanets.join(', ')}` : ''}
Inteligencias más fuertes (mayor puntaje): ${top3.join(' | ')}
${weak.length > 0 ? `Inteligencias con menor actividad: ${weak.join(' | ')}` : ''}
${notStarted.length > 0 ? `Inteligencias aún sin explorar: ${notStarted.slice(0, 4).join(', ')}` : ''}
`.trim() : `${childName} acaba de comenzar su aventura en Orbi. No hay sesiones previas.`

  const promptHasData = `Eres un psicólogo educativo experto en las Inteligencias Múltiples de Howard Gardner.

Datos reales del perfil de ${childName} en Orbi:

${context}

ACTIVIDADES DE REFERENCIA POR INTELIGENCIA (úsalas para las recomendaciones, sé específico/a):
- Lógico-Matemática → rompecabezas numéricos, juegos de estrategia (ajedrez, dominó), experimentos científicos en casa, app de código para niños (Scratch), sudoku infantil
- Lingüístico-Verbal → leer en voz alta juntos cada noche, crear un diario de aventuras, juegos de palabras (Scrabble Junior), inventar cuentos en familia, karaoke de canciones educativas
- Visual-Espacial → armar rompecabezas 3D o Lego, dibujar mapas de su cuarto/casa, origami, videojuegos de construcción (Minecraft), actividades de dibujo técnico
- Corporal-Cinestésica → clases de danza, deportes de equipo, manualidades y arcilla, teatro infantil, yoga para niños, circuitos de obstáculos en casa
- Musical → aprender un instrumento (ukulele, flauta dulce), cantar en casa, clases de percusión, escuchar y clasificar géneros musicales, crear canciones con letras propias
- Naturalista → huerto en casa o jardín, excursiones a parques/zoológicos, observación de estrellas, cuidado de una mascota, colectar hojas/rocas y clasificarlas
- Interpersonal → deportes de equipo, actividades de voluntariado, juegos de mesa en grupo, teatro o debate escolar, proyectos colaborativos con amigos
- Intrapersonal → diario personal ilustrado, meditación guiada para niños, establecer metas semanales con seguimiento, leer biografías de personas inspiradoras

Genera un reporte profesional. Devuelve ÚNICAMENTE un JSON válido (sin bloques markdown, sin texto fuera del JSON):

{
  "perfil": "Etiqueta breve del perfil dominante basada en las top 2 inteligencias (ej: 'Perfil Visual-Cinestésico')",
  "resumen": "3-4 oraciones analizando el perfil real: inteligencia dominante con su puntaje, nivel de compromiso (sesiones jugadas, nivel alcanzado), y qué dice esto sobre el estilo de aprendizaje del niño.",
  "fortalezas": [
    "Fortaleza 1: nombra la inteligencia específica, cita el puntaje real y explica qué habilidades concretas demuestra en la vida cotidiana",
    "Fortaleza 2: igual de específico con datos reales"
  ],
  "areas_desarrollo": [
    "Una inteligencia con menor actividad (cita cuál), explicando de forma positiva por qué desarrollarla complementaría su perfil actual"
  ],
  "recomendaciones": [
    "Actividad MUY ESPECÍFICA para potenciar la inteligencia más fuerte (usa las de la lista de referencia, menciona el nombre de la actividad y por qué encaja con su perfil)",
    "Actividad para explorar la inteligencia con menor puntaje o sin explorar (usa la lista de referencia, sé concreto)",
    "Hábito de rutina semanal que integre las fortalezas detectadas en la vida diaria del niño"
  ],
  "tendencia": "2 oraciones sobre el patrón observado: velocidad de progresión, consistencia entre sesiones, si avanzó de nivel y qué implica para su ritmo de aprendizaje.",
  "mensaje": "Mensaje cálido de cierre para los papás, mencionando el nombre del niño (1-2 oraciones)"
}`

  const promptNoData = `Eres Orbi, tutor espacial. ${childName} acaba de registrarse en Orbi pero aún no ha jugado.
Devuelve ÚNICAMENTE este JSON (sin markdown):
{
  "perfil": "Explorador Espacial",
  "resumen": "Mensaje de bienvenida cálido de 2-3 oraciones para los padres explicando qué es Orbi y qué van a descubrir.",
  "fortalezas": [],
  "areas_desarrollo": [],
  "recomendaciones": ["Explora los primeros planetas Kalculu y Verbum para comenzar a descubrir las inteligencias de ${childName}"],
  "tendencia": "¡La aventura acaba de comenzar!",
  "mensaje": "Mensaje motivador para los papás"
}`

  try {
    const raw   = await callGemini(hasData ? promptHasData : promptNoData, 0.65, 2000, true)
    const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const data  = JSON.parse(clean)
    res.json({ report: data })
  } catch (err) {
    console.error('ERROR parent-report:', err)
    res.json({ report: null, error: 'parse' })
  }
})

module.exports = router
