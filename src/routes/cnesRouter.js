const express = require('express')
const router = express.Router()

const cnesController = require('../controller/cnesController')

router.get('/:cnes/func', cnesController.getFuncionarios)
router.get('/:cnes/monitoramento', cnesController.getProcUnidade)
router.get('/', cnesController.all)
router.get('/:cnes', cnesController.get)

router.get('/pact/:cns/:ano/:mes', cnesController.getPactFuncionario)
router.post('/pact', cnesController.setPactFuncionario)

module.exports = router