const express = require('express');
const router = express.Router();
const productController = require('../controller/produits');

router.get('/', productController.recupererTousProduits);

router.get('/:id', productController.recupererProduitParId);

router.put('/:id/stock', productController.mettreAJourStock);

module.exports = router;
