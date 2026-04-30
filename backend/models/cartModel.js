const fs = require('fs');
const path = require('path');

const cheminFichier = path.join(__dirname, '../data/produits.json');



function getTousProduits() {
    const donnees = fs.readFileSync(cheminFichier, 'utf-8');
    return JSON.parse(donnees);
}



function sauvegarderProduits(produits) {
    fs.writeFileSync(cheminFichier, JSON.stringify(produits, null, 4), 'utf-8');
}



function validerCommande(panier) {
    const produits = getTousProduits();
    const erreurs = [];


    panier.forEach(function (article) {
        const produit = produits.find(function (p) {
            return p.id == article.id;
        });

        if (!produit) {
            erreurs.push('Produit avec id ' + article.id + ' introuvable');
        } else if (produit.stock < article.quantite) {
            erreurs.push('Stock insuffisant pour ' + produit.nom + ' (dispo: ' + produit.stock + ', demande: ' + article.quantite + ')');
        }
    });

    if (erreurs.length > 0) {
        return { succes: false, erreurs: erreurs };
    }


    panier.forEach(function (article) {
        const produit = produits.find(function (p) {
            return p.id == article.id;
        });
        produit.stock = produit.stock - article.quantite;
    });

    sauvegarderProduits(produits);

    return { succes: true, message: 'Commande validee' };
}


module.exports = {
    validerCommande
};
