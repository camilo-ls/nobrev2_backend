const db = require('../config/database')

class pactController {
    // Lista de Profissionais da Unidade
    async getListaPact(req, res) {
        const cnes = req.params.cnes
        const ano = req.params.ano
        const mes = req.params.mes       

        let listaProfissionais = await db('profissionais').select('NOME_PROF', 'CNS', 'VINC_ID', 'CBO')
        .where({'CNES': cnes}).orderBy('CBO', 'NOME_PROF')
        
        const listaCnes = await db('pmp_padrao').distinct('CBO').where({'CNES': cnes})

        let arrayCnes = []

        for (let cbo of listaCnes) {           
            arrayCnes.push(cbo.CBO)
        }

        for (let prof of listaProfissionais) {
            const idx = await listaProfissionais.findIndex(prof => !arrayCnes.includes(prof.CBO))           
            if (idx != -1) {
                listaProfissionais.splice(idx, 1)
                continue
            }
        }

        for (let prof of listaProfissionais) {
            await db('cbo').select('NOME_CBO').where({'CBO': prof.CBO}).first()
            .then(resp => {
                prof.CARGO = resp.NOME_CBO
            })
            .catch(e => {
                prof.CARGO = 'INDEFINIDO' 
            })
            
            await db('dias_uteis').select('DIAS_UTEIS').where({'ANO': ano, 'MES': mes}).first()
                    .then(resp => {
                        prof.DIAS_PACTUADOS = resp.DIAS_UTEIS
                        prof.FECHADO = false
                    })
                    .catch(e => console.log(e))
            await db('pmp_hist').select().where({'CNES': cnes, 'CNS': prof.CNS, 'VINC_ID': prof.VINC_ID, 'ANO': ano, 'MES': mes}).first()
            .then(resp => {
                if (resp) {
                    prof.DIAS_PACTUADOS = resp.DIAS_PACTUADOS
                    prof.JUSTIFICATIVA = resp.JUSTIFICATIVA
                    prof.FECHADO = resp.FECHADO     
                }          
            })
            .catch(e => console.log(e))
            let prof_aux = {
                mes: mes,
                ano: ano,
                cnes: cnes,
                cns: prof.CNS,
                vinc_id: prof.VINC_ID,
                coeficiente: prof.DIAS_PACTUADOS/20,
                dias_pactuados: prof.DIAS_PACTUADOS,
                fechado: prof.FECHADO,
                justificativa: prof.JUSTIFICATIVA 
            }
            const ja_existe = await db('pmp_hist').select().where({'MES': prof_aux.mes, 'ANO': prof_aux.ano, 'VINC_ID': prof_aux.vinc_id})
            if (!ja_existe) {
                await db('pmp_hist').insert(prof_aux)
            }           
        }
        if (!listaProfissionais) res.status(400).send({message: 'Não existem profissionais na unidade selecionada'})
        res.status(200).send(listaProfissionais)
    }

    // Metas pactuadas pra Unidade inteira
    async getMetaUnidade(req, res) {
        const cnes = req.params.cnes
        const ano = req.params.ano
        const mes = req.params.mes

        const listaProcedimentos = await db.select('COD_PROCED', 'NOME_PROCED')
        .sum('QUANTIDADE as QUANTIDADE')
        .from('pmp_pactuados')
        .where({'ANO': ano, 'MES': mes, 'CNES': cnes})
        .leftJoin('procedimentos', 'pmp_pactuados.PROCEDIMENTO', 'procedimentos.COD_PROCED')
        .groupBy('PROCEDIMENTO')
        .orderBy('PROCEDIMENTO ')
        .then(lista => res.status(200).json(lista))
        .catch(erro => res.status(500).send({message: erro}))
    }

