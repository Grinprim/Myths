(() => {
    const layoutScript = document.getElementById('ml-layout');
    const basePath = (layoutScript?.dataset.base || '.').replace(/\/$/, '');

    const buildPath = (file) => `${basePath}/dyn/${file}`;

    const initNavbar = () => {
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
