const db = require('../config/database')

class cnesController {
    async getFuncionarios(req, res) {
        const cnes = req.params.cnes
        await db.select('profissionais.VINC_ID', 'profissionais.CNES', 'profissionais.NOME_PROF', 'CNS', 'profissionais.CBO', 'cbo.NOME_CBO', 'INE')
        .from('profissionais').join('cbo', {'profissionais.CBO': 'cbo.CBO'})
        .where({'profissionais.CNES': cnes})
        .orderBy('profissionais.NOME_PROF')
        .then(lista => {
            res.json(lista)
        })
        .catch(err => res.status(500).send(err))
    }

    async getProcUnidade(req, res) {
        const cnes = req.params.cnes
        await db.select('pmp_padrao.COD_PROCED', 'procedimentos.NOME_PROCED').sum('QUANTIDADE as PACTUADO')
        .from('profissionais')
        .join('pmp_padrao', 'profissionais.CBO', '=', 'pmp_padrao.CBO')
        .join('procedimentos', 'pmp_padrao.COD_PROCED', '=', 'procedimentos.COD_PROCED')
        .where({'profissionais.CNES': cnes})
        .groupBy('COD_PROCED')
        .then(lista => res.json(lista))
        .catch(err => res.status(500).send(err))
    }

    async getPactFuncionario(req, res) {
        const cns = req.params.cns
        const vinc_id = req.params.vinc_id
        const ano = req.params.ano
        const mes = req.params.mes
        await db.select('DIAS_PACTUADOS', 'FECHADO', 'JUSTIFICATIVA')
        .from('pmp_hist').where({'VINC_ID': VINC_ID})
        .andWhere({'ano': ano})
        .andWhere({'mes': mes})
        .first()
        .then(resultado => {
           res.json(resultado)
        })
        .catch(err => res.status(500).send(err))
    } 

    async all(req, res) {
        await db('cnes')
        .select('CNES', 'NOME_UNIDADE', 'BAIRRO', 'DISA')
        .then(lista => res.json(lista))
        .catch(err => res.status(500).send(err))
    }

    async get(req, res) {
        const cnes = req.params.cnes
        await db('cnes')
        .select('CNES', 'NOME_UNIDADE', 'BAIRRO', 'DISA')
        .where({'CNES': cnes})
        .first()
        .then(resultado => {
            if (resultado) {
                res.json(resultado)
            }
            else {
                res.status(500).send({message: 'CNES não encontrado.'})
            }
        })
    }
}

module.exports = new cnesController()