const express = require('express')
const router = express.Router()

const profController = require('../controller/profController')

router.get('/pmp/:cnes/:cns', profController.getMeta)
router.get('/pmp/:cnes/:cns/:ano/:mes', profController.getMeta)
router.get('/:cns', profController.get)
router.get('/cpf/:cpf', profController.getCpf)

module.exports = router