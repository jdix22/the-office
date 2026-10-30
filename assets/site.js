/* The Office Professional Hair Studio. Plain JS, no build step. */
(function () {
  'use strict';

  /* ---------- settings the studio may change ---------- */
  // Instagram: create a free feed at behold.so connected to @theofficehairstudio,
  // choose "JSON" as the feed type and paste its ID here. Until then the
  // section shows studio photos that link to the Instagram profile.
  var BEHOLD_FEED_ID = '';
  // SMP form: leave empty to open the visitor's email app, or paste a
  // Formspree (or similar) endpoint to receive submissions by email directly.
  var FORM_ENDPOINT = '';
  var STUDIO_EMAIL = 'theofficehairstudio@gmail.com';

  var SQUARE_WIDGET = 'https://app.squareup.com/appointments/buyer/widget/cz90t707zmd3mr/L8RW299A308M1';
  var SQUARE_SERVICE = 'https://book.squareup.com/appointments/cz90t707zmd3mr/location/L8RW299A308M1/services/';

  var root = document.documentElement;
  var ROOT_URL = new URL('..', document.currentScript.src).href;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var smooth = function (p, a, b) { var t = clamp((p - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  var easeIO = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- one scroll scheduler for everything ---------- */
  var tasks = [];
  var queued = false;
  function frame() {
    queued = false;
    var again = false;
    for (var i = 0; i < tasks.length; i++) if (tasks[i]()) again = true;
    if (again) schedule();
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', function () { measureAll(); schedule(); });
  var measurers = [];
  function measureAll() { measurers.forEach(function (m) { m(); }); }

  /* ---------- header, drawer, book bar ---------- */
  var hdr = $('#hdr');
  var bookbar = $('#bookbar');
  var lastScrolled = null, lastBar = null;
  tasks.push(function () {
    var s = scrollY > 30;
    if (s !== lastScrolled && hdr) { hdr.classList.toggle('scrolled', s); lastScrolled = s; }
    var b = scrollY > innerHeight * .55;
    if (b !== lastBar && bookbar) { bookbar.classList.toggle('show', b); lastBar = b; }
    return false;
  });
  if (!$('.hero') && hdr) hdr.classList.add('solid');

  var menuBtn = $('.menu-btn');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    if (menuBtn) { menuBtn.setAttribute('aria-expanded', open); menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
    $$('#drawer a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---------- reveals and the lit-mirror frames ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      el.classList.add('in');
      if (el.hasAttribute('data-stagger')) setTimeout(function () { el.classList.add('settled'); }, 1500);
      if (el.classList.contains('lit')) setTimeout(function () { el.classList.add('done'); }, 2600);
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: .08 });
  $$('[data-reveal],[data-stagger],.lit').forEach(function (el) { io.observe(el); });

  /* ---------- HERO: pinned studio, lights come up, then it fades away ---------- */
  var hero = $('.hero');
  if (hero) (function () {
    var stage = $('.stage', hero), fr = $('.frame', hero), full = $('.ly-full', hero), dim = $('.ly-dim', hero);
    var glows = $$('.glow', hero), comets = $$('.comet', hero);
    var b1 = $('.band-1', hero), b2 = $('.band-2', hero), foot = $('.hero-foot', hero);
    var top = 0, range = 1, p = 0, dp = -1, armed = false;
    var cache = {};
    function put(key, el, prop, val) {
      if (cache[key] === val) return;
      cache[key] = val;
      if (prop.charAt(0) === '-') el.style.setProperty(prop, val); else el.style[prop] = val;
    }

    // split band two into words for its rise-in
    $$('[data-words]', b2).forEach(function (el) {
      var words = [];
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              var w = document.createElement('span'); w.className = 'w'; w.textContent = part;
              words.push(w); frag.appendChild(w);
            });
            node.replaceChild(frag, n);
          } else if (n.nodeType === 1) walk(n);
        });
      })(el);
      words.forEach(function (w, i) { w.style.setProperty('--th', (i / Math.max(1, words.length) * .55).toFixed(3)); });
    });

    function measure() {
      var r = hero.getBoundingClientRect();
      top = r.top + scrollY;
      range = Math.max(1, hero.offsetHeight - stage.offsetHeight);
    }

    function render(v) {
      put('sc', fr, 'transform', 'scale(' + (1 + .12 * easeIO(v)).toFixed(4) + ')');
      put('full', full, 'opacity', smooth(v, .12, .5).toFixed(3));
      var g = (smooth(v, .03, .16) * (1 - smooth(v, .36, .55)) * .5).toFixed(3);
      glows.forEach(function (el, i) { put('g' + i, el, 'opacity', g); });
      comets.forEach(function (el, i) {
        var a = .03 + i * .045, t = clamp((v - a) / .2, 0, 1);
        put('c' + i, el, 'strokeDashoffset', (70 - t * 1070).toFixed(1));
        put('co' + i, el, 'opacity', t > 0 && t < 1 ? '.95' : '0');
      });
      var o1 = 1 - smooth(v, .24, .3);
      put('b1o', b1, 'opacity', o1.toFixed(3));
      put('b1t', b1, 'transform', 'translateY(' + (-v * 90).toFixed(1) + 'px)');
      put('b1v', b1, 'visibility', o1 < .02 ? 'hidden' : 'visible');
      put('fo', foot, 'opacity', (1 - smooth(v, .2, .28)).toFixed(3));
      put('fv', foot, 'visibility', v > .28 ? 'hidden' : 'visible');
      put('b2o', b2, 'opacity', (smooth(v, .33, .37) * (1 - smooth(v, .62, .66))).toFixed(3));
      put('b2k', b2, '--k', clamp((v - .33) / .09, 0, 1).toFixed(3));
      put('st', stage, 'opacity', (1 - smooth(v, .64, .93)).toFixed(3));
    }

    function tick() {
      if (!armed) return false;
      p = clamp((scrollY - top) / range, 0, 1);
      if (dp < 0) dp = p;
      var d = p - dp;
      dp = Math.abs(d) < .0004 ? p : dp + d * .16;
      render(dp);
      return dp !== p;
    }

    function arm() {
      if (armed) return;
      armed = true; cache = {}; dp = -1;
      measure(); schedule();
    }
    function disarm() {
      if (!armed) return;
      armed = false; cache = {};
      [stage, fr, full, b1, b2, foot].concat(glows, comets).forEach(function (el) { el.removeAttribute('style'); });
      $$('.w', b2).forEach(function (w) { w.style.removeProperty('--k'); });
    }

    // the lights switch on once the darkened room has painted
    function switchOn() { fr.classList.add('on'); }
    if (dim.complete) requestAnimationFrame(switchOn);
    else { dim.addEventListener('load', switchOn); dim.addEventListener('error', switchOn); }

    tasks.push(tick);
    measurers.push(function () { if (armed) measure(); });

    var gates = ['(prefers-reduced-motion: reduce)', '(orientation: landscape) and (pointer: coarse) and (max-height: 500px)'].map(function (q) { return matchMedia(q); });
    function apply() {
      var still = gates.some(function (m) { return m.matches; });
      root.classList.toggle('motion', !still);
      if (still) disarm(); else arm();
      measureAll(); schedule();
    }
    gates.forEach(function (m) { m.addEventListener ? m.addEventListener('change', apply) : m.addListener(apply); });
    apply();
    addEventListener('load', function () { measureAll(); schedule(); });
  })();

  /* ---------- the menu: choose your barber ---------- */
  var tabs = $$('.chair');
  if (tabs.length) {
    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (!panel) return;
        if (on) {
          panel.hidden = false;
          panel.classList.remove('enter'); void panel.offsetWidth; panel.classList.add('enter');
          setTimeout(function () { panel.classList.remove('enter'); }, 1600);
        } else panel.hidden = true;
      });
      if (focus) tab.focus();
      var row = tab.parentNode;
      var l = tab.offsetLeft - row.offsetLeft, r = l + tab.offsetWidth;
      if (l < row.scrollLeft || r > row.scrollLeft + row.clientWidth) row.scrollTo({ left: l - 16, behavior: 'smooth' });
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') n = tabs[0];
        else if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
  }

  /* ---------- studio tour video (loads only when asked) ---------- */
  $$('[data-yt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + btn.getAttribute('data-yt') + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
      f.title = 'The Office studio tour';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      btn.parentNode.appendChild(f);
      btn.remove();
    });
  });

  /* ---------- Instagram: live Behold feed, or studio photos until connected ---------- */
  var ig = $('[data-ig]');
  if (ig) (function () {
    var rows = $$('.ig-row', ig);
    var PROFILE = 'https://www.instagram.com/theofficehairstudio/';
    var fallback = [
      ['work-fade', 'A clean skin fade, side profile'],
      ['work-balayage', 'Soft blonde balayage waves'],
      ['work-cut', 'A precision cut at a photo shoot'],
      ['work-design', 'A freehand hair design at an expo'],
      ['work-beard', 'Beard detail with clippers'],
      ['work-bob', 'A blunt bob with a fringe'],
      ['work-eye', 'An eye design cut into a fade'],
      ['work-art', 'Portrait painting in progress'],
      ['shave', 'A hot towel shave in a cloud of steam'],
      ['work-obi', 'At the station under the lit mirrors']
    ].map(function (f) { return { src: ROOT_URL + 'assets/img/' + f[0] + '.webp', alt: f[1], href: PROFILE, cap: f[1], kind: '' }; });

    function tile(p, dupe) {
      var a = document.createElement('a');
      a.className = 'ig-tile';
      a.href = p.href; a.target = '_blank'; a.rel = 'noopener';
      if (dupe) { a.tabIndex = -1; a.setAttribute('aria-hidden', 'true'); }
      a.setAttribute('aria-label', (p.cap ? p.cap.slice(0, 90) : 'Instagram post') + ', opens Instagram');
      var img = document.createElement('img');
      img.src = p.src; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async'; img.width = 400; img.height = 500;
      a.appendChild(img);
      if (p.kind) a.insertAdjacentHTML('beforeend', '<svg class="kind" aria-hidden="true"><use href="#' + p.kind + '"/></svg>');
      if (p.cap) { var s = document.createElement('span'); s.textContent = p.cap; a.appendChild(s); }
      return a;
    }
    function fill(list) {
      var half = Math.ceil(list.length / 2);
      var sets = [list.slice(0, half), list.slice(half).concat(list.slice(0, Math.max(0, half - (list.length - half))))];
      rows.forEach(function (row, r) {
        row.textContent = '';
        var set = sets[r].length ? sets[r] : list;
        var n = 0;
        while (n < Math.max(8, set.length)) { row.appendChild(tile(set[n % set.length], n >= set.length)); n++; }
      });
      measureAll(); schedule();
    }
    function fromBehold(data) {
      var posts = Array.isArray(data) ? data : (data && data.posts) || [];
      return posts.slice(0, 12).map(function (p) {
        var s = p.sizes || {};
        var pick = (s.medium && s.medium.mediaUrl) || (s.large && s.large.mediaUrl) || (s.small && s.small.mediaUrl) ||
          (p.mediaType === 'VIDEO' ? p.thumbnailUrl : p.mediaUrl);
        return {
          src: pick, href: p.permalink || PROFILE, cap: (p.prunedCaption || p.caption || '').trim(), alt: '',
          kind: p.mediaType === 'VIDEO' ? 'i-reel' : p.mediaType === 'CAROUSEL_ALBUM' ? 'i-stack' : ''
        };
      }).filter(function (p) { return p.src; });
    }
    function load() {
      fetch('https://feeds.behold.so/' + BEHOLD_FEED_ID, { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw r.status; return r.json(); })
        .then(function (d) { var list = fromBehold(d); if (list.length) fill(list); })
        .catch(function () { /* keep the studio photos */ });
    }
    fill(fallback);
    if (BEHOLD_FEED_ID) {
      load();
      setInterval(function () { if (!document.hidden) load(); }, 10 * 60 * 1000);
    }

    // the rows drift in opposite directions as you scroll past
    var sec = ig.closest('section'), sTop = 0, sH = 1, last = null;
    measurers.push(function () { var r = sec.getBoundingClientRect(); sTop = r.top + scrollY; sH = sec.offsetHeight; });
    tasks.push(function () {
      if (!root.classList.contains('motion')) { if (last !== null) { rows.forEach(function (r) { r.style.transform = ''; }); last = null; } return false; }
      var q = clamp((scrollY + innerHeight - sTop) / (innerHeight + sH), 0, 1);
      var k = Math.round(q * 1000);
      if (k === last) return false;
      last = k;
      var shift = q * .18 * innerWidth;
      rows[0].style.transform = 'translate3d(' + (-shift).toFixed(1) + 'px,0,0)';
      if (rows[1]) rows[1].style.transform = 'translate3d(' + (shift - .09 * innerWidth).toFixed(1) + 'px,0,0)';
      return false;
    });
  })();

  /* ---------- gentle parallax on background photos ---------- */
  $$('[data-parallax]').forEach(function (img) {
    var box = img.parentNode.parentNode, t = 0, h = 1, last = null;
    measurers.push(function () { var r = box.getBoundingClientRect(); t = r.top + scrollY; h = box.offsetHeight; });
    tasks.push(function () {
      if (!root.classList.contains('motion')) return false;
      var q = clamp((scrollY + innerHeight - t) / (innerHeight + h), 0, 1);
      var y = Math.round((q - .5) * -14 * 10) / 10;
      if (y === last) return false;
      last = y;
      img.style.transform = 'translate3d(0,' + y + '%,0)';
      return false;
    });
  });

  /* ---------- open now, and today's hours ---------- */
  var HOURS = { 2: [10, 20], 3: [10, 20], 4: [10, 20], 5: [10, 20], 6: [9, 16] };
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var fmt = function (h) { return (h > 12 ? h - 12 : h) + (h >= 12 ? ' pm' : ' am'); };
  function torontoNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Toronto', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
      var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
      return { day: DAYS.indexOf(o.weekday), hour: +o.hour + (+o.minute) / 60 };
    } catch (e) { var d = new Date(); return { day: d.getDay(), hour: d.getHours() + d.getMinutes() / 60 }; }
  }
  function status() {
    var n = torontoNow(), today = HOURS[n.day];
    if (today && n.hour >= today[0] && n.hour < today[1]) return { open: true, text: 'Open now · until ' + fmt(today[1]) };
    if (today && n.hour < today[0]) return { open: false, text: 'Closed · opens today at ' + fmt(today[0]) };
    for (var i = 1; i <= 7; i++) {
      var d = (n.day + i) % 7;
      if (HOURS[d]) return { open: false, text: 'Closed · opens ' + (i === 1 ? 'tomorrow' : DAYS[d]) + ' at ' + fmt(HOURS[d][0]) };
    }
    return { open: false, text: '' };
  }
  function paintStatus() {
    var s = status();
    $$('[data-status]').forEach(function (el) {
      el.classList.toggle('open', s.open);
      $('span', el).textContent = s.text;
    });
    var day = torontoNow().day;
    $$('[data-hours] [data-day]').forEach(function (row) {
      var d = +row.getAttribute('data-day');
      row.classList.toggle('today', d === day || (d === 0 && day === 1));
    });
  }
  paintStatus();
  setInterval(paintStatus, 60 * 1000);

  /* ---------- map loads when it is near ---------- */
  $$('iframe[data-src]').forEach(function (f) {
    var mo = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { f.src = f.getAttribute('data-src'); mo.disconnect(); }
    }, { rootMargin: '600px 0px' });
    mo.observe(f);
  });

  /* ---------- booking: Square's own booking flow, in a window on larger screens ---------- */
  var dlg = $('#book');
  if (dlg && typeof dlg.showModal === 'function') (function () {
    var body = $('.dlg-body', dlg), who = $('[data-book-who]', dlg), ext = $('[data-book-ext]', dlg);
    var frameEl = null, current = '';
    var wide = matchMedia('(min-width: 761px)');
    function open(src, label, href) {
      who.textContent = label;
      ext.href = href;
      if (!frameEl) {
        frameEl = document.createElement('iframe');
        frameEl.title = 'Book an appointment with The Office on Square';
        frameEl.allow = 'payment';
        frameEl.addEventListener('load', function () { body.classList.add('ready'); });
        body.appendChild(frameEl);
      }
      if (src !== current) { body.classList.remove('ready'); frameEl.src = src; current = src; }
      root.style.overflow = 'hidden';
      dlg.showModal();
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-book]');
      if (!a || !wide.matches || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      setMenu(false);
      var id = a.getAttribute('data-book');
      open(id ? SQUARE_SERVICE + id : SQUARE_WIDGET, a.getAttribute('data-who') || 'All barbers', a.href);
    });
    dlg.addEventListener('close', function () { root.style.overflow = ''; });
    $('[data-close]', dlg).addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  })();

  /* ---------- consultation form (SMP page) ---------- */
  $$('form[data-mailform]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {};
      $$('input,select,textarea', form).forEach(function (f) { if (f.name) data[f.name] = f.value.trim(); });
      var subject = form.getAttribute('data-subject') || 'Website enquiry';
      var lines = Object.keys(data).filter(function (k) { return data[k]; }).map(function (k) { return k + ': ' + data[k]; });
      var done = function () { form.classList.add('sent'); var ok = $('.form-ok', form); if (ok) ok.focus(); };
      if (FORM_ENDPOINT) {
        fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(Object.assign({ _subject: subject }, data)) })
          .then(function (r) { if (!r.ok) throw r.status; done(); })
          .catch(function () { location.href = 'mailto:' + STUDIO_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n')); done(); });
      } else {
        location.href = 'mailto:' + STUDIO_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
        done();
      }
    });
  });

  /* ---------- small things ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  document.addEventListener('visibilitychange', function () { document.body.classList.toggle('paused', document.hidden); });
  measureAll(); schedule();
})();
