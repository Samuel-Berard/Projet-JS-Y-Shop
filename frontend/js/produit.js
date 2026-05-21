const API_URL = 'http://localhost:3000/api/produits';

// Récupération de l'identifiant du produit depuis l'URL
const params = new URLSearchParams(window.location.search);
const produitId = params.get('id');

const container = document.querySelector('#products-container');

// Variables globales pour stocker les produits et les filtres
let listeProduits = [];
let filtres = [];

// Si on a un ID, on affiche la page de détail, sinon la liste complète
if (produitId) {
    chargerDetail(produitId);
} else {
    chargerProduits();
    initFiltres();
}

// Mise à jour des compteurs dans le menu
majCompteurs();

// Fonction pour récupérer les produits depuis le backend
function chargerProduits() {
    fetch(API_URL)
        .then(function (res) {
            if (!res.ok) throw new Error('Erreur chargement');
            return res.json();
        })
        .then(function (data) {
            listeProduits = data;
            filtres = data;
            afficher(data);
        })
        .catch(function (err) {
            console.error(err);
            container.innerHTML = '<p class="erreur-msg">Impossible de charger les produits. Le serveur est-il lancé ?</p>';
        });
}

// Fonction pour afficher une liste de produits dans le conteneur
function afficher(liste) {
    container.innerHTML = '';

    if (liste.length === 0) {
        container.innerHTML = '<p class="erreur-msg">Aucun produit pour ce filtre.</p>';
        return;
    }

    for (let i = 0; i < liste.length; i++) {
        container.appendChild(creerCarte(liste[i]));
    }
}

// Crée l'élément HTML (la carte) pour un produit donné
function creerCarte(produit) {
    const carte = document.createElement('div');
    carte.classList.add('row');
    carte.classList.add('pointer-cursor');

    const enFavori = estFavori(produit.id);
    const iconeCoeur = enFavori ? 'fa-solid fa-heart favori-actif' : 'fa-regular fa-heart';

    carte.innerHTML = `
        <div class="product-images">
            <img src="/assets/${produit.images[0]}" alt="${produit.nom}" class="product-img img-principale">
            <img src="/assets/${produit.images[1] || produit.images[0]}" alt="${produit.nom}" class="product-img img-secondaire">
        </div>
        <div class="product-text">
            <h5>${produit.categorie}</h5>
        </div>
        <div class="heart-icon" data-id="${produit.id}">
            <i class="${iconeCoeur}"></i>
        </div>
        <div class="product-info">
            <h4 class="product-name">${produit.nom}</h4>
            <p class="product-price">${afficherPrix(produit.prix)} ${produit.devise}</p>
        </div>
    `;

    carte.addEventListener('click', function (e) {
        if (e.target.closest('.heart-icon')) return;
        window.location.href = '/produit.html?id=' + produit.id;
    });

    const coeur = carte.querySelector('.heart-icon');
    coeur.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleFavori(produit);
        const ic = coeur.querySelector('i');
        ic.className = estFavori(produit.id) ? 'fa-solid fa-heart favori-actif' : 'fa-regular fa-heart';
        majCompteurs();
    });

    return carte;
}

function initFiltres() {
    const boutons = document.querySelectorAll('.btn-filtre');
    boutons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            boutons.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');

            const cat = btn.dataset.categorie;
            if (cat === 'tous') {
                filtres = listeProduits;
            } else {
                filtres = listeProduits.filter(function (p) { return p.categorie === cat; });
            }
            trier();
        });
    });

    const select = document.querySelector('#select-tri');
    if (select) {
        select.addEventListener('change', function () { trier(); });
    }
}

function trier() {
    const select = document.querySelector('#select-tri');
    const liste = filtres.slice();

    if (select) {
        if (select.value === 'prix-asc') {
            liste.sort(function (a, b) { return a.prix - b.prix; });
        } else if (select.value === 'prix-desc') {
            liste.sort(function (a, b) { return b.prix - a.prix; });
        } else if (select.value === 'nom-asc') {
            liste.sort(function (a, b) { return a.nom.localeCompare(b.nom); });
        }
    }

    afficher(liste);
}

function chargerDetail(id) {
    const mainHome = document.querySelector('.main-home');
    if (mainHome) mainHome.classList.add('hidden');

    const titre = document.querySelector('.trending-product .center-text h2');
    if (titre) titre.innerHTML = 'Détail du <span>Produit</span>';

    fetch(API_URL + '/' + id)
        .then(function (res) {
            if (!res.ok) throw new Error('Introuvable');
            return res.json();
        })
        .then(function (produit) {
            container.innerHTML = '';
            container.appendChild(creerCarteDetail(produit));
            chargerSimilaires(produit);
            initCarrousel(produit.images);
        })
        .catch(function () {
            container.innerHTML = '<p class="erreur-msg">Produit introuvable.</p>';
        });
}

