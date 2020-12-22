const express = require('express')
const router = express.Router()

const profController = require('../controller/profController')

router.get('/pmp/:cnes/:cns/:vinc_id', profController.getMeta)
router.get('/pmp/:ano/:mes/:cnes/:cns/:vinc_id', profController.getMeta)
router.get('/id/:ano/:mes/:cns/:vinc_id', profController.get)
router.get('/cpf/:cpf', profController.getCpf)
router.get('/cns/:cns', profController.getCns)

module.exports = router