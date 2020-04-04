const express = require('express')
const router = express.Router()

const Controller = require('../controller/accessDataController')

router.get('/', Controller.getDistribution)

module.exports = router
