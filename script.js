// --- MISE À JOUR AUTOMATIQUE DE L'ANNÉE DANS LE FOOTER ---
const yearElement = document.getElementById('year');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

// --- OPTIONNEL : ANIMATION D'APPARITION AU SCROLL (SCROLL REVEAL) ---
// Ce code permet de faire apparaître les éléments doucement quand ils entrent dans l'écran
const observerOptions = {
    root: null,          // Observe par rapport à la zone d'affichage (viewport)
    rootMargin: '0px',
    threshold: 0.15      // S'active quand 15% de l'élément est visible
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Ajoute la classe 'visible' définie dans CSS
            entry.target.classList.add('visible');
            
            // Si vous voulez que l'animation ne se joue qu'une seule fois, décommentez la ligne ci-dessous :
            // observer.unobserve(entry.target); 
        }
    });
}, observerOptions);

// Sélectionne tous les éléments avec la classe 'scroll-reveal' (sections, cartes...)
document.querySelectorAll('.scroll-reveal').forEach((element) => {
    observer.observe(element);
});

// --- NAVIGATION FLUIDE POUR LES LIENS D'ANCRAGE DU MENU ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault(); // Empêche le comportement brut par défaut (saut instantané)
        const targetId = this.getAttribute('href');
        
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Scroll en douceur vers l'élément
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
