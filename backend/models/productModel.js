const fs = require('fs');
const path = require('path');


const cheminFichier = path.join(__dirname, '../data/produits.json');


function getTousProduits() {
    const donnees = fs.readFileSync(cheminFichier, 'utf-8');
    return JSON.parse(donnees);
}



function getProduitParId(id) {
    const produits = getTousProduits();
    return produits.find(function (p) {
        return p.id == id;
    });
}



function mettreAJourStock(id, nouvelleQuantite) {
    const produits = getTousProduits();

    const index = produits.findIndex(function (p) {
        return p.id == id;
    });

    if (index === -1) {
        return null;
    }

    produits[index].stock = nouvelleQuantite;
    fs.writeFileSync(cheminFichier, JSON.stringify(produits, null, 4), 'utf-8');

    return produits[index];
}


module.exports = {
    getTousProduits,
    getProduitParId,
    mettreAJourStock
};
