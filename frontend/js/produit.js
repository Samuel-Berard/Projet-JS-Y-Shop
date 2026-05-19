/**
 * produit.js - Gestion de la page catalogue et de la page détail produit
 * Auteur : Y-Shop
 * 
 * Ce fichier gère :
 *  - L'affichage de tous les produits (catalogue)
 *  - Le filtre par catégorie
 *  - Le tri (prix croissant/décroissant, nom)
 *  - L'affichage du détail d'un produit (carrousel, description tronquée, produits similaires)
 *  - L'ajout au panier (via localStorage)
 *  - Le compteur panier dans la navbar
 */

const API_URL = 'http://localhost:3000/api/produits';

// On récupère l'id du produit dans l'URL si on est sur une page détail
var params = new URLSearchParams(window.location.search);
var produitId = params.get('id');

var productsContainer = document.getElementById('products-container');

// Stockage de tous les produits chargés pour les filtres/tri côté client
var tousLesProduits = [];
var produitsFiltres = [];

// --- Initialisation ---
if (produitId) {
    chargerDetailProduit(produitId);
} else {
    chargerTousLesProduits();
    initialiserFiltresEtTri();
}

// Met à jour le compteur panier dans la navbar dès le chargement
mettreAJourCompteurPanier();
mettreAJourCompteurFavoris();


// =============================================
// CATALOGUE - Chargement de tous les produits
// =============================================

/**
 * Charge tous les produits depuis l'API et les affiche dans le catalogue.
 */
function chargerTousLesProduits() {
    fetch(API_URL)
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des produits');
            }
            return response.json();
        })
        .then(function (produits) {
            // On garde une copie de tous les produits pour les filtres
            tousLesProduits = produits;
            produitsFiltres = produits;
            afficherProduits(produits);
        })
        .catch(function (erreur) {
            console.error('Erreur:', erreur);
            productsContainer.innerHTML = '<p class="erreur-msg">Impossible de charger les produits. Vérifiez que le serveur tourne.</p>';
        });
}

/**
 * Affiche une liste de produits dans le conteneur.
 * @param {Array} produits - Tableau de produits à afficher
 */
function afficherProduits(produits) {
    productsContainer.innerHTML = '';

    if (produits.length === 0) {
        productsContainer.innerHTML = '<p class="erreur-msg">Aucun produit trouvé pour ce filtre.</p>';
        return;
    }

    produits.forEach(function (produit) {
        var carte = creerCarteProduit(produit);
        productsContainer.appendChild(carte);
    });
}

/**
 * Crée et retourne une carte HTML pour un produit du catalogue.
 * Au survol, la première image est remplacée par la seconde.
 * @param {Object} produit - Objet produit
 * @returns {HTMLElement} - Élément carte du produit
 */
function creerCarteProduit(produit) {
    var carte = document.createElement('div');
    carte.classList.add('row');
    carte.style.cursor = 'pointer';

    // Badge favori
    var estFavori = estDansFavoris(produit.id);
    var classCoeur = estFavori ? 'fa-solid fa-heart favori-actif' : 'fa-regular fa-heart';

    carte.innerHTML = `
        <div class="product-images">
            <img src="./assets/${produit.images[0]}" alt="${produit.nom}" class="product-img img-principale">
            <img src="./assets/${produit.images[1]}" alt="${produit.nom}" class="product-img img-secondaire">
        </div>
        <div class="product-text">
            <h5>${produit.categorie}</h5>
        </div>
        <div class="heart-icon" data-id="${produit.id}">
            <i class="${classCoeur}"></i>
        </div>
        <div class="product-info">
            <h4 class="product-name">${produit.nom}</h4>
            <p class="product-price">${formaterPrix(produit.prix)} ${produit.devise}</p>
        </div>
    `;

    // Clic sur la carte → page détail
    carte.addEventListener('click', function (e) {
        // Si on clique sur le cœur, on ne navigue pas
        if (e.target.closest('.heart-icon')) return;
        window.location.href = './produit.html?id=' + produit.id;
    });

    // Clic sur le cœur → ajouter/retirer des favoris
    var iconCoeur = carte.querySelector('.heart-icon');
    iconCoeur.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleFavori(produit);
        // Mettre à jour l'icône
        var icone = iconCoeur.querySelector('i');
        if (estDansFavoris(produit.id)) {
            icone.className = 'fa-solid fa-heart favori-actif';
        } else {
            icone.className = 'fa-regular fa-heart';
        }
        mettreAJourCompteurFavoris();
    });

    return carte;
}