function creerCarteDetail(produit) {
    const carte = document.createElement('div');
    carte.classList.add('produit-detail');

    let descCourte = produit.description;
    let tronquee = false;
    if (produit.description.length > 150) {
        descCourte = produit.description.substring(0, 150) + '...';
        tronquee = true;
    }

    const couleurs = Array.isArray(produit.couleurs) ? produit.couleurs : [produit.couleurs];
    let htmlCouleurs = couleurs.map(function (c, index) {
        // La première couleur est sélectionnée par défaut
        let classe = index === 0 ? 'badge-couleur actif' : 'badge-couleur';
        return '<span class="' + classe + '" data-couleur="' + c + '">' + c + '</span>';
    }).join('');

    const iconeCoeur = estFavori(produit.id) ? 'fa-solid fa-heart favori-actif' : 'fa-regular fa-heart';

    carte.innerHTML = `
        <div class="detail-images">
            <div class="carrousel-container">
                <button id="btn-gauche" class="carrousel-btn">&#10094;</button>
                <div class="carrousel-viewport">
                    <div id="carrousel-track">
                        ${produit.images.map(function(img) {
                            return '<img src="/assets/' + img + '" alt="' + produit.nom + '" class="carrousel-img">';
                        }).join('')}
                    </div>
                </div>
                <button id="btn-droite" class="carrousel-btn">&#10095;</button>
            </div>
            <div class="mini-images">
                ${produit.images.map(function(img, i) {
                    return '<img src="/assets/' + img + '" alt="' + produit.nom + '" class="mini-img" data-index="' + i + '">';
                }).join('')}
            </div>
        </div>

        <div class="detail-info">
            <div class="detail-header">
                <span class="detail-categorie">${produit.categorie}</span>
                <button class="btn-favori-detail" id="btn-favori-detail">
                    <i class="${iconeCoeur}"></i>
                </button>
            </div>

            <h2 class="detail-nom">${produit.nom}</h2>
            <p class="detail-prix">${afficherPrix(produit.prix)} <span class="detail-devise">${produit.devise}</span></p>

            <div class="detail-description">
                <p id="desc-texte">${descCourte}</p>
                ${tronquee ? '<button id="btn-voir-plus" class="btn-voir-plus">Voir plus</button>' : ''}
            </div>

            <div class="detail-caracteristiques">
                <h4>Caractéristiques</h4>
                <ul>
                    <li><strong>Catégorie :</strong> ${produit.categorie}</li>
                    <li><strong>Stock :</strong> ${produit.stock > 0 ? produit.stock + ' disponibles' : '<span class="rupture">Rupture de stock</span>'}</li>
                    ${produit['Ancien détenteur'] ? '<li><strong>Ancien détenteur :</strong> ' + produit['Ancien détenteur'] + '</li>' : ''}
                </ul>
            </div>

            <div class="detail-couleurs">
                <h4>Variantes disponibles</h4>
                <div class="couleurs-liste">${htmlCouleurs}</div>
            </div>

            <div class="detail-panier">
                <div class="quantite-selector">
                    <button id="btn-moins" class="btn-qty">-</button>
                    <input type="number" id="input-quantite" value="1" min="1" max="${produit.stock}" class="input-qty">
                    <button id="btn-plus" class="btn-qty">+</button>
                </div>
                <button id="btn-ajouter-panier" class="btn-ajouter-panier" ${produit.stock === 0 ? 'disabled' : ''}>
                    ${produit.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                </button>
            </div>
        </div>
    `;

    if (tronquee) {
        const btnVoir = carte.querySelector('#btn-voir-plus');
        const texte = carte.querySelector('#desc-texte');
        let ouvert = false;
        // Gère le clic sur "Voir plus" ou "Voir moins"
        btnVoir.addEventListener('click', function () {
            ouvert = !ouvert;
            texte.textContent = ouvert ? produit.description : descCourte;
            btnVoir.textContent = ouvert ? 'Voir moins' : 'Voir plus';
        });
    }

    // Gestion de la sélection de la couleur/variante
    const badgesCouleurs = carte.querySelectorAll('.badge-couleur');
    badgesCouleurs.forEach(function (badge) {
        badge.addEventListener('click', function () {
            badgesCouleurs.forEach(function (b) { b.classList.remove('actif'); });
            badge.classList.add('actif');
        });
    });

    const inputQte = carte.querySelector('#input-quantite');
    carte.querySelector('#btn-moins').addEventListener('click', function () {
        if (parseInt(inputQte.value) > 1) inputQte.value = parseInt(inputQte.value) - 1;
    });
    carte.querySelector('#btn-plus').addEventListener('click', function () {
        if (parseInt(inputQte.value) < produit.stock) inputQte.value = parseInt(inputQte.value) + 1;
    });

    // Bouton pour ajouter le produit au panier
    carte.querySelector('#btn-ajouter-panier').addEventListener('click', function () {
        const qte = parseInt(inputQte.value);
        let panier = lirePanier();
        let trouve = false;
        
        // Récupère la couleur sélectionnée
        const couleurActive = carte.querySelector('.badge-couleur.actif');
        const couleurChoisie = couleurActive ? couleurActive.dataset.couleur : couleurs[0];

        // Cherche si le produit avec la même couleur est déjà dans le panier
        for (let i = 0; i < panier.length; i++) {
            if (panier[i].id === produit.id && panier[i].couleur === couleurChoisie) {
                if (panier[i].quantite + qte > produit.stock) {
                    notif('Stock insuffisant ! Vous avez atteint la limite.');
                    return;
                }
                panier[i].quantite += qte;
                panier[i].stock = produit.stock;
                trouve = true;
                break;
            }
        }

        // Sinon on l'ajoute comme nouvel article
        if (!trouve) {
            panier.push({ 
                id: produit.id, 
                nom: produit.nom, 
                prix: produit.prix, 
                devise: produit.devise, 
                image: produit.images[0], 
                quantite: qte, 
                stock: produit.stock,
                couleur: couleurChoisie
            });
        }

        localStorage.setItem('panier', JSON.stringify(panier));
        notif('Produit ajouté au panier.');
        majCompteurs();
    });

    const btnFav = carte.querySelector('#btn-favori-detail');
    btnFav.addEventListener('click', function () {
        toggleFavori(produit);
        const ic = btnFav.querySelector('i');
        if (estFavori(produit.id)) {
            ic.className = 'fa-solid fa-heart favori-actif';
            notif('Ajouté aux favoris.');
        } else {
            ic.className = 'fa-regular fa-heart';
            notif('Retiré des favoris.');
        }
        majCompteurs();
    });

    const minis = carte.querySelectorAll('.mini-img');
    minis.forEach(function (mini, i) {
        mini.addEventListener('click', function () {
            allerA(i);
            minis.forEach(function (m) { m.classList.remove('mini-active'); });
            mini.classList.add('mini-active');
        });
    });
    if (minis.length > 0) minis[0].classList.add('mini-active');

    return carte;
}

