(() => {
    const layoutScript = document.getElementById('ml-layout');
    const basePath = (layoutScript?.dataset.base || '.').replace(/\/$/, '');
    const siteRoot = (layoutScript?.dataset.root || '.').replace(/\/$/, '');

    const buildPath = (file) => `${basePath}/dyn/${file}`;

    const routeMap = {
        index: 'index.html',
        'solar-system': 'solar-system.html',
        cardmaker: 'Assets/cardmaker/card_maker.html',
        gallery: 'Assets/pages/card_gallery.html',
        print: 'Assets/pages/multy_print.html',
        counter: 'ManaCounter/game_counter.html',
        myths: '../index.html'
    };

    const resolveRoute = (routeName) => {
        const route = routeMap[routeName];
        if (!route) return '#';
        return `${siteRoot}/${route}`;
    };

    const normalizePath = (value) => {
        const anchor = document.createElement('a');
        anchor.href = value;
        return anchor.pathname.replace(/\/$/, '').toLowerCase();
    };

    const initNavbar = () => {
        const nav = document.querySelector('nav.nav-container');
        const btn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');
        const links = document.querySelectorAll('.nav-link, .mobile-link, .nav-back-button');

        const currentPath = normalizePath(window.location.href);
        // Set theme based on current page
        if (currentPath.includes('solar-system')) {
            nav.setAttribute('data-theme', 'solar-system');
        } else {
            nav.setAttribute('data-theme', 'timeline');
        }

        links.forEach((link) => {
            const routeName = link.getAttribute('data-nav-route');
            if (!routeName) return;
            link.setAttribute('href', resolveRoute(routeName));
        });

        if (btn && menu) {
            btn.addEventListener('click', (event) => {
                event.stopPropagation();
                menu.classList.toggle('hidden');
            });

            document.addEventListener('click', () => {
                if (!menu.classList.contains('hidden')) menu.classList.add('hidden');
            });
        }

        links.forEach((link) => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;
            if (normalizePath(href) === currentPath && !link.classList.contains('nav-back-button')) {
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
