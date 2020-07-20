const { authSecret } = require('../.env')
const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')
const db = require('./database')

module.exports = app => {
    const signin = async (req, res) => {
        
        if (!req.body.email || !req.body.password) {
            return res.status(400).send('Email e/ou senha não informados')
        }
        
        const user = await db('users')
        .where({email: req.body.email})
        .first()
        if (!user) {
            return res.status(400).send('Usuário não encontrado')
        }

        const isMatch = bcrypt.compareSync(req.body.password, user.password)
        if (!isMatch) {
            return res.status(401).send('Email/Senha inválidos')
        }

        const now = Math.floor(Date.now() / 1000)

        const payload = {
            id: user.id,
            nivel: user.nivel,
            admin: user.admin,
            nome: user.nome,
            email: user.email,
            cnes: user.cnes,
            iat: now,
            exp: now + (60 * 60 * 6 * 1) // seg * min * hor * dias
        }

        console.log(payload)

        res.json({
            ...payload,
            token: jwt.encode(payload, authSecret)
        })
    }

    const validateToken = async (req, res) => {
        const userData = req.body || null
        try {
            if (userData) {
                const token = jwt.decode(userData.token, authSecret)
                if (new Date(token.exp * 1000) > new Date()) {
                    return res.send(true)
                }
            }
        }
        catch (e) {
            // problema com o token          
        }

        res.send(false)

    }

    return { signin, validateToken }
}