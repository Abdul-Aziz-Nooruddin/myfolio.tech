/**
 * MyFolio TurboNav — Instantaneous App Navigation & Seamless Swapping Engine
 * Provides < 50ms page transitions, hover prefetching, and network-resilient offline caching.
 */

(function() {
  'use strict';

  // Guard against multi-initialization
  if (window.__myfolioTurboNav) return;
  window.__myfolioTurboNav = true;

  // In-memory HTML cache (URL -> { html, timestamp })
  const pageCache = new Map();
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  // Prefetch tracking to avoid duplicate in-flight requests
  const pendingPrefetches = new Set();

  // Progress Bar Element
  let progressBar = null;

  function initProgressBar() {
    if (document.getElementById('turbo-progress-bar')) return;
    const bar = document.createElement('div');
    bar.id = 'turbo-progress-bar';
    bar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 2.5px;
      background: linear-gradient(90deg, #38BDF8, #818CF8, #38BDF8);
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.8), 0 0 4px rgba(129, 140, 248, 0.6);
      z-index: 99999999;
      pointer-events: none;
      transition: width 0.15s ease-out, opacity 0.25s ease-out;
      opacity: 0;
    `;
    document.documentElement.appendChild(bar);
    progressBar = bar;
  }

  function startProgress() {
    if (!progressBar) initProgressBar();
    if (!progressBar) return;
    progressBar.style.transition = 'width 0.15s ease-out, opacity 0.15s ease-out';
    progressBar.style.opacity = '1';
    progressBar.style.width = '30%';
    setTimeout(() => {
      if (progressBar && progressBar.style.opacity === '1') {
        progressBar.style.width = '75%';
      }
    }, 120);
  }

  function finishProgress() {
    if (!progressBar) return;
    progressBar.style.width = '100%';
    setTimeout(() => {
      if (progressBar) {
        progressBar.style.opacity = '0';
        setTimeout(() => {
          if (progressBar) progressBar.style.width = '0%';
        }, 250);
      }
    }, 100);
  }

  // Normalize URLs to strip origin and hash for cache lookup
  function cleanPath(urlStr) {
    try {
      const parsed = new URL(urlStr, window.location.origin);
      return parsed.pathname;
    } catch (e) {
      return urlStr.split('#')[0].split('?')[0];
    }
  }

  // Determine if a URL is an internal navigatable app page
  function isInternalRoute(urlStr) {
    try {
      const parsed = new URL(urlStr, window.location.origin);
      if (parsed.origin !== window.location.origin) return false;
      const p = parsed.pathname;
      if (p.startsWith('/api/') || p.startsWith('/assets/') || p.startsWith('/images/')) return false;
      if (/\.(png|jpg|jpeg|gif|webp|svg|ico|pdf|zip|mp3|mp4|woff2?|ttf)$/i.test(p)) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  // Prefetch page HTML into in-memory cache
  async function prefetchUrl(url) {
    const path = cleanPath(url);
    if (!isInternalRoute(url)) return;
    if (pendingPrefetches.has(path)) return;

    const cached = pageCache.get(path);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) return;

    pendingPrefetches.add(path);
    try {
      const res = await fetch(url, {
        credentials: 'include',
        headers: { 'X-Requested-With': 'TurboNav' },
        cache: 'default'
      });
      if (res.ok) {
        const text = await res.text();
        pageCache.set(path, { html: text, timestamp: Date.now() });
      }
    } catch (e) {
      // Silent catch for prefetch failure
    } finally {
      pendingPrefetches.delete(path);
    }
  }

  // Execute scripts in injected content
  function runScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
      // If it's an inline script or standard page script, re-create to execute
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  // Update active states on sidebar navigation items
  function updateSidebarActiveStates(newPath) {
    document.querySelectorAll('.sidebar-nav-item').forEach(el => {
      const href = el.getAttribute('href');
      if (!href) return;
      const linkPath = cleanPath(href);
      if (linkPath === newPath) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }

  // Core Page Swapper
  async function navigateTo(url, isPopState = false) {
    const path = cleanPath(url);
    const targetUrl = new URL(url, window.location.origin).href;

    // Same path with hash jump
    if (path === window.location.pathname && url.includes('#')) {
      if (!isPopState) history.pushState({}, '', targetUrl);
      const hash = url.split('#')[1];
      const targetEl = document.getElementById(hash);
      if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    startProgress();

    let html = null;
    const cached = pageCache.get(path);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      html = cached.html;
    } else {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(targetUrl, {
          credentials: 'include',
          headers: { 'X-Requested-With': 'TurboNav' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          html = await res.text();
          pageCache.set(path, { html, timestamp: Date.now() });
        } else {
          // Fallback to standard navigation on non-200
          window.location.href = targetUrl;
          return;
        }
      } catch (err) {
        // Fallback to native browser navigation if fetch fails
        window.location.href = targetUrl;
        return;
      }
    }

    try {
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(html, 'text/html');

      // Update Title
      if (newDoc.title) {
        document.title = newDoc.title;
      }

      const currentMain = document.querySelector('.app-main-content');
      const newMain = newDoc.querySelector('.app-main-content');

      // CASE 1: Both pages share .app-main-content (e.g. Dashboard <-> Profile)
      if (currentMain && newMain) {
        currentMain.style.opacity = '0.5';
        currentMain.style.transition = 'opacity 0.08s ease-out';
        
        requestAnimationFrame(() => {
          currentMain.innerHTML = newMain.innerHTML;
          currentMain.style.opacity = '1';
          
          if (!isPopState) {
            history.pushState({ turbo: true, url: targetUrl }, '', targetUrl);
          }

          updateSidebarActiveStates(path);
          window.scrollTo({ top: 0, behavior: 'instant' });
          runScripts(currentMain);

          // Trigger page-specific initializers if defined
          if (typeof window.initDashboard === 'function' && path.includes('dashboard')) {
            window.initDashboard();
          } else if (typeof window.initProfile === 'function' && path.includes('profile')) {
            window.initProfile();
          }

          document.dispatchEvent(new CustomEvent('turbo:load', { detail: { url: targetUrl, path } }));
          finishProgress();
        });
        return;
      }

      // CASE 2: Different layout shell (e.g. Dashboard -> Studio full bleed canvas)
      // Morph document body smoothly
      if (!isPopState) {
        history.pushState({ turbo: true, url: targetUrl }, '', targetUrl);
      }
      
      document.body.innerHTML = newDoc.body.innerHTML;
      Array.from(newDoc.body.attributes).forEach(attr => {
        document.body.setAttribute(attr.name, attr.value);
      });

      window.scrollTo({ top: 0, behavior: 'instant' });
      runScripts(document.body);

      // Re-initialize universal components
      if (typeof window.renderSidebar === 'function') {
        window.renderSidebar();
      }
      if (typeof window.initThemeToggle === 'function') {
        window.initThemeToggle();
      }

      document.dispatchEvent(new CustomEvent('turbo:load', { detail: { url: targetUrl, path } }));
      finishProgress();

    } catch (parseErr) {
      console.warn('[TurboNav] Seamless swap error, using fallback:', parseErr);
      window.location.href = targetUrl;
    }
  }

  // Hover & Touchstart Intent Prefetching
  function handlePrefetchIntent(e) {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
    if (link.target === '_blank' || link.hasAttribute('download')) return;
    prefetchUrl(href);
  }

  // Click Interception
  function handleClick(e) {
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
    if (link.target === '_blank' || link.hasAttribute('download')) return;
    if (link.hasAttribute('data-no-turbo')) return;

    if (!isInternalRoute(href)) return;

    e.preventDefault();
    navigateTo(href);
  }

  // History Popstate (Back / Forward Navigation)
  window.addEventListener('popstate', (e) => {
    navigateTo(window.location.href, true);
  });

  // Attach global event listeners
  document.addEventListener('mouseover', handlePrefetchIntent, { passive: true });
  document.addEventListener('touchstart', handlePrefetchIntent, { passive: true });
  document.addEventListener('click', handleClick);

  // Initialize progress bar and prefetch adjacent pages
  document.addEventListener('DOMContentLoaded', () => {
    initProgressBar();
    // Cache current page HTML
    pageCache.set(cleanPath(window.location.pathname), { html: document.documentElement.outerHTML, timestamp: Date.now() });
    
    // Speculative prefetch for top navigation items after idle
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        ['/dashboard', '/studio', '/profile'].forEach(p => {
          if (p !== cleanPath(window.location.pathname)) prefetchUrl(p);
        });
      });
    } else {
      setTimeout(() => {
        ['/dashboard', '/studio', '/profile'].forEach(p => {
          if (p !== cleanPath(window.location.pathname)) prefetchUrl(p);
        });
      }, 1500);
    }
  });

  // Service Worker Registration for Offline & Low-Bandwidth Resilience
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').catch(err => {
        // Silent catch for environments without service workers
      });
    });
  }

  window.myfolioTurboNav = {
    prefetch: prefetchUrl,
    navigate: navigateTo,
    clearCache: () => pageCache.clear()
  };
})();
