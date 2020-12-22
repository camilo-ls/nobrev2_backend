const db = require('../config/database')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {authSecret} = require('../../.env')

class userController {
    async create(req, res) {
        const user = {...req.body}
                   
        const checkEmail = await db('users').select('EMAIL').where({'EMAIL': user.email}).first()
        if (checkEmail) {
            return res.status(400).send({message: 'E-mail já cadastrado'})
        }

        const checkCpf = await db('users').select('CPF').where({'CPF': user.cpf}).first()
        if (checkCpf) {
            return res.status(400).send({message: 'CPF já cadastrado'})
        }

        const hashedPassword = await bcrypt.hash(user.password, 10)
        user.password = hashedPassword

        const user_cbo = await db('profissionais').select('CBO').where({'CPF': user.cpf}).first()
        if (user_cbo.CBO == 131210) user.nivel = 1
        
        await db('users').insert(user)
        .then(userId => { 
            res.json(
                { 
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
        .where({'ID': id})
        .then(result => res.status(200).send('Sucesso'))
        .catch(err => res.status(400).send(err.message))
    }

    async all(req, res) {
        await db('users').select('ID', 'NOME', 'EMAIL', 'ADMIN', 'NIVEL', 'ATIVO')
        .orderBy('NOME', 'desc')
        .then(lista => res.json(lista))
        .catch(err => res.status(500).send(err.message))
    }

    async get(req, res) {
        const id = req.params.id
        await db('users').select('ID', 'NOME', 'EMAIL', 'ADMIN', 'NIVEL', 'ATIVO')
        .where({'ID': id}).first()
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
        await db('users').select('ID', 'NOME', 'EMAIL', 'PASSWORD', 'ADMIN', 'NIVEL', 'ATIVO', 'CNES', 'CPF')
        .where({'EMAIL': email}).first()
        .then(async resultado => {
            if (resultado) {
                if (bcrypt.compareSync(password, resultado.PASSWORD)) {
                    await db('profissionais').select('CNS', 'VINC_ID')
                    .where({'CPF': resultado.CPF}).first()
                    .then(cns => {
                        const payload = {
                            id: resultado.VINC_ID,
                            nome: resultado.NOME,
                            nivel: resultado.NIVEL,
                            admin: resultado.ADMIN,
                            cnes: resultado.CNES,
                            cns: cns.CNS
                        }                    
                        jwt.sign(payload, authSecret, { expiresIn: '1h' }, (err, token) => {
                            res.json({token: token})                  
                        })                    
                    })
                    .catch(err => res.status(500).send({message: err.message}))                    
                }
                else {
                    res.status(500).send({message: 'Senha não confere'})
                }
            }
            else {
                res.status(500).send({message: 'Usuário não existe'})
            }
        })
        .catch(err => res.status(500).send({message: err.message}))
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