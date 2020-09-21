const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const bodyParser = require('body-parser')

const server = express()

// Middlewares
server.use(cors())
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: false }))

// Redirecionamento de rotas:
const statRouter = require('./routes/statRouter')
server.use('/nobre/api/stat', statRouter)

const pactRoutes = require('./routes/pactRouter')
server.use('/nobre/api/pact', pactRoutes)

const authRoutes = require('./routes/authRouter')
server.use('/nobre/api/auth', authRoutes)

const userRoutes = require('./routes/userRoutes')
server.use('/nobre/api/user', userRoutes)

const cnesRoutes = require('./routes/cnesRouter')
server.use('/nobre/api/cnes', cnesRoutes)

const profRoutes = require('./routes/profRouter')
server.use('/nobre/api/prof', profRoutes)

const cboRoutes = require('./routes/cboRouter')
server.use('/nobre/api/cbo', cboRoutes)

// Atividades programadas:
const renovarMetasDefault = require('./scheduled/renovarMetasDefault')
renovarMetasDefault()

server.get('/nobre/api/teste', (req, res) => {
    res.send('API funcionando')
})

server.listen(3001, () => {
    console.log('> Servidor online')
})