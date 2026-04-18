const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const storyRouter  = require('./routes/story')
const playerRouter = require('./routes/player')
const terraRouter  = require('./routes/terra')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/story',  storyRouter)
app.use('/api/player', playerRouter)
app.use('/api/terra',  terraRouter)

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch((err) => console.log('Error MongoDB:', err))

app.get('/', (req, res) => {
  res.json({ message: 'Orbi API funcionando' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})