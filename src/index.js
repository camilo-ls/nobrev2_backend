const express = require('express')
const cors = require('cors')
const server = express()

server.use(cors())
server.use(express.json())

const userRoutes = require('./routes/userRoutes')
server.use('/user', userRoutes)

const cnesRoutes = require('./routes/cnesRouter')
server.use('/cnes', cnesRoutes)

const profRoutes = require('./routes/profRouter')
server.use('/prof', profRoutes)

server.get('/teste', (req, res) => {
    res.send('API funcionando')
})

server.listen(3001, () => {
    console.log('> Servidor online')
})