/**
 * MUSCLE ATLAS - INTERACTIVE GRAVITY DOTS
 * A completely isolated HTML5 Canvas particle physics system.
 * Backout: To remove this effect, simply remove `<script src="js/dots.js"></script>` from the HTML files.
 */
(function() {
    'use strict';

    let canvas, ctx;
    let particles = [];
    const NUM_PARTICLES = window.innerWidth < 768 ? 60 : 130;
    
    // Physics parameters
    const ATTRACTION_RADIUS = 160;
    const REPULSION_FORCE = 0.05;
    
    // Track pointer location (independent from main.js)
    const mouse = { x: -1000, y: -1000 };

    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(randomizeParams = false) {
            if (randomizeParams) {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
            } else {
                // Respawn slightly off-screen to avoid popping
                const side = Math.floor(Math.random() * 4);
                if (side === 0) { this.x = Math.random() * canvas.width; this.y = -10; } // top
                if (side === 1) { this.x = canvas.width + 10; this.y = Math.random() * canvas.height; } // right
                if (side === 2) { this.x = Math.random() * canvas.width; this.y = canvas.height + 10; } // bottom
                if (side === 3) { this.x = -10; this.y = Math.random() * canvas.height; } // left
            }
            
            // Very slow ambient drift
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.radius = Math.random() * 1.5 + 0.5; // extremely fine dots
            
            // Opacity pulsing
            this.baseAlpha = Math.random() * 0.4 + 0.1;
        }

        update() {
            // Apply ambient drift
            this.x += this.vx;
            this.y += this.vy;

            // Gravity repulsion math
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // If mouse is close, repulse violently
            let rAlpha = this.baseAlpha;
            if (dist < ATTRACTION_RADIUS) {
                const force = (ATTRACTION_RADIUS - dist) / ATTRACTION_RADIUS;
                this.vx += (dx / dist) * force * REPULSION_FORCE;
                this.vy += (dy / dist) * force * REPULSION_FORCE;
                rAlpha = Math.min(1.0, this.baseAlpha + force * 0.5); // Glow when pushed
            }

            // Slowly decay extreme velocities back to ambient drift
            this.vx *= 0.98;
            this.vy *= 0.98;

            // Wrap around or respawn
            if (this.x < -20 || this.x > canvas.width + 20 || this.y < -20 || this.y > canvas.height + 20) {
                this.reset();
            }

            // Draw
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(212, 175, 55, ${rAlpha})`; // Gold particles
            ctx.fill();
        }
    }

    const initCanvas = () => {
        canvas = document.getElementById('gravity-canvas');
        if (!canvas) return;
        
        ctx = canvas.getContext('2d', { alpha: true });
        
        const resize = () => {
            // High DPI support for crispy dots
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);
        };
        
        window.addEventListener('resize', resize);
        resize();

        // Populate array
        for (let i = 0; i < NUM_PARTICLES; i++) {
            particles.push(new Particle());
        }

        requestAnimationFrame(renderLoop);
    };

    const renderLoop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < NUM_PARTICLES; i++) {
            particles[i].update();
        }
        requestAnimationFrame(renderLoop);
    };

    // Listeners
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }, { passive: true });
    
    // Send mouse far away when leaving browser window
    document.body.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    // Boot
    window.addEventListener('load', initCanvas);
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(initCanvas, 100);
    }
})();
