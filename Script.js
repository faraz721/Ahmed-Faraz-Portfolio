/**
 * Script.js
 * Smooth typing / deleting effect that cycles through role titles.
 */

(function () {
  'use strict';

  const ROLES = ['AI Engineer', 'Python Developer', 'Software Engineer', 'Full-Stack Developer'];

  const el = document.getElementById('typed-text');

  const TYPE_SPEED   = 75;   // ms per character while typing
  const DELETE_SPEED = 40;   // ms per character while deleting
  const HOLD_TIME    = 1400; // pause once a word is fully typed
  const GAP_TIME     = 350;  // pause once a word is fully deleted

  let roleIndex = 0;
  let charIndex = 0;
  let deleting  = false;

  function tick () {
    const current = ROLES[roleIndex];
    let delay;

    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === current.length) {
        deleting = true;
        delay = HOLD_TIME;
      } else {
        delay = TYPE_SPEED;
      }
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % ROLES.length;
        delay = GAP_TIME;
      } else {
        delay = DELETE_SPEED;
      }
    }

    setTimeout(tick, delay);
  }

  setTimeout(tick, 600); // small initial delay before typing starts
}());