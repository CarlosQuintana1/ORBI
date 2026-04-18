const express = require('express')
const router  = express.Router()

const PROMPT = `Eres Orbi, un guía de naturaleza para niños de 6-10 años. Analiza la imagen.

Si ves un animal, insecto, planta u otro ser vivo, responde SOLO con este JSON (sin texto extra):
{
  "found": true,
  "animal": "nombre común del ser vivo en español",
  "emoji": "un emoji que lo represente",
  "fact": "un dato curioso, divertido y educativo de 1-2 oraciones en español, apropiado para niños de 6 años"
}

Si NO hay ningún ser vivo visible, responde SOLO con:
{"found": false, "message": "¡No veo ningún animal! Apunta la cámara a un animal, insecto o planta 🔍"}`

router.post('/identify', async (req, res) => {
  const { image } = req.body
  if (!image) return res.status(400).json({ found: false, message: 'No se recibió imagen.' })

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: 'image/jpeg', data: image } },
              { text: PROMPT }
            ]
          }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 300 }
        })
      }
    )

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return res.json({ found: false, message: '¡Ups! No pude analizar. Intenta de nuevo.' })

    res.json(JSON.parse(match[0]))
  } catch (err) {
    console.error('TERRA ERROR:', err)
    res.status(500).json({ found: false, message: 'Error al identificar. Intenta de nuevo.' })
  }
})

module.exports = router
