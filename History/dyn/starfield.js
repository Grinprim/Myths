(() => {
    const canvas = document.getElementById('starCanvas');
    const header = document.getElementById('hero-header');
    if (!canvas || !header) return;

    const ctx = canvas.getContext('2d');
    let stars = [];
    const starCount = 550;
    const mouse = { x: null, y: null, radius: 200 };

    const colors = [
        'rgba(165, 180, 252, ',
        'rgba(191, 219, 254, ',
        'rgba(233, 213, 255, '
    ];

    const resize = () => {
        canvas.width = header.offsetWidth;
        canvas.height = header.offsetHeight;
        initStars();
    };

    header.addEventListener('mousemove', (event) => {
        const rect = header.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });

    header.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    header.addEventListener('click', (event) => {
        const rect = header.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        stars.forEach((star) => {
            const dx = star.x - clickX;
            const dy = star.y - clickY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 400) {
                const force = (400 - distance) / 8;
                star.vx = (dx / distance) * force;
                star.vy = (dy / distance) * force;
            }
        });
    });

    class Star {
        constructor() {
            this.init();
        }

        init() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = 0;
            this.vy = 0;
            this.size = Math.pow(Math.random(), 3) * 4 + 1;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 10;
            this.opacity = Math.random() * 0.6 + 0.3;
            this.blinkSpeed = Math.random() * 0.01 + 0.005;
            this.blinkDir = 1;
            this.colorBase = colors[Math.floor(Math.random() * colors.length)];
            this.shapeType = Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        }

        update() {
            this.opacity += this.blinkSpeed * this.blinkDir;
            if (this.opacity > 0.9 || this.opacity < 0.2) this.blinkDir *= -1;

            this.x += this.vx;
            this.y += this.vy;
            this.vx *= 0.92;
            this.vy *= 0.92;
            this.rotation += this.rotationSpeed;

            if (mouse.x != null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.x -= (dx / distance) * force * this.density * 0.2;
                    this.y -= (dy / distance) * force * this.density * 0.2;
                }
            }

            this.x += (this.baseX - this.x) * 0.04;
            this.y += (this.baseY - this.y) * 0.04;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            ctx.fillStyle = this.colorBase + this.opacity + ')';
            ctx.strokeStyle = this.colorBase + (this.opacity * 0.5) + ')';
            ctx.lineWidth = 1;

            if (this.shapeType === 0) {
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.shapeType === 1) {
                ctx.strokeRect(-this.size, -this.size, this.size * 2, this.size * 2);
                if (this.size > 2) ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            } else if (this.shapeType === 2) {
                ctx.beginPath();
                ctx.moveTo(0, -this.size);
                ctx.lineTo(this.size, this.size);
                ctx.lineTo(-this.size, this.size);
                ctx.closePath();
                ctx.stroke();
            }

            if (this.size > 3) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'rgba(99, 102, 241, 0.4)';
            }
            ctx.restore();

            if (mouse.x != null && this.size > 1.8) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    ctx.strokeStyle = `rgba(129, 140, 248, ${(1 - distance / mouse.radius) * 0.6})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
    }

    const initStars = () => {
        stars = [];
        for (let i = 0; i < starCount; i++) {
            stars.push(new Star());
        }
    };

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach((star) => {
            star.update();
            star.draw();
        });
        requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);

    resize();
    animate();
})();
