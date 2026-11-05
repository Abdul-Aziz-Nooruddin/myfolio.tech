/**
 * MyFolio Platform Universal Theme Engine
 * Seamless Light / Dark Mode Toggle with localStorage persistence and cross-tab synchronization.
 */
(function() {
  const STORAGE_KEY = 'myfolio-theme';
  
  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    // Default to dark obsidian luxury for dashboard, studio, and auth
    return 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${theme}`);
    
    // Update any toggle buttons on page
    document.querySelectorAll('.mf-theme-toggle, #themeToggleBtn').forEach(btn => {
      btn.setAttribute('data-current-theme', theme);
      btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      const sun = btn.querySelector('.theme-icon-sun');
      const moon = btn.querySelector('.theme-icon-moon');
      if (sun && moon) {
        if (theme === 'dark') {
          sun.style.display = 'block';
          moon.style.display = 'none';
        } else {
          sun.style.display = 'none';
          moon.style.display = 'block';
        }
      }
    });

    try {
      window.dispatchEvent(new CustomEvent('myfolio-theme-changed', { detail: { theme } }));
    } catch (e) {}
  }

  window.toggleMyFolioTheme = function() {
    const current = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    return next;
  };

  // Immediate execution to prevent flash
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(document.documentElement.getAttribute('data-theme') || initialTheme);
    document.querySelectorAll('.mf-theme-toggle, #themeToggleBtn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.toggleMyFolioTheme();
      });
    });
  });

  // Cross-tab sync
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
      applyTheme(e.newValue);
    }
  });
})();
