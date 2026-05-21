
document.addEventListener('DOMContentLoaded', () => {
    //on recupere le formulaire de contact
    const formContact = document.querySelector('#form-contact');

    //si le formulaire existe
    if (formContact) {
        //on ajoute un event listener pour le soumission du formulaire
        formContact.addEventListener('submit', (e) => {
            //on empeche le comportement par defaut
            e.preventDefault();

            //on recupere les valeurs du formulaire
            const name = document.querySelector('#name').value;
            const email = document.querySelector('#email').value;
            const message = document.querySelector('#message').value;


            fetch('http://localhost:3000/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, message })
            })
                .then(response => response.json())
                .then(data => {
                    //on verifie si le message a bien été envoyé
                    if (data.succes) {
                        //on affiche un message de succès
                        alert('Votre message a bien été envoyé !');
                        //on vide le formulaire
                        formContact.reset();
                    } else {
                        //on affiche un message d'erreur
                        alert('Erreur lors de l\'envoi du message : ' + (data.erreur || 'Erreur inconnue'));
                    }
                })
                .catch(error => {
                    //on affiche une erreur
                    console.error('Erreur :', error);
                    alert('Erreur de connexion au serveur.');
                });
        });
    }
});
