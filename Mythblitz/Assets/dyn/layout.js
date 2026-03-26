(() => {
    const layoutScript = document.getElementById('ml-layout');
    const basePath = (layoutScript?.dataset.base || '.').replace(/\/$/, '');
    const siteRoot = (layoutScript?.dataset.root || '.').replace(/\/$/, '');

    const buildPath = (file) => `${basePath}/dyn/${file}`;

    const routeMap = {
        home: 'index.html',
        cardmaker: 'Assets/cardmaker/index.html',
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
        const btn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');
        const links = document.querySelectorAll('.nav-link, .mobile-link');

        links.forEach((link) => {
            const routeName = link.getAttribute('data-route');
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

        const currentPath = normalizePath(window.location.href);
        links.forEach((link) => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;
            if (normalizePath(href) === currentPath) {
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
