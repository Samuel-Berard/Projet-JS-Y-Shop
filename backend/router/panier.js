const express = require('express');
const router = express.Router();
const cartController = require('../controller/panier');

//passer commande
router.post('/commander', cartController.passerCommande);

//exporter le router
module.exports = router;
