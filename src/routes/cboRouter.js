const express = require('express')
const router = express.Router()

const cboController = require('../controller/cboController')

router.get('/:cbo', cboController.get)

module.exports = router