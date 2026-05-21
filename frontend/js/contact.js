document.addEventListener('DOMContentLoaded', () => {
    const formContact = document.querySelector('#form-contact');

    if (formContact) {
        formContact.addEventListener('submit', (e) => {
            e.preventDefault();

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
                    if (data.succes) {
                        alert('Votre message a bien été envoyé !');
                        formContact.reset();
                    } else {
                        alert('Erreur lors de l'envoi du message : ' + (data.erreur || 'Erreur inconnue'));
                    }
                })
                .catch(error => {
                    console.error('Erreur :', error);
                    alert('Erreur de connexion au serveur.');
                });
        });
    }
});