// =============================================
// FILTRES ET TRI
// =============================================

/**
 * Initialise les boutons de filtre par catégorie et le sélecteur de tri.
 * Ces éléments doivent exister dans le HTML de produit.html.
 */
function initialiserFiltresEtTri() {
    // Filtre par catégorie
    var boutonsFiltre = document.querySelectorAll('.btn-filtre');
    boutonsFiltre.forEach(function (bouton) {
        bouton.addEventListener('click', function () {
            // On retire la classe active de tous les boutons
            boutonsFiltre.forEach(function (b) { b.classList.remove('active'); });
            bouton.classList.add('active');

            var categorie = bouton.dataset.categorie;
            // Si 'tous', on remet tout, sinon on filtre
            if (categorie === 'tous') {
                produitsFiltres = tousLesProduits;
            } else {
                produitsFiltres = tousLesProduits.filter(function (p) {
                    return p.categorie === categorie;
                });
            }
            // On applique aussi le tri en cours
            appliquerTri();
        });
    });

    // Tri
    var selectTri = document.getElementById('select-tri');
    if (selectTri) {
        selectTri.addEventListener('change', function () {
            appliquerTri();
        });
    }
}

/**
 * Applique le tri sélectionné sur les produits filtrés et les réaffiche.
 */
function appliquerTri() {
    var selectTri = document.getElementById('select-tri');
    if (!selectTri) {
        afficherProduits(produitsFiltres);
        return;
    }

    var valeurTri = selectTri.value;
    var produitsTries = produitsFiltres.slice(); // copie du tableau

    if (valeurTri === 'prix-asc') {
        produitsTries.sort(function (a, b) { return a.prix - b.prix; });
    } else if (valeurTri === 'prix-desc') {
        produitsTries.sort(function (a, b) { return b.prix - a.prix; });
    } else if (valeurTri === 'nom-asc') {
        produitsTries.sort(function (a, b) { return a.nom.localeCompare(b.nom); });
    }
    // Si valeur === 'defaut', on laisse l'ordre d'origine

    afficherProduits(produitsTries);
}


// =============================================
// DETAIL PRODUIT
// =============================================

/**
 * Charge le détail d'un produit par son id depuis l'API et affiche la page détail.
 * @param {string|number} id - Identifiant du produit
 */
function chargerDetailProduit(id) {
    // On masque la section bannière s'il y en a une
    var mainHome = document.querySelector('.main-home');
    if (mainHome) mainHome.style.display = 'none';

    // On change le titre de la section
    var centerText = document.querySelector('.trending-product .center-text h2');
    if (centerText) centerText.innerHTML = 'Détail du <span>Produit</span>';

    fetch(API_URL + '/' + id)
        .then(function (response) {
            if (!response.ok) throw new Error('Produit non trouvé');
            return response.json();
        })
        .then(function (produit) {
            productsContainer.innerHTML = '';
            var carte = creerCarteDetaillee(produit);
            productsContainer.appendChild(carte);

            // Après avoir affiché le produit, on charge les produits similaires
            chargerProduitsSimilaires(produit);

            // On initialise le carrousel
            initialiserCarrousel(produit.images);
        })
        .catch(function (erreur) {
            console.error('Erreur:', erreur);
            productsContainer.innerHTML = '<p class="erreur-msg">Produit introuvable.</p>';
        });
}

/**
 * Crée la carte HTML détaillée d'un produit (pour la page détail).
 * Inclut : images, description tronquée, caractéristiques, sélecteur quantité, bouton panier.
 * @param {Object} produit - Objet produit complet
 * @returns {HTMLElement} - Carte détaillée
 */
