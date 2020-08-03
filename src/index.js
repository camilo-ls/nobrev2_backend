const express = require('express')
const cors = require('cors')
const passport = require('passport')
const passportLocal = require('passport-local').Strategy
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs')
const session = require('express-session')
const bodyParser = require('body-parser')
const authSecret = require('./.env')

const server = express()

// Middlewares
server.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))
server.use(express.json())
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))
server.use(session({
    secret: authSecret,
    resave: true,
    saveUninitialized: true
}))

server.use(cookieParser(authSecret))

server.post('/login', (req, res) => {
    console.log(req.body)
})

server.post('/register', (req, res) => {
    console.log(req.body)
})

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