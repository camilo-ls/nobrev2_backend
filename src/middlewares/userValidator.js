const TaskValidator = async (req, res, next) => {
    const { nivel, email, nome, password, admin, ativo } = req.body

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

module.exports = TaskValidator