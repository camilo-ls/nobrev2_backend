const db = require('../config/database')

class profController {
    async getMeta(req, res) {
        const cns = req.params.cns
        await db.select('profissionais.nome as profissional', 'procedimentos.nome', 'pmp_padrao.procedimento as cod', 'pmp_padrao.quantidade')
        .from('pmp_padrao')
        .join('profissionais', 'profissionais.cbo', '=', 'pmp_padrao.cbo')
        .join('procedimentos', 'pmp_padrao.procedimento', '=', 'procedimentos.cod')
        .where({'profissionais.cns': cns})
        .then(proc => res.json(proc))
        .catch(err => res.status(500).send(err))
    }
}

module.exports = new profController()