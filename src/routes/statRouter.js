const express = require('express')
const router = express.Router()

const statController = require('../controller/statController')

router.post('/', statController.create)
router.delete('/:id', statController.delete)

router.get('/list/own/:cns', statController.listOwn)
router.get('/list/agravo', statController.listAgravo)
router.get('/list/cod/:agravo', statController.listCod)
router.get('/list/all', statController.listAll)

module.exports = router