const express = require('express')
const router = express.Router()

const pactController = require('../controller/pactController')

router.get('/coef/:ano/:mes/:cns/:mat', pactController.getCoef)
router.get('/data', pactController.getData)
router.get('/dias_uteis/:ano/:mes', pactController.getDiasUteis)
router.get('/dias_pact/:ano/:mes/:cns/:mat', pactController.getDiasPact)
router.get('/dias_mes/:ano/:mes', pactController.getDiasMes)
router.get('/unidade/:ano/:mes/:cnes', pactController.getListaPact)
router.get('/unidade_pact/:ano/:mes/:cnes', pactController.getMetaUnidade)
router.get('/disa_pact/:ano/:mes/:disa', pactController.getMetaDisa)
router.get('/faltam_pactuar/:ano/:mes/:disa', pactController.listaUnidadesPact)
router.get('/responsabilidade/:cnes', pactController.getResponsabilidade)
router.get('/data_revisao/:ano/:mes', pactController.getDataRevisao)

router.post('/pactuar', pactController.setPactFuncionario)

module.exports = router