let posCarrousel = 0;

function initCarrousel(images) {
    const track = document.querySelector('#carrousel-track');
    const btnG = document.querySelector('#btn-gauche');
    const btnD = document.querySelector('#btn-droite');
    if (!track) return;

    btnD.addEventListener('click', function () {
        posCarrousel++;
        if (posCarrousel >= images.length) posCarrousel = 0;
        allerA(posCarrousel);
        majMinis(posCarrousel);
    });

    btnG.addEventListener('click', function () {
        posCarrousel--;
        if (posCarrousel < 0) posCarrousel = images.length - 1;
        allerA(posCarrousel);
        majMinis(posCarrousel);
    });
}

function allerA(index) {
    const track = document.querySelector('#carrousel-track');
    if (!track) return;
    track.parentElement.scrollTo({ left: index * track.parentElement.clientWidth, behavior: 'smooth' });
    posCarrousel = index;
}

function majMinis(index) {
    const minis = document.querySelectorAll('.mini-img');
    minis.forEach(function (m, i) {
        m.classList.toggle('mini-active', i === index);
    });
}

function chargerSimilaires(produitActuel) {
    fetch(API_URL)
        .then(function (res) { return res.json(); })
        .then(function (data) {
            const similaires = data.filter(function (p) {
                return p.categorie === produitActuel.categorie && p.id !== produitActuel.id;
            }).slice(0, 4);

            if (similaires.length === 0) return;

            const section = document.createElement('div');
            section.classList.add('similaires-section');
            section.innerHTML = '<h3>Produits similaires</h3><div class="similaires-grille" id="similaires-grille"></div>';
            container.appendChild(section);

            const grille = document.querySelector('#similaires-grille');
            similaires.forEach(function (p) {
                grille.appendChild(creerCarte(p));
            });
        });
}

function lirePanier() {
    return JSON.parse(localStorage.getItem('panier') || '[]');
}

function estFavori(id) {
    let favoris = JSON.parse(localStorage.getItem('favoris') || '[]');
    for (let i = 0; i < favoris.length; i++) {
        if (favoris[i].id === id) return true;
    }
    return false;
}

function toggleFavori(produit) {
    let favoris = JSON.parse(localStorage.getItem('favoris') || '[]');
    if (estFavori(produit.id)) {
        favoris = favoris.filter(function (f) { return f.id !== produit.id; });
    } else {
        favoris.push({ id: produit.id, nom: produit.nom, prix: produit.prix, devise: produit.devise, image: produit.images[0], categorie: produit.categorie });
    }
    localStorage.setItem('favoris', JSON.stringify(favoris));
}

function afficherPrix(prix) {
    return prix.toLocaleString('fr-FR');
}

function notif(msg) {
    let el = document.querySelector('#notification');
    if (!el) {
        el = document.createElement('div');
        el.id = 'notification';
        document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('visible');
    setTimeout(function () { el.classList.remove('visible'); }, 2000);
}
