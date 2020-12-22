const db = require('../config/database')

class profController {
    async getMeta(req, res) {
        const cnes = req.params.cnes
        const cns = req.params.cns
        const vinc_id = req.params.vinc_id
        let mes = new Date().getMonth()
        let ano = new Date().getFullYear()

        if (req.params.mes) mes = req.params.mes
        if (req.params.ano) ano = req.params.ano

        const dias_uteis = await db('dias_uteis').select('DIAS_UTEIS').where({'ANO': ano, 'MES': mes}).first()
        let pact_user = await db('pmp_hist').select('COEFICIENTE').where({'CNS': cns, 'VINC_ID': vinc_id, 'MES': mes, 'ANO': ano}).first()       
        if (pact_user) pact_user = pact_user.COEFICIENTE
        else pact_user = dias_uteis.DIAS_UTEIS/20   
            
        await db.select('profissionais.NOME_PROF as profissional', 'procedimentos.NOME_PROCED', 'pmp_padrao.COD_PROCED as COD', 'pmp_padrao.QUANTIDADE')
        .from('pmp_padrao')
        .join('profissionais', 'profissionais.CBO', '=', 'pmp_padrao.CBO')
        .join('procedimentos', 'pmp_padrao.COD_PROCED', '=', 'procedimentos.COD_PROCED')
        .where({'profissionais.CNS': cns, 'profissionais.VINC_ID': vinc_id, 'pmp_padrao.CNES': cnes})
        .then(proc => {
            proc.map(procedimento => {                
                procedimento.QUANTIDADE = Math.ceil(procedimento.QUANTIDADE * pact_user)                
            })            
           res.status(200).json(proc)
        })
        .catch(err => res.status(500).send({message: 'Profissional não encontrado.', err}))
    }

    async get(req, res) {
        const ano = req.params.ano
        const mes = req.params.mes
        const cns = req.params.cns
        const vinc_id = req.params.vinc_id
        await db.select()
        .from('profissionais')
        .leftJoin('cbo', 'profissionais.CBO', 'cbo.CBO')
        .leftJoin('pmp_hist', 'pmp_hist.VINC_ID', 'profissionais.VINC_ID')
        .where({'pmp_hist.ANO': ano, 'pmp_hist.MES': mes, 'profissionais.CNS': cns, 'profissionais.VINC_ID': vinc_id})
        .first()
        .then(retorno => {            
            res.json(retorno)
        })
        .catch(err => res.status(500).send({message: 'CNS não encontrado.', err}))
    }

    async getCns(req, res) {
        const cns = req.params.cns
        await db('profissionais').select('VINC_ID', 'CPF', 'CNS', 'NOME_PROF', 'CBO', 'CNES')
        .where({'CNS': cns})
        .then(retorno => res.json(retorno))
        .catch(err => res.status(500).send({message: 'CNS não encontrado.', err}))
    }

    async getCpf(req, res) {
        const cpf = req.params.cpf
        await db('profissionais').select('VINC_ID', 'CPF', 'CNS', 'NOME_PROF', 'CBO', 'CNES')
        .where({'CPF': cpf})
        .first()
        .then(retorno => res.json(retorno))
        .catch(err => res.status(500).send({message: 'CPF não encontrado.', err}))
    }
}

module.exports = new profController()