const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const bodyParser = require('body-parser')

const server = express()

// Middlewares
server.use(cors())
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: false }))

const pactRoutes = require('./routes/pactRouter')
server.use('/pact', pactRoutes)

const authRoutes = require('./routes/authRouter')
server.use('/auth', authRoutes)

const userRoutes = require('./routes/userRoutes')
server.use('/user', userRoutes)

const cnesRoutes = require('./routes/cnesRouter')
server.use('/cnes', cnesRoutes)

const profRoutes = require('./routes/profRouter')
server.use('/prof', profRoutes)

const cboRoutes = require('./routes/cboRouter')
server.use('/cbo', cboRoutes)

server.get('/teste', (req, res) => {
    res.send('API funcionando')
})

server.listen(3001, () => {
    console.log('> Servidor online')
})