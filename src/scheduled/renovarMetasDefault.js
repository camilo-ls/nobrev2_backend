const scheduler = require('node-schedule')
const db = require('../config/database')

const renovarMetasDefault = () => {
    scheduler.scheduleJob({hour: 1, minute: 30}, async () => {
        let tempoComeco = new Date()        
        console.log('> Preenchendo as metas padrão do mês...')
        const ano = tempoComeco.getFullYear()
        const mes = tempoComeco.getMonth() + 2
        if (mes > 12) {
            ano = ano + 1
            mes = mes % 12
        }
        console.log(ano, mes)
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
            const relVinculos = await db.distinct('VINC_ID').from('profissionais').whereNotIn('CBO', listaCBOs).andWhere({'CNES': cnes})
            let listaVinculos = []
            for (let vinc of relVinculos) {
                listaVinculos.push(vinc.VINC_ID)
            }
            await db.delete().from('pmp_hist').whereIn('VINC_ID', listaVinculos).andWhere({'CNES': cnes})
        }
        
        const tempoFinal = new Date()
        const tempoPassado = (tempoFinal - tempoComeco)/1000
        const tempoMinutos = tempoPassado/60
        console.log('> Finalizado em', tempoMinutos, 'minutos')
    })    
}

module.exports = renovarMetasDefault