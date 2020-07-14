const express = require('express')
const router = express.Router()

const cnesController = require('../controller/cnesController')

router.get('/:cnes/func', cnesController.getFuncionarios)
router.get('/:cnes/monitoramento', cnesController.getProcUnidade)
router.get('/', cnesController.all)
router.get('/:cnes', cnesController.get)

module.exports = router