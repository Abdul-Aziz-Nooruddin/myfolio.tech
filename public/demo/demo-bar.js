/**
 * MyFolio Flat Design Demo Suite — Interactive Top Switcher Bar
 * Injected across all demo pages for instant cross-page preview and theme toggling
 */

(function() {
  const pages = [
    { id: 'home', name: 'Home / Landing', url: '/demo/index.html', icon: '🏠' },
    { id: 'studio', name: 'Studio', url: '/demo/studio.html', icon: '🎨' },
    { id: 'dashboard', name: 'Dashboard', url: '/demo/dashboard.html', icon: '📊' },
    { id: 'pricing', name: 'Pricing', url: '/demo/pricing.html', icon: '💳' },
    { id: 'auth', name: 'Auth / Sign In', url: '/demo/auth.html', icon: '🔐' },
    { id: 'profile', name: 'Profile / Settings', url: '/demo/profile.html', icon: '👤' },
    { id: 'about', name: 'About', url: '/demo/about.html', icon: 'ℹ️' },
    { id: 'contact', name: 'Contact', url: '/demo/contact.html', icon: '📬' },
    { id: 'faq', name: 'FAQ', url: '/demo/faq.html', icon: '❓' },
    { id: '404', name: '404 Page', url: '/demo/404.html', icon: '🚫' }
  ];

  // Determine current page
  const currentPath = window.location.pathname;
  let activePage = pages[0];
  for (const p of pages) {
    if (currentPath === p.url || currentPath.endsWith(p.url.replace('/demo/', '')) || (p.id === 'home' && (currentPath === '/demo' || currentPath === '/demo/'))) {
      activePage = p;
      break;
    }
  }

  // Restore Theme
  const savedTheme = localStorage.getItem('myfolio-flat-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Inject Styles
  const style = document.createElement('style');
  style.id = 'myfolio-demo-bar-styles';
  style.textContent = `
    #mf-demo-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 48px;
      background: #06070B;
      border-bottom: 2px solid #F5A623;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      color: #FFFFFF;
      box-sizing: border-box;
    }
    #mf-demo-bar * {
      box-sizing: border-box;
    }
    body {
      padding-top: 48px !important;
    }
    .mf-demo-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      color: #FFFFFF;
      text-decoration: none;
      white-space: nowrap;
    }
    .mf-demo-badge {
      background: #F5A623;
      color: #06070B;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 7px;
      border-radius: 4px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .mf-demo-nav-tabs {
      display: flex;
      align-items: center;
      gap: 4px;
      overflow-x: auto;
      max-width: calc(100vw - 360px);
      scrollbar-width: none;
    }
    .mf-demo-nav-tabs::-webkit-scrollbar {
      display: none;
    }
    .mf-demo-tab {
      padding: 6px 12px;
      border-radius: 6px;
      color: #94A3B8;
      text-decoration: none;
      font-weight: 600;
      font-size: 12px;
      white-space: nowrap;
      transition: background 0.15s, color 0.15s;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .mf-demo-tab:hover {
      color: #FFFFFF;
      background: rgba(255, 255, 255, 0.08);
    }
    .mf-demo-tab.active {
      color: #06070B;
      background: #FFFFFF;
      font-weight: 700;
    }
    .mf-demo-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      white-space: nowrap;
    }
    .mf-demo-btn {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: transparent;
      color: #FFFFFF;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      transition: all 0.15s;
    }
    .mf-demo-btn:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: #FFFFFF;
    }
    .mf-demo-btn-theme {
      background: rgba(255, 255, 255, 0.08);
    }
    .mf-demo-btn-exit {
      color: #94A3B8;
      border-color: transparent;
    }
    .mf-demo-btn-exit:hover {
      color: #FFFFFF;
      background: transparent;
    }
    @media (max-width: 900px) {
      .mf-demo-nav-tabs {
        display: none;
      }
      #mf-demo-dropdown {
        display: block !important;
      }
    }
    #mf-demo-dropdown {
      display: none;
      background: #1E293B;
      color: #FFFFFF;
      border: 1px solid #334155;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      outline: none;
    }
  `;
  document.head.appendChild(style);

  // Build DOM
  const bar = document.createElement('div');
  bar.id = 'mf-demo-bar';

  let tabsHtml = '';
  let optionsHtml = '';
  pages.forEach(p => {
    const isActive = p.id === activePage.id;
    tabsHtml += `
      <a href="${p.url}" class="mf-demo-tab ${isActive ? 'active' : ''}">
        <span>${p.icon}</span> ${p.name}
      </a>
    `;
    optionsHtml += `
      <option value="${p.url}" ${isActive ? 'selected' : ''}>${p.icon} ${p.name}</option>
    `;
  });

  bar.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;">
      <a href="/demo/index.html" class="mf-demo-brand">
        <span>MyFolio</span>
        <span class="mf-demo-badge">FLAT DESIGN DEMO</span>
      </a>
      <select id="mf-demo-dropdown" onchange="window.location.href=this.value">
        ${optionsHtml}
      </select>
    </div>

    <nav class="mf-demo-nav-tabs">
      ${tabsHtml}
    </nav>

    <div class="mf-demo-actions">
      <button class="mf-demo-btn mf-demo-btn-theme" id="mf-theme-toggle" title="Toggle Flat Theme">
        ${savedTheme === 'dark' ? '☀️ Flat Light' : '🌙 Flat Dark'}
      </button>
      <a href="/" class="mf-demo-btn mf-demo-btn-exit" title="Return to current production website">
        Exit Demo ↗
      </a>
    </div>
  `;

  document.body.prepend(bar);

  // Theme toggle handler
  document.getElementById('mf-theme-toggle').addEventListener('click', function() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('myfolio-flat-theme', next);
    this.textContent = next === 'dark' ? '☀️ Flat Light' : '🌙 Flat Dark';
  });
})();
