/**
 * Nav.js
 * Fixed glass navbar behaviour:
 *  - deepens the glass effect slightly once the page is scrolled
 *  - opens/closes the mobile menu
 *  - toggles light/dark theme and remembers the choice
 *  - highlights the nav link of the section currently on screen
 *  - scrolls smoothly to a section when any #link is clicked
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

      // Turn transitions off for this one switch so the change is instant.
      root.classList.add('theme-switching');

      if (isDark) {
        root.removeAttribute('data-theme');
        try { localStorage.setItem('theme', 'light'); } catch (e) {}
      } else {
        root.setAttribute('data-theme', 'dark');
        try { localStorage.setItem('theme', 'dark'); } catch (e) {}
      }

      updateToggleLabel();

      void root.offsetWidth; // apply the new colours right now, with transitions off
      requestAnimationFrame(function () {
        root.classList.remove('theme-switching');
      });
    });
  }

  /* ── Smooth in-page scrolling ─────────────────────────── */
  // Any link like <a href="#projects"> glides to its section instead of jumping.
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('click', function (e) {
    const link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!link) return;

    const hash = link.getAttribute('href');
    if (!hash || hash.length < 2) return;

    const target = document.querySelector(hash);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });

    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', hash);
    }
  });

  /* ── Active section highlight ─────────────────────────── */
  // Whichever section crosses the middle of the screen gets its nav link
  // marked as active. "skills" has no link of its own, so it keeps About lit.
  const navLinks = Array.from(navbar.querySelectorAll('.navbar__link[href^="#"]'));
  const sectionToLink = {
    hero: '#hero',
    services: '#services',
    projects: '#projects',
    about: '#about',
    skills: '#about',
    contact: '#contact'
  };

  function setActive (sectionId) {
    const target = sectionToLink[sectionId];
    navLinks.forEach(function (link) {
      const on = link.getAttribute('href') === target;
      link.classList.toggle('is-active', on);
      if (on) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    Object.keys(sectionToLink).forEach(function (id) {
      const section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }
}());