// ── Step 1: apply saved theme + font instantly (before paint) ──
(function () {
  var theme = localStorage.getItem('portfolio-theme') || 'cyber';
  document.documentElement.setAttribute('data-theme', theme);
})();

// ── Step 2: wire up UI after DOM is ready ──
document.addEventListener('DOMContentLoaded', function () {

  var host = window.location.hostname;
  var isLocal = host === 'localhost' || host === '127.0.0.1' || host.includes('github.io');

  // ── THEME ──
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    document.querySelectorAll('.theme-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.theme === theme);
    });
  }

  applyTheme(localStorage.getItem('portfolio-theme') || 'cyber');

  document.getElementById('themeToggle').addEventListener('click', function (e) {
    e.stopPropagation();
    document.getElementById('themeOptions').classList.toggle('open');
    document.getElementById('fontOptions').classList.remove('open');
  });

  document.querySelectorAll('.theme-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyTheme(btn.dataset.theme);
      document.getElementById('themeOptions').classList.remove('open');
    });
  });

  // ── FONT — parse options from fonts.css ──
  function parseFontOptions(css) {
    var options = [];
    var regex = /@font-option-start([\s\S]*?)@font-option-end/g;
    var match;
    while ((match = regex.exec(css)) !== null) {
      var block = match[1];
      function get(key) {
        var m = block.match(new RegExp(key + ':\\s*(.+)'));
        return m ? m[1].trim() : '';
      }
      options.push({
        id:      get('id'),
        name:    get('name'),
        imp:     get('import'),
        body:    get('body'),
        display: get('display'),
        mono:    get('mono'),
      });
    }
    return options;
  }

  function loadFontLink(id, url) {
    if (!document.getElementById('font-link-' + id)) {
      var link = document.createElement('link');
      link.id = 'font-link-' + id;
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
    }
  }

  function applyFont(fontId, options) {
    var f = options.find(function (o) { return o.id === fontId; });
    if (!f) return;
    loadFontLink(f.id, f.imp);
    var root = document.documentElement;
    root.style.setProperty('--font-body',    f.body);
    root.style.setProperty('--font-display', f.display);
    root.style.setProperty('--font-mono',    f.mono);
    localStorage.setItem('portfolio-font', fontId);
    document.querySelectorAll('.font-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.font === fontId);
    });
  }

  function buildFontSwitcher(options) {
    var container = document.getElementById('fontOptions');
    if (!container) return;
    container.innerHTML = '';
    options.forEach(function (f) {
      var btn = document.createElement('button');
      btn.className = 'font-btn';
      btn.dataset.font = f.id;
      // Strip quotes for inline style
      var displayFamily = f.display.replace(/'/g, '"');
      btn.innerHTML =
        '<span class="font-btn-name">' + f.name + '</span>' +
        '<span class="font-btn-preview" style="font-family:' + displayFamily + '"">Mayur Rathod</span>';
      btn.addEventListener('click', function () {
        applyFont(f.id, options);
        document.getElementById('fontOptions').classList.remove('open');
      });
      container.appendChild(btn);
    });
  }

  // Hide switchers on production, skip font loading
  if (!isLocal) {
    document.querySelectorAll('.theme-switcher, .font-switcher').forEach(function (el) {
      el.style.display = 'none';
    });
    return;
  }

  // Fetch fonts.css, parse options, build switcher
  fetch('fonts.css')
    .then(function (r) { return r.text(); })
    .then(function (css) {
      var options = parseFontOptions(css);
      if (!options.length) return;

      buildFontSwitcher(options);

      var savedFont = localStorage.getItem('portfolio-font') || options[0].id;
      applyFont(savedFont, options);

      document.getElementById('fontToggle').addEventListener('click', function (e) {
        e.stopPropagation();
        document.getElementById('fontOptions').classList.toggle('open');
        document.getElementById('themeOptions').classList.remove('open');
      });
    })
    .catch(function (err) {
      console.warn('fonts.css could not be loaded for font switcher:', err);
    });

  // Close both on outside click
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.theme-switcher') && !e.target.closest('.font-switcher')) {
      document.getElementById('themeOptions').classList.remove('open');
      var fo = document.getElementById('fontOptions');
      if (fo) fo.classList.remove('open');
    }
  });

});
