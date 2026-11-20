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

  /* ---- 7. enquiry forms -------------------------------------------------- */
  /* Static hosting, so there is no mail server behind the site. Both routes
     compose the same tidy message out of what the visitor typed: WhatsApp,
     which is how almost every enquiry actually arrives, and email as the
     fallback.

     "Email instead" used to be a plain mailto: link carrying nothing but a
     subject, which failed in two ways. It threw away everything the visitor
     had just typed, and on any device with no mail app registered as the
     handler — every desktop using webmail, and plenty of phones — clicking it
     did nothing at all, silently.

     So the email route now fills in the whole message, and always prints it
     on the page afterwards with the address and a copy button. A mailto: that
     goes nowhere raises no error and cannot be detected, so the only honest
     answer is to assume it might have and leave a way through either way. */

  var EMAIL = 'utraindrivingschool@gmail.com';

  function composeMessage(form) {
    var data = new FormData(form);
    var title = form.getAttribute('data-wa-title') || 'Enquiry from the U-Train website';
    var lines = [title, ''];

    $$('[name]', form).forEach(function (input) {
      if (input.type === 'checkbox' && !input.checked) return;
      var label = input.getAttribute('data-label') || input.name;
      var value = input.type === 'checkbox' ? 'Yes' : (data.get(input.name) || '').toString().trim();
      if (value) lines.push(label + ': ' + value);
    });

    return { subject: title, body: lines.join('\n') };
  }

  function setStatus(form, text) {
    var status = $('[data-form-status]', form);
    if (!status) return;
    status.hidden = false;
    status.textContent = text;
  }

  /* --- WhatsApp, the primary route --- */
  $$('form[data-wa-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = composeMessage(form);
      setStatus(form, 'Opening WhatsApp with your details…');
      window.open(
        'https://wa.me/' + SCHOOL.whatsapp + '?text=' + encodeURIComponent(msg.body),
        '_blank', 'noopener'
      );
    });
  });

  /* --- copying, with a path for old browsers and plain http --- */
  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function copyText(text, done) {
    /* The Clipboard API can be present and still refuse — an unfocused
       document, a permissions policy, Safari being Safari. Falling back to
       the old execCommand path on rejection rather than giving up is the
       whole point of having two. */
    if (navigator.clipboard && window.isSecureContext) {
      try {
        navigator.clipboard.writeText(text).then(
          function () { done(true); },
          function () { done(legacyCopy(text)); }
        );
        return;
      } catch (err) {
        /* some browsers throw synchronously instead of rejecting */
      }
    }
    done(legacyCopy(text));
  }

  /* When copying is refused outright, select the text so Ctrl/Cmd+C works. */
  function selectText(el) {
    if (!el || !window.getSelection || !document.createRange) return;
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /* --- the panel that catches a mailto: going nowhere --- */
  function showMailout(form, msg, trigger) {
    var box = $('[data-mailout]', form);
    if (!box) {
      box = document.createElement('div');
      box.className = 'mailout';
      box.setAttribute('data-mailout', '');
      var anchor = trigger.closest('.btn-row') || trigger;
      anchor.parentNode.insertBefore(box, anchor.nextSibling);
    }
    box.innerHTML = '';

    var head = document.createElement('p');
    head.className = 'mailout__head';
    head.textContent = 'If your mail app did not open, send this to ' + EMAIL;
    box.appendChild(head);

    var pre = document.createElement('pre');
    pre.className = 'mailout__text';
    pre.textContent = msg.body;
    box.appendChild(pre);

    var row = document.createElement('div');
    row.className = 'btn-row';

    var copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'btn btn--sm';
    copy.textContent = 'Copy the message';
    copy.addEventListener('click', function () {
      copyText(msg.body, function (ok) {
        if (ok) {
          copy.textContent = 'Copied';
        } else {
          /* nothing worked — hand them the text already selected */
          copy.textContent = 'Press Ctrl+C now';
          selectText(pre);
        }
        window.setTimeout(function () { copy.textContent = 'Copy the message'; }, 3000);
      });
    });
    row.appendChild(copy);

    var addr = document.createElement('a');
    addr.className = 'btn btn--sm btn--ghost';
    addr.href = 'mailto:' + EMAIL;
    addr.textContent = EMAIL;
    row.appendChild(addr);

    box.appendChild(row);
    return box;
  }

  /* --- Email, the fallback --- */
  $$('[data-email-send]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var form = btn.closest('form');
      if (!form) return;

      // the plain link this replaced skipped the form's own validation
      if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;

      var msg = composeMessage(form);
      setStatus(form, 'Opening your mail app…');
      var box = showMailout(form, msg, btn);

      /* Clicking a real anchor is the gentlest way to hand a mailto: to the
         system: where there is no handler the browser stays put instead of
         navigating to an error page. */
      var a = document.createElement('a');
      a.href = 'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent(msg.subject) +
        '&body=' + encodeURIComponent(msg.body);
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
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
