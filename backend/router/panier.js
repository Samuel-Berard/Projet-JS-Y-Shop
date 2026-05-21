const express = require('express');
const router = express.Router();
const cartController = require('../controller/panier');

//recuperer tous les paniers
router.get('/', cartController.recupererTousPaniers);

//passer commande
router.post('/commander', cartController.passerCommande);

//exporter le router
module.exports = router;
