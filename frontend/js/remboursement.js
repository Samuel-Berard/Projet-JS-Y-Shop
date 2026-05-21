
document.addEventListener('DOMContentLoaded', () => {
    const questions = document.querySelectorAll('.faq-question');

    questions.forEach((btn) => {
        btn.addEventListener('click', () => {
            const isOpen = btn.getAttribute('aria-expanded') === 'true';

            
            questions.forEach((other) => {
                if (other !== btn) {
                    other.setAttribute('aria-expanded', 'false');
                    other.closest('.faq-item').classList.remove('faq-item--open');
                }
            });

            
            btn.setAttribute('aria-expanded', String(!isOpen));
            btn.closest('.faq-item').classList.toggle('faq-item--open', !isOpen);
        });
    });
});
