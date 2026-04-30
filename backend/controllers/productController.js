const productModel = require('../models/productModel');



function recupererTousProduits(req, res) {
    const produits = productModel.getTousProduits();
    res.json(produits);
}



function recupererProduitParId(req, res) {
    const id = req.params.id;
    const produit = productModel.getProduitParId(id);

    if (produit) {
        res.json(produit);
    } else {
        res.status(404).json({ message: 'Produit non trouve' });
    }
}


function mettreAJourStock(req, res) {
    const id = req.params.id;
    const { quantite } = req.body;

    if (quantite === undefined || quantite < 0) {
        return res.status(400).json({ message: 'Quantite invalide' });
    }

    const produit = productModel.mettreAJourStock(id, quantite);

    if (produit) {
        res.json(produit);
    } else {
        res.status(404).json({ message: 'Produit non trouve' });
    }
}


module.exports = {
    recupererTousProduits,
    recupererProduitParId,
    mettreAJourStock
};
