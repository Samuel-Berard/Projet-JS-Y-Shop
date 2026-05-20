// URL de l'API
var API_URL = 'http://localhost:3000/api/produits';

// Récupère l'id dans l'URL si on est sur une page détail
var params = new URLSearchParams(window.location.search);
var produitId = params.get('id');

var container = document.querySelector('#products-container');

// Listes de produits pour les filtres
var listeProduits = [];
var filtres = [];

// Lancement selon la page
if (produitId) {
    chargerDetail(produitId);
} else {
    chargerProduits();
    initFiltres();
}

majCompteurs();


// Charge et affiche tous les produits
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


// Affiche une liste de produits dans le container
function afficher(liste) {
    container.innerHTML = '';

    if (liste.length === 0) {
        container.innerHTML = '<p class="erreur-msg">Aucun produit pour ce filtre.</p>';
        return;
    }

    for (var i = 0; i < liste.length; i++) {
        container.appendChild(creerCarte(liste[i]));
    }
}


// Crée une carte produit pour le catalogue
function creerCarte(produit) {
    var carte = document.createElement('div');
    carte.classList.add('row');
    carte.style.cursor = 'pointer';

    var enFavori = estFavori(produit.id);
    var iconeCoeur = enFavori ? 'fa-solid fa-heart favori-actif' : 'fa-regular fa-heart';

    carte.innerHTML = `
        <div class="product-images">
            <img src="/assets/${produit.images[0]}" alt="${produit.nom}" class="product-img img-principale">
            <img src="/assets/${produit.images[1]}" alt="${produit.nom}" class="product-img img-secondaire">
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

    // Clic sur la carte -> page détail
    carte.addEventListener('click', function (e) {
        if (e.target.closest('.heart-icon')) return;
        window.location.href = '/produit.html?id=' + produit.id;
    });

    // Clic sur le coeur -> favori
    var coeur = carte.querySelector('.heart-icon');
    coeur.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleFavori(produit);
        var ic = coeur.querySelector('i');
        ic.className = estFavori(produit.id) ? 'fa-solid fa-heart favori-actif' : 'fa-regular fa-heart';
        majCompteurs();
    });

    return carte;
}


// Init les boutons filtres et le select de tri
function initFiltres() {
    var boutons = document.querySelectorAll('.btn-filtre');
    boutons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            boutons.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');

            var cat = btn.dataset.categorie;
            if (cat === 'tous') {
                filtres = listeProduits;
            } else {
                filtres = listeProduits.filter(function (p) { return p.categorie === cat; });
            }
            trier();
        });
    });

    var select = document.querySelector('#select-tri');
    if (select) {
        select.addEventListener('change', function () { trier(); });
    }
}


// Trie les produits filtrés et les réaffiche
function trier() {
    var select = document.querySelector('#select-tri');
    var liste = filtres.slice();

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


// Charge le détail d'un produit
function chargerDetail(id) {
    var mainHome = document.querySelector('.main-home');
    if (mainHome) mainHome.style.display = 'none';

    var titre = document.querySelector('.trending-product .center-text h2');
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


// Crée la vue détaillée d'un produit
function creerCarteDetail(produit) {
    var carte = document.createElement('div');
    carte.classList.add('produit-detail');

    // Description tronquée à 150 caractères
    var descCourte = produit.description;
    var tronquee = false;
    if (produit.description.length > 150) {
        descCourte = produit.description.substring(0, 150) + '...';
        tronquee = true;
    }

    // Couleurs (string ou tableau)
    var couleurs = Array.isArray(produit.couleurs) ? produit.couleurs : [produit.couleurs];
    var htmlCouleurs = couleurs.map(function (c) {
        return '<span class="badge-couleur">' + c + '</span>';
    }).join('');

    var iconeCoeur = estFavori(produit.id) ? 'fa-solid fa-heart favori-actif' : 'fa-regular fa-heart';

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

    // Bouton voir plus / voir moins
    if (tronquee) {
        var btnVoir = carte.querySelector('#btn-voir-plus');
        var texte = carte.querySelector('#desc-texte');
        var ouvert = false;
        btnVoir.addEventListener('click', function () {
            ouvert = !ouvert;
            texte.textContent = ouvert ? produit.description : descCourte;
            btnVoir.textContent = ouvert ? 'Voir moins' : 'Voir plus';
        });
    }

    // + / - quantité
    var inputQte = carte.querySelector('#input-quantite');
    carte.querySelector('#btn-moins').addEventListener('click', function () {
        if (parseInt(inputQte.value) > 1) inputQte.value = parseInt(inputQte.value) - 1;
    });
    carte.querySelector('#btn-plus').addEventListener('click', function () {
        if (parseInt(inputQte.value) < produit.stock) inputQte.value = parseInt(inputQte.value) + 1;
    });

    // Ajouter au panier
    carte.querySelector('#btn-ajouter-panier').addEventListener('click', function () {
        var qte = parseInt(inputQte.value);
        var panier = lirePanier();
        var trouve = false;

        for (var i = 0; i < panier.length; i++) {
            if (panier[i].id === produit.id) {
                panier[i].quantite += qte;
                trouve = true;
                break;
            }
        }

        if (!trouve) {
            panier.push({ id: produit.id, nom: produit.nom, prix: produit.prix, devise: produit.devise, image: produit.images[0], quantite: qte });
        }

        localStorage.setItem('panier', JSON.stringify(panier));
        notif('Produit ajouté au panier.');
        majCompteurs();
    });

    // Bouton favori
    var btnFav = carte.querySelector('#btn-favori-detail');
    btnFav.addEventListener('click', function () {
        toggleFavori(produit);
        var ic = btnFav.querySelector('i');
        if (estFavori(produit.id)) {
            ic.className = 'fa-solid fa-heart favori-actif';
            notif('Ajouté aux favoris.');
        } else {
            ic.className = 'fa-regular fa-heart';
            notif('Retiré des favoris.');
        }
        majCompteurs();
    });

    // Mini images du carrousel
    var minis = carte.querySelectorAll('.mini-img');
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


// Init le carrousel d'images
var posCarrousel = 0;

function initCarrousel(images) {
    var track = document.querySelector('#carrousel-track');
    var btnG = document.querySelector('#btn-gauche');
    var btnD = document.querySelector('#btn-droite');
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
    var track = document.querySelector('#carrousel-track');
    if (!track) return;
    track.style.transform = 'translateX(-' + (index * track.parentElement.clientWidth) + 'px)';
    posCarrousel = index;
}

function majMinis(index) {
    var minis = document.querySelectorAll('.mini-img');
    minis.forEach(function (m, i) {
        m.classList.toggle('mini-active', i === index);
    });
}


// Charge des produits de la même catégorie
function chargerSimilaires(produitActuel) {
    fetch(API_URL)
        .then(function (res) { return res.json(); })
        .then(function (data) {
            var similaires = data.filter(function (p) {
                return p.categorie === produitActuel.categorie && p.id !== produitActuel.id;
            }).slice(0, 4);

            if (similaires.length === 0) return;

            var section = document.createElement('div');
            section.classList.add('similaires-section');
            section.innerHTML = '<h3>Produits similaires</h3><div class="similaires-grille" id="similaires-grille"></div>';
            container.appendChild(section);

            var grille = document.querySelector('#similaires-grille');
            similaires.forEach(function (p) {
                grille.appendChild(creerCarte(p));
            });
        });
}


// --- Panier localStorage ---

function lirePanier() {
    return JSON.parse(localStorage.getItem('panier') || '[]');
}


// --- Favoris localStorage ---

function estFavori(id) {
    var favoris = JSON.parse(localStorage.getItem('favoris') || '[]');
    for (var i = 0; i < favoris.length; i++) {
        if (favoris[i].id === id) return true;
    }
    return false;
}

function toggleFavori(produit) {
    var favoris = JSON.parse(localStorage.getItem('favoris') || '[]');
    if (estFavori(produit.id)) {
        favoris = favoris.filter(function (f) { return f.id !== produit.id; });
    } else {
        favoris.push({ id: produit.id, nom: produit.nom, prix: produit.prix, devise: produit.devise, image: produit.images[0], categorie: produit.categorie });
    }
    localStorage.setItem('favoris', JSON.stringify(favoris));
}


// --- Utilitaires ---

function afficherPrix(prix) {
    return prix.toLocaleString('fr-FR');
}

// Notification temporaire en bas d'écran
function notif(msg) {
    var el = document.querySelector('#notification');
    if (!el) {
        el = document.createElement('div');
        el.id = 'notification';
        document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('visible');
    setTimeout(function () { el.classList.remove('visible'); }, 2000);
}
