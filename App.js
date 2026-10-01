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
      }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

      observer.observe(skillsGrid);
    } else {
      // No IntersectionObserver support — just show the bars filled in.
      skillsGrid.classList.add('is-visible');
    }
  }

  /* ── Project videos ───────────────────────────────────────
   * - Videos load only when a card is near the viewport (fast first load)
   * - Autoplay (muted + looped) while visible, pause when scrolled away
   * - Small button lets the visitor pause/play; a manual pause is respected
   * - Respects "reduce motion": shows the poster, visitor can press play
   */
  const projectVideos = document.querySelectorAll('.project-card__video');
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function loadVideo (video) {
    if (video.dataset.loaded) return;
    video.querySelectorAll('source[data-src]').forEach(function (s) {
      s.src = s.getAttribute('data-src');
    });
    video.dataset.loaded = 'true';
    video.load();
  }

  function setToggleState (video, playing) {
    const btn = video.parentElement.querySelector('.project-card__toggle');
    if (!btn) return;
    btn.classList.toggle('is-paused', !playing);
    btn.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
  }

  projectVideos.forEach(function (video) {
    video.muted = true; // required for autoplay in all browsers
    const btn = video.parentElement.querySelector('.project-card__toggle');

    video.addEventListener('play',  function () { setToggleState(video, true); });
    video.addEventListener('pause', function () { setToggleState(video, false); });
    // Hide the video only if the LAST source fails too (a missing .webm alone is fine —
    // the browser just falls back to the .mp4).
    const sources = video.querySelectorAll('source');
    if (sources.length) {
      sources[sources.length - 1].addEventListener('error', function () {
        video.classList.add('is-missing');
      });
    }

    if (btn) {
      btn.addEventListener('click', function () {
        loadVideo(video);
        if (video.paused) {
          video.dataset.userPaused = '';
          video.play().catch(function () {});
        } else {
          video.dataset.userPaused = 'true';
          video.pause();
        }
      });
    }
    setToggleState(video, false);
  });

  /* Preload every project video in the background right after the page
   * has finished loading, so by the time a visitor reaches Projects the
   * videos are already downloaded (files are small, ~300 KB each). */
  function preloadAllVideos () {
    projectVideos.forEach(function (v) {
      v.preload = 'auto';
      loadVideo(v);
    });
  }
  if (document.readyState === 'complete') {
    setTimeout(preloadAllVideos, 300);
  } else {
    window.addEventListener('load', function () { setTimeout(preloadAllVideos, 300); });
  }

  if (projectVideos.length && 'IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        const video = entry.target;
        if (entry.isIntersecting) {
          loadVideo(video);
          if (!reduceMotion && !video.dataset.userPaused) {
            video.play().catch(function () {});
          }
        } else if (!video.paused) {
          video.pause();
        }
      });
    }, { threshold: 0.35, rootMargin: '600px 0px' });

    projectVideos.forEach(function (v) { videoObserver.observe(v); });
  } else {
    projectVideos.forEach(function (v) {
      loadVideo(v);
      if (!reduceMotion) v.play().catch(function () {});
    });
  }

  /* ── Scroll-reveal ────────────────────────────────────────
   * Elements fade in while sliding from the bottom, left or right each
   * time they enter the viewport. Elements that appear at the same moment
   * come in one after another (staggered). When an element leaves the
   * screen it is reset, so the animation plays again on the next visit
   * (scrolling back, or clicking the section link again).
   */
  function prepare (selector, pickDirection) {
    document.querySelectorAll(selector).forEach(function (el, i) {
      el.classList.add('reveal');
      const dir = pickDirection ? pickDirection(i) : null;
      if (dir) el.classList.add('reveal--' + dir);
    });
  }

  prepare('.services__grid .service-card', function (i) { return ['left', null, 'right'][i % 3]; });
  prepare('.projects__grid .project-card', function (i) { return i % 2 === 0 ? 'left' : 'right'; });
  prepare('.about__image-wrap', function () { return 'left'; });
  prepare('.about__content', function () { return 'right'; });
  prepare('.skill-group', function (i) { return i % 2 === 0 ? 'left' : 'right'; });
  prepare('.contact__intro', function () { return 'left'; });
  prepare('.contact__form', function () { return 'right'; });

  const revealEls = document.querySelectorAll('.reveal');
  const STAGGER = 110;   // ms between elements that appear together
  const DURATION = 1000; // ms, matches the CSS transition
  const SHOW_AT = 0.12;  // fraction of the element that must be visible
  const revealTimers = new WeakMap();

  function showEl (el, delay) {
    if (el.classList.contains('is-visible')) return;
    clearTimeout(revealTimers.get(el));
    el.classList.remove('reveal-done');
    el.style.setProperty('--reveal-delay', delay + 'ms');
    el.classList.add('is-visible');
    revealTimers.set(el, setTimeout(function () {
      el.classList.add('reveal-done');
      el.style.removeProperty('--reveal-delay');
    }, delay + DURATION + 100));
  }

  function hideEl (el) {
    if (!el.classList.contains('is-visible')) return;
    clearTimeout(revealTimers.get(el));
    el.classList.remove('is-visible', 'reveal-done');
    el.style.removeProperty('--reveal-delay');
  }

  if (revealEls.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      const revealObserver = new IntersectionObserver(function (entries) {
        let n = 0;
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            hideEl(entry.target);
          } else if (entry.intersectionRatio >= SHOW_AT) {
            if (!entry.target.classList.contains('is-visible')) {
              showEl(entry.target, Math.min(n, 5) * STAGGER);
              n++;
            }
          }
        });
      }, { threshold: [0, SHOW_AT], rootMargin: '0px 0px -60px 0px' });

      revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
      // No IntersectionObserver (or reduced motion) — just show everything.
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

      // Field validation — required + email-format checks (via the
      // native HTML attributes on each input) surfaced with the
      // browser's built-in validation UI.
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const isConfigured = EMAILJS_PUBLIC_KEY.indexOf('YOUR_') !== 0
        && EMAILJS_SERVICE_ID.indexOf('YOUR_') !== 0
        && EMAILJS_TEMPLATE_ID.indexOf('YOUR_') !== 0;

      if (!window.emailjs || !isConfigured) {
        setStatus('The contact form isn\u2019t connected yet \u2014 add your EmailJS keys in app.js, or email me directly.', 'error');
        return;
      }

      const submitBtn = form.querySelector('.contact__submit');
      const submitLabel = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.textContent = 'Sending\u2026';
      }
      setStatus('Sending\u2026', 'loading');

      window.emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
        .then(function () {
          setStatus('Message sent \u2014 thanks for reaching out! I\u2019ll reply soon.', 'success');
          form.reset();
        })
        .catch(function () {
          setStatus('Something went wrong sending that. Please try again or email me directly.', 'error');
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.removeAttribute('aria-busy');
            submitBtn.innerHTML = submitLabel;
          }
        });
    });
  }
}());