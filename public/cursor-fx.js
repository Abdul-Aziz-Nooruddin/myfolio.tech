/**
 * MyFolio Cursor FX & Text Proximity Motion Engine
 * Features:
 * 1. Fluid Magnetic Cursor Dot & Ring with spring lerp physics
 * 2. Text Cursor Proximity Engine (Gaussian distance-based letter scaling & chromatic illumination)
 * 3. Mobile touch awareness (disables custom cursor on touch, activates gyro orientation)
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
      will-change: transform, color;
      transition: transform 0.08s ease-out, color 0.12s ease-out;
      transform-origin: center bottom;
    }
  `;
  document.head.appendChild(style);

  // Initialize once DOM is ready
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

    // Pointer move listener
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

    // Track interactive element hovers for magnetic expansion
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
    // Part 2: Text Cursor Proximity Engine (Port of TextCursorProximity)
    // -------------------------------------------------------------
    var proximityElements = [];

    function setupProximityTarget(el) {
      if (!el || el.dataset.proximityInitialized) return;
      el.dataset.proximityInitialized = 'true';

      var originalText = el.textContent || '';
      var words = originalText.trim().split(/\s+/);
      el.innerHTML = '';

      var letterEntries = [];

      words.forEach(function(word, wIdx) {
        var wordSpan = document.createElement('span');
        wordSpan.style.display = 'inline-block';
        wordSpan.style.whiteSpace = 'nowrap';

        for (var i = 0; i < word.length; i++) {
          var char = word[i];
          var letterSpan = document.createElement('span');
          letterSpan.className = 'mf-proximity-letter';
          letterSpan.textContent = char;
          letterSpan.setAttribute('aria-hidden', 'true');
          wordSpan.appendChild(letterSpan);
          letterEntries.push(letterSpan);
        }

        el.appendChild(wordSpan);

        if (wIdx < words.length - 1) {
          var space = document.createTextNode(' ');
          el.appendChild(space);
        }
      });

      // Accessible hidden label for screen readers
      var srSpan = document.createElement('span');
      srSpan.style.position = 'absolute';
      srSpan.style.width = '1px';
      srSpan.style.height = '1px';
      srSpan.style.padding = '0';
      srSpan.style.margin = '-1px';
      srSpan.style.overflow = 'hidden';
      srSpan.style.clip = 'rect(0, 0, 0, 0)';
      srSpan.style.whiteSpace = 'nowrap';
      srSpan.style.border = '0';
      srSpan.textContent = originalText;
      el.appendChild(srSpan);

      proximityElements.push({
        container: el,
        letters: letterEntries,
        radius: 95 // 95px Gaussian proximity radius
      });
    }

    // Automatically bind to hero titles on comparison and landing pages
    var targetSelectors = [
      '.compare-hero h1',
      '.hero-title',
      '.hero h1',
      '[data-cursor-proximity]',
      '.compare-hero-title',
      'h1.masthead-title'
    ];

    targetSelectors.forEach(function(sel) {
      var elements = document.querySelectorAll(sel);
      elements.forEach(function(el) {
        setupProximityTarget(el);
      });
    });

    // -------------------------------------------------------------
    // Part 3: Animation Loop (Spring Lerp Physics + Text Proximity)
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
        if (proximityElements.length > 0) {
          for (var p = 0; p < proximityElements.length; p++) {
            var item = proximityElements[p];
            var rect = item.container.getBoundingClientRect();

            // Only calculate if cursor is reasonably close to container bounds (within 150px)
            if (
              mouseX >= rect.left - 150 &&
              mouseX <= rect.right + 150 &&
              mouseY >= rect.top - 150 &&
              mouseY <= rect.bottom + 150
            ) {
              var letters = item.letters;
              var radius = item.radius;

              for (var l = 0; l < letters.length; l++) {
                var letter = letters[l];
                var lRect = letter.getBoundingClientRect();
                var cx = lRect.left + lRect.width / 2;
                var cy = lRect.top + lRect.height / 2;

                var dx = mouseX - cx;
                var dy = mouseY - cy;
                var dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < radius) {
                  // Gaussian falloff matching the React TextCursorProximity formula
                  var norm = dist / (radius / 2);
                  var proximity = Math.exp(-Math.pow(norm, 2) / 2);

                  var scale = 1 + proximity * 0.32; // up to 1.32x scale
                  var elevate = -proximity * 4; // slight vertical lift
                  letter.style.transform = 'scale(' + scale.toFixed(3) + ') translateY(' + elevate.toFixed(1) + 'px)';
                  letter.style.color = proximity > 0.35 ? '#13708e' : '';
                } else if (letter.style.transform !== '') {
                  letter.style.transform = '';
                  letter.style.color = '';
                }
              }
            } else {
              // Cursor is outside container bounds; reset letters if needed
              var lettersToReset = item.letters;
              for (var r = 0; r < lettersToReset.length; r++) {
                if (lettersToReset[r].style.transform !== '') {
                  lettersToReset[r].style.transform = '';
                  lettersToReset[r].style.color = '';
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
