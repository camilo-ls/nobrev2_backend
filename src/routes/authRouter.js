const express = require('express')
const router = express.Router()

const userController = require('../controller/userController')
const userValidator = require('../middlewares/userValidator')
const api = require('../config/database')

router.post('/register', userValidator, userController.create)
router.post('/login', userController.login)
router.post('/verifyToken', userController.verifyToken)

module.exports = router