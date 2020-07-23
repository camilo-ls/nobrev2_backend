import userController from '../controller/userController'
import jwt from 'jsonwebtoken'
import expressJwt from 'express-jwt'
import db from './database'

const signin = async (req, res) => {
    try {
        let user = await db('user').where({'email': req.body.email }).first()
        if (!user) {
            return res.status(401).send('Usuário não encontrado')
        }
    }

}

export default {
    signin,
    signout,
    requireSignin,
    hasAuth,
}