function creerCarteDetaillee(produit) {
    var carte = document.createElement('div');
    carte.classList.add('produit-detail');

    // Tronquer la description à 150 caractères
    var descriptionCourte = produit.description;
    var descriptionComplete = produit.description;
    var estTronquee = false;
    if (produit.description.length > 150) {
        descriptionCourte = produit.description.substring(0, 150) + '...';
        estTronquee = true;
    }

    // Couleurs disponibles (peut être string ou tableau)
    var couleurs = Array.isArray(produit.couleurs) ? produit.couleurs : [produit.couleurs];
    var htmlCouleurs = couleurs.map(function (couleur) {
        return '<span class="badge-couleur">' + couleur + '</span>';
    }).join('');

    // Favori
    var estFavori = estDansFavoris(produit.id);
    var classCoeur = estFavori ? 'fa-solid fa-heart favori-actif' : 'fa-regular fa-heart';

    carte.innerHTML = `
        <div class="detail-images">
            <div class="carrousel-container">
                <button id="btn-gauche" class="carrousel-btn">&#10094;</button>
                <div class="carrousel-viewport">
                    <div id="carrousel-track">
                        ${produit.images.map(function(img) {
                            return '<img src="./assets/' + img + '" alt="' + produit.nom + '" class="carrousel-img">';
                        }).join('')}
                    </div>
                </div>
                <button id="btn-droite" class="carrousel-btn">&#10095;</button>
            </div>
            <div class="mini-images">
                ${produit.images.map(function(img, index) {
                    return '<img src="./assets/' + img + '" alt="' + produit.nom + '" class="mini-img" data-index="' + index + '">';
                }).join('')}
            </div>
        </div>

        <div class="detail-info">
            <div class="detail-header">
                <span class="detail-categorie">${produit.categorie}</span>
                <button class="btn-favori-detail" id="btn-favori-detail" title="Ajouter aux favoris">
                    <i class="${classCoeur}"></i>
                </button>
            </div>

            <h2 class="detail-nom">${produit.nom}</h2>
            <p class="detail-prix">${formaterPrix(produit.prix)} <span class="detail-devise">${produit.devise}</span></p>

            <div class="detail-description">
                <p id="desc-texte">${descriptionCourte}</p>
                ${estTronquee ? '<button id="btn-voir-plus" class="btn-voir-plus">Voir plus</button>' : ''}
            </div>

            <div class="detail-caracteristiques">
                <h4>Caractéristiques</h4>
                <ul>
                    <li><strong>Catégorie :</strong> ${produit.categorie}</li>
                    <li><strong>Stock :</strong> ${produit.stock > 0 ? produit.stock + ' disponibles' : '<span class="rupture">Rupture de stock</span>'}</li>
                    ${produit['Ancien détenteur'] ? '<li><strong>Ancien détenteur :</strong> ' + produit['Ancien détenteur'] + '</li>' : ''}
                    ${produit.spoiler ? '<li><strong>Spoiler :</strong> <span class="badge-spoiler">Contient des spoilers</span></li>' : ''}
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
                    🛒 ${produit.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                </button>
            </div>
        </div>
    `;

    // Bouton voir plus/moins pour la description
    if (estTronquee) {
        var btnVoirPlus = carte.querySelector('#btn-voir-plus');
        var descTexte = carte.querySelector('#desc-texte');
        var affichageComplet = false;

        btnVoirPlus.addEventListener('click', function () {
            if (!affichageComplet) {
                descTexte.textContent = descriptionComplete;
                btnVoirPlus.textContent = 'Voir moins';
                affichageComplet = true;
            } else {
                descTexte.textContent = descriptionCourte;
                btnVoirPlus.textContent = 'Voir plus';
                affichageComplet = false;
            }
        });
    }

    // Sélecteur de quantité
    var inputQte = carte.querySelector('#input-quantite');
    var btnMoins = carte.querySelector('#btn-moins');
    var btnPlus = carte.querySelector('#btn-plus');

    btnMoins.addEventListener('click', function () {
        var val = parseInt(inputQte.value);
        if (val > 1) inputQte.value = val - 1;
    });

    btnPlus.addEventListener('click', function () {
        var val = parseInt(inputQte.value);
        if (val < produit.stock) inputQte.value = val + 1;
    });

    // Bouton ajouter au panier
    var btnAjouter = carte.querySelector('#btn-ajouter-panier');
    btnAjouter.addEventListener('click', function () {
        var quantite = parseInt(inputQte.value);
        ajouterAuPanier(produit, quantite);
        afficherNotification('✅ Ajouté au panier !');
        mettreAJourCompteurPanier();
    });

    // Bouton favori dans le détail
    var btnFavoriDetail = carte.querySelector('#btn-favori-detail');
    btnFavoriDetail.addEventListener('click', function () {
        toggleFavori(produit);
        var icone = btnFavoriDetail.querySelector('i');
        if (estDansFavoris(produit.id)) {
            icone.className = 'fa-solid fa-heart favori-actif';
            afficherNotification('❤️ Ajouté aux favoris !');
        } else {
            icone.className = 'fa-regular fa-heart';
            afficherNotification('💔 Retiré des favoris');
        }
        mettreAJourCompteurFavoris();
    });

    // Mini images pour la galerie
    var miniImgs = carte.querySelectorAll('.mini-img');
    miniImgs.forEach(function (mini) {
        mini.addEventListener('click', function () {
            var index = parseInt(mini.dataset.index);
            allerVersImage(index);
            // Mettre la mini image active en surbrillance
            miniImgs.forEach(function (m) { m.classList.remove('mini-active'); });
            mini.classList.add('mini-active');
        });
    });
    // La première mini image est active par défaut
    if (miniImgs.length > 0) miniImgs[0].classList.add('mini-active');

    return carte;
}


