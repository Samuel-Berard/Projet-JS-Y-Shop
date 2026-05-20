const express = require('express');
const router = express.Router();
const contactController = require('../controller/contact');

router.post('/', contactController.envoyerMessage);

module.exports = router;
