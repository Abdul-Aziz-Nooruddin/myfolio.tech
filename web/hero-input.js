/**
 * hero-input.js - Deprecated and permanently disabled.
 * Self-healing cleanup script to purge any cached DOM nodes.
 */
(function() {
  function purge() {
    var stage = document.getElementById('heroUniverseStage') || document.querySelector('.hero-universe-stage');
    if (stage) stage.remove();
    var dock = document.getElementById('heroGithubDock') || document.querySelector('.hero-github-dock');
    if (dock) dock.remove();
    var modal = document.getElementById('heroSandboxModal');
    if (modal) modal.remove();
  }
  purge();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', purge);
  }
  window.addEventListener('load', purge);
})();
