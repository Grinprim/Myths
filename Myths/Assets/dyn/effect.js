(function () {
    // Add or remove portals by editing this array.
    // Required fields for each portal:
    // - displayName: label shown on the portal
    // - color: any valid CSS color (hex, rgb, hsl)
    // - link: destination URL
    const portals = [
        {
            displayName: 'Mythlight',
            color: '#6366f1',
            link: './Mythlight/index.html'
        },
        {
            displayName: 'Mythblitz',
            color: '#10b981',
            link: './Mythblitz/index.html'
        }
    ];

    function buildPortalItem(portal, index, total) {
        const angle = (360 / total) * index;

        const item = document.createElement('article');
        item.className = 'portal-orbit-item';
        item.style.setProperty('--angle', angle + 'deg');

        const inner = document.createElement('div');
        inner.className = 'portal-orbit-item-inner';
        inner.style.setProperty('--angle', angle + 'deg');

        const counter = document.createElement('div');
        counter.className = 'portal-orbit-item-counter';

        const face = document.createElement('div');
        face.className = 'portal-orbit-item-face';

        const anchor = document.createElement('a');
        anchor.className = 'portal-button';
        anchor.href = portal.link;
        anchor.style.setProperty('--portal-color', portal.color);
        anchor.setAttribute('aria-label', portal.displayName);

        const ambient = document.createElement('span');
        ambient.className = 'portal-ambient';

        const outerRing = document.createElement('span');
        outerRing.className = 'portal-outer-ring';

        const middleRing = document.createElement('span');
        middleRing.className = 'portal-middle-ring';

        const particleRing = document.createElement('span');
        particleRing.className = 'portal-particle-ring';

        const ring = document.createElement('span');
        ring.className = 'portal-ring';

        const eventHorizon = document.createElement('span');
        eventHorizon.className = 'portal-event-horizon';

        const voidSwirl = document.createElement('span');
        voidSwirl.className = 'portal-void-swirl';

        const absoluteCore = document.createElement('span');
        absoluteCore.className = 'portal-absolute-core';

        const core = document.createElement('span');
        core.className = 'portal-core';
        core.textContent = portal.displayName;

        eventHorizon.appendChild(voidSwirl);
        eventHorizon.appendChild(absoluteCore);

        anchor.appendChild(ambient);
        anchor.appendChild(outerRing);
        anchor.appendChild(middleRing);
        anchor.appendChild(particleRing);
        anchor.appendChild(ring);
        anchor.appendChild(eventHorizon);
        anchor.appendChild(core);
        face.appendChild(anchor);
        counter.appendChild(face);
        inner.appendChild(counter);
        item.appendChild(inner);

        return item;
    }

    function renderPortalEffect(options) {
        const opts = options || {};
        const mountId = opts.mountId || 'portal-orbit';
        const logoSrc = opts.logoSrc || './Myths/Assets/img/logo.png';
        const logoAlt = opts.logoAlt || 'Myths Logo';
        const portalList = Array.isArray(opts.portals) && opts.portals.length ? opts.portals : portals;

        const mount = document.getElementById(mountId);
        if (!mount || !portalList.length) return;

        const stage = document.createElement('div');
        stage.className = 'portal-orbit-stage';

        const ring = document.createElement('div');
        ring.className = 'portal-orbit-ring';
        ring.setAttribute('aria-hidden', 'true');

        const core = document.createElement('div');
        core.className = 'portal-orbit-core';
        core.setAttribute('aria-hidden', 'true');

        const glow = document.createElement('div');
        glow.className = 'absolute inset-0 bg-amber-500/20 rounded-full blur-3xl animate-pulse';

        const spinOuter = document.createElement('div');
        spinOuter.className = 'absolute inset-0 border-2 border-dashed border-amber-500/30 rounded-full animate-[spin_15s_linear_infinite]';

        const spinInner = document.createElement('div');
        spinInner.className = 'absolute inset-8 border border-amber-400/20 rounded-full animate-[spin_10s_linear_infinite_reverse]';

        const logo = document.createElement('img');
        logo.src = logoSrc;
        logo.alt = logoAlt;
        logo.className = 'relative z-10 h-[76%] w-[76%] object-contain animate-float drop-shadow-[0_0_25px_rgba(245,158,11,0.8)]';

        const topGradient = document.createElement('div');
        topGradient.className = 'absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full opacity-50';

        const rotor = document.createElement('div');
        rotor.className = 'portal-orbit-rotor';

        portalList.forEach(function (portal, index) {
            rotor.appendChild(buildPortalItem(portal, index, portalList.length));
        });

        core.appendChild(glow);
        core.appendChild(spinOuter);
        core.appendChild(spinInner);
        core.appendChild(logo);
        core.appendChild(topGradient);

        stage.appendChild(ring);
        stage.appendChild(core);
        stage.appendChild(rotor);

        mount.innerHTML = '';
        mount.appendChild(stage);
    }

    // Expose config and renderer so portals can be updated from HTML if needed.
    window.MythsPortalEffect = {
        portals: portals,
        render: renderPortalEffect
    };

    document.addEventListener('DOMContentLoaded', function () {
        renderPortalEffect({
            mountId: 'portal-orbit',
            logoSrc: './Myths/Assets/img/logo.png',
            logoAlt: 'Myths Logo',
            portals: portals
        });
    });
})();
