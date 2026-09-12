/**
 * app.js
 *  - reveals the skill bars with a single animation once they scroll into view
 *  - wires the contact form up to EmailJS so it works on a static GitHub Pages site
 */

(function () {
  'use strict';

  /* ── Skill bars ───────────────────────────────────────── */
  const skillsGrid = document.getElementById('skillsGrid');

  if (skillsGrid) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            skillsGrid.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      observer.observe(skillsGrid);
    } else {
      // No IntersectionObserver support — just show the bars filled in.
      skillsGrid.classList.add('is-visible');
    }
  }

  /* ── Scroll-reveal (fade-in) ──────────────────────────────
   * Subtle fade/slide-in for section headers, cards, and the
   * about/contact panels as they enter the viewport. Reveals
   * once per element (no repeated fade-out/fade-in on re-scroll)
   * to avoid flicker and keep it performant.
   */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

      revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
      // No IntersectionObserver support — just show everything.
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  /* ── Contact form (EmailJS) ───────────────────────────────
   * EmailJS lets a static, backend-free site like GitHub Pages send real
   * email from a form. Create a free account at emailjs.com, then replace
   * the three placeholders below with your own values:
   *   EMAILJS_PUBLIC_KEY  → Account > General > Public Key
   *   EMAILJS_SERVICE_ID  → Email Services > your service's ID
   *   EMAILJS_TEMPLATE_ID → Email Templates > your template's ID
   * The template should expect "user_name", "user_email", "subject" and
   * "message" fields to match the form inputs below.
   * Until these are filled in, the form will show a friendly error
   * instead of trying to send.
   */
  const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
  const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
  const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

  const form   = document.getElementById('contactForm');
  const status = document.getElementById('contactStatus');

  function setStatus (message, state) {
    if (!status) return;
    status.textContent = message;
    if (state) {
      status.setAttribute('data-state', state);
    } else {
      status.removeAttribute('data-state');
    }
  }

  if (form) {
    if (window.emailjs && typeof window.emailjs.init === 'function') {
      try { window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); } catch (e) {}
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const isConfigured = EMAILJS_PUBLIC_KEY.indexOf('YOUR_') !== 0
        && EMAILJS_SERVICE_ID.indexOf('YOUR_') !== 0
        && EMAILJS_TEMPLATE_ID.indexOf('YOUR_') !== 0;

      if (!window.emailjs || !isConfigured) {
        setStatus('The contact form isn\u2019t connected yet \u2014 add your EmailJS keys in app.js, or email me directly.', 'error');
        return;
      }

      const submitBtn = form.querySelector('.contact__submit');
      if (submitBtn) submitBtn.disabled = true;
      setStatus('Sending...', '');

      window.emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
        .then(function () {
          setStatus('Message sent \u2014 thanks for reaching out! I\u2019ll reply soon.', 'success');
          form.reset();
        })
        .catch(function () {
          setStatus('Something went wrong sending that. Please try again or email me directly.', 'error');
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }
}());