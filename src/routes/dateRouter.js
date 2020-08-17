const express = require('express')
const router = express.Router()

const dataController = require('../controller/dataController')
const { route } = require('./profRouter')

router.get('/', dataController.getData)

module.exports = router