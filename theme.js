// theme.js — shared theme switcher logic for all pages

(function () {
  const savedTheme = localStorage.getItem('portfolio-theme') || 'cyber';
  applyTheme(savedTheme);

  document.getElementById('themeToggle').addEventListener('click', () => {
    document.getElementById('themeOptions').classList.toggle('open');
  });

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.theme);
      document.getElementById('themeOptions').classList.remove('open');
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.theme-switcher')) {
      document.getElementById('themeOptions').classList.remove('open');
    }
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    document.querySelectorAll('.theme-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.theme === theme);
    });
  }
})();
