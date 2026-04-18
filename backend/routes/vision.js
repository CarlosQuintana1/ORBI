const express = require('express')
const router  = express.Router()

// POST /api/vision/identify — Gemini Vision multimodal for Terra planet
router.post('/identify', async (req, res) => {
  const { image } = req.body
  if (!image) return res.status(400).json({ found: false, message: 'No se recibió imagen.' })

  const prompt = `Eres Orbi, explorador espacial amigable para niños de 6-10 años. Analiza esta imagen.

Si ves un animal, insecto, planta u otro ser vivo, responde SOLO con este JSON (sin texto extra):
{
  "found": true,
  "animal": "nombre común en español",
  "emoji": "emoji que lo represente",
  "fact": "UN dato curioso divertido en máximo 3 oraciones simples en español, apropiado para niños de 6 años"
}

Si NO hay ningún ser vivo visible, responde SOLO con:
{"found": false, "message": "¡No veo ningún ser vivo! Apunta la cámara a un animal, insecto o planta."}`

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
              { text: prompt },
            ],
          }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 300 },
        }),
      }
    )

    const data  = await response.json()
    const text  = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return res.json({ found: false, message: '¡Ups! No pude analizar. Intenta de nuevo.' })
    res.json(JSON.parse(match[0]))
  } catch (err) {
    console.error('VISION ERROR:', err)
    res.status(500).json({ found: false, message: 'Error al identificar. Intenta de nuevo.' })
  }
})

module.exports = router
