const menu = document.querySelector('#menu-icon');


afficherFavoris();
mettreAJourCompteurPanier();
mettreAJourCompteurFavoris();

//fonction pour lire les favoris
function lireFavoris() {
    //on recupere les favoris
    const data = localStorage.getItem('favoris');
    //on retourne les favoris
    return data ? JSON.parse(data) : [];
}
//fonction pour afficher les favoris
function afficherFavoris() {
    //on recupere les favoris
    let favoris = lireFavoris();
    //on recupere l'element liste
    const liste = document.querySelector('#favoris-liste');
    //on recupere l'element favoris vide
    const favorisVide = document.querySelector('#favoris-vide');

    //on vide la liste
    liste.innerHTML = '';

    //si le panier est vide
    if (favoris.length === 0) {
        //on cache l'element liste
        liste.classList.add('hidden');
        //on affiche l'element favoris vide
        favorisVide.classList.remove('hidden');
        return;
    }

    //on affiche l'element liste
    liste.classList.remove('hidden');
    //on cache l'element favoris vide
    favorisVide.classList.add('hidden');
    //on parcourt les favoris
    favoris.forEach(function (produit) {
        const carte = creerCarteFavori(produit);
        liste.appendChild(carte);
    });
}

//fonction pour creer une carte favori
function creerCarteFavori(produit) {
    //on cree l'element carte
    const carte = document.createElement('div');
    //on ajoute la classe row
    carte.classList.add('row');
    //on ajoute l'id du produit
    carte.dataset.id = produit.id;
    //on ajoute le contenu html de la carte
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

    //on ajoute un event listener pour le clic sur la carte
    carte.addEventListener('click', function (e) {
        //si on clique sur l'icone coeur, on ne fait rien
        if (e.target.closest('.heart-icon')) return;
        //on redirige vers la page produit
        window.location.href = '/produit.html?id=' + produit.id;
    });
    //on recupere l'icone coeur
    const iconCoeur = carte.querySelector('.heart-icon');
    //on ajoute un event listener pour le clic sur l'icone coeur
    iconCoeur.addEventListener('click', function (e) {
        //on arrete la propagation de l'evenement
        e.stopPropagation();
        //on retire le produit des favoris
        retirerDesFavoris(produit.id);
    });
    //on retourne la carte
    return carte;
}

//fonction pour retirer un produit des favoris
function retirerDesFavoris(id) {
    //on recupere les favoris
    let favoris = lireFavoris();
    //on filtre les favoris
    favoris = favoris.filter(function (f) { return f.id !== id; });
    //on sauvegarde les favoris
    localStorage.setItem('favoris', JSON.stringify(favoris));
    //on affiche les favoris
    afficherFavoris();
    //on met à jour le compteur de favoris
    mettreAJourCompteurFavoris();
}

//fonction pour mettre à jour le compteur de favoris
function mettreAJourCompteurFavoris() {
    //on recupere les favoris
    let favoris = lireFavoris();
    //on recupere l'element compteur
    const compteur = document.querySelector('#compteur-favoris');
    //si l'element compteur existe
    if (compteur) {
        //on affiche le compteur
        compteur.textContent = favoris.length;
        //on cache ou affiche le compteur selon s'il y a des favoris ou non
        compteur.classList.toggle('hidden', !(favoris.length > 0));
    }
}

//fonction pour mettre à jour le compteur de panier
function mettreAJourCompteurPanier() {
    //on recupere le panier
    const data = localStorage.getItem('panier');
    //on parse le panier
    let panier = data ? JSON.parse(data) : [];
    //on initialise le compteur
    let total = 0;
    //on parcourt le panier et on ajoute la quantite de chaque article au compteur
    panier.forEach(function (item) { total += item.quantite; });

    //on recupere l'element compteur
    const compteur = document.querySelector('#compteur-panier');
    //si l'element compteur existe
    if (compteur) {
        //on affiche le compteur
        compteur.textContent = total;
        //on cache ou affiche le compteur selon s'il y a des articles dans le panier ou non
        compteur.classList.toggle('hidden', !(total > 0));
    }
}

//fonction pour formater le prix
function formaterPrix(prix) {
    //on formate le prix
    return prix.toLocaleString('fr-FR');
}
