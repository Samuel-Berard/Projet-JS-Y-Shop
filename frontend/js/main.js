const header = document.querySelector('header');

if (header) {
    window.addEventListener("scroll", function () {
        header.classList.toggle("sticky", window.scrollY > 0);
    });
}

const menu = document.querySelector('#menu-icon');

function majCompteurs() {
    let panier = JSON.parse(localStorage.getItem('panier') || '[]');
    let total = 0;
    panier.forEach(function (item) {
        total = total + item.quantite;
    });
    const cp = document.querySelector('#compteur-panier');
    if (cp) {
        cp.textContent = total;
        cp.style.display = total > 0 ? 'inline-flex' : 'none';
    }

    let favoris = JSON.parse(localStorage.getItem('favoris') || '[]');
    const cf = document.querySelector('#compteur-favoris');
    if (cf) {
        cf.textContent = favoris.length;
        cf.style.display = favoris.length > 0 ? 'inline-flex' : 'none';
    }
}

majCompteurs();
