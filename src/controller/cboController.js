const db = require('../config/database')

class cboController {
    async get(req, res) {
        const cbo = req.params.cbo
        await db('cbo').select('cbo', 'nome')
        .where({'cbo': cbo})
        .first()
        .then(resultado => {
            res.json(resultado)
        })
        .catch(erro => res.status(500).send(erro))
    }
}

module.exports = new cboController