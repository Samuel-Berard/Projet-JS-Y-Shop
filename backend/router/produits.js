const express = require('express');
const router = express.Router();
const productController = require('../controller/produits');

//recuperer tous les produits
router.get('/', productController.recupererTousProduits);

//recuperer un produit par son id
router.get('/:id', productController.recupererProduitParId);

//mettre à jour le stock d'un produit
router.put('/:id/stock', productController.mettreAJourStock);

//exporter le router
module.exports = router;
