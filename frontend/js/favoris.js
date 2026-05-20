/**
 * favoris.js - Gestion de la page "Mes Favoris"
 * 
 * Ce fichier gère :
 *  - La lecture des favoris depuis le localStorage
 *  - L'affichage des produits en favoris
 *  - La suppression d'un produit des favoris
 *  - Les compteurs dans la navbar
 */

// On affiche les favoris dès le chargement
afficherFavoris();
mettreAJourCompteurPanier();
mettreAJourCompteurFavoris();


/**
 * Lit les favoris depuis le localStorage.
 * @returns {Array} - Tableau des produits favoris
 */
function lireFavoris() {
    var data = localStorage.getItem('favoris');
    return data ? JSON.parse(data) : [];
}

/**
 * Affiche tous les favoris dans la grille de produits.
 * Si aucun favori, affiche un message invitant à visiter le catalogue.
 */
function afficherFavoris() {
    var favoris = lireFavoris();
    var liste = document.querySelector('#favoris-liste');
    var favorisVide = document.querySelector('#favoris-vide');

    liste.innerHTML = '';

    if (favoris.length === 0) {
        // Aucun favori → message vide
        favorisVide.style.display = 'block';
        return;
    }

    favorisVide.style.display = 'none';

    // On affiche chaque favori comme une carte produit
    favoris.forEach(function (produit) {
        var carte = creerCarteFavori(produit);
        liste.appendChild(carte);
    });
}

/**
 * Crée une carte HTML pour un produit favori.
 * Inclut un bouton pour le retirer des favoris.
 * @param {Object} produit - Produit favori
 * @returns {HTMLElement} - Carte du favori
 */
function creerCarteFavori(produit) {
    var carte = document.createElement('div');
    carte.classList.add('row');
    carte.dataset.id = produit.id;

    carte.innerHTML = `
        <div class="product-images">
            <img src="./assets/${produit.image}" alt="${produit.nom}" class="product-img img-principale">
        </div>
        <div class="product-text">
            <h5>${produit.categorie}</h5>
        </div>
        <div class="heart-icon favori-actif-icon" data-id="${produit.id}" title="Retirer des favoris">
            <i class="fa-solid fa-heart favori-actif"></i>
        </div>
        <div class="product-info">
            <h4 class="product-name">${produit.nom}</h4>
            <p class="product-price">${formaterPrix(produit.prix)} ${produit.devise}</p>
        </div>
    `;

    // Clic sur la carte → page détail du produit
    carte.addEventListener('click', function (e) {
        if (e.target.closest('.heart-icon')) return;
        window.location.href = './produit.html?id=' + produit.id;
    });

    // Clic sur le cœur → retirer des favoris
    var iconCoeur = carte.querySelector('.heart-icon');
    iconCoeur.addEventListener('click', function (e) {
        e.stopPropagation();
        retirerDesFavoris(produit.id);
    });

    return carte;
}

/**
 * Retire un produit des favoris et rafraîchit l'affichage.
 * @param {number} id - Id du produit à retirer
 */
function retirerDesFavoris(id) {
    var favoris = lireFavoris();
    favoris = favoris.filter(function (f) { return f.id !== id; });
    localStorage.setItem('favoris', JSON.stringify(favoris));
    afficherFavoris();
    mettreAJourCompteurFavoris();
}

/**
 * Met à jour le compteur de favoris dans la navbar.
 */
function mettreAJourCompteurFavoris() {
    var favoris = lireFavoris();
    var compteur = document.querySelector('#compteur-favoris');
    if (compteur) {
        compteur.textContent = favoris.length;
        compteur.style.display = favoris.length > 0 ? 'inline-flex' : 'none';
    }
}

/**
 * Met à jour le compteur du panier dans la navbar.
 */
function mettreAJourCompteurPanier() {
    var data = localStorage.getItem('panier');
    var panier = data ? JSON.parse(data) : [];
    var total = 0;
    panier.forEach(function (item) { total += item.quantite; });

    var compteur = document.querySelector('#compteur-panier');
    if (compteur) {
        compteur.textContent = total;
        compteur.style.display = total > 0 ? 'inline-flex' : 'none';
    }
}

/**
 * Formate un prix avec des séparateurs de milliers.
 * @param {number} prix - Prix à formater
 * @returns {string} - Prix formaté
 */
function formaterPrix(prix) {
    return prix.toLocaleString('fr-FR');
}
