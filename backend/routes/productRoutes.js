const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');


router.get('/', (req, res) => {

    const cheminFichier = path.join(__dirname, '../data/produits.json');


    const donnees = fs.readFileSync(cheminFichier, 'utf-8');


    const produits = JSON.parse(donnees);


    res.json(produits);
});

module.exports = router;