// =============================================
// CARROUSEL D'IMAGES
// =============================================

var positionCarrousel = 0;

/**
 * Initialise le carrousel d'images dans la page détail.
 * Gère les boutons gauche/droite et le défilement.
 * @param {Array} images - Tableau des noms d'images du produit
 */
function initialiserCarrousel(images) {
    var track = document.getElementById('carrousel-track');
    var btnGauche = document.getElementById('btn-gauche');
    var btnDroite = document.getElementById('btn-droite');

    if (!track || !btnGauche || !btnDroite) return;

    var nbImages = images.length;
    positionCarrousel = 0;

    // Bouton droite → image suivante
    btnDroite.addEventListener('click', function () {
        positionCarrousel++;
        if (positionCarrousel >= nbImages) positionCarrousel = 0;
        allerVersImage(positionCarrousel);
        mettreAJourMiniActif(positionCarrousel);
    });

    // Bouton gauche → image précédente
    btnGauche.addEventListener('click', function () {
        positionCarrousel--;
        if (positionCarrousel < 0) positionCarrousel = nbImages - 1;
        allerVersImage(positionCarrousel);
        mettreAJourMiniActif(positionCarrousel);
    });
}

/**
 * Déplace le carrousel vers l'image à l'index donné.
 * @param {number} index - Index de l'image à afficher
 */
function allerVersImage(index) {
    var track = document.getElementById('carrousel-track');
    if (!track) return;
    var largeur = track.parentElement.clientWidth;
    track.style.transform = 'translateX(-' + (index * largeur) + 'px)';
    positionCarrousel = index;
}

/**
 * Met à jour la mini image active (surbrillance) dans la galerie.
 * @param {number} index - Index de l'image active
 */
function mettreAJourMiniActif(index) {
    var miniImgs = document.querySelectorAll('.mini-img');
    miniImgs.forEach(function (m, i) {
        if (i === index) {
            m.classList.add('mini-active');
        } else {
            m.classList.remove('mini-active');
        }
    });
}


// =============================================
// PRODUITS SIMILAIRES
// =============================================

/**
 * Charge et affiche les produits de la même catégorie que le produit actuel.
 * Exclut le produit lui-même de la liste.
 * @param {Object} produitActuel - Le produit dont on cherche les similaires
 */
function chargerProduitsSimilaires(produitActuel) {
    fetch(API_URL)
        .then(function (response) { return response.json(); })
        .then(function (produits) {
            // On garde les produits de la même catégorie (sans le produit actuel)
            var similaires = produits.filter(function (p) {
                return p.categorie === produitActuel.categorie && p.id !== produitActuel.id;
            });

            // On affiche au maximum 4 produits similaires
            var quatrePremiers = similaires.slice(0, 4);

            if (quatrePremiers.length === 0) return;

            // On crée la section similaires
            var sectionSimilaires = document.createElement('div');
            sectionSimilaires.classList.add('similaires-section');
            sectionSimilaires.innerHTML = '<h3>Produits similaires</h3><div class="similaires-grille" id="similaires-grille"></div>';

            productsContainer.appendChild(sectionSimilaires);

            var grille = document.getElementById('similaires-grille');
            quatrePremiers.forEach(function (produit) {
                var carte = creerCarteProduit(produit);
                grille.appendChild(carte);
            });
        })
        .catch(function (e) {
            console.error('Impossible de charger les similaires', e);
        });
}


