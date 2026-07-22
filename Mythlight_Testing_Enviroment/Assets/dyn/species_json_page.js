(() => {
    const SPECIES_JSON_PATH = '../../../../json/species.json';

    function slugify(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '_');
    }

    function getCurrentSlug() {
        const fileName = window.location.pathname.split('/').pop() || '';
        return fileName.toLowerCase().replace(/\.html$/, '');
    }

    function sourceBadgeClass(sourceColor) {
        const map = {
            indigo: 'bg-indigo-600',
            purple: 'bg-purple-600',
            rose: 'bg-rose-600',
            emerald: 'bg-emerald-600',
            amber: 'bg-amber-600',
            slate: 'bg-slate-600',
        };
        return map[sourceColor] || 'bg-slate-600';
    }

    function renderSpecies(species) {
        const container = document.getElementById('species-json-root');
        if (!container || !species) return;

        const attrNames = { B: 'Body', M: 'Mind', SK: 'Skill', ST: 'Style' };
        const descriptionHtml = Array.isArray(species.description)
            ? species.description.map((paragraph) => `<p>${paragraph}</p>`).join('')
            : `<p>${species.description || ''}</p>`;

        const attributesHtml = Object.entries(species.attributes || {}).map(([key, val]) => {
            const numeric = Number(val) || 0;
            const tone = numeric > 0
                ? 'text-emerald-400'
                : numeric < 0
                    ? 'text-rose-400'
                    : 'text-slate-400';
            return `
                <div class="bg-slate-900/80 p-4 rounded-xl border border-slate-700 text-center">
                    <div class="text-xs uppercase text-slate-500">${attrNames[key] || key}</div>
                    <div class="text-lg font-bold ${tone}">${numeric >= 0 ? '+' : ''}${numeric}</div>
                </div>
            `;
        }).join('');

        const traitHtml = (species.trait || []).map((trait) => `
            <div class="bg-slate-900/40 border border-slate-800 rounded-xl p-5 hover:bg-slate-900/60 transition">
                <div class="flex justify-between items-center mb-2 gap-2">
                    <strong class="text-indigo-200">${trait.name || 'Unnamed Trait'}</strong>
                    <div class="flex gap-2">
                        <span class="text-xs px-2 py-1 bg-indigo-900/30 border border-indigo-500/20 rounded uppercase">${trait.action || '-'}</span>
                        <span class="text-xs px-2 py-1 bg-indigo-900/30 border border-indigo-500/20 rounded uppercase">${trait.type || '-'}</span>
                    </div>
                </div>
                <p class="text-sm text-slate-400">${trait.description || ''}</p>
            </div>
        `).join('');

        container.innerHTML = `
            <section class="space-y-6">
                <div class="border-b border-slate-800 pb-4">
                    <span class="text-xs font-black ${sourceBadgeClass(species.source_color)} text-white px-2 py-1 rounded">${species.source || 'Unknown'}</span>
                    <h1 class="text-4xl font-bold text-white mt-3">${species.name || 'Species'}</h1>
                    <p class="text-indigo-400 italic mt-2">${species.summary || ''}</p>
                </div>

                <div class="space-y-4 text-slate-300 leading-relaxed">${descriptionHtml}</div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">${attributesHtml}</div>

                ${species.feat_points ? `
                    <div class="bg-slate-900/80 p-4 rounded-xl border border-slate-700 text-center">
                        <div class="text-xs uppercase text-slate-500">Feat Points</div>
                        <div class="text-lg font-bold text-indigo-400">${species.feat_points}</div>
                    </div>
                ` : ''}

                <div class="space-y-4">${traitHtml || '<div class="text-slate-500">No traits listed.</div>'}</div>
            </section>
        `;
    }

    function renderNotFound() {
        const container = document.getElementById('species-json-root');
        if (!container) return;
        container.innerHTML = `
            <section class="bg-slate-900/40 border border-slate-800 rounded-xl p-6 text-center">
                <h1 class="text-2xl font-bold text-white">Species Not Found</h1>
                <p class="text-slate-400 mt-2">Could not locate this species in JSON.</p>
            </section>
        `;
    }

    async function init() {
        const slug = getCurrentSlug();

        try {
            const response = await fetch(SPECIES_JSON_PATH, { cache: 'no-cache' });
            if (!response.ok) {
                renderNotFound();
                return;
            }

            const data = await response.json();
            const speciesList = Array.isArray(data) ? data : (data.species || []);
            const species = speciesList.find((entry) => slugify(entry.name) === slug);

            if (!species) {
                renderNotFound();
                return;
            }

            document.title = `Mythlight RPG | ${species.name}`;
            renderSpecies(species);
        } catch (error) {
            console.error('Failed loading species JSON page:', error);
            renderNotFound();
        }
    }

    document.addEventListener('DOMContentLoaded', init);
})();
