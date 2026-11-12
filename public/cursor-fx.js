/**
 * MyFolio Cursor FX & Text Proximity Motion Engine
 * Features:
 * 1. Fluid Magnetic Cursor Dot & Ring with spring lerp physics
 * 2. Multi-Chromatic Text Cursor Proximity Engine with Atomic Word Containers
 *    - Full-page coverage: every heading, paragraph, nav item, badge, button & link
 *    - Atomic Word Containers (.mf-proximity-word with white-space: nowrap) guarantee words never break mid-word across lines
 *    - Resilient space spans (.mf-proximity-space) guarantee spacing is preserved inside flexbox containers (prevents "Howitworks" and letter-spaced pills)
 *    - Spectrum of 12 distinct jewel & neon chromatic palettes varying across all texts
 *    - Gaussian distance-based letter scaling (scale 1.0 -> 1.38) & vertical lift
 *    - MutationObserver ensures dynamic React mounts on landing & comparison pages are bound
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

    /* Atomic word wrapper: prevents mid-word splitting across lines and prevents flexbox letter spacing */
    .mf-proximity-word {
      display: inline-block;
      white-space: nowrap;
      pointer-events: auto;
    }

    /* Space span: guarantees space is never collapsed by flexbox containers */
    .mf-proximity-space {
      display: inline-block;
      width: 0.28em;
      pointer-events: none;
      user-select: text;
    }

    /* Proximity text letter spans */
    .mf-proximity-letter {
      display: inline-block;
      white-space: inherit;
      will-change: transform, color, text-shadow;
      transition: transform 0.06s ease-out, color 0.12s ease-out, text-shadow 0.12s ease-out;
      transform-origin: center bottom;
      pointer-events: auto;
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
        if (!isTouch) {
          document.body.classList.add('has-custom-cursor');
        }
      }
    }, { passive: true });

    window.addEventListener('pointerdown', function(e) {
      if (e.pointerType === 'touch') return;
      isClicking = true;
      document.body.classList.add('mf-cursor-clicking');
    }, { passive: true });

    window.addEventListener('pointerup', function() {
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
    // Part 2: Multi-Chromatic Text Cursor Proximity Engine
    // -------------------------------------------------------------
    // 12 distinct jewel & neon chromatic palettes so texts never share a monotone color
    var CHROMATIC_PALETTES = [
      // 0: Hot Neon Magenta
      { color: '#FF2E93', shadow1: 'rgba(255, 46, 147, 0.95)', shadow2: 'rgba(255, 110, 180, 0.70)' },
      // 1: Electric Cyan
      { color: '#00F0FF', shadow1: 'rgba(0, 240, 255, 0.95)', shadow2: 'rgba(0, 180, 255, 0.70)' },
      // 2: Radiant Solar Amber
      { color: '#F59E0B', shadow1: 'rgba(245, 158, 11, 0.95)', shadow2: 'rgba(251, 191, 36, 0.70)' },
      // 3: Electric Violet
      { color: '#A855F7', shadow1: 'rgba(168, 85, 247, 0.95)', shadow2: 'rgba(192, 132, 252, 0.70)' },
      // 4: Emerald Mint
      { color: '#10B981', shadow1: 'rgba(16, 185, 129, 0.95)', shadow2: 'rgba(52, 211, 153, 0.70)' },
      // 5: Coral Flame
      { color: '#FF4D4D', shadow1: 'rgba(255, 77, 77, 0.95)', shadow2: 'rgba(255, 128, 128, 0.70)' },
      // 6: Azure Sky
      { color: '#38BDF8', shadow1: 'rgba(56, 189, 248, 0.95)', shadow2: 'rgba(14, 165, 233, 0.70)' },
      // 7: Vivid Tangerine
      { color: '#FB923C', shadow1: 'rgba(251, 146, 60, 0.95)', shadow2: 'rgba(249, 115, 22, 0.70)' },
      // 8: Cyber Lime
      { color: '#84CC16', shadow1: 'rgba(132, 204, 22, 0.95)', shadow2: 'rgba(163, 230, 53, 0.70)' },
      // 9: Rose Quartz
      { color: '#FB7185', shadow1: 'rgba(251, 113, 133, 0.95)', shadow2: 'rgba(244, 63, 94, 0.70)' },
      // 10: Indigo Starlight
      { color: '#6366F1', shadow1: 'rgba(99, 102, 241, 0.95)', shadow2: 'rgba(129, 140, 248, 0.70)' },
      // 11: Electric Turquoise
      { color: '#2DD4BF', shadow1: 'rgba(45, 212, 191, 0.95)', shadow2: 'rgba(20, 184, 166, 0.70)' }
    ];

    var proximityTargets = [];
    var containerCounter = 0;

    // Safely wraps text characters inside atomic word containers (.mf-proximity-word with white-space: nowrap)
    // and preserves spaces with explicit .mf-proximity-space spans to prevent flexbox collapse
    function wrapTextNodes(node, letterEntries, containerIdx, wordTracker) {
      if (node.nodeType === 3) { // TEXT_NODE
        var text = node.textContent;
        if (!text || text.trim() === '') return;

        var tokens = text.match(/\S+|\s+/g) || [];
        var frag = document.createDocumentFragment();

        for (var t = 0; t < tokens.length; t++) {
          var token = tokens[t];
          if (/^\s+$/.test(token)) {
            var spaceSpan = document.createElement('span');
            spaceSpan.className = 'mf-proximity-space';
            spaceSpan.innerHTML = '&nbsp;';
            spaceSpan.setAttribute('aria-hidden', 'true');
            frag.appendChild(spaceSpan);
          } else {
            var wordSpan = document.createElement('span');
            wordSpan.className = 'mf-proximity-word';

            var wordIdx = wordTracker.count++;
            var paletteIdx = (containerIdx * 5 + wordIdx * 2) % CHROMATIC_PALETTES.length;
            var pal = CHROMATIC_PALETTES[paletteIdx];

            for (var i = 0; i < token.length; i++) {
              var char = token[i];
              var letterSpan = document.createElement('span');
              letterSpan.className = 'mf-proximity-letter';
              letterSpan.textContent = char;

              letterSpan._palColor = pal.color;
              letterSpan._palShadow1 = pal.shadow1;
              letterSpan._palShadow2 = pal.shadow2;
              letterSpan._isTransformed = false;

              wordSpan.appendChild(letterSpan);
              letterEntries.push(letterSpan);
            }
            frag.appendChild(wordSpan);
          }
        }
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1) { // ELEMENT_NODE
        if (node.classList && (node.classList.contains('mf-proximity-letter') || node.classList.contains('mf-proximity-word') || node.classList.contains('mf-proximity-space'))) {
          return;
        }
        // Don't traverse SVGs, code tags, or excluded widgets
        var tagName = node.tagName.toLowerCase();
        if (tagName === 'svg' || tagName === 'script' || tagName === 'style' || tagName === 'canvas' || tagName === 'iframe') {
          return;
        }

        var children = Array.from(node.childNodes);
        for (var c = 0; c < children.length; c++) {
          wrapTextNodes(children[c], letterEntries, containerIdx, wordTracker);
        }
      }
    }

    function registerProximityElement(container) {
      if (!container || container.dataset.mfProximityBound) return;

      // Skip if an ancestor container is already bound
      var parent = container.parentElement;
      if (parent && parent.closest && parent.closest('[data-mf-proximity-bound]')) return;

      container.dataset.mfProximityBound = 'true';

      var letters = [];
      var cIdx = containerCounter++;
      var wordTracker = { count: 0 };
      wrapTextNodes(container, letters, cIdx, wordTracker);

      if (letters.length > 0) {
        proximityTargets.push({
          container: container,
          letters: letters,
          letterOffsets: [],
          _offsetsValid: false,
          hasActive: false,
          radius: 95 // 95px interaction radius
        });
      }
    }

    function measureLetterOffsets(target, rect) {
      if (target._offsetsValid && target.letterOffsets && target.letterOffsets.length === target.letters.length) return;
      var letters = target.letters;
      target.letterOffsets = [];
      for (var l = 0; l < letters.length; l++) {
        var lRect = letters[l].getBoundingClientRect();
        target.letterOffsets.push({
          x: (lRect.left - rect.left) + lRect.width / 2,
          y: (lRect.top - rect.top) + lRect.height / 2
        });
      }
      target._offsetsValid = true;
    }

    window.addEventListener('resize', function() {
      for (var p = 0; p < proximityTargets.length; p++) {
        proximityTargets[p]._offsetsValid = false;
      }
    }, { passive: true });

    function scanProximityElements() {
      // Focus exclusively on top hero mastheads and explicitly tagged opt-in elements
      // Interactive controls (buttons, nav links, form elements, pills), cards, and general body
      // paragraphs are intentionally excluded to guarantee 100% intact typography and zero word splitting.
      var selectors = [
        '#hero-heading',
        '.hero-headline',
        '[data-cursor-proximity]',
        '.text-cursor-proximity'
      ];

      var elements = document.querySelectorAll(selectors.join(','));
      for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        if (el.dataset.mfProximityBound) continue;

        // Skip buttons, navigation, ads, tracking, cursor, and leaves containers
        if (el.closest('button, [role="button"], .btn, nav, .desktop-navigation, .header-actions, .ps-persona-picker, input, select, textarea, .burger-button, #adsterra-floating-bar, #mf-cursor-dot, #mf-cursor-ring, .leaves-container, [class*="monetag"], [id*="monetag"], [class*="ad-"], [id*="ad"], iframe, ins, svg, script, style, noscript')) {
          continue;
        }

        // Verify element has text
        var hasText = false;
        for (var n = 0; n < el.childNodes.length; n++) {
          if (el.childNodes[n].nodeType === 3 && el.childNodes[n].textContent.trim().length > 0) {
            hasText = true;
            break;
          }
        }
        if (hasText || (el.children.length === 0 && el.textContent.trim().length > 0)) {
          registerProximityElement(el);
        }
      }
    }

    // Run initial scan
    scanProximityElements();

    // Debounced MutationObserver watches for dynamic route changes without layout thrashing
    var mutationTimer = null;
    var observer = new MutationObserver(function(mutations) {
      for (var m = 0; m < mutations.length; m++) {
        var targetNode = mutations[m].target;
        if (targetNode && targetNode.classList && (
          targetNode.classList.contains('mf-cursor-dot') ||
          targetNode.classList.contains('mf-cursor-ring') ||
          targetNode.classList.contains('mf-proximity-letter') ||
          targetNode.id === 'myfolio-seasonal-leaves'
        )) {
          return;
        }
      }
      if (mutationTimer) clearTimeout(mutationTimer);
      mutationTimer = setTimeout(function() {
        scanProximityElements();
      }, 300);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Fallback scans during initial hydration
    setTimeout(scanProximityElements, 120);
    setTimeout(scanProximityElements, 600);

    function resetTargetLetters(target) {
      var letters = target.letters;
      for (var r = 0; r < letters.length; r++) {
        if (letters[r]._isTransformed) {
          letters[r].style.transform = '';
          letters[r].style.color = '';
          letters[r].style.textShadow = '';
          letters[r]._isTransformed = false;
        }
      }
      target.hasActive = false;
    }

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

        // Update Text Cursor Proximity across all registered text containers
        var targetCount = proximityTargets.length;
        if (targetCount > 0) {
          var viewH = window.innerHeight;

          for (var p = 0; p < targetCount; p++) {
            var target = proximityTargets[p];
            var container = target.container;
            var rect = container.getBoundingClientRect();

            // Viewport culling: skip elements completely offscreen
            if (rect.bottom < -60 || rect.top > viewH + 60) {
              if (target.hasActive) {
                resetTargetLetters(target);
              }
              continue;
            }

            // Proximity bounding box check with 90px threshold
            if (
              mouseX >= rect.left - 90 &&
              mouseX <= rect.right + 90 &&
              mouseY >= rect.top - 90 &&
              mouseY <= rect.bottom + 90
            ) {
              target.hasActive = true;
              measureLetterOffsets(target, rect);
              var letters = target.letters;
              var offsets = target.letterOffsets;
              var radius = target.radius;

              for (var l = 0; l < letters.length; l++) {
                var letter = letters[l];
                var offset = offsets[l];
                if (!offset) continue;
                var cx = rect.left + offset.x;
                var cy = rect.top + offset.y;

                var dx = mouseX - cx;
                var dy = mouseY - cy;
                var dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < radius) {
                  // Gaussian falloff
                  var norm = dist / (radius / 2);
                  var proximity = Math.exp(-Math.pow(norm, 2) / 2);

                  // Scale & elevation
                  var scale = 1 + proximity * 0.38;
                  var lift = -proximity * 5.2;

                  letter.style.transform = 'scale(' + scale.toFixed(3) + ') translateY(' + lift.toFixed(1) + 'px)';

                  // Chromatic illumination with the letter's assigned vibrant palette
                  if (proximity > 0.08) {
                    letter.style.color = letter._palColor;
                    letter.style.textShadow = '0 0 ' + (proximity * 16).toFixed(1) + 'px ' + letter._palShadow1 + ', 0 0 ' + (proximity * 8).toFixed(1) + 'px ' + letter._palShadow2;
                  } else {
                    letter.style.color = '';
                    letter.style.textShadow = '';
                  }
                  letter._isTransformed = true;
                } else if (letter._isTransformed) {
                  letter.style.transform = '';
                  letter.style.color = '';
                  letter.style.textShadow = '';
                  letter._isTransformed = false;
                }
              }
            } else if (target.hasActive) {
              resetTargetLetters(target);
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
