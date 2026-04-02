/**
 * MUSCLE ATLAS - UNIFIED PERSISTENT ENGINE v5
 * Complete ground-up rebuild of the cursor.
 */
(function() {
    'use strict';

    let cursorRing;
    let magicTitle;
    let sweepOverlay;
    
    // Core state
    const state = {
        x: -100, y: -100,
        active: false,
        scale: 1,
        hovering: false
    };

    const init = () => {
        // 1. Completely fresh, pure-JS cursor injection
        // Remove any old static ones first to prevent duplicates
        document.querySelectorAll('.muscle-cursor-ring, .cinematic-atlas-ring').forEach(el => el.remove());
        
        cursorRing = document.createElement('div');
        cursorRing.className = 'muscle-cursor-ring';
        // Base critical styles directly applied to guarantee they work everywhere perfectly
        Object.assign(cursorRing.style, {
            position: 'absolute', // Completely immune to 'fixed' containing block bugs
            top: '0',
            left: '0',
            width: '12px',
            height: '12px',
            border: '2px solid #d4af37', // Gold ring
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: '2147483647',
            transform: 'translate(-50%, -50%)',
            transition: 'width 0.2s, height 0.2s, background-color 0.2s, border-color 0.2s', // Removed transform transition to prevent layout lag
            backgroundColor: 'transparent',
            boxShadow: '0 0 8px rgba(212, 175, 55, 0.3)'
        });
        document.body.appendChild(cursorRing);

        // Track other elements
        magicTitle = document.getElementById('magic-title');
        sweepOverlay = document.querySelector('.page-sweep');

        // Setup Hovers
        document.querySelectorAll('a, button, .glass-card, .btn-pill-glow, .magic-btn').forEach(el => {
            el.addEventListener('mouseenter', () => {
                state.scale = el.closest('.glass-card') ? 1.3 : 1.6;
                state.hovering = true;
                cursorRing.style.width = (12 * state.scale) + 'px';
                cursorRing.style.height = (12 * state.scale) + 'px';
                cursorRing.style.backgroundColor = 'rgba(212, 175, 55, 0.15)';
                cursorRing.style.borderColor = '#ffd700'; // brighter gold
                cursorRing.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)';
            });
            el.addEventListener('mouseleave', () => {
                state.scale = 1;
                state.hovering = false;
                cursorRing.style.width = '12px';
                cursorRing.style.height = '12px';
                cursorRing.style.backgroundColor = 'transparent';
                cursorRing.style.borderColor = '#d4af37';
                cursorRing.style.boxShadow = '0 0 8px rgba(212, 175, 55, 0.3)';
            });
        });

        // Setup Inter-page Transitions
        document.body.addEventListener('click', (e) => {
            const anchor = e.target.closest('a');
            if (!anchor) return;
            const href = anchor.getAttribute('href');
            if (!href || href.includes('#') || href.startsWith('mailto')) return;
            
            e.preventDefault();
            if (sweepOverlay) sweepOverlay.classList.add('active');
            document.body.classList.add('is-transitioning');
            setTimeout(() => window.location.href = href, 450);
        });

        // Start pure logic loop
        requestAnimationFrame(updateLoop);
    };

    const updateLoop = () => {
        // Hero parralax (Overview only)
        if (magicTitle && state.active) {
            const rx = (window.innerHeight / 2 - state.y) / 60;
            const ry = (state.x - window.innerWidth / 2) / 60;
            magicTitle.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        }
        requestAnimationFrame(updateLoop);
    };

    // Bulletproof Position Synchronization
    const syncCursor = () => {
        if (state.x !== -100 && state.y !== -100 && cursorRing) {
            // By using absolute position, we add the scroll offsets. 
            // This natively forces the cursor to act 'fixed' without relying on the browser's CSS GPU compositor.
            cursorRing.style.left = (state.x + window.pageXOffset) + 'px';
            cursorRing.style.top = (state.y + window.pageYOffset) + 'px';
        }
    };

    // Global Tracking: Ultra minimal
    const onMove = (e) => {
        const cx = e.clientX !== undefined ? e.clientX : (e.touches ? e.touches[0].clientX : null);
        const cy = e.clientY !== undefined ? e.clientY : (e.touches ? e.touches[0].clientY : null);
        
        if (cx !== null && cy !== null) {
            state.x = cx;
            state.y = cy;
            state.active = true;
            syncCursor();
        }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('scroll', syncCursor, { passive: true }); // Ensure cursor stays relative on mouse wheel scrolls
    window.addEventListener('load', init);
    
    // Fallback if load already happened
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    }
})();
