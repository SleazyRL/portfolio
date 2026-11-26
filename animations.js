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

    /* ----- 5. Fond animé : les lumières glissent vers des endroits au hasard ----- */
    // Mettre true pour couper l'animation chez les visiteurs qui ont demandé « mouvement réduit ».
    var RESPECTER_MOUVEMENT_REDUIT = false;

    var veutMoinsDeMouvement = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!(RESPECTER_MOUVEMENT_REDUIT && veutMoinsDeMouvement)) {
        var fond = document.createElement('div');
        fond.className = 'fond-lumieres';
        fond.setAttribute('aria-hidden', 'true');
        document.body.insertBefore(fond, document.body.firstChild);
        racine.classList.add('lumieres-js');

        var hasard = function (min, max) { return min + Math.random() * (max - min); };
        var douceur = function (t) { return t * t * (3 - 2 * t); }; // départ et arrivée en douceur

        var lumieres = [
            { x: 20, y: 25 }, { x: 80, y: 20 }, { x: 70, y: 80 }, { x: 15, y: 85 }
        ].map(function (l) {
            l.de = { x: l.x, y: l.y };
            l.vers = null;
            l.debut = 0;
            l.duree = 0;
            return l;
        });

        var nouvelleCible = function (l, maintenant) {
            l.de = { x: l.x, y: l.y };
            l.vers = { x: hasard(-5, 105), y: hasard(-5, 105) }; // n'importe où sur l'écran
            l.debut = maintenant;
            l.duree = hasard(4500, 8000); // chaque trajet dure entre 4,5 et 8 secondes
        };

        var avancer = function (maintenant) {
            lumieres.forEach(function (l, i) {
                if (!l.vers || maintenant - l.debut >= l.duree) {
                    if (l.vers) { l.x = l.vers.x; l.y = l.vers.y; }
                    nouvelleCible(l, maintenant);
                }
                var t = douceur(Math.min(1, (maintenant - l.debut) / l.duree));
                l.x = l.de.x + (l.vers.x - l.de.x) * t;
                l.y = l.de.y + (l.vers.y - l.de.y) * t;
                fond.style.setProperty('--x' + (i + 1), l.x.toFixed(2) + '%');
                fond.style.setProperty('--y' + (i + 1), l.y.toFixed(2) + '%');
            });
            requestAnimationFrame(avancer);
        };
        requestAnimationFrame(avancer);
    }

    /* ----- 6. Formulaire de contact : envoi sans quitter la page ----- */
    // Sans JavaScript, le formulaire reste un envoi classique (FormSubmit puis retour sur #merci).
    var formulaire = document.querySelector('form.formulaire');

    if (formulaire && window.fetch && window.FormData) {
        var statut = formulaire.querySelector('.formulaire-statut');
        var envoi = formulaire.querySelector('button[type="submit"]');
        var adresse = formulaire.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');

        var afficher = function (html, erreur) {
            if (!statut) return;
            statut.hidden = !html;
            statut.classList.toggle('erreur', !!erreur);
            statut.innerHTML = html;
        };

        formulaire.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!formulaire.reportValidity()) return;

            // un robot remplit le champ piège : on fait semblant d'avoir envoyé
            var piege = formulaire.querySelector('[name="_honey"]');
            if (piege && piege.value) { location.hash = 'merci'; return; }

            envoi.disabled = true;
            afficher('Envoi en cours…', false);

            fetch(adresse, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new FormData(formulaire)
            })
            .then(function (reponse) { return reponse.json(); })
            .then(function (donnees) {
                if (String(donnees.success) !== 'true') throw new Error(donnees.message || 'echec');
                formulaire.reset();
                afficher('', false);
                location.hash = 'merci';
            })
            .catch(function () {
                afficher('Le message n\u2019a pas pu partir. Réessayez ou écrivez-moi directement à ' +
                    '<a href="mailto:boguszynski.jakub09@gmail.com">boguszynski.jakub09@gmail.com</a>.', true);
            })
            .then(function () { envoi.disabled = false; });
        });
    }
})();
