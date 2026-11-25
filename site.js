/* Zambux website: the phone menu, the sticky "Get the app" bar, and the early-access forms. Plain JavaScript, no libraries. */
(function () {
  'use strict';

  // The public database address and key. The key is meant to be public: it can only call the one function below.
  var API = 'https://osfzobkdibzkcsfzbvxw.supabase.co/rest/v1/rpc/join_early_access';
  var KEY = 'sb_publishable_3ua_50Gx5oqG_SwepxXMDA_7xQ_OBEw';

  // ---- phone menu ----
  var nav = document.querySelector('.nav'), burger = document.querySelector('.burger');
  if (nav && burger) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    Array.prototype.forEach.call(nav.querySelectorAll('a'), function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); });
    });
  }

  // ---- bar that stays at the bottom on a phone, once the first screen has scrolled away ----
  var bar = document.querySelector('.bar'), hero = document.querySelector('.hero');
  if (bar && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      bar.classList.toggle('show', !entries[0].isIntersecting);
    }, { threshold: 0, rootMargin: '-120px 0px 0px 0px' }).observe(hero);
  }

  // ---- early-access forms ----
  function friendly(text) {
    var t = String(text || '').toLowerCase();
    if (t.indexOf('bad_email') >= 0) return 'That doesn’t look like an email address. Check it and try again.';
    if (t.indexOf('bad_city') >= 0) return 'Add your city, like Austin.';
    if (t.indexOf('failed to fetch') >= 0 || t.indexOf('network') >= 0) return 'Can’t reach Zambux right now. Check your connection and try again.';
    return 'Something went wrong. Please try again in a minute, or write to support@zambux.com.';
  }

  Array.prototype.forEach.call(document.querySelectorAll('form.ea'), function (form) {
    var msg = form.querySelector('.msg'), btn = form.querySelector('button[type=submit]');
    var android = form.querySelector('input[name=android]');
    // Pre-tick "I use Android" for visitors who are on an Android phone.
    if (android && /android/i.test(navigator.userAgent)) android.checked = true;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.className = 'msg'; msg.textContent = '';
      // A hidden field only a robot fills in: quietly pretend it worked.
      if (form.elements.company && form.elements.company.value) { msg.className = 'msg ok'; msg.textContent = 'You’re on the list.'; return; }
      var email = (form.elements.email.value || '').trim();
      var city = form.elements.city ? (form.elements.city.value || '').trim() : 'Austin';
      var source = form.getAttribute('data-source') || 'site';
      if (form.elements.biz) source = 'business:' + (form.elements.biz.value || '').trim();
      if (!email) { msg.className = 'msg err'; msg.textContent = 'Add your email so we can reach you.'; form.elements.email.focus(); return; }
      btn.disabled = true; var label = btn.textContent; btn.textContent = 'One moment…';
      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: 'Bearer ' + KEY },
        body: JSON.stringify({ p_email: email, p_city: city || 'Austin', p_platform: android && android.checked ? 'android' : 'ios', p_source: source })
      }).then(function (r) { return r.text().then(function (t) { return { ok: r.ok, text: t }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.text);
          msg.className = 'msg ok';
          msg.textContent = (android && android.checked)
            ? 'Thanks. We’ll email you when Zambux reaches Android.'
            : 'You’re on the list. We’ll email you the moment Zambux is ready.';
          form.reset();
          if (android && /android/i.test(navigator.userAgent)) android.checked = true;
        })
        .catch(function (err) { msg.className = 'msg err'; msg.textContent = friendly(err && err.message); })
        .then(function () { btn.disabled = false; btn.textContent = label; });
    });
  });
})();
