/**
 * MyFolio Instant Hero GitHub Username Bar Engine
 * Mounts directly into the homepage hero section to maximize visitor engagement.
 * Features:
 * - Instant GitHub username input dock with auto-cleaning & keyboard handling
 * - Direct transition to Studio generator
 * - Platform reassurance tags
 */

(function initHeroGithubInput() {
  function sanitizeGithubUsername(raw) {
    if (!raw) return '';
    let val = raw.trim();
    val = val.replace(/^https?:\/\/(www\.)?github\.com\//i, '');
    val = val.replace(/^github\.com\//i, '');
    val = val.replace(/^@+/, '');
    val = val.split('/')[0].trim();
    return val.replace(/[^a-zA-Z0-9-]/g, '');
  }

  function createHeroGithubDock() {
    const dock = document.createElement('div');
    dock.className = 'hero-github-dock';
    dock.id = 'heroGithubDock';

    dock.innerHTML = `
      <form class="hero-github-form" id="heroGithubForm" action="/studio" method="GET" novalidate>
        <div class="hero-github-input-wrapper">
          <div class="hero-github-icon-slot" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </div>
          <span class="hero-github-prefix" aria-hidden="true">github.com/</span>
          <input 
            type="text" 
            name="github" 
            id="heroGithubInput" 
            class="hero-github-input" 
            placeholder="your-username" 
            autocomplete="off" 
            autocapitalize="none" 
            spellcheck="false" 
            aria-label="GitHub username"
            required
          />
          <button type="submit" class="hero-github-btn" id="heroGithubBtn" aria-label="Generate 3D Portfolio">
            <span class="btn-text">Build 3D</span>
            <span class="btn-sparkle" aria-hidden="true">✦</span>
          </button>
        </div>
      </form>

      <div class="hero-github-reassurance" aria-label="Platform assurances">
        <span class="reassurance-tag">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg>
          Instant 3D Preview
        </span>
        <span class="reassurance-divider">•</span>
        <span class="reassurance-tag">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg>
          Full Source Code ZIP Export
        </span>
        <span class="reassurance-divider">•</span>
        <span class="reassurance-tag">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/></svg>
          Zero Sign-Up Required
        </span>
      </div>
    `;

    // References
    const form = dock.querySelector('#heroGithubForm');
    const input = dock.querySelector('#heroGithubInput');
    const btn = dock.querySelector('#heroGithubBtn');
    const btnText = btn.querySelector('.btn-text');

    function triggerGeneration(username) {
      const cleanUser = sanitizeGithubUsername(username);
      if (!cleanUser) {
        input.focus();
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 400);
        return;
      }

      btn.classList.add('is-loading');
      btnText.textContent = 'Building...';

      try {
        sessionStorage.setItem('myfolio_preview_username', cleanUser);
      } catch (e) {}

      window.location.href = `/studio?github=${encodeURIComponent(cleanUser)}&autobuild=1`;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      triggerGeneration(input.value);
    });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerGeneration(input.value);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerGeneration(input.value);
      }
    });

    input.addEventListener('paste', () => {
      setTimeout(() => {
        input.value = sanitizeGithubUsername(input.value);
      }, 10);
    });

    return dock;
  }

  function mountHeroDock() {
    if (document.getElementById('heroGithubDock')) return;
    const heroCta = document.querySelector('.hero-cta');
    if (!heroCta) return;

    const dock = createHeroGithubDock();
    heroCta.innerHTML = '';
    heroCta.appendChild(dock);
  }

  function initObserver() {
    function tryMount() {
      const heroCta = document.querySelector('.hero-cta');
      if (!heroCta) return false;
      if (document.getElementById('heroGithubDock')) return true;
      const dock = createHeroGithubDock();
      heroCta.innerHTML = '';
      heroCta.appendChild(dock);
      return true;
    }

    if (tryMount()) return;

    const observer = new MutationObserver((mutations, obs) => {
      if (tryMount()) {
        obs.disconnect();
      }
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      tryMount();
    }, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
  } else {
    initObserver();
  }
})();
