const express = require('express')
const router = express.Router()
const controller = require('../controller/students')

router.get('/students/', controller.getAllStudents)
router.get('/students/:id', controller.getStudentById)

module.exports = router