// =============================================
// PANIER (LocalStorage)
// =============================================

/**
 * Lit le panier depuis le localStorage.
 * @returns {Array} - Tableau des articles du panier
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
 * Ajoute un produit au panier ou augmente sa quantité s'il est déjà présent.
 * @param {Object} produit - Produit à ajouter
 * @param {number} quantite - Quantité à ajouter
 */
function ajouterAuPanier(produit, quantite) {
    var panier = lirePanier();

    // On cherche si le produit est déjà dans le panier
    var indexExistant = -1;
    for (var i = 0; i < panier.length; i++) {
        if (panier[i].id === produit.id) {
            indexExistant = i;
            break;
        }
    }

    if (indexExistant >= 0) {
        // Le produit existe déjà → on augmente la quantité
        panier[indexExistant].quantite += quantite;
    } else {
        // Nouveau produit → on l'ajoute
        panier.push({
            id: produit.id,
            nom: produit.nom,
            prix: produit.prix,
            devise: produit.devise,
            image: produit.images[0],
            quantite: quantite
        });
    }

    sauvegarderPanier(panier);
}

/**
 * Met à jour le compteur du panier dans la navbar (nombre total d'articles).
 */
function mettreAJourCompteurPanier() {
    var panier = lirePanier();
    var total = 0;
    panier.forEach(function (item) { total += item.quantite; });

    var compteur = document.getElementById('compteur-panier');
    if (compteur) {
        compteur.textContent = total;
        compteur.style.display = total > 0 ? 'inline-flex' : 'none';
    }
}


// =============================================
// FAVORIS (LocalStorage)
// =============================================

/**
 * Lit les favoris depuis le localStorage.
 * @returns {Array} - Tableau des produits en favoris
 */
function lireFavoris() {
    var data = localStorage.getItem('favoris');
    return data ? JSON.parse(data) : [];
}

/**
 * Vérifie si un produit est dans les favoris.
 * @param {number} id - Id du produit
 * @returns {boolean}
 */
function estDansFavoris(id) {
    var favoris = lireFavoris();
    return favoris.some(function (f) { return f.id === id; });
}

/**
 * Ajoute ou retire un produit des favoris (toggle).
 * @param {Object} produit - Produit à basculer
 */
function toggleFavori(produit) {
    var favoris = lireFavoris();

    if (estDansFavoris(produit.id)) {
        // Retirer des favoris
        favoris = favoris.filter(function (f) { return f.id !== produit.id; });
    } else {
        // Ajouter aux favoris
        favoris.push({
            id: produit.id,
            nom: produit.nom,
            prix: produit.prix,
            devise: produit.devise,
            image: produit.images[0],
            categorie: produit.categorie
        });
    }

    localStorage.setItem('favoris', JSON.stringify(favoris));
}

/**
 * Met à jour le compteur de favoris dans la navbar.
 */
function mettreAJourCompteurFavoris() {
    var favoris = lireFavoris();
    var compteur = document.getElementById('compteur-favoris');
    if (compteur) {
        compteur.textContent = favoris.length;
        compteur.style.display = favoris.length > 0 ? 'inline-flex' : 'none';
    }
}


// =============================================
// UTILITAIRES
// =============================================

/**
 * Formate un prix en séparant les milliers avec des espaces.
 * Exemple : 1000000000 → "1 000 000 000"
 * @param {number} prix - Prix à formater
 * @returns {string} - Prix formaté
 */
function formaterPrix(prix) {
    return prix.toLocaleString('fr-FR');
}

/**
 * Affiche une notification temporaire en bas de l'écran.
 * Elle disparaît automatiquement après 2 secondes.
 * @param {string} message - Message à afficher
 */
function afficherNotification(message) {
    // On cherche ou crée le conteneur de notification
    var notif = document.getElementById('notification');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'notification';
        document.body.appendChild(notif);
    }

    notif.textContent = message;
    notif.classList.add('visible');

    // On efface après 2 secondes
    setTimeout(function () {
        notif.classList.remove('visible');
    }, 2000);
}
