const header = document.querySelector('header')

if (header) {
    window.addEventListener("scroll", function () {
        header.classList.toggle("sticky", window.scrollY > 0);
    })
}

let menu = document.querySelector('#menu-icon');

const productsContainer = document.getElementById('products-container');
let allProducts = [];

if (productsContainer) {
    fetch('../backend/data/produits.json')
        .then(response => {
            if (!response.ok) {
                throw new Error("Erreur de chargement du JSON");
            }
            return response.json();
        })
        .then(produits => {
            allProducts = produits;
            renderProducts(allProducts);
            setupFilters();
        })
        .catch(error => {
            console.error("Erreur lors du chargement des produits :", error);
            productsContainer.innerHTML = "<p style='text-align:center; padding:20px; color:#f5f5f7;'>Impossible de charger les produits.</p>";
        });
}

function renderProducts(produits) {
    productsContainer.innerHTML = '';

    if (produits.length === 0) {
        productsContainer.innerHTML = "<p style='text-align:center; padding:20px; color:#86868b; grid-column: 1 / -1;'>Aucun produit trouvé dans cette catégorie.</p>";
        return;
    }

    produits.forEach(produit => {
        const row = document.createElement('div');
        row.classList.add('row');

        const imgPrincipale = `../frontend/assets/${produit.images[0]}`;
        const imgSecondaire = produit.images.length > 1 ? `../frontend/assets/${produit.images[1]}` : imgPrincipale;

        let nomCourt = produit.nom;
        if (nomCourt.includes(' / ')) {
            nomCourt = nomCourt.split(' / ')[0];
        }

        row.innerHTML = `
            <div class="product-images">
                <img src="${imgPrincipale}" alt="${nomCourt} (Fruit)" class="img-principale">
                <img src="${imgSecondaire}" alt="${nomCourt} (Détenteur)" class="img-secondaire">
            </div>
            <div class="product-info">
                <div class="product-category">${produit.categorie}</div>
                <div class="product-name">${nomCourt}</div>
                <div class="product-price">${produit.prix.toLocaleString()} ฿</div>
                <a href="details.html?id=${produit.id}" class="buy-link" style="margin-top:10px; display:inline-block;">Acheter</a>
            </div>
        `;

        productsContainer.appendChild(row);
    });
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {

            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');


            productsContainer.style.opacity = '0';

            setTimeout(() => {
                if (filterValue === 'all') {
                    renderProducts(allProducts);
                } else {
                    const filtered = allProducts.filter(p => p.categorie.toLowerCase() === filterValue.toLowerCase());
                    renderProducts(filtered);
                }
                productsContainer.style.opacity = '1';
                productsContainer.style.transition = 'opacity 0.4s ease';
            }, 200);
        });
    });
}