const express = require('express')
const cors = require('cors')
const server = express()

server.use(cors())
server.use(express.json())

const userRoutes = require('./routes/userRoutes')
server.use('/user', userRoutes)

server.get('/teste', (req, res) => {
    res.send('API funcionando')
})

server.listen(3000, () => {
    console.log('> Servidor online')
})