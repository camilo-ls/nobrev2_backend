const db = require('../config/database')

class profController {
    async getMeta(req, res) {
        const cns = req.params.cns
        let mes = new Date().getMonth()
        let ano = new Date().getFullYear()

        if (req.params.mes) mes = req.params.mes
        if (req.params.ano) ano = req.params.ano

        console.log(cns, ano, mes)

        const dias_uteis = await db('dias_uteis').select('dias_uteis').where({'ano': ano, 'mes': mes}).first()
        let pact_user = await db('pmp_hist').select('coeficiente').where({'cns': cns, 'mes': mes, 'ano': ano}).first()       
        if (pact_user) pact_user = pact_user.coeficiente
        else pact_user = dias_uteis.dias_uteis/20        
            
        await db.select('profissionais.nome as profissional', 'procedimentos.nome', 'pmp_padrao.procedimento as cod', 'pmp_padrao.quantidade')
        .from('pmp_padrao')
        .join('profissionais', 'profissionais.cbo', '=', 'pmp_padrao.cbo')
        .join('procedimentos', 'pmp_padrao.procedimento', '=', 'procedimentos.cod')
        .where({'profissionais.cns': cns})
        .then(proc => {
            proc.map(procedimento => {                
                procedimento.quantidade = Math.ceil(procedimento.quantidade * pact_user)                
            })            
           res.status(200).json(proc)
        })
        .catch(err => res.status(500).send(err))
    }

    async get(req, res) {
        const cpf = req.params.cpf
        await db.select('id', 'cpf', 'cns', 'nome', 'cbo', 'cnes')
        .from('profissionais')
        .where({'cpf': cpf})
        .first()
        .then(retorno => res.json(retorno))
        .catch(err => res.status(500).send(err))
    }
}

module.exports = new profController()