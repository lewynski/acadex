<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>File Converter – Acadex</title>
    <meta
      name="description"
      content="Convert PDFs, Word docs, spreadsheets, and images — entirely in your browser. No uploads, no accounts."
    />
    <link rel="stylesheet" href="assets/css/style.css" />
    <script>
      /* Apply saved theme before first paint to avoid flash. */
      try {
        var t = localStorage.getItem('ar-theme');
        document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
      } catch (e) {}
    </script>
  </head>
  <body>

    <!-- ═══════════════════════ NAVBAR ═══════════════════════ -->
    <nav class="navbar" id="navbar">
      <div class="navbar-in">
        <a href="index.html" class="nav-logo">Acadex</a>

        <div class="nav-links" role="list">
          <a href="index.html"     class="nav-link"        role="listitem">Acadex</a>
          <a href="converter.html" class="nav-link active"  role="listitem">File Converter</a>
        </div>

        <div class="nav-actions">
          <button class="theme" id="theme" type="button" aria-pressed="false" title="Switch theme">
            <span aria-hidden="true" id="theme-mark">&#9788;</span>
            <span class="sr"         id="theme-said">Switch to light</span>
          </button>
          <button
            class="hamburger"
            id="hamburger"
            type="button"
            aria-label="Open menu"
            aria-expanded="false"
            aria-controls="nav-mobile"
          >
            <span class="hbar"></span>
            <span class="hbar"></span>
            <span class="hbar"></span>
          </button>
        </div>
      </div>

      <!-- Mobile drawer -->
      <div class="nav-mobile" id="nav-mobile" aria-hidden="true">
        <a href="index.html"     class="nav-mobile-link">Acadex</a>
        <a href="converter.html" class="nav-mobile-link">File Converter</a>
      </div>
    </nav>

    <!-- ═══════════════════════ HERO ═══════════════════════ -->
    <section class="conv-hero shell">
      <div class="hero-orbs" aria-hidden="true">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>
      <div class="hero-content">
        <h1>File Converter</h1>
        <p>
          Convert PDFs, Word docs, spreadsheets, and images — right inside your browser.
          Nothing is uploaded to any server.
        </p>
      </div>
    </section>

    <!-- ═══════════════════════ MAIN ═══════════════════════ -->
    <main class="shell" id="app">
      <section class="section section-flush">
        <div class="panel">

          <!-- Step 1: Choose format -->
          <p class="step-label">Step 1 — Choose a conversion</p>
          <div class="format-grid" id="format-grid" role="group" aria-label="Conversion formats"></div>

          <!-- Step 2: Drop / pick file -->
          <div id="drop-wrap" class="hidden">
            <p class="step-label">Step 2 — Drop your file</p>
            <label class="conv-drop" id="conv-drop" for="conv-file-input">
              <div class="conv-drop-icon">📂</div>
              <p class="conv-drop-title">Drop your file here</p>
              <p class="conv-drop-note" id="conv-drop-note">or click to browse</p>
            </label>
            <input type="file" id="conv-file-input" class="sr" />
          </div>

          <!-- Progress bar -->
          <div class="conv-progress" id="conv-progress" aria-live="polite">
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" id="progress-fill" role="progressbar"
                   aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>
            </div>
            <p class="progress-label" id="progress-label">Processing…</p>
          </div>

          <!-- Result -->
          <div class="conv-result" id="conv-result">
            <p class="step-label">Step 3 — Your result</p>
            <pre class="conv-output" id="conv-output" tabindex="0" aria-label="Converted text preview"></pre>
            <div class="conv-dl-row">
              <button class="btn"       id="conv-download" type="button">⬇ Download file</button>
              <button class="btn btn-quiet" id="conv-copy"  type="button">Copy text</button>
              <button class="btn btn-quiet" id="conv-reset" type="button">Convert another</button>
            </div>
          </div>

          <p class="status" id="conv-status" role="status" aria-live="polite"></p>
        </div>
      </section>
    </main>

    <!-- ═══════════════════════ FOOTER ═══════════════════════ -->
    <footer class="footer shell">
      <p>
        Files are processed entirely in your browser using open-source libraries.
        No data is sent to any server.
      </p>
      <p>
        Concerns or a bug to report:
        <a href="mailto:report@jonlewynv.online">report@jonlewynv.online</a><br />
        Website: <a href="https://www.jonlewynv.online/" rel="noopener">www.jonlewynv.online</a>
      </p>
      <p class="credit">Developer: Jon Lewyn V. Tanggaro</p>
    </footer>

    <script src="assets/js/converter.js" defer></script>
    <script src="assets/js/mascot.js" defer></script>

    <script>
      /* ── Theme toggle ── */
      (function () {
        const btn  = document.getElementById('theme');
        const mark = document.getElementById('theme-mark');
        const said = document.getElementById('theme-said');
        if (!btn) return;

        function apply(theme) {
          document.documentElement.setAttribute('data-theme', theme);
          try { localStorage.setItem('ar-theme', theme); } catch {}
          const dark  = theme === 'dark';
          mark.textContent = dark ? '\u2600' : '\u263D';      // ☀ / ☽
          const label = dark ? 'Switch to light' : 'Switch to dark';
          btn.title = label;
          said.textContent = label;
          btn.setAttribute('aria-pressed', String(!dark));
        }

        const saved = (() => { try { return localStorage.getItem('ar-theme'); } catch { return null; } })();
        apply(saved === 'light' ? 'light' : 'dark');
        btn.addEventListener('click', () => {
          apply(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
        });
      })();

      /* ── Hamburger ── */
      (function () {
        const ham = document.getElementById('hamburger');
        const mob = document.getElementById('nav-mobile');
        if (!ham || !mob) return;
        ham.addEventListener('click', () => {
          const open = mob.classList.toggle('open');
          ham.setAttribute('aria-expanded', String(open));
          mob.setAttribute('aria-hidden', String(!open));
        });
      })();
    </script>

  </body>
</html>
