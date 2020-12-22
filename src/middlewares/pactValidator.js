const pactValidator = async (req, res, next) => {
    const { nome, cns, vinc_id, cbo, dias_pactuados, fechado, cnes, ano, mes, justificativa, dias_mes } = req.body
    if (dias_pactuados != dias_mes) {
        if (justificativa == 'Selecione...' || justificativa.length < 3) {
            res.status(400).json({
                message: 'Justificativa inválida'
            })
            return
        }
    }    
    next()
}

module.exports = pactValidator