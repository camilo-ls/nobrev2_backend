const express = require('express')
const router = express.Router()

const statController = require('../controller/statController')

router.post('/', statController.listOwn)
router.delete('/:id', statController.delete)

router.get('/list/:cns', statController.listOwn)
router.get('/list/agravo', statController.listAgravo)
router.get('/list/cod/:agravo', statController.listCod)


module.exports = router