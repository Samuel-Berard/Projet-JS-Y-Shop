//fonction pour que le header devienne sticky au scroll
const header = document.querySelector('header');
//condition pour que le header soit sticky au scroll
if (header) {
    window.addEventListener("scroll", function () {
        header.classList.toggle("sticky", window.scrollY > 0);
    });
}

//fonction pour mettre à jour les compteurs du panier et des favoris
function majCompteurs() {
    //on recupere le panier
    let panier = JSON.parse(localStorage.getItem('panier') || '[]');
    //on initialise le compteur
    let total = 0;
    //on parcourt le panier et on ajoute le nombre d'articles au compteur
    panier.forEach(function (item) {
        total = total + item.quantite;
    });
    //on recupere l'element compteur du panier
    const cp = document.querySelector('#compteur-panier');
    //on affiche le compteur
    if (cp) {
        cp.textContent = total;
        cp.classList.toggle('hidden', !(total > 0));
    }

    let favoris = JSON.parse(localStorage.getItem('favoris') || '[]');
    const cf = document.querySelector('#compteur-favoris');
    if (cf) {
        cf.textContent = favoris.length;
        cf.classList.toggle('hidden', !(favoris.length > 0));
    }
}

majCompteurs();
