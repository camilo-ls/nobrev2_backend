const express = require('express')
const router = express.Router()

const profController = require('../controller/profController')

router.get('/pmp/:cns', profController.getMeta)
router.get('/:cpf', profController.get)

module.exports = router