const userValidator = async (req, res, next) => {
    const { nivel, nome, email, password, admin, ativo, cnes, cpf } = req.body

    if (!nivel) {
        req.body.nivel = 0
    }
    if (!email) {
        res.status(400).send('Email não definido')
        return
    }
    if (!nome) {
        res.status(400).send('Nome não informado')
        return
    }
    if (!password) {
        res.status(400).send('Senha não informada')
        return
    }
    if (!admin) {
        req.body.admin = 0
    }
    if (!ativo) {
        req.body.ativo = 1
    }
   
    next()
  
}

module.exports = userValidator