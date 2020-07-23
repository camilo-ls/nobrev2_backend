const express = require('express')
const router = express.Router()
const auth = require('../config/auth')

router.post('/signin', auth.signin)

export default router