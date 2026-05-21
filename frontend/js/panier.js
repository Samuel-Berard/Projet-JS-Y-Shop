

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

function calculerEtAfficherTotal(panier) {
    let total = 0;
    panier.forEach(function (article) {
        total += article.prix * article.quantite;
    });

    const devise = panier.length > 0 ? panier[0].devise : 'BERRY';
    const totalElem = document.querySelector('#panier-total-prix');
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
 //fefe
    // Afficher une alerte après l'achat (ticket)
    let total = 0;
    const devise = panier.length > 0 ? panier[0].devise || '' : '';
    let ticket = 'Commande en cours de traitement...\n\nTICKET DE CAISSE\n\n';
    panier.forEach(function (a) {
        const sous = a.prix * a.quantite;
        total += sous;
        ticket += `${a.nom} - Qté: ${a.quantite} - Prix: ${formaterPrix(a.prix)} ${a.devise || ''} - Sous-total: ${formaterPrix(sous)} ${a.devise || ''}\n`;
    });
    ticket += `\nTOTAL: ${formaterPrix(total)} ${devise} \n\nMerci pour votre achat !`;
    alert(ticket);
//fefe
    const panierPourServeur = panier.map(function (article) {
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
                
                localStorage.removeItem('panier');
                mettreAJourCompteurPanier();

                document.querySelector('#panier-liste').style.display = 'none';
                document.querySelector('#panier-recap').style.display = 'none';
                document.querySelector('#panier-vide').style.display = 'none';
                document.querySelector('#panier-confirmation').style.display = 'block';
            } else {
                
                const msg = resultat.message || (resultat.erreurs ? resultat.erreurs.join('\n') : 'Erreur inconnue');
                alert('Impossible de passer la commande :\n' + msg);
            }
        })
        .catch(function (erreur) {
            console.error('Erreur commande:', erreur);
            alert('Erreur de connexion au serveur. Vérifiez que le serveur tourne.');
        });
}

function mettreAJourCompteurPanier() {
    let panier = lirePanier();
    let total = 0;
    panier.forEach(function (item) { total += item.quantite; });

    const compteur = document.querySelector('#compteur-panier');
    if (compteur) {
        compteur.textContent = total;
        compteur.classList.toggle('hidden', !(total > 0 ));
    }
}

function mettreAJourCompteurFavoris() {
    const data = localStorage.getItem('favoris');
    let favoris = data ? JSON.parse(data) : [];
    const compteur = document.querySelector('#compteur-favoris');
    if (compteur) {
        compteur.textContent = favoris.length;
        compteur.classList.toggle('hidden', !(favoris.length > 0 ));
    }
}

function formaterPrix(prix) {
    return prix.toLocaleString('fr-FR');
}
