const express = require('express')
const router = express.Router()

const profController = require('../controller/profController')

router.get('/pmp/:cnes/:cns/:mat', profController.getMeta)
router.get('/pmp/:ano/:mes/:cnes/:cns/:mat', profController.getMeta)
router.get('/id/:cns/:mat', profController.get)
router.get('/cpf/:cpf', profController.getCpf)
router.get('/cns/:cns', profController.getCns)

module.exports = router