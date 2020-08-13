const db = require('../config/database')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {authSecret} = require('../../.env')

class userController {
    async create(req, res) {
        const user = {...req.body}
                   
        const checkEmail = await db('users').select('email').where({'email': user.email}).first()
        if (checkEmail) {
            return res.status(400).send({message: 'E-mail já cadastrado'})
        }

        const checkCpf = await db('users').select('cpf').where({'cpf': user.cpf}).first()
        if (checkCpf) {
            return res.status(400).send({message: 'CPF já cadastrado'})
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
            let token = jwt.sign(payload, authSecret, { expiresIn: '1h' })  
            res.json(
                { 
                    token: token,
                    msg: 'Usuário cadastrado com sucesso!'
                }
            )            
        })
        .catch(err => res.status(500).send(err.message))
    }
    
    async update(req, res) {
        const user = {...req.body}
        const id = req.params.id
        await db('users').update(user)
        .where({'id': id})
        .then(result => res.status(200).send('Sucesso'))
        .catch(err => res.status(400).send(err.message))
    }

    async all(req, res) {
        await db('users').select('id', 'nome', 'email', 'admin', 'nivel', 'ativo')
        .orderBy('nome', 'desc')
        .then(lista => res.json(lista))
        .catch(err => res.status(500).send(err.message))
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
                res.status(500).send({message: 'Usuário não existe'})
            }
        })
        .catch(err => res.status(500).send(err.message))
    }

    async login(req, res) {        
        const email = req.body.email
        const password = req.body.password
        await db('users').select('id', 'nome', 'email', 'password', 'admin', 'nivel', 'ativo', 'cnes')
        .where({'email': email}).first()
        .then(resultado => {
            if (resultado) {
                if (bcrypt.compareSync(password, resultado.password)) {
                    const payload = {
                        id: resultado.id,
                        nome: resultado.nome,
                        nivel: resultado.nivel,
                        admin: resultado.admin,
                        cnes: resultado.cnes
                    }                    
                    jwt.sign(payload, authSecret, { expiresIn: '1h' }, (err, token) => {
                        res.json({token: token})                  
                    })                    
                }
                else {
                    res.status(500).send({message: 'Senha não confere'})
                }
            }
            else {
                res.status(500).send({message: 'Usuário não existe'})
            }
        })
        .catch(err => res.status(500).send(err.message))
    }

    async verifyToken(req, res) {
        const token = req.body.token
        jwt.verify(token, authSecret, (err, decoded) => {
            if (err) {
                res.status(401).send(false)
            }
            else {
                res.status(200).send(true)
            }
        })
    }
}

module.exports = new userController()