(() => {
    const layoutScript = document.getElementById('ml-layout');
    const basePath = (layoutScript?.dataset.base || '.').replace(/\/$/, '');

    const buildPath = (file) => `${basePath}/dyn/${file}`;

    const NAV_ROUTES = {
        home: '../index.html',
        rules: 'pages/rules.html',
        species: 'pages/species.html',
        paths: 'pages/paths.html',
        traits: 'pages/traits.html',
        spells: 'pages/spells.html',
        inventory: 'pages/inventory.html',
        'character-sheet': 'pages/sheet/character_sheet.html',
    };

    const applyNavbarRoutes = () => {
        const links = document.querySelectorAll('[data-nav-route]');
        links.forEach((link) => {
            const route = link.getAttribute('data-nav-route');
            const target = route ? NAV_ROUTES[route] : null;
            if (target) {
                link.setAttribute('href', `${basePath}/${target}`);
            }
        });

        const logo = document.querySelector('[data-nav-logo]');
        if (logo) {
            logo.setAttribute('src', `${basePath}/img/logo.png`);
        }
    };

    const initNavbar = () => {
        applyNavbarRoutes();

        const btn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');
        const links = document.querySelectorAll('.nav-link, .mobile-link');

        if (btn && menu) {
            btn.addEventListener('click', (event) => {
                event.stopPropagation();
                menu.classList.toggle('hidden');
            });

            document.addEventListener('click', () => {
                if (!menu.classList.contains('hidden')) menu.classList.add('hidden');
            });
        }

        const currentFile = window.location.pathname.split('/').pop() || 'index.html';
        links.forEach((link) => {
            const href = link.getAttribute('href');
            if (href && href.split('/').pop() === currentFile) {
                link.classList.add('active');
            }
        });
    };

    const loadFragment = async (selector, file, afterLoad) => {
        const target = document.querySelector(selector);
        if (!target) return;

        try {
            const response = await fetch(buildPath(file));
            if (!response.ok) return;
            const html = await response.text();
            target.innerHTML = html;
            if (afterLoad) afterLoad();
        } catch (error) {
            console.error(`Error loading ${file}:`, error);
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        loadFragment('#navbar-placeholder', 'navbar.html', initNavbar);
        loadFragment('#footer-placeholder', 'footer.html');
    });
})();
