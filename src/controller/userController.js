const db = require('../config/database')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authSecret = require('../../.env')

class userController {
    async create(req, res) {
        const user = {...req.body}
                   
        const checkEmail = await db('users').select('email').where({'email': user.email}).first()
        if (checkEmail) {
            return res.status(400).send('E-mail já cadastrado')
        }

        const hashedPassword = await bcrypt.hash(user.password, 10)
        user.password = hashedPassword
        
        await db('users').insert(user)
        .then(userId => {
            const payload = {
                id: userId,
                nome: user.nome,
                nivel: user.nivel,
                admin: user.admin,
                cnes: user.cnes
            }
            jwt.sign(payload, authSecret, { expiresIn: '1h' }, (err, token) => {
                if (err) {
                    res.status(400).send(err)
                }
                res.status(200).json({token: token}).send('Usuário cadastrado com sucesso')                
            })            
            
        })
        .catch(err => res.status(500).send(err))
    }
    
    async update(req, res) {
        const user = {...req.body}
        const id = req.params.id
        await db('users').update(user)
        .where({'id': id})
        .then(result => res.status(200).send('Sucesso'))
        .catch(err => res.status(400).send(err))
    }

    async all(req, res) {
        await db('users').select('id', 'nome', 'email', 'admin', 'nivel', 'ativo')
        .orderBy('nome', 'desc')
        .then(lista => res.json(lista))
        .catch(err => res.status(500).send(err))
    }

    async get(req, res) {
        const id = req.params.id
        await db('users').select('id', 'nome', 'email', 'admin', 'nivel', 'ativo')
        .where({'id': id}).first()
        .then(resultado => {
            if (resultado) {
                res.json(resultado)
            }
            else {
                res.status(500).send('Usuário não existe')
            }
        })
        .catch(err => res.status(500).send(err))
    }

    async login(req, res) {
        const email = req.body.email
        const password = req.body.password
        await db('users').select('id', 'nome', 'email', 'password', 'admin', 'nivel', 'ativo')
        .where({'email': email}).first()
        .then(resultado => {
            if (resultado) {
                if (bcrypt.compareSync(password, resultado.password)) {
                    const payload = {
                        id: resultado.id,
                        nome: resultado.nome,
                        nivel: resultado,nivel,
                        admin: resultado.admin,
                        cnes: resultado.cnes
                    }
                    jwt.sign(payload, authSecret, { expiresIn: '1h' }, (err, token) => {
                        if (err) {
                            res.status(400).send(err)
                        }
                        res.status(200).json({token: token}).send('Usuário autenticado com sucesso')                   
                    })                    
                }
                else {
                    res.status(500).send('Senha não confere')
                }
            }
            else {
                res.status(500).send('Usuário não existe')
            }
        })
        .catch(err => res.status(500).send(err))
    }
}

module.exports = new userController()