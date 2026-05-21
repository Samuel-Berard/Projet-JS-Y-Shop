
document.addEventListener('DOMContentLoaded', () => {
    //on recupere toutes les questions
    const questions = document.querySelectorAll('.faq-question');
    //on parcourt toutes les questions
    questions.forEach((btn) => {
        //on ajoute un event listener pour le clic sur la question
        btn.addEventListener('click', () => {
            //on recupere l'etat de la question
            const isOpen = btn.getAttribute('aria-expanded') === 'true';

            //on ferme les autres questions
            questions.forEach((other) => {
                //si la question est differente de la question actuelle
                if (other !== btn) {
                    //on ferme la question
                    other.setAttribute('aria-expanded', 'false');
                    other.closest('.faq-item').classList.remove('faq-item--open');
                }
            });


            btn.setAttribute('aria-expanded', String(!isOpen));
            btn.closest('.faq-item').classList.toggle('faq-item--open', !isOpen);
        });
    });
});
