const db = require('../config/database')

class cnesController {
    async getFuncionarios(req, res) {
        const cnes = req.params.cnes
        await db.select('profissionais.id', 'profissionais.cnes', 'profissionais.nome', 'cns', 'profissionais.cbo', 'cbo.nome as cbo_nome', 'ine')
        .from('profissionais').join('cbo', {'profissionais.cbo': 'cbo.cbo'})
        .where({'profissionais.cnes': cnes})
        .orderBy('profissionais.nome')
        .then(lista => res.json(lista))
        .catch(err => res.status(500).send(err))
    }

    async all(req, res) {
        await db('cnes')
        .select('cnes', 'nome', 'bairro', 'tipologia', 'tipo')
        .then(lista => res.json(lista))
        .catch(err => res.status(500).send(err))
    }

    async get(req, res) {
        const cnes = req.params.cnes
        await db('cnes')
        .select('cnes', 'nome', 'bairro', 'tipologia', 'tipo')
        .where({ 'cnes': cnes }).first()
        .then(resultado => {
            if (resultado) {
                res.json(resultado)
            }
            else {
                res.status(500).send('Nenhum registro encontrado')
            }
        })
    }
}

module.exports = new cnesController()