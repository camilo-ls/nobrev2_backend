const db = require('../config/database')

class userController {
    async create(req, res) {
        const user = {...req.body}
                   
        const checkEmail = await db('users').select('email').where({'email': user.email}).first()
        if (checkEmail) {
            return res.status(400).send('E-mail já cadastrado')
        }
        
        await db('users').insert(user)
        .then(conf => res.status(200).send('Sucesso'))
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
}

module.exports = new userController()