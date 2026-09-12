/**
 * Nav.js
 * Fixed glass navbar behaviour:
 *  - deepens the glass effect slightly once the page is scrolled
 *  - opens/closes the mobile menu
 *  - toggles light/dark theme and remembers the choice
 */

(function () {
  'use strict';

  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('navMenu');
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  if (!navbar) return;

  /* ── Scroll state ─────────────────────────────────────── */
  function onScroll () {
    navbar.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Mobile menu toggle ───────────────────────────────── */
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      const isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    menu.querySelectorAll('.navbar__link').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── Theme toggle ─────────────────────────────────────── */
  // The inline script in <head> already applies a saved theme before
  // first paint; here we just keep the toggle button and storage in sync.
  function updateToggleLabel () {
    if (!themeToggle) return;
    const isDark = root.getAttribute('data-theme') === 'dark';
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  updateToggleLabel();

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const isDark = root.getAttribute('data-theme') === 'dark';

      if (isDark) {
        root.removeAttribute('data-theme');
        try { localStorage.setItem('theme', 'light'); } catch (e) {}
      } else {
        root.setAttribute('data-theme', 'dark');
        try { localStorage.setItem('theme', 'dark'); } catch (e) {}
      }

      updateToggleLabel();
    });
  }
}());