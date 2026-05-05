
const API_URL = 'http://localhost:3000/api/produits';

const params = new URLSearchParams(window.location.search);
const produitId = params.get('id');

const productsContainer = document.getElementById('products-container');


chargerCarrousel();

if (produitId) {
    chargerDetailProduit(produitId);
} else {
    chargerTousLesProduits();
}


var position = 0;
var pas = 240;

var track = document.getElementById('carrousel-track');
var btnGauche = document.getElementById('btn-gauche');
var btnDroite = document.getElementById('btn-droite');

function chargerCarrousel() {
    fetch(API_URL)
        .then(function (response) {
            return response.json();
        })
        .then(function (produits) {
            produits.forEach(function (produit) {
                var img = document.createElement('img');
                img.src = './assets/' + produit.images[0];
                img.alt = produit.nom;
                track.appendChild(img);
            });
        });
}

btnDroite.addEventListener('click', function () {
    var maxScroll = track.scrollWidth - track.parentElement.clientWidth;
    position = position + pas;
    if (position > maxScroll) {
        position = 0;
    }
    track.style.transform = 'translateX(-' + position + 'px)';
});

btnGauche.addEventListener('click', function () {
    position = position - pas;
    if (position < 0) {
        position = 0;
    }
    track.style.transform = 'translateX(-' + position + 'px)';
});


function chargerDetailProduit(id) {

    var mainHome = document.querySelector('.main-home');
    if (mainHome) {
        mainHome.style.display = 'none';
    }

    var centerText = document.querySelector('.trending-product .center-text h2');
    centerText.innerHTML = 'Détail du <span>Produit</span>';

    fetch(API_URL + '/' + id)
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Produit non trouvé');
            }
            return response.json();
        })
        .then(function (produit) {
            productsContainer.innerHTML = '';
            var carte = creerCarteDetaillee(produit);
            productsContainer.appendChild(carte);
        })
        .catch(function (erreur) {
            console.error('Erreur:', erreur);
            productsContainer.innerHTML = '<p>Produit introuvable.</p>';
        });
}


function creerCarteDetaillee(produit) {
    var carte = document.createElement('div');
    carte.classList.add('row', 'produit-detail');

    carte.innerHTML = `
        <div class="product-images">
            <img src="./assets/${produit.images[0]}" alt="${produit.nom}" class="product-img img-principale">
            <img src="./assets/${produit.images[1]}" alt="${produit.nom}" class="product-img img-secondaire">
        </div>
        <div class="product-text">
            <h5>${produit.categorie}</h5>
        </div>
        <div class="heart-icon">
            <i class="fa-regular fa-heart"></i>
        </div>
        <div class="product-info">
            <h4 class="product-name">${produit.nom}</h4>
            <p class="product-price">${produit.prix} ${produit.devise}</p>
            <p class="product-description">${produit.description}</p>
            <p class="product-stock">Stock : ${produit.stock} disponibles</p>
        </div>
    `;

    return carte;
}


function chargerTousLesProduits() {
    fetch(API_URL)
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des produits');
            }
            return response.json();
        })
        .then(function (produits) {
            productsContainer.innerHTML = '';

            produits.forEach(function (produit) {
                var carte = creerCarteProduit(produit);
                productsContainer.appendChild(carte);
            });
        })
        .catch(function (erreur) {
            console.error('Erreur:', erreur);
            productsContainer.innerHTML = '<p>Impossible de charger les produits.</p>';
        });
}


function creerCarteProduit(produit) {
    var carte = document.createElement('div');
    carte.classList.add('row');
    carte.style.cursor = 'pointer';

    carte.innerHTML = `
        <div class="product-images">
            <img src="./assets/${produit.images[0]}" alt="${produit.nom}" class="product-img img-principale">
            <img src="./assets/${produit.images[1]}" alt="${produit.nom}" class="product-img img-secondaire">
        </div>
        <div class="product-text">
            <h5>${produit.categorie}</h5>
        </div>
        <div class="heart-icon">
            <i class="fa-regular fa-heart"></i>
        </div>
        <div class="product-info">
            <h4 class="product-name">${produit.nom}</h4>
            <p class="product-price">${produit.prix} ${produit.devise}</p>
        </div>
    `;

    carte.addEventListener('click', function () {
        window.location.href = './produit.html?id=' + produit.id;
    });

    return carte;
}
