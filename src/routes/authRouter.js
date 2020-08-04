const express = require('express')
const router = express.Router()

const userController = require('../controller/userController')
const api = require('../config/database')

router.post('/register', userController.create)

router.post('/login', userController.login)

module.exports = router