const jwt = require('jsonwebtoken')
const {authSecret} = require('../../.env')

const auth = (req, res, next) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) {
            return res.status(401).send('Você precisa estar logado para acessar esta ṕagina')
        }
        
        const verified = jwt.verify(token, authSecret)
        if (!verified) {
            return res.status(401).send('Token inválido')
        }

        next()
    }
    catch (erro) {
        res.status(500)
    }
}

module.exports = auth