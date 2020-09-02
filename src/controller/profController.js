const db = require('../config/database')

class profController {
    async getMeta(req, res) {
        const cnes = req.params.cnes
        const cns = req.params.cns
        const mat = req.params.mat
        let mes = new Date().getMonth()
        let ano = new Date().getFullYear()

        if (req.params.mes) mes = req.params.mes
        if (req.params.ano) ano = req.params.ano

        const dias_uteis = await db('dias_uteis').select('dias_uteis').where({'ano': ano, 'mes': mes}).first()
        let pact_user = await db('pmp_hist').select('coeficiente').where({'cns': cns, 'mat': mat, 'mes': mes, 'ano': ano}).first()       
        if (pact_user) pact_user = pact_user.coeficiente
        else pact_user = dias_uteis.dias_uteis/20        
            
        await db.select('profissionais.nome as profissional', 'procedimentos.nome', 'pmp_padrao.procedimento as cod', 'pmp_padrao.quantidade')
        .from('pmp_padrao')
        .join('profissionais', 'profissionais.cbo', '=', 'pmp_padrao.cbo')
        .join('procedimentos', 'pmp_padrao.procedimento', '=', 'procedimentos.cod')
        .where({'profissionais.cns': cns, 'profissionais.mat': mat, 'pmp_padrao.cnes': cnes})
        .then(proc => {
            proc.map(procedimento => {                
                procedimento.quantidade = Math.ceil(procedimento.quantidade * pact_user)                
            })            
           res.status(200).json(proc)
        })
        .catch(err => res.status(500).send({message: 'Profissional não encontrado.', err}))
    }

    async get(req, res) {
        const cns = req.params.cns
        const mat = req.params.mat
        await db.select('id', 'cpf', 'cns', 'mat', 'nome', 'cbo', 'cnes')
        .from('profissionais')
        .where({'cns': cns, 'mat': mat})
        .first()
        .then(retorno => res.json(retorno))
        .catch(err => res.status(500).send({message: 'CNS não encontrado.', err}))
    }

    async getCns(req, res) {
        const cns = req.params.cns
        await db('profissionais').select('id', 'cpf', 'cns', 'mat', 'nome', 'cbo', 'cnes')
        .where({'cns': cns})
        .then(retorno => res.json(retorno))
        .catch(err => res.status(500).send({message: 'CPF não encontrado.', err}))
    }

    async getCpf(req, res) {
        const cpf = req.params.cpf
        await db('profissionais').select('id', 'cpf', 'cns', 'mat', 'nome', 'cbo', 'cnes')
        .where({'cpf': cpf})
        .first()
        .then(retorno => res.json(retorno))
        .catch(err => res.status(500).send({message: 'CPF não encontrado.', err}))
    }
}

module.exports = new profController()