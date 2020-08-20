const db = require('../config/database')

class pactController {
    async getListaPact(req, res) {
        const cnes = req.params.cnes
        const ano = req.params.ano
        const mes = req.params.mes       

        let listaProfissionais = await db('profissionais').select('nome', 'cns', 'cbo')
        .where({'cnes': cnes}).orderBy('cbo', 'nome')
        
        const listaCnes = await db('pmp_padrao').select('cbo').where({'cnes': cnes})

        let arrayCnes = []

        for (let cbo of listaCnes) {
            if (!arrayCnes.includes(cbo.cbo)) {
                arrayCnes.push(cbo.cbo)
            }
        }

        for (let prof of listaProfissionais) {
            await db('cbo').select('nome').where({'cbo': prof.cbo}).first()
            .then(resp => {
                prof.cargo = resp.nome
            })
            .catch(e => {
                console.log(e)
                prof.cargo = 'INDEFINIDO' 
            })
            await db('dias_uteis').select('dias_uteis').where({'ano': ano, 'mes': mes}).first()
                    .then(resp => {
                        prof.dias_pactuados = resp.dias_uteis
                        prof.fechado = false
                    })
                    .catch(e => console.log(e))
            await db('pmp_hist').select().where({'cnes': cnes, 'cns': prof.cns, 'ano': ano, 'mes': mes}).first()
            .then(resp => {
                if (resp) {
                    prof.dias_pactuados = resp.dias_pactuados
                    prof.justificativa = resp.justificativa
                    prof.fechado = true                    
                }          
            })
            .catch(e => console.log(e))            
        }
        if (!listaProfissionais) res.status(400).send({message: 'Não existem profissionais na unidade selecionada'})        
        res.status(200).send(listaProfissionais)
    }

    async getPactUnidade(req, res) {
        const cnes = req.params.cnes
        const ano = req.params.ano
        const mes = req.params.mes

        let listaProfissionais = await db('profissionais').select('cns', 'cbo', 'coef_ESAP').where({'cnes': cnes})
        let diasUteis = await db('dias_uteis').select('dias_uteis').where({'ano': ano, 'mes': mes}).first()     
        let listaProcedimentos = await db('pmp_padrao').select('nome', 'procedimento as cod').sum('quantidade as quantidade').where({'cnes': cnes})
        .leftJoin('procedimentos', 'procedimentos.cod', 'pmp_padrao.procedimento').groupBy('procedimento').orderBy('procedimento')

        for (let proc of listaProcedimentos) proc.quantidade = 0   
        
        for (let prof of listaProfissionais) {
            let coefPact = await db('pmp_hist').select('coeficiente').where({'cns': prof.cns, 'ano': ano, 'mes': mes}).first()
            
            let procedimentos = await db('pmp_padrao').select('procedimento as cod', 'quantidade').where({'cnes': cnes, 'cbo': prof.cbo})

            if (procedimentos) {
                for (let proc of procedimentos) {
                    if (coefPact) proc.quantidade *= coefPact.coeficiente
                    else proc.quantidade *= diasUteis.dias_uteis/20
                    
                    if (prof.coef_ESAP) proc.quantidade *= prof.coef_ESAP

                    proc.quantidade = Math.ceil(proc.quantidade)

                    for (let proced of listaProcedimentos) {
                        if (proced.cod == proc.cod) {                            
                            proced.quantidade += proc.quantidade                            
                            continue
                        }
                    }
                }
            }           
        }
        res.status(200).json(listaProcedimentos)
    }

    async getCoef(req, res) {
        const cns = req.params.cns
        const ano = req.params.ano
        const mes = req.params.mes

        const pact_user = await db('pmp_hist').select('coeficiente').where({'cns': cns, 'mes': mes, 'ano': ano}).first()
        if (!pact_user) res.status(400).send({message: 'Profissional não teve pactuação na competência informada.'})
        else res.status(200).json({'coeficiente': pact_user.coeficiente})
    }

    async getDiasUteis(req, res) {
        const ano = req.params.ano
        const mes = req.params.mes

        let dias_uteis = await db('dias_uteis').select('dias_uteis').where({'mes': mes, 'ano': ano}).first()
        if (!dias_uteis) dias_uteis = 22
        dias_uteis = dias_uteis.dias_uteis
        res.status(200).json({dias_uteis: dias_uteis})
    }

    async getDiasMes(req, res) {
        const ano = req.params.ano
        const mes = req.params.mes
        res.status(200).json({dias: new Date(ano, mes, 0).getDate()})
    }

    async getData(req, res) {
        const data = {
            ano: new Date().getFullYear(),
            mes: new Date().getMonth() + 1,
            dia: new Date().getDay().toString()
        }
        res.status(200).json(data)
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

    async setPactFuncionario(req, res) {
        const user = req.body
        const { mes, ano, cnes, cns, dias_pactuados, justificativa } = user
        const coeficiente = dias_pactuados/20

        const pactuado = await db('pmp_hist').select().where({'cns': cns, 'ano': ano, 'mes': mes}).first()
        if (!pactuado) {
            await db('pmp_hist').insert({
                'mes': mes,
                'ano': ano,
                'cnes': cnes,
                'cns': cns,
                'coeficiente': coeficiente,
                'dias_pactuados': dias_pactuados,
                'fechado': true,
                'justificativa': justificativa 
            })
            .then(resp => res.status(200).json({resp, message: 'Pactuação realizada com sucesso'}))
            .catch(err => res.status(500).json(err))
        }
        else {
            await db('pmp_hist').update({
                'mes': mes,
                'ano': ano,
                'cnes': cnes,
                'cns': cns,
                'coeficiente': coeficiente,
                'dias_pactuados': dias_pactuados,
                'fechado': true,
                'justificativa': justificativa 
            }).where({'cns': cns, 'ano': ano, 'mes': mes})
            .then(resp => res.status(200).json({resp, message: 'Pactuação atualizada com sucesso'}))
            .catch(err => res.status(500).json(err))
        }
    }   
}

module.exports = new pactController()