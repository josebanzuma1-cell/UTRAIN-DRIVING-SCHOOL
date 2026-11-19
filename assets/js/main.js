/* =========================================================================
   U-Train Driving School — site behaviour
   No dependencies. Everything degrades gracefully without JS.
   ========================================================================= */
(function () {
  'use strict';

  /* ---- shared brand data (single place to change the numbers) ---------- */
  var SCHOOL = {
    whatsapp: '256755938383',          // digits only, international format
    phoneMain: '0755938383',
    phoneAlt: '0753197776'
  };
  window.UTRAIN = SCHOOL;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- 1. mobile drawer ------------------------------------------------ */
  var body = document.body;
  var toggle = $('.nav__toggle');
  var drawer = $('.drawer');
  var scrim = $('.scrim');

  function closeMenu() {
    body.classList.remove('menu-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }
  function openMenu() {
    body.classList.add('menu-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      body.classList.contains('menu-open') ? closeMenu() : openMenu();
    });
  }
  if (scrim) scrim.addEventListener('click', closeMenu);
  $$('.drawer a, .drawer__close').forEach(function (el) {
    el.addEventListener('click', closeMenu);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---- 2. sticky nav shadow ------------------------------------------- */
  var nav = $('.nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-stuck', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- 3. reveal on scroll -------------------------------------------- */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealables = $$('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---- 4. counting stats ---------------------------------------------- */
  var counters = $$('[data-count]');
  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dur = 1500;
    var start = null;

    if (reduced) { el.textContent = target.toLocaleString('en-US') + suffix; return; }

    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('en-US') + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(runCount);
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { runCount(entry.target); cio.unobserve(entry.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ---- 5. FAQ: one open at a time -------------------------------------- */
  $$('.faq').forEach(function (group) {
    var items = $$('details', group);
    items.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        items.forEach(function (other) { if (other !== d) other.open = false; });
      });
    });
  });

  /* ---- 6. year stamp ---------------------------------------------------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---- 7. enquiry form -> WhatsApp -------------------------------------- */
  /* The site is static hosting, so there is no mail server behind it.
     The form composes a tidy WhatsApp message instead — which is how most
     enquiries actually reach the school anyway. The mailto fallback is
     offered beside the button in the markup. */
  $$('form[data-wa-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = new FormData(form);
      var title = form.getAttribute('data-wa-title') || 'Enquiry from the U-Train website';
      var lines = [title, ''];

      $$('[name]', form).forEach(function (input) {
        if (input.type === 'checkbox' && !input.checked) return;
        var label = input.getAttribute('data-label') || input.name;
        var value = input.type === 'checkbox' ? 'Yes' : (data.get(input.name) || '').toString().trim();
        if (value) lines.push(label + ': ' + value);
      });

      var url = 'https://wa.me/' + SCHOOL.whatsapp + '?text=' + encodeURIComponent(lines.join('\n'));
      var status = $('[data-form-status]', form);
      if (status) {
        status.hidden = false;
        status.textContent = 'Opening WhatsApp with your details…';
      }
      window.open(url, '_blank', 'noopener');
    });
  });

  /* ---- 8. load the map only when asked ---------------------------------- */
  /* Nothing from Google runs on the page until the visitor presses the button,
     so no third-party cookies are set behind their back. */
  $$('[data-map-load]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var box = btn.closest('.mapbox');
      if (!box || box.classList.contains('is-loaded')) return;

      var frame = document.createElement('iframe');
      frame.className = 'map-embed';
      frame.src = box.getAttribute('data-map');
      frame.title = box.getAttribute('data-map-title') || 'Map';
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      box.appendChild(frame);
      box.classList.add('is-loaded');
    });
  });

  /* ---- 9. keep the drawer in step with a resize ------------------------- */
  var mq = window.matchMedia('(min-width: 981px)');
  var onMq = function (e) { if (e.matches) closeMenu(); };
  mq.addEventListener ? mq.addEventListener('change', onMq) : mq.addListener(onMq);
})();
