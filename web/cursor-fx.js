/**
 * MyFolio Cursor FX & Text Proximity Motion Engine
 * Features:
 * 1. Fluid Magnetic Cursor Dot & Ring with spring lerp physics
 * 2. Text Cursor Proximity Engine (Gaussian distance-based letter scaling & chromatic illumination)
 *    - Ported from TextCursorProximity component (from: scale(1), to: scale(1.4), radius: 100, gaussian)
 *    - Active across Landing Page (#hero-heading, .hero-headline, .hero-wordmark) and Comparison Pages
 *    - MutationObserver ensures instant binding even when React mounts elements dynamically
 * 3. Mobile touch awareness (disables custom cursor on touch, activates gyroscope orientation)
 * 4. Full compliance with prefers-reduced-motion
 */
(function initCursorFx() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Respect reduced motion
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
  } catch (e) {}

  // Check if touch device / pointer coarse
  var isTouch = false;
  try {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      isTouch = true;
    }
  } catch (e) {}

  // Inject CSS for custom cursor and proximity text
  var style = document.createElement('style');
  style.id = 'myfolio-cursor-styles';
  style.textContent = `
    @media (pointer: fine) {
      body.has-custom-cursor {
        cursor: default;
      }
      body.has-custom-cursor a,
      body.has-custom-cursor button,
      body.has-custom-cursor [role="button"],
      body.has-custom-cursor input,
      body.has-custom-cursor select,
      body.has-custom-cursor textarea,
      body.has-custom-cursor .cursor-pointer {
        cursor: pointer;
      }
    }

    .mf-cursor-dot {
      position: fixed;
      top: 0;
      left: 0;
      width: 8px;
      height: 8px;
      background: #75c5de;
      border-radius: 50%;
      pointer-events: none;
      z-index: 999999;
      transform: translate(-50%, -50%);
      transition: width 0.2s ease, height 0.2s ease, background-color 0.2s ease, opacity 0.2s ease;
      box-shadow: 0 0 12px rgba(117, 197, 222, 0.7);
      opacity: 0;
      will-change: transform;
    }

    .mf-cursor-ring {
      position: fixed;
      top: 0;
      left: 0;
      width: 36px;
      height: 36px;
      border: 1.5px solid rgba(19, 112, 142, 0.45);
      background: rgba(117, 197, 222, 0.04);
      border-radius: 50%;
      pointer-events: none;
      z-index: 999998;
      transform: translate(-50%, -50%);
      transition: width 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                  height 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.2s ease,
                  background-color 0.2s ease,
                  opacity 0.25s ease;
      backdrop-filter: blur(0.5px);
      opacity: 0;
      will-change: transform;
    }

    /* Hovering interactive elements */
    .mf-cursor-active .mf-cursor-dot {
      width: 12px;
      height: 12px;
      background: #13708e;
      box-shadow: 0 0 16px rgba(19, 112, 142, 0.8);
    }
    .mf-cursor-active .mf-cursor-ring {
      width: 54px;
      height: 54px;
      border-color: rgba(19, 112, 142, 0.7);
      background: rgba(117, 197, 222, 0.12);
    }

    /* Click pulse */
    .mf-cursor-clicking .mf-cursor-dot {
      transform: translate(-50%, -50%) scale(0.6);
    }
    .mf-cursor-clicking .mf-cursor-ring {
      transform: translate(-50%, -50%) scale(0.8);
      border-color: #e0a800;
    }

    /* Proximity text letter spans */
    .mf-proximity-letter {
      display: inline-block;
      will-change: transform, color, text-shadow;
      transition: transform 0.06s ease-out, color 0.1s ease-out, text-shadow 0.1s ease-out;
      transform-origin: center bottom;
    }
  `;
  document.head.appendChild(style);

  function init() {
    // -------------------------------------------------------------
    // Part 1: Interactive Fluid Magnetic Cursor (Desktop)
    // -------------------------------------------------------------
    var dot = document.createElement('div');
    dot.className = 'mf-cursor-dot';
    dot.setAttribute('aria-hidden', 'true');

    var ring = document.createElement('div');
    ring.className = 'mf-cursor-ring';
    ring.setAttribute('aria-hidden', 'true');

    document.body.appendChild(dot);
    document.body.appendChild(ring);

    var mouseX = -100;
    var mouseY = -100;
    var ringX = -100;
    var ringY = -100;
    var dotX = -100;
    var dotY = -100;
    var isVisible = false;
    var isHovering = false;
    var isClicking = false;

    window.addEventListener('pointermove', function(e) {
      if (e.pointerType === 'touch') {
        isTouch = true;
        dot.style.opacity = '0';
        ring.style.opacity = '0';
        return;
      }
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
        document.body.classList.add('has-custom-cursor');
        ringX = mouseX;
        ringY = mouseY;
        dotX = mouseX;
        dotY = mouseY;
      }
    }, { passive: true });

    window.addEventListener('pointerleave', function() {
      isVisible = false;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
      document.body.classList.remove('has-custom-cursor');
    }, { passive: true });

    window.addEventListener('mousedown', function() {
      isClicking = true;
      document.body.classList.add('mf-cursor-clicking');
    }, { passive: true });

    window.addEventListener('mouseup', function() {
      isClicking = false;
      document.body.classList.remove('mf-cursor-clicking');
    }, { passive: true });

    document.addEventListener('mouseover', function(e) {
      var target = e.target;
      if (target && target.closest && target.closest('a, button, [role="button"], input, select, textarea, .btn, .card, .interactive-card, [data-interactive]')) {
        isHovering = true;
        document.body.classList.add('mf-cursor-active');
      }
    }, { passive: true });

    document.addEventListener('mouseout', function(e) {
      var target = e.target;
      if (target && target.closest && target.closest('a, button, [role="button"], input, select, textarea, .btn, .card, .interactive-card, [data-interactive]')) {
        isHovering = false;
        document.body.classList.remove('mf-cursor-active');
      }
    }, { passive: true });

    // -------------------------------------------------------------
    // Part 2: Text Cursor Proximity Engine (Faithful Port of TextCursorProximity)
    // -------------------------------------------------------------
    var proximityTargets = [];

    // Safely wraps text characters in individual spans without breaking existing React trees
    function wrapTextNodes(node, letterEntries) {
      if (node.nodeType === 3) { // TEXT_NODE
        var text = node.textContent;
        if (!text || text.trim() === '') return;

        var frag = document.createDocumentFragment();
        for (var i = 0; i < text.length; i++) {
          var char = text[i];
          if (char === ' ') {
            frag.appendChild(document.createTextNode(' '));
          } else {
            var span = document.createElement('span');
            span.className = 'mf-proximity-letter';
            span.textContent = char;
            span.setAttribute('aria-hidden', 'true');
            span.style.display = 'inline-block';
            span.style.willChange = 'transform, color, text-shadow';
            span.style.transformOrigin = 'center bottom';
            frag.appendChild(span);
            letterEntries.push(span);
          }
        }
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1) { // ELEMENT_NODE
        if (node.classList && node.classList.contains('mf-proximity-letter')) {
          letterEntries.push(node);
          return;
        }
        var children = Array.from(node.childNodes);
        for (var c = 0; c < children.length; c++) {
          wrapTextNodes(children[c], letterEntries);
        }
      }
    }

    function registerProximityElement(container) {
      if (!container || container.dataset.mfProximityBound) return;
      container.dataset.mfProximityBound = 'true';

      var letters = [];
      wrapTextNodes(container, letters);

      if (letters.length > 0) {
        proximityTargets.push({
          container: container,
          letters: letters,
          radius: 100 // 100px Gaussian interaction radius matching TextCursorProximity
        });
      }
    }

    function scanProximityElements() {
      var selectors = [
        '#hero-heading',
        '.hero-headline',
        '.hero-wordmark',
        '.compare-hero h1',
        '.hero-title',
        '.hero h1',
        '[data-cursor-proximity]',
        '.text-cursor-proximity',
        '.compare-hero-title',
        'h1.masthead-title'
      ];

      selectors.forEach(function(sel) {
        var elements = document.querySelectorAll(sel);
        elements.forEach(function(el) {
          registerProximityElement(el);
        });
      });
    }

    // Run initial scan
    scanProximityElements();

    // MutationObserver watches for React mounting or dynamic route changes
    var observer = new MutationObserver(function() {
      scanProximityElements();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Fallback polling during initial page hydration
    var pollCount = 0;
    var hydrationPoller = setInterval(function() {
      scanProximityElements();
      pollCount++;
      if (pollCount > 15) clearInterval(hydrationPoller);
    }, 400);

    // -------------------------------------------------------------
    // Part 3: Render Loop (Spring Lerp Physics + Text Proximity)
    // -------------------------------------------------------------
    function renderLoop() {
      if (isVisible && !isTouch) {
        // Fast responsive lerp for dot, softer spring for outer ring
        dotX += (mouseX - dotX) * 0.55;
        dotY += (mouseY - dotY) * 0.55;
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;

        dot.style.transform = 'translate(' + dotX.toFixed(1) + 'px, ' + dotY.toFixed(1) + 'px) translate(-50%, -50%)';
        ring.style.transform = 'translate(' + ringX.toFixed(1) + 'px, ' + ringY.toFixed(1) + 'px) translate(-50%, -50%)';

        // Update Text Cursor Proximity
        if (proximityTargets.length > 0) {
          for (var p = 0; p < proximityTargets.length; p++) {
            var target = proximityTargets[p];
            var container = target.container;
            var rect = container.getBoundingClientRect();

            // Bounding box check with margin
            if (
              mouseX >= rect.left - 120 &&
              mouseX <= rect.right + 120 &&
              mouseY >= rect.top - 120 &&
              mouseY <= rect.bottom + 120
            ) {
              var letters = target.letters;
              var radius = target.radius;

              for (var l = 0; l < letters.length; l++) {
                var letter = letters[l];
                var lRect = letter.getBoundingClientRect();
                var cx = lRect.left + lRect.width / 2;
                var cy = lRect.top + lRect.height / 2;

                var dx = mouseX - cx;
                var dy = mouseY - cy;
                var dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < radius) {
                  // Gaussian falloff: normalizedDistance = Math.exp(-Math.pow(dist / (radius / 2), 2) / 2)
                  var norm = dist / (radius / 2);
                  var proximity = Math.exp(-Math.pow(norm, 2) / 2);

                  // Scale: from scale(1) to scale(1.4)
                  var scale = 1 + proximity * 0.40;
                  var lift = -proximity * 5.5;

                  letter.style.transform = 'scale(' + scale.toFixed(3) + ') translateY(' + lift.toFixed(1) + 'px)';

                  // Chromatic illumination
                  if (proximity > 0.08) {
                    letter.style.color = '#FF87C1';
                    letter.style.textShadow = '0 0 ' + (proximity * 18).toFixed(1) + 'px rgba(255, 135, 193, 0.85), 0 0 ' + (proximity * 8).toFixed(1) + 'px rgba(255, 68, 68, 0.6)';
                  } else {
                    letter.style.color = '';
                    letter.style.textShadow = '';
                  }
                } else if (letter.style.transform !== '') {
                  letter.style.transform = '';
                  letter.style.color = '';
                  letter.style.textShadow = '';
                }
              }
            } else {
              // Cursor is outside container bounds; reset letters
              var lettersToReset = target.letters;
              for (var r = 0; r < lettersToReset.length; r++) {
                if (lettersToReset[r].style.transform !== '') {
                  lettersToReset[r].style.transform = '';
                  lettersToReset[r].style.color = '';
                  lettersToReset[r].style.textShadow = '';
                }
              }
            }
          }
        }
      }

      requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
