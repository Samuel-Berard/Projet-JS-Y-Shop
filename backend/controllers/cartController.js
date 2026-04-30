const cartModel = require('../models/cartModel');



function passerCommande(req, res) {
    const { panier } = req.body;

    if (!panier || !Array.isArray(panier) || panier.length === 0) {
        return res.status(400).json({ message: 'Le panier est vide ou invalide' });
    }

    const resultat = cartModel.validerCommande(panier);

    if (resultat.succes) {
        res.json(resultat);
    } else {
        res.status(400).json(resultat);
    }
}


module.exports = {
    passerCommande
};