    async listaUnidadesPact(req, res) {
        const disa = req.params.disa
        const ano = req.params.ano
        const mes = req.params.mes

        let listaUnidades = []
        const fetchUnidades = await db('cnes').select('CNES', 'NOME_UNIDADE').where({'DISA': disa})
        for (let unidade of fetchUnidades) {
            const pactuouCont = await db('pmp_hist').count('* as count').where({'CNES': unidade.CNES, 'ANO': ano, 'MES': mes, 'FECHADO': true}).first()
            const nPactuouCont = await db('pmp_hist').count('* as count').where({'CNES': unidade.CNES, 'ANO': ano, 'MES': mes, 'FECHADO': false}).first()
            
            let novaUnidade = {
                cnes: unidade.CNES,
                nome: unidade.NOME_UNIDADE,
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

        db.select('COD_PROCED', 'procedimentos.NOME_PROCED')
        .sum('QUANTIDADE as QUANTIDADE')
        .from('pmp_pactuados')
        .leftJoin('procedimentos', 'pmp_pactuados.PROCEDIMENTO', 'procedimentos.COD_PROCED')
        .leftJoin('cnes', 'pmp_pactuados.CNES', 'cnes.CNES')
        .where({'ANO': ano, 'MES': mes, 'DISA': disa})
        .groupBy('COD_PROCED')
        .orderBy('COD_PROCED')
        .then(lista => res.status(200).json(lista))
        .catch(e => res.status(500).send({message: e}))        
    }

    async getCoef(req, res) {
        const cns = req.params.cns
        const vinc_id = req.params.vinc_id
        const ano = req.params.ano
        const mes = req.params.mes

        const pact_user = await db('pmp_hist').select('COEFICIENTE').where({'CNS': cns, 'VINC_ID': vinc_id, 'MES': mes, 'ANO': ano}).first()
        if (!pact_user) res.status(400).send({message: 'Profissional não teve pactuação na competência informada.'})
        else res.status(200).json({'COEFICIENTE': pact_user.COEFICIENTE})
    }

    async getDiasUteis(req, res) {
        const ano = req.params.ano
        const mes = req.params.mes

        let dias_uteis = await db('dias_uteis').select('DIAS_UTEIS').where({'MES': mes, 'ANO': ano}).first()
        if (!dias_uteis) dias_uteis = 22
        dias_uteis = dias_uteis.DIAS_UTEIS
        res.status(200).json({DIAS_UTEIS: dias_uteis})
    }

    async getDiasMes(req, res) {
        const ano = req.params.ano
        const mes = req.params.mes
        res.status(200).json({dias: new Date(ano, mes, 0).getDate()})
    }

    async getData(req, res) {
        const data = {
            //ano: new Date().getFullYear(),
            //mes: new Date().getMonth() + 1,
            ano: 2021,
            mes: 2,
            dia: new Date().getDate()
        }
        res.status(200).json(data)
    }

    async getDataRevisao(req, res) {
        const ano = req.params.ano
        const mes = req.params.mes
        await db('pact_numoa').select('DIA').where({'ANO': ano, 'MES': mes}).first()
        .then(resp => res.status(200).send(resp))
        .catch(err => res.status(500).send({message: err}))
    }

    async getDiasPact(req, res) {
        const cns = req.params.cns
        const vinc_id = req.params.vinc_id
        const ano = req.params.ano
        const mes = req.params.mes

        let dias_uteis = await db('pmp_hist').select('DIAS_PACTUADOS').where({'CNS': cns, 'VINC_ID': vinc_id, 'MES': mes, 'ANO': ano}).first()        
        if (!dias_uteis) {
            dias_uteis = await db('dias_uteis').select('DIAS_UTEIS').where({'MES': mes, 'ANO': ano}).first()
            dias_uteis = dias_uteis.DIAS_UTEIS
        }
        else dias_uteis = dias_uteis.DIAS_UTEIS
        res.status(200).json({dias_pactuados: dias_uteis})
    }

    async setPactFuncionario(req, res) {
        const user = req.body
        const { mes, ano, cnes, cbo, cns, vinc_id, dias_pactuados, justificativa } = user
        const coeficiente = dias_pactuados/20

        console.log(user)
        const pactuado = await db('pmp_hist').select().where({'VINC_ID': vinc_id, 'ANO': ano, 'MES': mes})
        .catch(e => console.log(e))
        if (!pactuado) {
            await db('pmp_hist').insert({
                'MES': mes,
                'ANO': ano,
                'CNES': cnes,
                'CNS': cns,
                'VINC_ID': vinc_id,
                'COEFICIENTE': coeficiente,
                'DIAS_PACTUADO': dias_pactuados,
                'FECHADO': true,
                'JUSTIFICATIVA': justificativa 
            })
            .then()
            .catch(err => res.status(500))
        }
        else {
            await db('pmp_hist').update({
                'MES': mes,
                'ANO': ano,
                'CNES': cnes,
                'CNS': cns,
                'VINC_ID': vinc_id,
                'COEFICIENTE': coeficiente,
                'DIAS_PACTUADOS': dias_pactuados,
                'FECHADO': true,
                'JUSTIFICATIVA': justificativa 
            }).where({'VINC_ID': vinc_id, 'ANO': ano, 'MES': mes})
            .then()
            .catch(err => res.status(500))
        }
        const meta_existe = await db('pmp_pactuados').select().where({'ANO': ano, 'MES': mes, 'VINC_ID': vinc_id})
        const listaProcedimentos = await db('pmp_padrao').select().where({'CNES': cnes, 'CBO': cbo})
        if (meta_existe) {
            for (let procedimento of listaProcedimentos) {
                const novoValor = procedimento.quantidade * coeficiente
                db('pmp_pactuados').update({'QUANTIDADE': novoValor}).where({'ANO': ano, 'MES': mes, 'CNES': cnes, 'VINC_ID': vinc_id, 'COD_PROCED': procedimento.COD_PROCED})
                .catch(err => res.status(500))            
            }
        }
        else {
            for (let procedimento of listaProcedimentos) {
                const novoValor = procedimento.QUANTIDADE * coeficiente
                db('pmp_pactuados').insert({'MES': mes, 'ANO': ano, 'CNES': cnes, 'CNS': cns, 'VINC_ID': vinc_id, 'PROCEDIMENTO': procedimento.PROCEDIMENTO, 'QUANTIDADE': novoValor})
                .then()
                .catch(err => res.status(200).json({message: err}))
            }
        }
        res.status(200).json({message: 'Pactuação atualizada com sucesso!'})
    }

    async getResponsabilidade(req, res) {
        const cnes = req.params.cnes
        await db.select('responsabilidade.FILHO as cnes', 'cnes.NOME_UNIDADE')
        .from('responsabilidade')
        .leftJoin('cnes', 'responsabilidade.FILHO', 'cnes.CNES')
        .where({'responsabilidade.PAI': cnes})
        .then(resp => res.status(200).json(resp))
        .catch(e => res.status(500).json(e))
    }

    async getAnosDisa(req, res) {
        const disa = req.params.disa
        await db('pmp_pactuados').distinct('ANO').leftJoin('cnes', 'pmp_pactuados.CNES', 'cnes.CNES')
        .where({'DISA': disa})
        .then(anos => res.status(200).json(anos))
        .catch(e => res.status(500).json(e))
    }

    async getMesesDisa(req, res) {
        const disa = req.params.disa
        const ano = req.params.ano
        await db('pmp_pactuados').distinct('MES').leftJoin('cnes', 'pmp_pactuados.CNES', 'cnes.CNES')
        .where({'DISA': disa, 'ANO': ano})
        .then(meses => res.status(200).json(meses))
        .catch(e => res.status(500).json(e))
    }
    
    async getAnosPactuados(req, res) {
        const cnes = req.params.cnes
        await db('pmp_pactuados').distinct('ANO').where({'CNES': cnes})
        .then(anos => res.status(200).json(anos))
        .catch(e => res.status(500).json(e))
    }

    async getMesesPactuados(req, res) {
        const cnes = req.params.cnes
        const ano = req.params.ano
        await db('pmp_pactuados').distinct('MES').where({'CNES': cnes, 'ANO': ano})
        .then(meses => res.status(200).json(meses))
        .catch(e => res.status(500).json(e))
    }

    async getAnosPactuadosProfissional(req, res) {
        const cns = req.params.cns
        const vinc_id = req.params.vinc_id
        await db('pmp_pactuados').distinct('ANO').where({'CNS': cns, 'VINC_ID': vinc_id})
        .then(anos => res.status(200).json(anos))
        .catch(e => res.status(500).json(e))
    }

    async getMesesPactuadosProfissional(req, res) {
        const ano = req.params.ano
        const cns = req.params.cns
        const vinc_id = req.params.vinc_id
        await db('pmp_pactuados').distinct('MES').where({'CNS': cns, 'VINC_ID': vinc_id, 'ANO': ano})
        .then(meses => res.status(200).json(meses))
        .catch(e => res.status(500).json(e))
    }
  
    async getAnosSemsa(req, res) {
        await db('pmp_pactuados').distinct('ANO')
            .then(anos => res.status(200).json(anos))
        .catch(e => res.status(500).json(e))
    }

    async getMesesSemsa(req, res) {
        const ano = req.params.ano
        await db('pmp_pactuados').distinct('MES').where({'ANO': ano})
            .then(meses => res.status(200).json(meses))
        .catch(e => res.status(500).json(e))
    }

    async getUnidadesSobResp(req, res) {
        const vincId = req.params.vinc_id
        const fetchCpf = await db('profissionais').select().where('VINC_ID', 'like', `%${vincId}%`).first()
        if (!fetchCpf) {
            res.status(500).send('Usuário não encontrado')
        }
        else {
            const cpf = fetchCpf.CPF
            await db('cnes').select('CNES', 'NOME_UNIDADE').where({'CPF_RESP': cpf}).orderBy('NOME_UNIDADE')
            .then(resultado => {
                res.status(200).json(resultado)
            })
            .catch(e => res.status(500).json(e))
        }        
    }

    async renovarMetasDefault(req, res) {  
        const {ano, mes} = req.body
        const tempoComeco = new Date() 

        console.log('> Preenchendo as metas padrão do mês...')       

        let diasUteis = await db('dias_uteis').select('DIAS_UTEIS').where({'ANO': ano, 'MES': mes}).first()
        diasUteis = diasUteis.DIAS_UTEIS
        
        await db('pmp_pactuados').delete().where({'ANO': ano, 'MES': mes})

        const listaProfissionais = await db('profissionais').select()

        for (let prof of listaProfissionais) {
            console.log('>>>', listaProfissionais.indexOf(prof), 'de', listaProfissionais.length)
            const listaProcedimentos = await db('pmp_padrao').select('COD_PROCED', 'QUANTIDADE').where({'CNES': prof.CNES, 'CBO': prof.CBO})
            let coefPact = diasUteis/20
            const jaPactuado = await db('pmp_hist').select('COEFICIENTE').where({'ANO': ano, 'MES': mes, 'VINC_ID': prof.VINC_ID}).first()
            if (jaPactuado) {   
                coefPact = jaPactuado.COEFICIENTE
            }
            else {
                await db('pmp_hist').insert({'MES': mes, 'ANO': ano, 'CNES': prof.CNES, 'CNS': prof.CNS, 'VINC_ID': prof.VINC_ID, 'mat': 0, 'COEFICIENTE': coefPact, 'DIAS_PACTUADOS': diasUteis, 'FECHADO': 0, 'JUSTIFICATIVA': null})
            }

            for (let proced of listaProcedimentos) {
                await db('pmp_pactuados').insert({'MES': mes, 'ANO': ano, 'CNES': prof.CNES, 'INE': prof.INE, 'CNS': prof.CNS, 'VINC_ID': prof.VINC_ID, 'mat': 0, 'PROCEDIMENTO': proced.COD_PROCED, 'QUANTIDADE': Math.round(proced.QUANTIDADE * coefPact)})
            }
        }

        console.log('> Deletando da pmp_hist os profissionais que saíram da base...')
        const relVinculos = await db('profissionais').select('VINC_ID')
        let listaVinculos = []
        for (let vinculo of relVinculos) {
            listaVinculos.push(vinculo.VINC_ID)
        }
        await db('pmp_hist').delete().whereNotIn('VINC_ID', listaVinculos).andWhere({'ANO': ano, 'MES': mes})

        console.log('> Deletando da pmp_hist os profissionais com CBOs que não produzem meta...')
        const relCnes = await db('cnes').distinct('CNES')
        let listaCNES = []
        for (let nCnes of relCnes) {
            console.log('>>>', relCnes.indexOf(nCnes), 'de', relCnes.length)
            const cnes = nCnes.CNES
            const relCBOs = await db.distinct('CBO').from('pmp_padrao').where({'CNES': cnes})
            let listaCBOs = []
            for (let cbo of relCBOs) {
                listaCBOs.push(cbo.CBO)
            }
            const relVinculos = await db.distinct('VINC_ID').from('profissionais').whereNotIn('CBO', listaCBOs)
            let listaVinculos = []
            for (let vinc of relVinculos) {
                listaVinculos.push(vinc.VINC_ID)
            }
            await db.delete().from('pmp_hist').whereNotIn('VINC_ID', listaVinculos).andWhere({'CNES': cnes})
        }
        const tempoFinal = new Date()
        const tempoPassado = (tempoFinal - tempoComeco)/1000
        const tempoMinutos = tempoPassado/60
        console.log('> Finalizado em', tempoMinutos, 'minutos')       
    }
}

module.exports = new pactController()