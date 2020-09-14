const db = require('../config/database')

class pactController {
    // Lista de Profissionais da Unidade
    async getListaPact(req, res) {
        const cnes = req.params.cnes
        const ano = req.params.ano
        const mes = req.params.mes       

        let listaProfissionais = await db('profissionais').select('nome', 'cns', 'mat', 'cbo')
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
                prof.cargo = 'INDEFINIDO' 
            })
            
            await db('dias_uteis').select('dias_uteis').where({'ano': ano, 'mes': mes}).first()
                    .then(resp => {
                        prof.dias_pactuados = resp.dias_uteis
                        prof.fechado = false
                    })
                    .catch(e => console.log(e))
            await db('pmp_hist').select().where({'cnes': cnes, 'cns': prof.cns, 'mat': prof.mat, 'ano': ano, 'mes': mes}).first()
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
                'mat': prof.mat,
                'coeficiente': prof.dias_pactuados/20,
                'dias_pactuados': prof.dias_pactuados,
                'fechado': prof.fechado,
                'justificativa': prof.justificativa 
            }
            const ja_existe = await db('pmp_hist').select().where({'mes': prof_aux.mes, 'ano': prof_aux.ano, 'cns': prof_aux.cns, 'mat': prof_aux.mat}).first()
            if (!ja_existe) await db('pmp_hist').insert(prof_aux)           
        }
        if (!listaProfissionais) res.status(400).send({message: 'Não existem profissionais na unidade selecionada'})        
        res.status(200).send(listaProfissionais)
    }

    // Metas pactuadas pra Unidade inteira
    async getMetaUnidade(req, res) {
        const cnes = req.params.cnes
        const ano = req.params.ano
        const mes = req.params.mes

        const listaProcedimentos = await db.select('procedimento as cod', 'nome')
        .sum('quantidade as quantidade')
        .from('pmp_pactuados')
        .where({'ano': ano, 'mes': mes, 'cnes': cnes})
        .leftJoin('procedimentos', 'pmp_pactuados.procedimento', 'procedimentos.cod')
        .groupBy('procedimento')
        .orderBy('procedimento')
        .then(lista => res.status(200).json(lista))
        .catch(erro => res.status(500).send({message: erro}))
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

    async getMetaDisa(req, res) {
        const disa = req.params.disa
        const ano = req.params.ano
        const mes = req.params.mes

        db.select('procedimento as cod', 'procedimentos.nome')
        .sum('quantidade as quantidade')
        .from('pmp_pactuados')
        .leftJoin('procedimentos', 'pmp_pactuados.procedimento', 'procedimentos.cod')
        .leftJoin('cnes', 'pmp_pactuados.cnes', 'cnes.cnes')
        .where({'ano': ano, 'mes': mes, 'disa': disa})
        .groupBy('cod')
        .orderBy('cod')
        .then(lista => res.status(200).json(lista))
        .catch(e => res.status(500).send({message: e}))        
    }

    async getCoef(req, res) {
        const cns = req.params.cns
        const mat = req.params.mat
        const ano = req.params.ano
        const mes = req.params.mes

        const pact_user = await db('pmp_hist').select('coeficiente').where({'cns': cns, 'mat': mat, 'mes': mes, 'ano': ano}).first()
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
            dia: new Date().getDate()
        }
        res.status(200).json(data)
    }

    async getDataRevisao(req, res) {
        const ano = req.params.ano
        const mes = req.params.mes
        await db('pact_numoa').select('dia').where({'ano': ano, 'mes': mes}).first()
        .then(resp => res.status(200).send(resp))
        .catch(err => res.status(500).send({message: err}))
    }

    async getDiasPact(req, res) {
        const cns = req.params.cns
        const mat = req.params.mat
        const ano = req.params.ano
        const mes = req.params.mes

        let dias_uteis = await db('pmp_hist').select('dias_pactuados').where({'cns': cns, 'mat': mat, 'mes': mes, 'ano': ano}).first()        
        if (!dias_uteis) {
            dias_uteis = await db('dias_uteis').select('dias_uteis').where({'mes': mes, 'ano': ano}).first()
            dias_uteis = dias_uteis.dias_uteis
        }
        else dias_uteis = dias_uteis.dias_pactuados
        res.status(200).json({dias_pactuados: dias_uteis})
    }

    async setPactFuncionario(req, res) {
        const user = req.body
        const { mes, ano, cnes, cbo, cns, mat, dias_pactuados, justificativa } = user
        const coeficiente = dias_pactuados/20

        const pactuado = await db('pmp_hist').select().where({'cns': cns, 'mat': mat, 'ano': ano, 'mes': mes}).first()
        if (!pactuado) {
            await db('pmp_hist').insert({
                'mes': mes,
                'ano': ano,
                'cnes': cnes,
                'cns': cns,
                'mat': mat,
                'coeficiente': coeficiente,
                'dias_pactuados': dias_pactuados,
                'fechado': true,
                'justificativa': justificativa 
            })
            .then()
            .catch(err => res.status(500).json(err))
        }
        else {
            await db('pmp_hist').update({
                'mes': mes,
                'ano': ano,
                'cnes': cnes,
                'cns': cns,
                'mat': mat,
                'coeficiente': coeficiente,
                'dias_pactuados': dias_pactuados,
                'fechado': true,
                'justificativa': justificativa 
            }).where({'cns': cns, 'ano': ano, 'mes': mes})
            .then()
            .catch(err => res.status(500).json(err))
        }
        const meta_existe = await db('pmp_pactuados').select().where({'ano': ano, 'mes': mes, 'cns': cns, 'mat': mat}).first()
        const listaProcedimentos = await db('pmp_padrao').select().where({'cnes': cnes, 'cbo': cbo})
        if (meta_existe) {
            for (let procedimento of listaProcedimentos) {
                const novoValor = procedimento.quantidade * coeficiente
                db('pmp_pactuados').update({'quantidade': novoValor}).where({'ano': ano, 'mes': mes, 'cns': cns, 'mat': mat, 'procedimento': procedimento.procedimento})
                .catch(err => res.status(200).json(err))               
            }
        }
        else {
            for (let procedimento of listaProcedimentos) {
                const novoValor = procedimento.quantidade * coeficiente
                db('pmp_pactuados').insert({'mes': mes, 'ano': ano, 'cnes': cnes, 'cns': cns, 'mat': mat, 'procedimento': procedimento.procedimento, 'quantidade': novoValor})
                .catch(err => res.status(200).json({message: err}))
            }
        }
        res.status(200).json({message: 'Pactuação atualizada com sucesso!'})
    }
    async getResponsabilidade(req, res) {
        const cnes = req.params.cnes
        await db.select('responsabilidade.filho as cnes', 'cnes.nome')
        .from('responsabilidade')
        .leftJoin('cnes', 'responsabilidade.filho', 'cnes.cnes')
        .where({'responsabilidade.pai': cnes})
        .then(resp => res.status(200).json(resp))
        .catch(e => res.status(500).json(e))
    }

    async getAnosDisa(req, res) {
        const disa = req.params.disa
        await db('pmp_pactuados').distinct('ano').leftJoin('cnes', 'pmp_pactuados.cnes', 'cnes.cnes')
        .where({'disa': disa})
        .then(anos => res.status(200).json(anos))
        .catch(e => res.status(500).json(e))
    }

    async getMesesDisa(req, res) {
        const disa = req.params.disa
        const ano = req.params.ano
        await db('pmp_pactuados').distinct('mes').leftJoin('cnes', 'pmp_pactuados.cnes', 'cnes.cnes')
        .where({'disa': disa, 'ano': ano})
        .then(meses => res.status(200).json(meses))
        .catch(e => res.status(500).json(e))
    }

    
    async getAnosPactuados(req, res) {
        const cnes = req.params.cnes
        await db('pmp_pactuados').distinct('ano').where({'cnes': cnes})
        .then(anos => res.status(200).json(anos))
        .catch(e => res.status(500).json(e))
    }

    async getMesesPactuados(req, res) {
        const cnes = req.params.cnes
        const ano = req.params.ano
        await db('pmp_pactuados').distinct('mes').where({'cnes': cnes, 'ano': ano})
        .then(meses => res.status(200).json(meses))
        .catch(e => res.status(500).json(e))
    }

    async getAnosPactuadosProfissional(req, res) {
        const cns = req.params.cns
        const mat = req.params.mat
        await db('pmp_pactuados').distinct('ano').where({'cns': cns, 'mat': mat})
        .then(anos => res.status(200).json(anos))
        .catch(e => res.status(500).json(e))
    }

    async getMesesPactuadosProfissional(req, res) {
        const ano = req.params.ano
        const cns = req.params.cns
        const mat = req.params.mat
        await db('pmp_pactuados').distinct('mes').where({'cns': cns, 'mat': mat, 'ano': ano})
        .then(meses => res.status(200).json(meses))
        .catch(e => res.status(500).json(e))
    }
  
    async getAnosSemsa(req, res) {
        await db('pmp_pactuados').distinct('ano')
            .then(anos => res.status(200).json(anos))
        .catch(e => res.status(500).json(e))
    }

    async getMesesSemsa(req, res) {
        const ano = req.params.ano
        await db('pmp_pactuados').distinct('mes').where({ 'ano': ano })
            .then(meses => res.status(200).json(meses))
        .catch(e => res.status(500).json(e))
    }
}

module.exports = new pactController()