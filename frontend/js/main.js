var header = document.querySelector('header');

if (header) {
    window.addEventListener("scroll", function () {
        header.classList.toggle("sticky", window.scrollY > 0);
    });
}

var menu = document.querySelector('#menu-icon');

// Met a jour les compteurs panier et favoris dans la navbar
function majCompteurs() {
    var panier = JSON.parse(localStorage.getItem('panier') || '[]');
    var total = 0;
    panier.forEach(function (item) {
        total = total + item.quantite;
    });
    var cp = document.querySelector('#compteur-panier');
    if (cp) {
        cp.textContent = total;
        cp.style.display = total > 0 ? 'inline-flex' : 'none';
    }

    var favoris = JSON.parse(localStorage.getItem('favoris') || '[]');
    var cf = document.querySelector('#compteur-favoris');
    if (cf) {
        cf.textContent = favoris.length;
        cf.style.display = favoris.length > 0 ? 'inline-flex' : 'none';
    }
}

majCompteurs();