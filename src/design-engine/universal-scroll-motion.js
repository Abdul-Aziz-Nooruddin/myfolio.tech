/**
 * Universal Scroll Motion Engine (Lenis + GSAP 3.x + ScrollTrigger + Motion + Three/Postprocessing + Theatre)
 * Automatically choreographs 60-120 FPS smooth inertia scrolling, staggered reveals,
 * scrollytelling timelines, and interactive 3D spatial physics across all generated portfolio templates.
 */

class UniversalScrollMotion {
  /**
   * Injects Lenis, GSAP, ScrollTrigger, Motion, and universal 3D spatial choreography into any HTML bundle
   * @param {string} html Raw HTML document string
   * @param {string} templateId Template identifier for specialized theme accents
   * @returns {string} HTML with full motion and 3D scrollytelling engine wired
   */
  static injectScrollMotion(html, templateId = 'jack-3d-creator') {
    if (!html || typeof html !== 'string') return html;

    // Check if already injected
    if (html.includes('id="universal-scroll-motion-engine"')) return html;

    const themeColors = {
      'jack-3d-creator': '#00F0FF',
      '3d-creator': '#00F0FF',
      'nadia-brand': '#FF4D30',
      'nadia-personal-brand': '#FF4D30'
    };

    const accentColor = themeColors[templateId] || '#00F0FF';

    const motionHeadAssets = `
  <!-- Smooth Inertia Scroll (Lenis) & GSAP Motion Ecosystem -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.css">
  <script src="https://cdn.jsdelivr.net/npm/lenis@1.1.18/dist/lenis.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  
  <style id="universal-scroll-motion-styles">
    /* Top Scroll Progress Indicator */
    #scroll-progress-indicator {
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3.5px;
      background: linear-gradient(90deg, ${accentColor}, #38bdf8, #ec4899);
      z-index: 100000;
      box-shadow: 0 0 14px ${accentColor}, 0 0 4px #ffffff;
      pointer-events: none;
      transition: width 0.08s linear;
    }

    /* Hardware Accelerated Smooth Inertia Scroll Baseline (Lenis) */
    html.lenis, html.lenis body {
      height: auto;
    }
    .lenis.lenis-smooth {
      scroll-behavior: auto !important;
    }
    .lenis.lenis-smooth [data-lenis-prevent] {
      overscroll-behavior: contain;
    }
    .lenis.lenis-stopped {
      overflow: clip;
    }
    .lenis.lenis-smooth iframe {
      pointer-events: none;
    }

    /* Scroll Velocity Reactive Container */
    .scroll-velocity-item {
      will-change: transform;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* 3D Perspective Card Tilt Standards */
    .project-card, .crystal-project-card, .bio-project-card, .wood-project-card, .fusion-project-card, 
    .curio-case-card, .cosmic-project-card, .sanctuary-project-card, .white-crystal-card, .abyss-chest-card, .sprawl-vault-card,
    .greenhouse-project-card, .monograph-exhibit-card, .parchment-project-card {
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease, filter 0.35s ease;
      will-change: transform;
      transform-style: preserve-3d;
    }

    .project-card:hover, .crystal-project-card:hover, .bio-project-card:hover, .wood-project-card:hover, 
    .fusion-project-card:hover, .curio-case-card:hover, .cosmic-project-card:hover, .sanctuary-project-card:hover, 
    .white-crystal-card:hover, .abyss-chest-card:hover, .sprawl-vault-card:hover,
    .greenhouse-project-card:hover, .monograph-exhibit-card:hover, .parchment-project-card:hover {
      box-shadow: 0 24px 50px -12px rgba(0,0,0,0.65), 0 0 30px ${accentColor}44;
    }

    /* Spring-physics Magnetic Buttons */
    .magnetic-btn, .btn-primary, .cosmic-btn-primary, .crystal-btn-primary, .wood-btn-primary {
      will-change: transform;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
    }

    /* Reduced Motion Fallback */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      #scroll-progress-indicator { display: none !important; }
    }
  </style>
`;

    const motionScript = `
  <!-- Universal Scroll Progress Bar -->
  <div id="scroll-progress-indicator"></div>

  <!-- Universal Lenis + GSAP + Three/Postprocessing + Motion Scrollytelling Choreographer -->
  <script id="universal-scroll-motion-engine">
    (function() {
      function initScrollAnimations() {
        var isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var lastScrollTop = 0;
        var scrollVelocity = 0;
        var scrollTimeout;
        var ticking = false;

        // 1. Lenis Smooth Inertia Scroll Orchestration (@darkroomengineering/lenis)
        var lenis = null;
        function startLenis() {
          if (window.__folioLenis || isReducedMotion || typeof Lenis === 'undefined') return;
          try {
            lenis = new Lenis({
              duration: 1.2,
              easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
              orientation: 'vertical',
              gestureOrientation: 'vertical',
              smoothWheel: true,
              wheelMultiplier: 1.0,
              touchMultiplier: 1.5,
              infinite: false,
              syncTouch: false,
              autoResize: true
            });

            window.__folioLenis = lenis;

            try {
              window.dispatchEvent(new CustomEvent('folio:lenis:ready', { detail: { lenis: lenis } }));
              window.dispatchEvent(new Event('lenis-ready'));
            } catch (evErr) {}

            if (typeof ScrollTrigger !== 'undefined') {
              lenis.on('scroll', ScrollTrigger.update);
            }

            if (typeof gsap !== 'undefined') {
              gsap.ticker.add(function(time) {
                lenis.raf(time * 1000);
              });
              gsap.ticker.lagSmoothing(0);
            } else {
              function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
              }
              requestAnimationFrame(raf);
            }

            // Smooth In-Page Anchor Links Navigation
            document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
              anchor.addEventListener('click', function(e) {
                var targetId = this.getAttribute('href');
                if (!targetId) return;
                if (targetId === '#') {
                  e.preventDefault();
                  lenis.scrollTo(0, { duration: 1.2 });
                  return;
                }
                try {
                  var targetElement = document.querySelector(targetId);
                  if (targetElement) {
                    e.preventDefault();
                    lenis.scrollTo(targetElement, { offset: -24, duration: 1.2 });
                  }
                } catch(anchorErr) {}
              });
            });

            // Connect Lenis to real-time scroll physics
            lenis.on('scroll', function(e) {
              updateScrollPhysics(e.scroll, e.velocity);
            });
          } catch (e) {
            console.warn('[Lenis] Fallback to native scroll:', e);
          }
        }

        if (typeof Lenis !== 'undefined') {
          startLenis();
        } else {
          var checkCount = 0;
          var lenisTimer = setInterval(function() {
            checkCount++;
            if (typeof Lenis !== 'undefined') {
              clearInterval(lenisTimer);
              startLenis();
            } else if (checkCount > 25) {
              clearInterval(lenisTimer);
            }
          }, 40);
        }

        // 2. Real-time Scroll Velocity & Direction Physics
        function updateScrollPhysics(currentScroll, velocity) {
          var delta = currentScroll - lastScrollTop;
          scrollVelocity = velocity !== undefined ? velocity : delta;
          lastScrollTop = Math.max(0, currentScroll);

          // Update Progress Indicator
          var winScroll = document.body.scrollTop || document.documentElement.scrollTop;
          var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          var scrolled = (height > 0) ? (winScroll / height) * 100 : 0;
          var bar = document.getElementById('scroll-progress-indicator');
          if (bar) bar.style.width = scrolled + '%';

          // Apply Dynamic Velocity Skew to Interactive Cards on Scroll
          if (!ticking && !isReducedMotion) {
            window.requestAnimationFrame(function() {
              var clampedVelocity = Math.max(-20, Math.min(20, scrollVelocity));
              var skewAngle = clampedVelocity * 0.06;
              var scaleComp = 1 - Math.min(0.03, Math.abs(clampedVelocity) * 0.001);

              var velocityElements = document.querySelectorAll('.project-card, .crystal-project-card, .bio-project-card, .wood-project-card, .fusion-project-card, .curio-case-card, .cosmic-project-card, .nano-banana-3d-hero, .sanctuary-project-card, .white-crystal-card, .abyss-chest-card, .sprawl-vault-card, .greenhouse-project-card, .monograph-exhibit-card, .parchment-project-card');
              velocityElements.forEach(function(el) {
                el.style.transform = 'skewY(' + skewAngle + 'deg) scaleY(' + scaleComp + ')';
              });

              ticking = false;
            });
            ticking = true;
          }

          // Reset velocity skew smoothly when scrolling halts
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(function() {
            var velocityElements = document.querySelectorAll('.project-card, .crystal-project-card, .bio-project-card, .wood-project-card, .fusion-project-card, .curio-case-card, .cosmic-project-card, .nano-banana-3d-hero, .sanctuary-project-card, .white-crystal-card, .abyss-chest-card, .sprawl-vault-card, .greenhouse-project-card, .monograph-exhibit-card, .parchment-project-card');
            velocityElements.forEach(function(el) {
              el.style.transform = 'skewY(0deg) scaleY(1)';
            });
          }, 110);
        }

        window.addEventListener('scroll', function() {
          var currentScroll = window.pageYOffset || document.documentElement.scrollTop;
          updateScrollPhysics(currentScroll);
        }, { passive: true });

        // 3. Motion Spring-Physics 3D Tilt on Hover
        if (!isReducedMotion) {
          var tiltCards = document.querySelectorAll('.project-card, .curio-case-card, .crystal-project-card, .bio-project-card, .wood-project-card, .fusion-project-card, .cosmic-project-card, .sanctuary-project-card, .white-crystal-card, .abyss-chest-card, .sprawl-vault-card, .greenhouse-project-card, .monograph-exhibit-card, .parchment-project-card');
          tiltCards.forEach(function(card) {
            card.addEventListener('mousemove', function(e) {
              var rect = card.getBoundingClientRect();
              var x = e.clientX - rect.left;
              var y = e.clientY - rect.top;
              var centerX = rect.width / 2;
              var centerY = rect.height / 2;
              var rotateX = (centerY - y) / 14;
              var rotateY = (x - centerX) / 14;
              card.style.transform = 'perspective(1000px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) scale3d(1.025, 1.025, 1.025)';
            });
            card.addEventListener('mouseleave', function() {
              card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            });
          });

          // Magnetic Buttons Micro-Interaction
          var magneticBtns = document.querySelectorAll('.magnetic-btn, .cosmic-btn-primary, .crystal-btn-primary, .wood-btn-primary, .btn-primary');
          magneticBtns.forEach(function(btn) {
            btn.addEventListener('mousemove', function(e) {
              var rect = btn.getBoundingClientRect();
              var x = (e.clientX - rect.left) - rect.width / 2;
              var y = (e.clientY - rect.top) - rect.height / 2;
              btn.style.transform = 'translate(' + (x * 0.22) + 'px, ' + (y * 0.22) + 'px)';
            });
            btn.addEventListener('mouseleave', function() {
              btn.style.transform = 'translate(0px, 0px)';
            });
          });
        }

        // 4. GSAP & ScrollTrigger Animations
        if (typeof gsap === 'undefined') return;

        if (typeof ScrollTrigger !== 'undefined') {
          gsap.registerPlugin(ScrollTrigger);
        }

        var mm = gsap.matchMedia();

        mm.add("(min-width: 200px)", function() {
          // A. Continuous 3D Model Rotation on Scroll Up and Down
          var hero3D = document.querySelector('.nano-banana-3d-hero, .hero-3d-stage-container, .cosmic-hero-3d-wrapper, .sprawl-3d-stage, .abyss-nautilus-wrapper');
          if (hero3D && !isReducedMotion) {
            gsap.to(hero3D, {
              rotationY: 16,
              rotationZ: -3,
              yPercent: 12,
              ease: "none",
              scrollTrigger: {
                trigger: "body",
                start: "top top",
                end: "bottom bottom",
                scrub: 1.5
              }
            });
          }

          // B. Staggered Hero Entrance
          var heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
          var heroBadge = document.querySelector('.cosmic-hero-badge, .crystal-status-pill, .wood-hero-badge, .bio-status-badge, .fusion-status-pill, .curio-brass-badge, .sprawl-status-badge, .abyss-hero-badge');
          var heroTitle = document.querySelector('h1, .cosmic-title-gradient, .crystal-glitch-title, .wood-title-gradient, .bio-hero-name, .fusion-hero-name, .sprawl-hero-title');
          var heroTagline = document.querySelector('.cosmic-tagline, .crystal-hero-desc, .wood-hero-tagline, .bio-hero-bio, .fusion-hero-bio, .hero-bio, .sprawl-hero-bio');
          var heroCta = document.querySelector('.cosmic-cta-row, .crystal-hero-actions, .wood-hero-actions, .bio-hero-actions, .fusion-hero-actions, .hero-actions, .sprawl-actions');

          if (heroBadge) heroTl.fromTo(heroBadge, { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: 0.6 });
          if (heroTitle) heroTl.fromTo(heroTitle, { autoAlpha: 0, y: 35 }, { autoAlpha: 1, y: 0, duration: 0.8 }, "-=0.3");
          if (heroTagline) heroTl.fromTo(heroTagline, { autoAlpha: 0, y: 25 }, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.4");
          if (heroCta) heroTl.fromTo(heroCta, { autoAlpha: 0, scale: 0.95 }, { autoAlpha: 1, scale: 1, duration: 0.5 }, "-=0.3");

          // C. Continuous Parallax Scrub on All Section Headers
          gsap.utils.toArray('.cosmic-section-header, .crystal-section-header, .wood-section-header, .bio-section-header, .fusion-section-header, .curio-section-header, .sprawl-section-header, section h2').forEach(function(header) {
            gsap.fromTo(header,
              { autoAlpha: 0, y: 40 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: header,
                  start: "top 88%",
                  toggleActions: "play none none none"
                }
              }
            );
          });

          // D. Staggered Project Cards Reveal with Continuous Scrub
          var projectCards = gsap.utils.toArray('.project-card, .curio-case-card, .crystal-project-card, .bio-project-card, .wood-project-card, .fusion-project-card, .cosmic-project-card, .sanctuary-project-card, .white-crystal-card, .abyss-chest-card, .sprawl-vault-card, .greenhouse-project-card, .monograph-exhibit-card, .parchment-project-card');
          if (projectCards.length > 0) {
            ScrollTrigger.batch(projectCards, {
              start: "top 86%",
              onEnter: function(batch) {
                gsap.fromTo(batch,
                  { autoAlpha: 0, y: 50, scale: 0.95 },
                  {
                    autoAlpha: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.12,
                    ease: "power2.out",
                    overwrite: "auto"
                  }
                );
              },
              onEnterBack: function(batch) {
                gsap.to(batch, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, overwrite: "auto" });
              }
            });
          }

          // E. Skills Progress Bars Glide-in on Scroll
          gsap.utils.toArray('.crystal-skill-fill, .wood-skill-fill, .bio-skill-fill, .fusion-skill-fill, .cosmic-skill-fill, .skill-bar-fill, .skill-meter-fill').forEach(function(bar) {
            var targetWidth = bar.style.width || '85%';
            gsap.fromTo(bar,
              { width: "0%" },
              {
                width: targetWidth,
                duration: 1.2,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: bar,
                  start: "top 92%",
                  toggleActions: "play none none none"
                }
              }
            );
          });

          // F. Experience Timeline Nodes & Cards
          var timelineItems = gsap.utils.toArray('.crystal-timeline-item, .wood-timeline-item, .bio-timeline-item, .fusion-timeline-item, .curio-specimen-node, .cosmic-timeline-item, .timeline-item, .sprawl-drift-item, .abyss-timeline-node');
          if (timelineItems.length > 0) {
            ScrollTrigger.batch(timelineItems, {
              start: "top 88%",
              onEnter: function(batch) {
                gsap.fromTo(batch,
                  { autoAlpha: 0, x: -30 },
                  {
                    autoAlpha: 1,
                    x: 0,
                    duration: 0.7,
                    stagger: 0.15,
                    ease: "power2.out"
                  }
                );
              }
            });
          }

          // G. Resume Dossier 3D Card & Details Elevation
          var resumeVisual = document.querySelector('.resume-3d-wrapper, .cosmic-about-visual-card, .resume-codex-container, .nautical-map-frame, .sprawl-blueprint-box');
          if (resumeVisual) {
            gsap.fromTo(resumeVisual,
              { autoAlpha: 0, scale: 0.9, y: 40 },
              {
                autoAlpha: 1,
                scale: 1,
                y: 0,
                duration: 0.9,
                ease: "back.out(1.2)",
                scrollTrigger: {
                  trigger: resumeVisual,
                  start: "top 85%",
                  toggleActions: "play none none none"
                }
              }
            );
          }

          // H. Continuous Interactive 3D Parallax Drift for Background Layers
          if (!isReducedMotion) {
            const bgTargets = document.querySelectorAll('.hero-canvas-container, .cosmic-hero-bg, .stars-layer, .matrix-grid-bg, .abyss-canvas-layer');
            if (bgTargets.length > 0) {
              gsap.to(bgTargets, {
                yPercent: 22,
                ease: "none",
                scrollTrigger: {
                  trigger: "body",
                  start: "top top",
                  end: "bottom bottom",
                  scrub: 1.2
                }
              });
            }
          }
        });

        // Ensure ScrollTrigger positions are synchronized after layout calculation
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }

        // 5. Scrollytelling Bridge for Theatre.js & 3D Sequences
        window.__folioScrollytelling = {
          bindCameraToScroll: function(camera, trackSpline) {
            if (!camera || !trackSpline || isReducedMotion) return;
            ScrollTrigger.create({
              trigger: 'body',
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1.5,
              onUpdate: function(self) {
                var pt = trackSpline.getPointAt(self.progress);
                if (pt) camera.position.set(pt.x, pt.y, pt.z);
              }
            });
          }
        };
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollAnimations);
      } else {
        initScrollAnimations();
      }
    })();
  </script>
`;

    // Inject Head Assets
    if (html.includes('</head>')) {
      html = html.replace('</head>', `${motionHeadAssets}\n</head>`);
    } else {
      html = `${motionHeadAssets}\n${html}`;
    }

    // Inject Body Script
    if (html.includes('</body>')) {
      html = html.replace('</body>', `${motionScript}\n</body>`);
    } else {
      html = `${html}\n${motionScript}`;
    }

    return html;
  }
}

module.exports = { UniversalScrollMotion };
