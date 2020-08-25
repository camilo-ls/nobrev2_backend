const db = require('../config/database')

class pactController {
    // Lista de Profissionais da Unidade
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
            const idx = await listaProfissionais.findIndex(prof => !arrayCnes.includes(prof.cbo))           
            if (idx != -1) {
                console.log(listaProfissionais[idx])
                listaProfissionais.splice(idx, 1)
                continue
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
                    prof.fechado = resp.fechado                 
                }          
            })
            .catch(e => console.log(e))
            let prof_aux = {
                'mes': mes,
                'ano': ano,
                'cnes': cnes,
                'cns': prof.cns,
                'coeficiente': prof.dias_pactuados/20,
                'dias_pactuados': prof.dias_pactuados,
                'fechado': prof.fechado,
                'justificativa': prof.justificativa 
            }
            const ja_existe = await db('pmp_hist').select().where({'mes': prof_aux.mes, 'ano': prof_aux.ano, 'cns': prof_aux.cns}).first()
            if (!ja_existe) await db('pmp_hist').insert(prof_aux)           
        }
        if (!listaProfissionais) res.status(400).send({message: 'Não existem profissionais na unidade selecionada'})        
        res.status(200).send(listaProfissionais)
    }

    // Metas pactuadas pra Unidade inteira
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

    async listaUnidadesPact(req, res) {
        const disa = req.params.disa
        const ano = req.params.ano
        const mes = req.params.mes

        let listaUnidades = []
        const fetchUnidades = await db('cnes').select('cnes', 'nome').where({'disa': disa})
        for (let unidade of fetchUnidades) {
            const pactuouCont = await db('pmp_hist').count('* as count').where({'cnes': unidade.cnes, 'ano': ano, 'mes': mes, 'fechado': true}).first()
            const nPactuouCont = await db('pmp_hist').count('* as count').where({'cnes': unidade.cnes, 'ano': ano, 'mes': mes, 'fechado': false}).first()
            
            let novaUnidade = {
                cnes: unidade.cnes,
                nome: unidade.nome,
                fechou: false                
            }
            
            if (nPactuouCont.count == 0 && pactuouCont.count != 0) novaUnidade.fechou = true
            novaUnidade.faltam = nPactuouCont.count
            novaUnidade.pactuaram = pactuouCont.count            
            listaUnidades.push(novaUnidade)
        }
        res.status(200).json(listaUnidades)
    }

    async getPactDisa(req, res) {
        const disa = req.params.disa
        const ano = req.params.ano
        const mes = req.params.mes

        let listaProcedimentosDisa = []
        let listaUnidades = await db('cnes').select('cnes').where({'disa': disa})
        for (let unidade of listaUnidades) {            
            let listaProfissionais = await db('profissionais').select('cns', 'cbo', 'coef_ESAP').where({'cnes': unidade.cnes})
            let diasUteis = await db('dias_uteis').select('dias_uteis').where({'ano': ano, 'mes': mes}).first()     
            //let listaProcedimentos = await db('pmp_padrao').select('nome', 'procedimento as cod').sum('quantidade as quantidade').where({'cnes': unidade.cnes})
            //.leftJoin('procedimentos', 'procedimentos.cod', 'pmp_padrao.procedimento').groupBy('procedimento').orderBy('procedimento')

            //for (let proc of listaProcedimentos) proc.quantidade = 0   
            
            for (let prof of listaProfissionais) {
                let coefPact = await db('pmp_hist').select('coeficiente').where({'cns': prof.cns, 'ano': ano, 'mes': mes}).first()                
                let procedimentos = await db('pmp_padrao').select('procedimento as cod', 'quantidade', 'nome').where({'cnes': unidade.cnes, 'cbo': prof.cbo})
                .leftJoin('procedimentos', 'pmp_padrao.procedimento', 'procedimentos.cod').orderBy('cod')

                if (procedimentos) {
                    for (let proc of procedimentos) {
                        if (coefPact) proc.quantidade *= coefPact.coeficiente
                        else proc.quantidade *= diasUteis.dias_uteis/20
                        
                        if (prof.coef_ESAP) proc.quantidade *= prof.coef_ESAP

                        proc.quantidade = Math.ceil(proc.quantidade)

                        const existe = listaProcedimentosDisa.some(x => x.cod == proc.cod)
                        if (existe) {
                            const idx = listaProcedimentosDisa.findIndex(e => e.cod == proc.cod)
                            listaProcedimentosDisa[idx].quantidade += proc.quantidade
                        }
                        else {
                            listaProcedimentosDisa.push({
                                cod: proc.cod,
                                nome: proc.nome,
                                quantidade: proc.quantidade
                            })
                        }
                    }
                }           
            }            
        }
        res.status(200).json(listaProcedimentosDisa)
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
    async getResponsabilidade(req, res) {
        const cnes = req.params.cnes

        await db('responsabilidade').select().where({'pai': cnes})
        .then(resp => res.status(200).json(resp))
        .catch(e => res.status(500).json(e))
    } 
}

module.exports = new pactController()