const scheduler = require('node-schedule')
const db = require('../config/database')

const renovarMetasDefault = () => {
    scheduler.scheduleJob('0 58 0-8 1-8 * *', async () => {
        console.log('> Preenchendo as metas padrão do mês...')
        const ano = new Date().getFullYear()
        const mes = new Date().getMonth() + 1 // + 1 // próximo mês
        const diasUteis = await db('dias_uteis').select('dias_uteis').where({'ano': ano, 'mes': mes}).first()
        const listaUnidades = await db('pmp_padrao').distinct('cnes')
        if (listaUnidades) {
            for (let unidade of listaUnidades) {                
                const listaFuncionarios = await db('profissionais').select().where({'cnes': unidade.cnes})
                if (listaFuncionarios) {
                    for (let funcionario of listaFuncionarios) {                        
                        const ja_pactuou = await db('pmp_pactuados').select().where({'ano': ano, 'mes': mes, 'cns': funcionario.cns, 'mat': funcionario.mat}).first()
                        if (!ja_pactuou) {
                            let coeficiente_esap = parseFloat(funcionario.coef_ESAP)                            
                            let coeficiente = await db('pmp_hist').select('coeficiente').where({'ano': ano, 'mes': mes, 'cns': funcionario.cns, 'mat': funcionario.mat}).first()
                            if (coeficiente) coeficiente = coeficiente.coeficiente
                            else coeficiente = (diasUteis.dias_uteis/20) * coeficiente_esap
                            const listaProcedimentos = await db('pmp_padrao').select().where({'cnes': funcionario.cnes, 'cbo': funcionario.cbo})
                            if (listaProcedimentos) {
                                for (let procedimento of listaProcedimentos) {
                                    db('pmp_pactuados').insert({'ano': ano, 'mes': mes, 'cnes': funcionario.cnes, 'cns': funcionario.cns, 'mat': funcionario.mat,
                                    'procedimento': procedimento.procedimento, 'quantidade': Math.ceil(procedimento.quantidade * coeficiente)})
                                    .then().catch()
                                }
                            }
                        }
                    }
                }                
            }
        }
        console.log('> Finalizou...')
    })    
}

module.exports = renovarMetasDefault