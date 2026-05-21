

const API_PANIER_URL = 'http://localhost:3000/api/panier/commander';

afficherPanier();
mettreAJourCompteurPanier();
mettreAJourCompteurFavoris();

function lirePanier() {
    const data = localStorage.getItem('panier');
    return data ? JSON.parse(data) : [];
}

function sauvegarderPanier(panier) {
    localStorage.setItem('panier', JSON.stringify(panier));
}

// Affiche le contenu du panier sur la page
function afficherPanier() {
    let panier = lirePanier();
    const liste = document.querySelector('#panier-liste');
    const recap = document.querySelector('#panier-recap');
    const panierVide = document.querySelector('#panier-vide');

    liste.innerHTML = '';

    if (panier.length === 0) {

        recap.classList.add('hidden');
        panierVide.classList.remove('hidden');
        return;
    }

    panierVide.classList.add('hidden');
    recap.classList.remove('hidden');

    panier.forEach(function (article) {
        const ligne = creerLignePanier(article);
        liste.appendChild(ligne);
    });

    calculerEtAfficherTotal(panier);

    const btnVider = document.querySelector('#btn-vider-panier');
    btnVider.onclick = function () {
        if (confirm('Êtes-vous sûr de vouloir vider le panier ?')) {
            viderPanier();
        }
    };

    const btnCommander = document.querySelector('#btn-commander');
    btnCommander.onclick = function () {
        passerCommande();
    };
}

// Crée l'élément HTML pour une ligne (un article) du panier
function creerLignePanier(article) {
    const ligne = document.createElement('div');
    ligne.classList.add('panier-article');
    // On utilise l'id et la couleur pour identifier l'article unique
    ligne.dataset.id = article.id;
    ligne.dataset.couleur = article.couleur || '';

    ligne.innerHTML = `
        <div class="panier-article-image">
            <img src="/assets/${article.image}" alt="${article.nom}">
        </div>
        <div class="panier-article-info">
            <h4 class="panier-article-nom">${article.nom}</h4>
            ${article.couleur ? '<p class="panier-article-couleur">Couleur: ' + article.couleur + '</p>' : ''}
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

    ligne.querySelector('.btn-moins-panier').addEventListener('click', function () {
        changerQuantite(article.id, article.couleur, -1);
    });

    ligne.querySelector('.btn-plus-panier').addEventListener('click', function () {
        changerQuantite(article.id, article.couleur, 1);
    });

    ligne.querySelector('.btn-supprimer-article').addEventListener('click', function () {
        supprimerArticle(article.id, article.couleur);
    });

    return ligne;
}

// Modifie la quantité d'un article dans le panier
function changerQuantite(id, couleur, delta) {
    let panier = lirePanier();

    for (let i = 0; i < panier.length; i++) {
        // On vérifie l'id ET la couleur
        if (panier[i].id === id && panier[i].couleur === couleur) {
            if (delta > 0 && panier[i].stock !== undefined && panier[i].quantite + delta > panier[i].stock) {
                alert('Stock insuffisant pour augmenter la quantité.');
                return;
            }
            panier[i].quantite += delta;

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

// Supprime un article du panier
function supprimerArticle(id, couleur) {
    let panier = lirePanier();
    panier = panier.filter(function (article) {
        return !(article.id === id && article.couleur === couleur);
    });
    sauvegarderPanier(panier);
    afficherPanier();
    mettreAJourCompteurPanier();
}

function viderPanier() {
    localStorage.removeItem('panier');
    afficherPanier();
    mettreAJourCompteurPanier();
}
//fonction pour calculer le total du panier
function calculerEtAfficherTotal(panier) {

    let total = 0;
    //on parcourt le panier et on ajoute le prix de chaque article au total
    panier.forEach(function (article) {
        total += article.prix * article.quantite;
    });
    //on recupere la devise du panier
    const devise = panier.length > 0 ? panier[0].devise : 'BERRY';
    //on recupere l'element total du panier
    const totalElem = document.querySelector('#panier-total-prix');
    //on affiche le total du panier
    if (totalElem) {
        totalElem.textContent = formaterPrix(total) + ' ' + devise;
    }
}

// Envoie la commande au serveur backend
function passerCommande() {
    let panier = lirePanier();

    if (panier.length === 0) {
        alert('Votre panier est vide !');
        return;
    }

    // Création du ticket de caisse
    let total = 0;
    let ticket = "Commande en cours de traitement...\n\nTICKET DE CAISSE\n\n";

    panier.forEach(function (article) {
        let sousTotal = article.prix * article.quantite;
        total += sousTotal;
        ticket += article.nom + " - Qté: " + article.quantite + " - Prix: " + formaterPrix(article.prix) + " BERRY - Sous-total: " + formaterPrix(sousTotal) + " BERRY\n";
    });

    ticket += "\nTOTAL: " + formaterPrix(total) + " BERRY\n\nMerci pour votre achat !";
    alert(ticket);

    // Vider le panier
    localStorage.removeItem('panier');
    mettreAJourCompteurPanier();

    // Afficher l'écran de confirmation
    document.querySelector('#panier-liste').style.display = 'none';
    document.querySelector('#panier-recap').style.display = 'none';
    document.querySelector('#panier-vide').style.display = 'none';
    document.querySelector('#panier-confirmation').style.display = 'block';
}
//fonction pour mettre à jour le compteur du panier
function mettreAJourCompteurPanier() {
    //on recupere le panier
    let panier = lirePanier();
    let total = 0;
    //on parcourt le panier et on ajoute le nombre d'articles au compteur
    panier.forEach(function (item) { total += item.quantite; });

    //on recupere l'element compteur
    const compteur = document.querySelector('#compteur-panier');
    //on affiche le compteur
    if (compteur) {
        compteur.textContent = total;
        compteur.classList.toggle('hidden', !(total > 0));
    }
}

function mettreAJourCompteurFavoris() {
    //on recupere les favoris
    const data = localStorage.getItem('favoris');
    let favoris = data ? JSON.parse(data) : [];
    //on recupere l'element compteur
    const compteur = document.querySelector('#compteur-favoris');
    //on affiche le compteur
    if (compteur) {
        compteur.textContent = favoris.length;
        compteur.classList.toggle('hidden', !(favoris.length > 0));
    }
}
//fonction pour formater le prix
function formaterPrix(prix) {
    //on formate le prix en le convertissant en chaine de caracteres
    return prix.toLocaleString('fr-FR');
}
