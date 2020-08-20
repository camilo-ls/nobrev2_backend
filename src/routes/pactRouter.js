const express = require('express')
const router = express.Router()

const pactController = require('../controller/pactController')

router.get('/coef/:cns/:ano/:mes', pactController.getCoef)
router.get('/data', pactController.getData)
router.get('/dias_uteis/:ano/:mes', pactController.getDiasUteis)
router.get('/dias_pact/:cns/:ano/:mes', pactController.getDiasPact)
router.get('/dias_mes/:ano/:mes', pactController.getDiasMes)
router.get('/unidade/:cnes/:ano/:mes', pactController.getListaPact)
router.get('/unidade_pact/:cnes/:ano/:mes', pactController.getPactUnidade)

router.post('/pactuar', pactController.setPactFuncionario)

module.exports = router