const express = require('express')
const router = express.Router()

const pactController = require('../controller/pactController')

router.get('/coef/:cns/:ano/:mes', pactController.getCoef)
router.get('/dias/:ano/:mes', pactController.getDias)
router.get('/dias_pact/:cns/:ano/:mes', pactController.getDiasPact)
router.get('/unidade/:cnes/:ano/:mes', pactController.getListaPact)

module.exports = router