// theme.js — Step 1: apply saved theme instantly (before paint)
(function () {
  var saved = localStorage.getItem('portfolio-theme') || 'cyber';
  document.documentElement.setAttribute('data-theme', saved);
})();

// Step 2: wire up UI after DOM is ready
document.addEventListener('DOMContentLoaded', function () {

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    document.querySelectorAll('.theme-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.theme === theme);
    });
  }

  // Mark the currently active button
  var current = localStorage.getItem('portfolio-theme') || 'cyber';
  applyTheme(current);

  // Toggle menu
  document.getElementById('themeToggle').addEventListener('click', function (e) {
    e.stopPropagation();
    document.getElementById('themeOptions').classList.toggle('open');
  });

  // Pick a theme
  document.querySelectorAll('.theme-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyTheme(btn.dataset.theme);
      document.getElementById('themeOptions').classList.remove('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.theme-switcher')) {
      document.getElementById('themeOptions').classList.remove('open');
    }
  });

});
