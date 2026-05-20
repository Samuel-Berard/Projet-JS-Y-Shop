

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

function afficherPanier() {
    let panier = lirePanier();
    const liste = document.querySelector('#panier-liste');
    const recap = document.querySelector('#panier-recap');
    const panierVide = document.querySelector('#panier-vide');

    liste.innerHTML = '';

    if (panier.length === 0) {
        
        recap.style.display = 'none';
        panierVide.style.display = 'block';
        return;
    }

    panierVide.style.display = 'none';
    recap.style.display = 'block';

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

function creerLignePanier(article) {
    const ligne = document.createElement('div');
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

    ligne.querySelector('.btn-moins-panier').addEventListener('click', function () {
        changerQuantite(article.id, -1);
    });

    ligne.querySelector('.btn-plus-panier').addEventListener('click', function () {
        changerQuantite(article.id, 1);
    });

    ligne.querySelector('.btn-supprimer-article').addEventListener('click', function () {
        supprimerArticle(article.id);
    });

    return ligne;
}

function changerQuantite(id, delta) {
    let panier = lirePanier();

    for (let i = 0; i < panier.length; i++) {
        if (panier[i].id === id) {
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

function supprimerArticle(id) {
    let panier = lirePanier();
    panier = panier.filter(function (article) {
        return article.id !== id;
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

function passerCommande() {
    let panier = lirePanier();

    if (panier.length === 0) {
        alert('Votre panier est vide !');
        return;
    }

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
        compteur.style.display = total > 0 ? 'inline-flex' : 'none';
    }
}

function mettreAJourCompteurFavoris() {
    const data = localStorage.getItem('favoris');
    let favoris = data ? JSON.parse(data) : [];
    const compteur = document.querySelector('#compteur-favoris');
    if (compteur) {
        compteur.textContent = favoris.length;
        compteur.style.display = favoris.length > 0 ? 'inline-flex' : 'none';
    }
}

function formaterPrix(prix) {
    return prix.toLocaleString('fr-FR');
}
