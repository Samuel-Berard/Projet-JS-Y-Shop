

afficherFavoris();
mettreAJourCompteurPanier();
mettreAJourCompteurFavoris();

function lireFavoris() {
    const data = localStorage.getItem('favoris');
    return data ? JSON.parse(data) : [];
}

function afficherFavoris() {
    let favoris = lireFavoris();
    const liste = document.querySelector('#favoris-liste');
    const favorisVide = document.querySelector('#favoris-vide');

    liste.innerHTML = '';

    if (favoris.length === 0) {
        
        favorisVide.classList.remove('hidden');
        return;
    }

    favorisVide.classList.add('hidden');

    favoris.forEach(function (produit) {
        const carte = creerCarteFavori(produit);
        liste.appendChild(carte);
    });
}

function creerCarteFavori(produit) {
    const carte = document.createElement('div');
    carte.classList.add('row');
    carte.dataset.id = produit.id;

    carte.innerHTML = `
        <div class="product-images">
            <img src="/assets/${produit.image}" alt="${produit.nom}" class="product-img img-principale">
        </div>
        <div class="product-text">
            <h5>${produit.categorie}</h5>
        </div>
        <div class="heart-icon favori-actif-icon" data-id="${produit.id}" title="Retirer des favoris">
            <i class="fa-solid fa-heart favori-actif"></i>
        </div>
        <div class="product-info">
            <h4 class="product-name">${produit.nom}</h4>
            <p class="product-price">${formaterPrix(produit.prix)} ${produit.devise}</p>
        </div>
    `;

    carte.addEventListener('click', function (e) {
        if (e.target.closest('.heart-icon')) return;
        window.location.href = '/produit.html?id=' + produit.id;
    });

    const iconCoeur = carte.querySelector('.heart-icon');
    iconCoeur.addEventListener('click', function (e) {
        e.stopPropagation();
        retirerDesFavoris(produit.id);
    });

    return carte;
}

function retirerDesFavoris(id) {
    let favoris = lireFavoris();
    favoris = favoris.filter(function (f) { return f.id !== id; });
    localStorage.setItem('favoris', JSON.stringify(favoris));
    afficherFavoris();
    mettreAJourCompteurFavoris();
}

function mettreAJourCompteurFavoris() {
    let favoris = lireFavoris();
    const compteur = document.querySelector('#compteur-favoris');
    if (compteur) {
        compteur.textContent = favoris.length;
        compteur.classList.toggle('hidden', !(favoris.length > 0 ));
    }
}

function mettreAJourCompteurPanier() {
    const data = localStorage.getItem('panier');
    let panier = data ? JSON.parse(data) : [];
    let total = 0;
    panier.forEach(function (item) { total += item.quantite; });

    const compteur = document.querySelector('#compteur-panier');
    if (compteur) {
        compteur.textContent = total;
        compteur.classList.toggle('hidden', !(total > 0 ));
    }
}

function formaterPrix(prix) {
    return prix.toLocaleString('fr-FR');
}
