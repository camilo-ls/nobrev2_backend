const db = require('../config/database')

class pactController {
    async getListaPact(req, res) {
        const cnes = req.params.cnes
        const ano = req.params.ano
        const mes = req.params.mes       

        const listaProfissionais = await db('profissionais').select('nome', 'cns', 'cbo')
        .where({'cnes': cnes})        

        for (let prof of listaProfissionais) {
            await db('cbo').select('nome').where({'cbo': prof.cbo}).first()
            .then(resp => {
                prof.cargo = resp.nome
            })
            .catch(e => console.log(e))
            await db('dias_uteis').select('dias_uteis').where({'ano': ano, 'mes': mes}).first()
                    .then(resp => {
                        prof.dias_pactuados = resp.dias_uteis
                        prof.fechado = false
                    })
                    .catch(e => console.log(e))
            await db('pmp_hist').select().where({'cnes': cnes, 'cns': prof.cns, 'ano': ano, 'mes': mes}).first()
            .then(resp => {
                if (resp) {
                    prof.dias_pactuados = ja_pact.dias_pactuados
                    prof.justificativa = ja_pact.justificativa
                    prof.fechado = true                    
                }                
            })
            .catch(e => console.log(e))            
        }
        if (!listaProfissionais) res.status(400).send({message: 'Não existem profissionais na unidade selecionada'})
        res.status(200).send(listaProfissionais)
    }
    async getCoef(req, res) {
        const cns = req.params.cns
        const ano = req.params.ano
        const mes = req.params.mes

        const pact_user = await db('pmp_hist').select('coeficiente').where({'cns': cns, 'mes': mes, 'ano': ano}).first()
        console.log(pact_user)
        if (!pact_user) res.status(400).send({message: 'Profissional não teve pactuação na competência informada.'})
        else res.status(200).json({'coeficiente': pact_user.coeficiente})
    }

    async getDias(req, res) {
        const ano = req.params.ano
        const mes = req.params.mes

        let dias_uteis = await db('dias_uteis').select('dias_uteis').where({'mes': mes, 'ano': ano}).first()
        if (!dias_uteis) dias_uteis = 22
        dias_uteis = dias_uteis.dias_uteis
        res.status(200).json({dias_uteis: dias_uteis})
    }

    async getDiasPact(req, res) {
        const cns = req.params.cns
        const ano = req.params.ano
        const mes = req.params.mes

        let dias_uteis = await db('pmp_hist').select('dias_pactuados').where({'cns': cns, 'mes': mes, 'ano': ano}).first()        
        if (!dias_uteis) {
            dias_uteis = await db('dias_uteis').select('dias_uteis').where({'mes': mes, 'ano': ano}).first()
            dias_uteis = dias_uteis.dias_uteis
        }
        else dias_uteis = dias_uteis.dias_pactuados
        res.status(200).json({dias_pactuados: dias_uteis})
    }
}

module.exports = new pactController()