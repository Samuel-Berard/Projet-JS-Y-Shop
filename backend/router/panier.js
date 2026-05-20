const express = require('express');
const router = express.Router();
const cartController = require('../controller/panier');

router.post('/commander', cartController.passerCommande);

module.exports = router;
