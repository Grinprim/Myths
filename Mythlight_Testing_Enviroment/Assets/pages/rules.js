(() => {
    /* =========================================================
       AMBIENT STARFIELD
       ========================================================= */
    const canvas = document.getElementById('cosmos-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let stars = [];
        let w, h;

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = document.documentElement.scrollHeight;
            const count = Math.min(260, Math.floor((w * h) / 9000));
            stars = Array.from({ length: count }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                r: Math.pow(Math.random(), 3) * 1.6 + 0.4,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.015 + 0.005,
                drift: (Math.random() - 0.5) * 0.05,
            }));
        };

        let t = 0;
        const draw = () => {
            t += 1;
            ctx.clearRect(0, 0, w, h);
            const scrollY = window.scrollY;
            for (const s of stars) {
                const y = s.y - scrollY * 0.15;
                if (y < -10 || y > h + 10) continue;
                const flicker = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
                ctx.beginPath();
                ctx.arc(s.x + Math.sin(t * 0.002 + s.phase) * 4, y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(185,199,242,${0.25 + flicker * 0.55})`;
                ctx.fill();
            }
            requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        resize();
        draw();
    }

    /* =========================================================
       LANTERN PENDULUM PHYSICS
       ========================================================= */
    const pivot = document.getElementById('lantern-pivot');
    const lanternBody = document.getElementById('lantern-body');
    const rig = document.getElementById('lantern-rig');

    if (pivot && rig) {
        let angle = (Math.random() - 0.5) * 0.15; // radians
        let angularVelocity = 0;
        const stiffness = 0.012;
        const damping = 0.975;
        let lastScrollY = window.scrollY;
        let dragging = false;
        let dragStartX = 0;

        const applyImpulse = (impulse) => {
            angularVelocity += impulse;
        };

        window.addEventListener('scroll', () => {
            const delta = window.scrollY - lastScrollY;
            lastScrollY = window.scrollY;
            applyImpulse(delta * 0.0009);
        }, { passive: true });

        window.addEventListener('mousemove', (e) => {
            if (dragging) return;
            const cx = window.innerWidth / 2;
            const distFromCenter = (e.clientX - cx) / cx; // -1..1
            if (Math.abs(e.clientY) < 200) {
                applyImpulse(distFromCenter * 0.0006);
            }
        });

        lanternBody?.addEventListener('mousedown', (e) => {
            dragging = true;
            dragStartX = e.clientX;
        });
        window.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            const dx = e.clientX - dragStartX;
            angle = Math.max(-0.6, Math.min(0.6, dx * 0.006));
        });
        window.addEventListener('mouseup', () => {
            if (dragging) {
                dragging = false;
                angularVelocity += (angle > 0 ? -0.02 : 0.02);
            }
        });

        const tick = () => {
            if (!dragging) {
                const restoring = -angle * stiffness * 40;
                angularVelocity += restoring * 0.016;
                angularVelocity *= damping;
                angle += angularVelocity;
            }
            rig.style.transform = `translateX(-50%) rotate(${angle}rad)`;
            requestAnimationFrame(tick);
        };
        tick();
    }

    /* =========================================================
       SCROLL TOC (opened by clicking the lantern)
       ========================================================= */
    const toc = document.getElementById('toc-scroll');
    const backdrop = document.getElementById('toc-backdrop');

    const openToc = () => {
        toc?.classList.add('open');
        backdrop?.classList.add('open');
    };
    const closeToc = () => {
        toc?.classList.remove('open');
        backdrop?.classList.remove('open');
    };

    lanternBody?.addEventListener('click', (e) => {
        // only treat as a click, not the tail end of a drag
        if (Math.abs(e.clientX - (lanternBody._downX ?? e.clientX)) > 4) return;
        if (toc?.classList.contains('open')) closeToc();
        else openToc();
    });
    lanternBody?.addEventListener('mousedown', (e) => { lanternBody._downX = e.clientX; });

    backdrop?.addEventListener('click', closeToc);
    toc?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeToc));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeToc(); });

    /* =========================================================
       BOOK TABS — active state + smooth jump
       ========================================================= */
    const tabs = document.querySelectorAll('.book-tab');
    const leaves = document.querySelectorAll('.leaf[id]');

    if (tabs.length && leaves.length) {
        const setActive = (id) => {
            tabs.forEach((t) => t.classList.toggle('active', t.getAttribute('data-target') === id));
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) setActive(entry.target.id);
            });
        }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

        leaves.forEach((leaf) => observer.observe(leaf));

        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                const target = document.getElementById(tab.getAttribute('data-target'));
                target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    /* =========================================================
       REVEAL LEAVES ON SCROLL
       ========================================================= */
    const revealTargets = document.querySelectorAll('.leaf');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });
    revealTargets.forEach((el) => revealObserver.observe(el));

    /* =========================================================
       MODE PILLS (just a visual toggle affordance, links already route)
       ========================================================= */
    const pills = document.querySelectorAll('.mode-pill');
    pills.forEach((p) => {
        p.addEventListener('click', () => {
            pills.forEach((o) => o.classList.remove('active'));
            p.classList.add('active');
        });
    });
})();
