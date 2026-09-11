/**
 * particles.js
 * Lightweight canvas-based dot field with cursor repulsion.
 * All rendering logic lives here; theme colors are read from CSS variables.
 */

(function () {
  'use strict';

  /* ── Configuration ─────────────────────────────────────── */
  const CONFIG = {
    count: 120,          // Total dots (scaled down on small screens)
    baseRadius: 1.4,     // Dot draw radius (px)
    repelRadius: 110,    // Cursor influence radius (px)
    repelStrength: 0.45, // How hard dots push away
    returnSpeed: 0.055,  // Fraction of distance recovered per frame
    damping: 0.82,       // Velocity damping (0–1, lower = more drag)
    mousePadding: 60,    // Extra canvas edge padding for cursor detection
  };

  /* ── State ──────────────────────────────────────────────── */
  const canvas = document.getElementById('particle-canvas');
  const ctx    = canvas.getContext('2d');

  let dots       = [];
  let mouse      = { x: -9999, y: -9999 }; // Off-screen default
  let raf        = null;
  let isMobile   = false;
  let dotColor   = 'rgba(255,255,255,0.35)';

  /* ── Dot factory ─────────────────────────────────────────── */
  function createDot (w, h) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    return {
      ox: x,   // Origin x
      oy: y,   // Origin y
      x,
      y,
      vx: 0,   // Velocity x
      vy: 0,   // Velocity y
    };
  }

  /* ── Initialise / resize ─────────────────────────────────── */
  function init () {
    resize();
    window.addEventListener('resize', debounce(resize, 160));
  }

  function resize () {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w   = window.innerWidth;
    const h   = window.innerHeight;

    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    isMobile = w < 768 || ('ontouchstart' in window);

    // Scale count to viewport area (fewer on small screens)
    const area  = w * h;
    const count = isMobile
      ? Math.floor(CONFIG.count * 0.5)
      : Math.min(CONFIG.count, Math.floor(area / 8000));

    dots = Array.from({ length: count }, () => createDot(w, h));
    readDotColor();
  }

  /* ── Read dot color from CSS variable ───────────────────── */
  function readDotColor () {
    dotColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--dot-color').trim() || 'rgba(255,255,255,0.3)';
  }

  /* ── Mouse / touch tracking ──────────────────────────────── */
  document.addEventListener('mousemove', function (e) {
    if (isMobile) return;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener('mouseleave', function () {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  /* ── Animation loop ──────────────────────────────────────── */
  function tick () {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = dotColor;

    const repelR2 = CONFIG.repelRadius * CONFIG.repelRadius;

    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];

      /* --- Cursor repulsion --- */
      if (!isMobile) {
        const dx = d.x - mouse.x;
        const dy = d.y - mouse.y;
        const dist2 = dx * dx + dy * dy;

        if (dist2 < repelR2 && dist2 > 0) {
          const dist    = Math.sqrt(dist2);
          const force   = (1 - dist / CONFIG.repelRadius) * CONFIG.repelStrength;
          const nx      = dx / dist; // Normalised direction
          const ny      = dy / dist;
          d.vx += nx * force * 12;
          d.vy += ny * force * 12;
        }
      }

      /* --- Return to origin (spring) --- */
      d.vx += (d.ox - d.x) * CONFIG.returnSpeed;
      d.vy += (d.oy - d.y) * CONFIG.returnSpeed;

      /* --- Damping --- */
      d.vx *= CONFIG.damping;
      d.vy *= CONFIG.damping;

      /* --- Integrate --- */
      d.x += d.vx;
      d.y += d.vy;

      /* --- Draw --- */
      ctx.beginPath();
      ctx.arc(d.x, d.y, CONFIG.baseRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(tick);
  }

  /* ── Theme change observer ───────────────────────────────── */
  // Re-read color whenever the html data-theme attribute changes
  const themeObserver = new MutationObserver(function () {
    readDotColor();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  /* ── Utility: debounce ───────────────────────────────────── */
  function debounce (fn, delay) {
    let timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  /* ── Start ───────────────────────────────────────────────── */
  init();
  tick();
}());