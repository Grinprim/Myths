(() => {
    const SPECIES_JSON = '../../../../json/species.json';

    function slugify(name) {
        return String(name || '').toLowerCase().replace(/\s+/g, '_');
    }

    function currentSlug() {
        const file = (window.location.pathname.split('/').pop() || '').toLowerCase();
        return file.endsWith('.html') ? file.replace('.html', '') : file;
    }

    function createShell() {
        const wrapper = document.createElement('aside');
        wrapper.id = 'species-side-nav';
        wrapper.className = 'fixed right-3 top-24 z-40 w-56 max-h-[72vh] bg-slate-900/85 border border-slate-700 rounded-xl shadow-2xl overflow-hidden';

        wrapper.innerHTML = `
            <div class="px-3 py-2 border-b border-slate-700 bg-slate-900/95">
                <div class="text-[11px] uppercase tracking-wide text-slate-400">Species</div>
                <div class="text-sm font-semibold text-white">Quick Navigator</div>
            </div>
            <div id="species-side-nav-list" class="max-h-[64vh] overflow-y-auto custom-scrollbar p-2 space-y-1"></div>
        `;

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.id = 'species-side-nav-toggle';
        toggle.className = 'fixed right-3 top-24 z-50 xl:hidden px-3 py-2 rounded-lg border border-slate-600 bg-slate-900/95 text-xs font-semibold tracking-wide uppercase text-slate-200';
        toggle.textContent = 'Species';

        document.body.appendChild(wrapper);
        document.body.appendChild(toggle);

        const syncVisibility = () => {
            const isNarrow = window.innerWidth < 1280;
            if (isNarrow) {
                wrapper.classList.add('hidden');
                toggle.classList.remove('hidden');
            } else {
                wrapper.classList.remove('hidden');
                toggle.classList.add('hidden');
            }
        };

        toggle.addEventListener('click', () => {
            wrapper.classList.toggle('hidden');
        });

        window.addEventListener('resize', syncVisibility);
        syncVisibility();
    }

    async function loadSpeciesList() {
        try {
            const response = await fetch(SPECIES_JSON, { cache: 'no-cache' });
            if (!response.ok) return [];
            const data = await response.json();
            return Array.isArray(data) ? data : (data.species || []);
        } catch {
            return [];
        }
    }

    function renderList(species) {
        const list = document.getElementById('species-side-nav-list');
        if (!list) return;

        const here = currentSlug();

        if (!species.length) {
            list.innerHTML = '<div class="text-xs text-slate-500 px-2 py-1">Species list unavailable.</div>';
            return;
        }

        list.innerHTML = species.map((entry) => {
            const slug = slugify(entry.name);
            const group = String(entry.source || '').toUpperCase() === 'FAIRYTALE' ? 'fairytale' : 'core';
            const href = `../../${group}/${slug}/${slug}.html`;
            const active = here === slug;

            return `
                <a
                    href="${href}"
                    class="block px-3 py-2 rounded-lg border text-sm transition ${
                        active
                            ? 'bg-indigo-600/35 border-indigo-400/70 text-white'
                            : 'bg-slate-900/70 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    }"
                >
                    <div class="font-semibold">${entry.name}</div>
                    <div class="text-[10px] uppercase tracking-wide opacity-80">${entry.source || 'Unknown'}</div>
                </a>
            `;
        }).join('');
    }

    document.addEventListener('DOMContentLoaded', async () => {
        createShell();
        const list = await loadSpeciesList();
        renderList(list);
    });
})();
