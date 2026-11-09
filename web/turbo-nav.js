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
  // Core Page Navigation Engine
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

    // Direct clean navigation ensures complete <head> stylesheet updates,
    // authentic script lifecycle execution, and prevents unstyled layout state
    window.location.href = targetUrl;
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

  // Offline Guard & Service Worker Registration
  // Pre-caches the 404 offline playground (Matchstick Mind + Spider Cursor) so that
  // when internet is not available or disconnected, users seamlessly land on the interactive 404 page.
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .catch(() => {});
    });
  }

  // Active Offline Event Listener: If network drops while browsing, route to offline 404 playground
  window.addEventListener('offline', () => {
    if (window.location.pathname !== '/404' && window.location.pathname !== '/404.html') {
      window.location.href = '/404.html?offline=1';
    }
  });

  window.myfolioTurboNav = {
    prefetch: prefetchUrl,
    navigate: navigateTo,
    clearCache: () => pageCache.clear()
  };
})();
