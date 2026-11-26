/* Scripts du portfolio (pages index.html et formation.html)
   1. les blocs apparaissent en douceur quand on arrive dessus
   2. le lien du menu correspondant à la section visible est mis en avant
   3. les fenêtres de détail se ferment avec Échap et gardent le clavier à l'intérieur
   4. menu déroulant (bouton) sur téléphone
   Les animations (1) sont désactivées si le visiteur a demandé « mouvement réduit »
   (la classe « anim » n'est alors pas ajoutée à la page). */
(function () {
    'use strict';

    var racine = document.documentElement;
    var liens = document.querySelectorAll('.menu nav a');

    /* ----- 1. Apparition au défilement ----- */
    if (racine.classList.contains('anim')) {
        if (!('IntersectionObserver' in window)) {
            racine.classList.remove('anim'); // rien ne reste caché
        } else {
            var cibles = document.querySelectorAll(
                '.section > .etiquette, .section > h2, .section > .intro, ' +
                '.carte, .ligne, .badges li, .formulaire, .suite'
            );
            var compteurs = new Map();

            var apparition = new IntersectionObserver(function (entrees) {
                entrees.forEach(function (entree) {
                    if (entree.isIntersecting) {
                        entree.target.classList.add('visible');
                        apparition.unobserve(entree.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

            cibles.forEach(function (el) {
                // léger décalage entre éléments frères : ils arrivent l'un après l'autre
                var rang = compteurs.get(el.parentNode) || 0;
                compteurs.set(el.parentNode, rang + 1);
                el.style.setProperty('--delai', Math.min(rang, 5) * 80 + 'ms');
                el.classList.add('reveal');
                apparition.observe(el);
            });
        }
    }

    /* ----- 2. Lien actif dans le menu ----- */
    if (/formation(\.html)?$/.test(location.pathname)) {
        liens.forEach(function (a) {
            if (a.getAttribute('href') === 'formation.html') a.classList.add('actif');
        });
    } else if ('IntersectionObserver' in window) {
        var sections = document.querySelectorAll('main section[id]');
        var suivi = new IntersectionObserver(function (entrees) {
            entrees.forEach(function (entree) {
                if (!entree.isIntersecting) return;
                // le formulaire fait partie de la zone « Contact »
                var id = entree.target.id === 'message' ? 'contact' : entree.target.id;
                liens.forEach(function (a) {
                    a.classList.toggle('actif', a.getAttribute('href') === '#' + id);
                });
            });
        }, { rootMargin: '-40% 0px -55% 0px' });
        sections.forEach(function (s) { suivi.observe(s); });
    }

    /* ----- 3. Fenêtres de détail : Échap, clavier, focus ----- */
    // Les fenêtres s'ouvrent grâce à l'adresse (#m-...) : le CSS les affiche, ici on gère le clavier.
    var zonesPage = document.querySelectorAll('.menu, main, .pied');
    var declencheur = null; // lien qui a ouvert la fenêtre, pour lui rendre le focus à la fermeture

    // Le fond cliquable sert à fermer à la souris : inutile dans l'ordre de tabulation
    document.querySelectorAll('.modale-fond').forEach(function (fond) {
        fond.setAttribute('tabindex', '-1');
    });

    document.addEventListener('click', function (e) {
        var lien = e.target.closest ? e.target.closest('a[href^="#"]') : null;
        if (lien && /^#(m-|merci)/.test(lien.getAttribute('href'))) declencheur = lien;
    });

    function modaleOuverte() {
        return document.querySelector('.modale:target');
    }

    function majFenetre() {
        var modale = modaleOuverte();
        // le reste de la page est mis de côté tant qu'une fenêtre est ouverte
        zonesPage.forEach(function (zone) { zone.inert = !!modale; });
        if (modale) {
            var croix = modale.querySelector('.modale-fermer');
            if (croix) croix.focus({ preventScroll: true });
        } else if (declencheur) {
            declencheur.focus({ preventScroll: true });
            declencheur = null;
        }
    }

    window.addEventListener('hashchange', majFenetre);
    majFenetre(); // cas d'une page ouverte directement sur une fenêtre (ex. #merci)


    /* ----- 4. Menu déroulant sur téléphone ----- */
    // Le bouton n'est visible que sur petit écran (CSS) ; ici on l'ouvre et on le ferme.
    var menu = document.querySelector('.menu');
    var bouton = menu ? menu.querySelector('.menu-bouton') : null;

    if (menu && bouton) {
        menu.classList.add('menu-js');

        var fermerMenu = function () {
            menu.classList.remove('ouvert');
            bouton.setAttribute('aria-expanded', 'false');
            bouton.setAttribute('aria-label', 'Ouvrir le menu');
        };

        bouton.addEventListener('click', function () {
            var ouvert = menu.classList.toggle('ouvert');
            bouton.setAttribute('aria-expanded', String(ouvert));
            bouton.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
        });

        // On referme en choisissant un lien, en touchant ailleurs ou avec Échap
        menu.querySelectorAll('nav a').forEach(function (a) {
            a.addEventListener('click', fermerMenu);
        });
        document.addEventListener('click', function (e) {
            if (!menu.contains(e.target)) fermerMenu();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && menu.classList.contains('ouvert')) {
                fermerMenu();
                bouton.focus();
            }
        });
        // Retour sur grand écran : le menu latéral reprend sa place
        window.addEventListener('resize', function () {
            if (window.innerWidth > 800) fermerMenu();
        });
    }

    document.addEventListener('keydown', function (e) {
        var modale = modaleOuverte();
        if (!modale) return;

        if (e.key === 'Escape') {
            location.hash = 'fermer';
            return;
        }
        if (e.key !== 'Tab') return;

        // Tabulation : on reste dans la fenêtre
        var elements = modale.querySelectorAll(
            'a[href]:not(.modale-fond), button, iframe, input, textarea, select'
        );
        if (!elements.length) return;
        var premier = elements[0];
        var dernier = elements[elements.length - 1];

        if (!modale.contains(document.activeElement)) {
            e.preventDefault();
            premier.focus();
        } else if (e.shiftKey && document.activeElement === premier) {
            e.preventDefault();
            dernier.focus();
        } else if (!e.shiftKey && document.activeElement === dernier) {
            e.preventDefault();
            premier.focus();
        }
    });
})();
