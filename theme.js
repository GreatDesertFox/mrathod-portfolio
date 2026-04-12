// ── Step 1: apply saved theme instantly (before paint) ──
(function () {
  var theme = localStorage.getItem('portfolio-theme') || 'cyber';
  document.documentElement.setAttribute('data-theme', theme);
})();

// ── Step 2: wire up UI after DOM is ready ──
document.addEventListener('DOMContentLoaded', function () {

  var host = window.location.hostname;
  var isLocal = host === 'localhost'
    || host === '127.0.0.1'
    || host.includes('github.io')
    || /^192\.168\./.test(host)
    || /^10\./.test(host)
    || /^172\.(1[6-9]|2\d|3[01])\./.test(host);

  // On production — do nothing, no switchers injected
  if (!isLocal) return;

  // ── Load switcher.html and inject into page ──
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'switcher.html', true);
  xhr.onload = function () {
    if (xhr.status !== 200) return;
    var div = document.createElement('div');
    div.innerHTML = xhr.responseText;
    while (div.firstChild) {
      document.body.appendChild(div.firstChild);
    }
    wireTheme();
    loadFonts();
  };
  xhr.onerror = function () { console.warn('switcher.html could not be loaded'); };
  xhr.send();

  // ── THEME ──
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    document.querySelectorAll('.theme-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.theme === theme);
    });
  }

  function wireTheme() {
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
  }

  // ── FONT ──
  function loadFonts() {
    var xhr2 = new XMLHttpRequest();
    xhr2.open('GET', 'fonts.css', true);
    xhr2.onload = function () {
      if (xhr2.status !== 200) return;
      var options = parseFontOptions(xhr2.responseText);
      if (!options.length) { console.warn('No font options found in fonts.css'); return; }
      buildFontSwitcher(options);
      var savedFont = localStorage.getItem('portfolio-font') || options[0].id;
      applyFont(savedFont, options);
      document.getElementById('fontToggle').addEventListener('click', function (e) {
        e.stopPropagation();
        document.getElementById('fontOptions').classList.toggle('open');
        document.getElementById('themeOptions').classList.remove('open');
      });
    };
    xhr2.onerror = function () { console.warn('fonts.css could not be loaded'); };
    xhr2.send();
  }

  function parseFontOptions(css) {
    var options = [];
    var regex = /@font-option-start([\s\S]*?)@font-option-end/g;
    var match;
    while ((match = regex.exec(css)) !== null) {
      var block = match[1];
      var id = (block.match(/\bid:\s*(.+)/) || [])[1];
      if (!id) continue;
      id = id.trim();
      if (id === 'unique key used in localStorage') continue;
      options.push((function (b) {
        function get(key) {
          var m = b.match(new RegExp('\\b' + key + ':\\s*(.+)'));
          return m ? m[1].trim() : '';
        }
        return { id: get('id'), name: get('name'), imp: get('import'), body: get('body'), display: get('display'), mono: get('mono') };
      })(block));
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
    var f = null;
    for (var i = 0; i < options.length; i++) {
      if (options[i].id === fontId) { f = options[i]; break; }
    }
    if (!f) return;
    loadFontLink(f.id, f.imp);
    document.documentElement.style.setProperty('--font-body',    f.body);
    document.documentElement.style.setProperty('--font-display', f.display);
    document.documentElement.style.setProperty('--font-mono',    f.mono);
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
      btn.innerHTML =
        '<span class="font-btn-name">' + f.name + '</span>' +
        '<span class="font-btn-preview" style="font-family:' + f.display + '">Mayur Rathod</span>';
      btn.addEventListener('click', (function (id) {
        return function () {
          applyFont(id, options);
          document.getElementById('fontOptions').classList.remove('open');
        };
      })(f.id));
      container.appendChild(btn);
    });
  }

  // Close both on outside click
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.theme-switcher') && !e.target.closest('.font-switcher')) {
      var to = document.getElementById('themeOptions');
      var fo = document.getElementById('fontOptions');
      if (to) to.classList.remove('open');
      if (fo) fo.classList.remove('open');
    }
  });

});
