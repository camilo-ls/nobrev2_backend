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
router.get('/disa_pact/:disa/:ano/:mes', pactController.getPactDisa)
router.get('/faltam_pactuar/:disa/:ano/:mes', pactController.listaUnidadesPact)
router.get('/responsabilidade/:cnes', pactController.getResponsabilidade)
router.get('/data_revisao/:ano/:mes', pactController.getDataRevisao)

router.post('/pactuar', pactController.setPactFuncionario)

module.exports = router