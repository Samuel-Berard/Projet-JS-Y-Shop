document.addEventListener('DOMContentLoaded', () => {

    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get('id'));

    if (!productId) {

        window.location.href = '404.html';
        return;
    }

    const container = document.getElementById('product-details-container');

    fetch('../backend/data/produits.json')
        .then(response => {
            if (!response.ok) throw new Error("Erreur de chargement");
            return response.json();
        })
        .then(produits => {
            const produit = produits.find(p => p.id === productId);

            if (!produit) {
                window.location.href = '404.html';
                return;
            }

            renderProductDetails(produit, container);
        })
        .catch(error => {
            console.error("Erreur:", error);
            container.innerHTML = "<p style='text-align:center; color:#fff; padding:50px;'>Une erreur est survenue lors du chargement du produit.</p>";
        });
});

function renderProductDetails(produit, container) {
    const imgPrincipale = `../frontend/assets/${produit.images[0]}`;
    const imgSecondaire = produit.images.length > 1 ? `../frontend/assets/${produit.images[1]}` : null;

    let nomComplet = produit.nom.split(' / ');
    let nomCourt = nomComplet[0];
    let nomJaponais = nomComplet[1] ? nomComplet[1] : '';

    container.innerHTML = `
        <div class="product-details-wrapper">
            <div class="details-image-section">
                <img src="${imgPrincipale}" alt="${nomCourt}" class="details-main-img">
                ${imgSecondaire ? `<img src="${imgSecondaire}" alt="Détenteur" class="details-secondary-img">` : ''}
            </div>
            <div class="details-info-section">
                <div class="details-badge">${produit.categorie}</div>
                <h1 class="details-title">${nomCourt}</h1>
                ${nomJaponais ? `<h2 class="details-subtitle">${nomJaponais}</h2>` : ''}
                
                <div class="details-price">${produit.prix.toLocaleString()} ฿</div>
                
                <p class="details-desc">${produit.description}</p>
                
                <div class="details-specs">
                    <div class="spec-item">
                        <span class="spec-label">Ancien détenteur</span>
                        <span class="spec-value">${produit["Ancien détenteur"] || "Inconnu"}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">En stock</span>
                        <span class="spec-value">${produit.stock} unités</span>
                    </div>
                </div>

                <div class="details-actions">
                    <button class="add-to-cart-btn">Ajouter au panier</button>
                </div>
            </div>
        </div>
    `;
}
