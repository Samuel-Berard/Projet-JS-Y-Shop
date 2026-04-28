
const API_URL = 'http://localhost:3000/api/produits';


const productsContainer = document.getElementById('products-container');


function creerCarteProduit(produit) {

    const carte = document.createElement('div');
    carte.classList.add('row');


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

    return carte;
}


function chargerProduits() {
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
                const carte = creerCarteProduit(produit);
                productsContainer.appendChild(carte);
            });
        })
        .catch(function (erreur) {
            console.error('Erreur:', erreur);
            productsContainer.innerHTML = '<p>Impossible de charger les produits.</p>';
        });
}


chargerProduits();