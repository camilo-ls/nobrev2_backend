const userValidator = async (req, res, next) => {
    const { nivel, nome, email, password, admin, ativo, cnes, cpf } = req.body

    if (!nivel) {
        req.body.nivel = 0
    }
    if (!email) {
        res.status(400).json({message: 'Email não definido'})
        return
    }
    if (!email.includes('@') || !email.includes('.') || email.length < 5) {
        res.status(400).json({message: 'Email inválido'})
        return
    }
    if (!nome) {
        res.status(400).json({message: 'Nome não informado'})
        return
    }
    if (nome.length < 3) {
        res.status(400).json({message: 'Nome muito curto'})
        return
    }
    if (!password) {
        res.status(400).json({message: 'Senha não informada'})
        return
    }
    if (password.length < 4) {
        res.status(400).send({message: 'Senha muito curta. Utilize uma senha com no mínimo 4 dígitos'})
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