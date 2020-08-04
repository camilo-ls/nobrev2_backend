const express = require('express')
const router = express.Router()

const userController = require('../controller/userController')
const userValidator = require('../middlewares/userValidator')

router.put('/:id', userValidator, userController.update)
router.get('/', userController.all)
router.get('/:id', userController.get)

module.exports = router