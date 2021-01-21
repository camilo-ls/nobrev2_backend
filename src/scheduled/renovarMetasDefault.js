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
        const tempoFinal = new Date()
        const tempoPassado = (tempoFinal - tempoComeco)/1000
        const tempoMinutos = tempoPassado/60
        console.log('> Finalizado em', tempoMinutos, 'minutos')
    })    
}

module.exports = renovarMetasDefault