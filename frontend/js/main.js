const header = document.querySelector('header')

if (header) {
    window.addEventListener("scroll", function () {
        header.classList.toggle("sticky", window.scrollY > 0);
    })
}

let menu = document.querySelector('#menu-icon');