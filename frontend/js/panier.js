/**
 * panier.js - Gestion de la page panier
 * 
 * Ce fichier gère :
 *  - La lecture du panier depuis le localStorage
 *  - L'affichage des articles du panier
 *  - La modification des quantités
 *  - La suppression d'un article
 *  - Le vidage complet du panier
 *  - Le calcul du total
 *  - L'envoi de la commande au serveur via l'API
 */

var API_PANIER_URL = 'http://localhost:3000/api/panier/commander';

// On lance l'affichage du panier dès le chargement de la page
afficherPanier();
mettreAJourCompteurPanier();
mettreAJourCompteurFavoris();


/**
 * Lit le panier depuis le localStorage.
 * @returns {Array} - Tableau des articles { id, nom, prix, devise, image, quantite }
 */
function lirePanier() {
    var data = localStorage.getItem('panier');
    return data ? JSON.parse(data) : [];
}

/**
 * Sauvegarde le panier dans le localStorage.
 * @param {Array} panier - Tableau des articles du panier
 */
function sauvegarderPanier(panier) {
    localStorage.setItem('panier', JSON.stringify(panier));
}

/**
 * Affiche tous les articles du panier dans la page.
 * Si le panier est vide, affiche un message et un lien vers la boutique.
 */
function afficherPanier() {
    var panier = lirePanier();
    var liste = document.querySelector('#panier-liste');
    var recap = document.querySelector('#panier-recap');
    var panierVide = document.querySelector('#panier-vide');

    liste.innerHTML = '';

    if (panier.length === 0) {
        // Panier vide → on affiche le message et on cache le récap
        recap.style.display = 'none';
        panierVide.style.display = 'block';
        return;
    }

    // Panier non vide → on affiche les articles et le récap
    panierVide.style.display = 'none';
    recap.style.display = 'block';

    panier.forEach(function (article) {
        var ligne = creerLignePanier(article);
        liste.appendChild(ligne);
    });

    // Mettre à jour le total
    calculerEtAfficherTotal(panier);

    // Bouton vider le panier
    var btnVider = document.querySelector('#btn-vider-panier');
    btnVider.onclick = function () {
        if (confirm('Êtes-vous sûr de vouloir vider le panier ?')) {
            viderPanier();
        }
    };

    // Bouton commander
    var btnCommander = document.querySelector('#btn-commander');
    btnCommander.onclick = function () {
        passerCommande();
    };
}

/**
 * Crée une ligne HTML pour un article du panier.
 * Inclut image, nom, prix unitaire, sélecteur quantité et bouton supprimer.
 * @param {Object} article - Article du panier
 * @returns {HTMLElement} - Élément de ligne du panier
 */
