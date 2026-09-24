/* Dex, the Acadex study buddy. Builds itself into the hero and listens to the
   page from outside, so app.js, quiz.js, converter.js and the exporter need no
   changes. Works on index.html and converter.html. */
(function () {
  'use strict';
  var hero = document.querySelector('.hero-content');
  if (!hero) return;

  var conv = !!document.getElementById('conv-drop');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var svg =
    '<svg class="dex" viewBox="0 0 200 220" data-mood="idle" aria-hidden="true">' +
    '<defs><linearGradient id="dexg" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#6fd0ff"/><stop offset="1" stop-color="#0a84ff"/></linearGradient></defs>' +
    '<ellipse class="dex-shadow" cx="100" cy="208" rx="54" ry="8"/>' +
    '<circle class="dex-arm" cx="26" cy="132" r="14"/><circle class="dex-arm" cx="174" cy="132" r="14"/>' +
    '<g class="dex-body">' +
    '<rect x="34" y="38" width="132" height="158" rx="46" fill="url(#dexg)"/>' +
    '<path d="M52 52 v130" stroke="rgba(255,255,255,.35)" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M104 38 v-26 h20 v26 l-10 -8z" fill="#ff6ba8"/>' +
    '<g class="dex-eyes">' +
    '<circle class="dex-white" cx="80" cy="102" r="17"/><circle class="dex-white" cx="124" cy="102" r="17"/>' +
    '<circle class="dex-pupil" cx="80" cy="102" r="8"/><circle class="dex-pupil" cx="124" cy="102" r="8"/></g>' +
    '<ellipse class="dex-cheek" cx="66" cy="134" rx="9" ry="6"/><ellipse class="dex-cheek" cx="138" cy="134" rx="9" ry="6"/>' +
    '<path class="m m-idle" d="M90 138 q12 9 24 0"/><path class="m m-happy" d="M84 134 q18 20 36 0"/>' +
    '<path class="m m-think" d="M94 143 h16"/><path class="m m-sad" d="M88 146 q14 -12 28 0"/>' +
    '<ellipse class="m m-wow" cx="102" cy="142" rx="8" ry="10"/></g></svg>';

  /* Floating sample cards: study questions on the main page, conversions on the converter. */
  var cards = conv
    ? '<div class="dex-card" style="--x:-250px;--y:-50px;--z:20px;--r:-6deg"><b>PDF to text</b>Lecture notes, page by page<i></i><i class="ok"></i></div>' +
      '<div class="dex-card" style="--x:250px;--y:-30px;--z:-30px;--r:5deg;--d:-2s"><b>Image to text</b>Read a photo of a handout<i></i><i></i></div>' +
      '<div class="dex-card extra" style="--x:180px;--y:90px;--z:50px;--r:-3deg;--d:-4s"><b>CSV to JSON</b>Rows become objects<i></i><i class="ok"></i></div>'
    : '<div class="dex-card" style="--x:-250px;--y:-70px;--z:20px;--r:-6deg"><b>Multiple choice</b>Which layer holds the cell nucleus?<i></i><i class="ok"></i></div>' +
      '<div class="dex-card" style="--x:250px;--y:-40px;--z:-30px;--r:5deg;--d:-2s"><b>Identification</b>Name the unit of force.<i></i><i></i></div>' +
      '<div class="dex-card extra" style="--x:180px;--y:90px;--z:50px;--r:-3deg;--d:-4s"><b>Matching</b>Column A against column B<i></i><i class="ok"></i></div>';

  var stage = document.createElement('div');
  stage.className = 'dex-stage' + (conv ? ' is-compact' : '');
  stage.setAttribute('aria-hidden', 'true');
  stage.innerHTML =
    '<div class="dex-scene">' + cards +
    '<div class="dex-wrap">' + svg + '<div class="dex-say"></div></div></div>';
  hero.appendChild(stage);

  var scene = stage.querySelector('.dex-scene');
  var dex = stage.querySelector('.dex');
  var eyes = stage.querySelector('.dex-eyes');
  var pupils = stage.querySelectorAll('.dex-pupil');
  var say = stage.querySelector('.dex-say');
  var timer = 0;

  /* Mood and speech. A mood with ms set returns to idle by itself. */
  function mood(name, text, ms) {
    dex.setAttribute('data-mood', name);
    clearTimeout(timer);
    say.textContent = text || '';
    say.classList.toggle('on', !!text);
    if (ms) timer = setTimeout(function () { mood('idle'); }, ms);
  }

  /* Eyes and the whole scene follow the pointer. */
  var px = 0, py = 0, queued = false;
  function paint() {
    queued = false;
    var r = dex.getBoundingClientRect();
    var dx = (px - (r.left + r.width / 2)) / innerWidth;
    var dy = (py - (r.top + r.height / 2)) / innerHeight;
    var look = dex.getAttribute('data-mood') === 'think' ? [0, -6] : [dx * 14, dy * 14];
    for (var i = 0; i < pupils.length; i++) {
      pupils[i].style.transform = 'translate(' + look[0].toFixed(1) + 'px,' + look[1].toFixed(1) + 'px)';
    }
    scene.style.setProperty('--ry', (dx * 10).toFixed(1) + 'deg');
    scene.style.setProperty('--rx', (-dy * 8).toFixed(1) + 'deg');
  }
  if (!calm) {
    addEventListener('pointermove', function (e) {
      px = e.clientX; py = e.clientY;
      if (!queued) { queued = true; requestAnimationFrame(paint); }
    }, { passive: true });
    (function blink() {
      setTimeout(function () {
        eyes.classList.add('blink');
        setTimeout(function () { eyes.classList.remove('blink'); blink(); }, 110);
      }, 2200 + Math.random() * 2600);
    })();
  }

  function on(id, type, fn) {
    var el = document.getElementById(id);
    if (el) el.addEventListener(type, fn);
    return el;
  }
  function watch(el, fn, opts) {
    if (el) new MutationObserver(fn).observe(el, opts);
  }

  if (!conv) {
    /* ── Main page ── */
    var drop = document.getElementById('drop');
    if (drop) {
      ['dragenter', 'dragover'].forEach(function (t) {
        drop.addEventListener(t, function () { mood('wow', 'Drop it here!'); });
      });
      drop.addEventListener('dragleave', function () { mood('idle'); });
      drop.addEventListener('drop', function () { mood('happy', 'Got them. Reading now.', 3500); });
    }
    var files = on('files', 'change', function () {
      if (files.files && files.files.length) mood('happy', 'Nice. Pick your questions below.', 4000);
    });
    on('make', 'click', function () { mood('think', 'Writing your questions...', 20000); });

    ['read-status', 'status'].forEach(function (id) {
      var el = document.getElementById(id);
      watch(el, function () {
        if (el.classList.contains('is-bad') && el.textContent.trim()) {
          mood('sad', 'Something went wrong. Check the message below.', 6000);
        }
      }, { attributes: true, childList: true, characterData: true, subtree: true });
    });
    watch(document.body, function (list) {
      for (var i = 0; i < list.length; i++) {
        for (var j = 0; j < list[i].addedNodes.length; j++) {
          var n = list[i].addedNodes[j];
          if (n.nodeType === 1 && (n.matches('.score-value') || n.querySelector('.score-value'))) {
            mood('happy', 'All marked. See where you slipped.', 6000);
            return;
          }
        }
      }
    }, { childList: true, subtree: true });

    mood('idle', 'Hi, I am Dex. Drop your slides.', 5000);
  } else {
    /* ── Converter page ── */
    var cdrop = document.getElementById('conv-drop');
    if (cdrop) {
      cdrop.addEventListener('dragover', function () { mood('wow', 'Drop it here!'); });
      cdrop.addEventListener('dragleave', function () { mood('idle'); });
      cdrop.addEventListener('drop', function () { mood('think', 'Converting...'); });
    }
    on('conv-file-input', 'change', function () { mood('think', 'Converting...'); });

    var grid = document.getElementById('format-grid');
    if (grid) grid.addEventListener('click', function (e) {
      if (e.target.closest('.fmt-btn')) mood('happy', 'Good pick. Now drop your file.', 4000);
    });

    var progress = document.getElementById('conv-progress');
    var result = document.getElementById('conv-result');
    var cstatus = document.getElementById('conv-status');
    var opts = { attributes: true, attributeFilter: ['class'] };

    watch(progress, function () {
      if (progress.classList.contains('show')) mood('think', 'Converting...');
    }, opts);
    watch(result, function () {
      if (result.classList.contains('show')) mood('happy', 'Done. Your file is ready.', 6000);
    }, opts);
    watch(cstatus, function () {
      if (cstatus.textContent.trim()) mood('sad', 'That did not work. Check the message below.', 6000);
    }, { childList: true, characterData: true, subtree: true });

    on('conv-reset', 'click', function () { mood('idle', 'Ready for another one.', 3000); });
    mood('idle', 'Hi, I am Dex. Pick a conversion.', 5000);
  }
})();
