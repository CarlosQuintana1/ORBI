const express = require('express')
const router = express.Router()

router.post('/generate', async (req, res) => {
  const { childName, topic = 'aventura espacial' } = req.body

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Crea una historia corta y divertida de máximo 4 oraciones para un niño de 6 a 10 años llamado ${childName}. La historia debe ser sobre ${topic} en un mundo espacial mágico. Usa lenguaje simple y emocionante. Solo devuelve la historia, sin títulos ni explicaciones.`
            }]
          }]
        })
      }
    )

    const data = await response.json()
    console.log('GEMINI RESPONSE:', JSON.stringify(data))

    if (!data.candidates || data.candidates.length === 0) {
      return res.status(500).json({ error: 'Sin respuesta de Gemini', detail: data })
    }

    const story = data.candidates[0].content.parts[0].text
    res.json({ story })

  } catch (err) {
    console.log('ERROR GEMINI:', err)
    res.status(500).json({ error: 'Error generando historia' })
  }
})

router.post('/speak', async (req, res) => {
  const { text } = req.body

  try {
    const response = await fetch(
      'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.8 }
        })
      }
    )

    const audioBuffer = await response.arrayBuffer()
    res.set('Content-Type', 'audio/mpeg')
    res.send(Buffer.from(audioBuffer))

  } catch (err) {
    console.log('ERROR ELEVENLABS:', err)
    res.status(500).json({ error: 'Error generando audio' })
  }
})

module.exports = router