function creerLignePanier(article) {
    var ligne = document.createElement('div');
    ligne.classList.add('panier-article');
    ligne.dataset.id = article.id;

    ligne.innerHTML = `
        <div class="panier-article-image">
            <img src="/assets/${article.image}" alt="${article.nom}">
        </div>
        <div class="panier-article-info">
            <h4 class="panier-article-nom">${article.nom}</h4>
            <p class="panier-article-prix">${formaterPrix(article.prix)} ${article.devise}</p>
        </div>
        <div class="panier-article-quantite">
            <button class="btn-qty btn-moins-panier" data-id="${article.id}">-</button>
            <span class="qte-affichage">${article.quantite}</span>
            <button class="btn-qty btn-plus-panier" data-id="${article.id}">+</button>
        </div>
        <div class="panier-article-sous-total">
            <p>${formaterPrix(article.prix * article.quantite)} ${article.devise}</p>
        </div>
        <button class="btn-supprimer-article" data-id="${article.id}" title="Supprimer">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;

    // Bouton diminuer la quantité
    ligne.querySelector('.btn-moins-panier').addEventListener('click', function () {
        changerQuantite(article.id, -1);
    });

    // Bouton augmenter la quantité
    ligne.querySelector('.btn-plus-panier').addEventListener('click', function () {
        changerQuantite(article.id, 1);
    });

    // Bouton supprimer l'article
    ligne.querySelector('.btn-supprimer-article').addEventListener('click', function () {
        supprimerArticle(article.id);
    });

    return ligne;
}

/**
 * Modifie la quantité d'un article dans le panier.
 * Si la quantité atteint 0, l'article est supprimé.
 * @param {number} id - Id du produit
 * @param {number} delta - Variation de quantité (+1 ou -1)
 */
function changerQuantite(id, delta) {
    var panier = lirePanier();

    for (var i = 0; i < panier.length; i++) {
        if (panier[i].id === id) {
            panier[i].quantite += delta;

            // Si quantité tombe à 0, on supprime l'article
            if (panier[i].quantite <= 0) {
                panier.splice(i, 1);
            }
            break;
        }
    }

    sauvegarderPanier(panier);
    afficherPanier();
    mettreAJourCompteurPanier();
}

/**
 * Supprime un article du panier par son id.
 * @param {number} id - Id du produit à supprimer
 */
function supprimerArticle(id) {
    var panier = lirePanier();
    panier = panier.filter(function (article) {
        return article.id !== id;
    });
    sauvegarderPanier(panier);
    afficherPanier();
    mettreAJourCompteurPanier();
}

/**
 * Vide complètement le panier (localStorage + affichage).
 */
function viderPanier() {
    localStorage.removeItem('panier');
    afficherPanier();
    mettreAJourCompteurPanier();
}

/**
 * Calcule le total du panier et l'affiche dans la zone récap.
 * @param {Array} panier - Tableau des articles du panier
 */
function calculerEtAfficherTotal(panier) {
    var total = 0;
    panier.forEach(function (article) {
        total += article.prix * article.quantite;
    });

    // On affiche avec la devise du premier article (tous sont en BERRY)
    var devise = panier.length > 0 ? panier[0].devise : 'BERRY';
    var totalElem = document.querySelector('#panier-total-prix');
    if (totalElem) {
        totalElem.textContent = formaterPrix(total) + ' ' + devise;
    }
}

/**
 * Envoie la commande au serveur via un POST sur /api/panier/commander.
 * Si la commande réussit, vide le panier et affiche un message de confirmation.
 * En cas d'erreur (stock insuffisant), affiche un message d'erreur.
 */
function passerCommande() {
    var panier = lirePanier();

    if (panier.length === 0) {
        alert('Votre panier est vide !');
        return;
    }

    // On prépare les données à envoyer : juste les ids et quantités
    var panierPourServeur = panier.map(function (article) {
        return { id: article.id, quantite: article.quantite };
    });

    fetch(API_PANIER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ panier: panierPourServeur })
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (resultat) {
            if (resultat.succes) {
                // Commande réussie → on vide le panier et on affiche la confirmation
                localStorage.removeItem('panier');
                mettreAJourCompteurPanier();

                document.querySelector('#panier-liste').style.display = 'none';
                document.querySelector('#panier-recap').style.display = 'none';
                document.querySelector('#panier-vide').style.display = 'none';
                document.querySelector('#panier-confirmation').style.display = 'block';
            } else {
                // Erreur côté serveur (stock insuffisant, etc.)
                var msg = resultat.message || (resultat.erreurs ? resultat.erreurs.join('\n') : 'Erreur inconnue');
                alert('Impossible de passer la commande :\n' + msg);
            }
        })
        .catch(function (erreur) {
            console.error('Erreur commande:', erreur);
            alert('Erreur de connexion au serveur. Vérifiez que le serveur tourne.');
        });
}

/**
 * Met à jour le compteur du panier dans la navbar.
 */
function mettreAJourCompteurPanier() {
    var panier = lirePanier();
    var total = 0;
    panier.forEach(function (item) { total += item.quantite; });

    var compteur = document.querySelector('#compteur-panier');
    if (compteur) {
        compteur.textContent = total;
        compteur.style.display = total > 0 ? 'inline-flex' : 'none';
    }
}

/**
 * Met à jour le compteur de favoris dans la navbar.
 */
function mettreAJourCompteurFavoris() {
    var data = localStorage.getItem('favoris');
    var favoris = data ? JSON.parse(data) : [];
    var compteur = document.querySelector('#compteur-favoris');
    if (compteur) {
        compteur.textContent = favoris.length;
        compteur.style.display = favoris.length > 0 ? 'inline-flex' : 'none';
    }
}

/**
 * Formate un prix en séparant les milliers avec des espaces.
 * @param {number} prix - Prix à formater
 * @returns {string} - Prix formaté
 */
function formaterPrix(prix) {
    return prix.toLocaleString('fr-FR');
}
