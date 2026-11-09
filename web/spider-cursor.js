/**
 * Spider Cursor Procedural Engine (Exclusive to 404 Page)
 * Features:
 * - 2 Autonomous Procedural Arachnid Web-Walkers
 * - 333 Ambient Floating Vector Nodes with dynamic distance thresholding
 * - Organic Noise-Driven Kinematic Silk Strands
 * - Responsive pointer tracking with adaptive color physics for light/dark surfaces
 * - Zero click interference (pointer-events: none)
 * - Automatic pause on prefers-reduced-motion
 */
(function initSpiderCursor() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Respect reduced motion
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
  } catch (e) {}

  function start() {
    if (document.getElementById('spider-cursor-canvas')) return;

    var canvas = document.createElement('canvas');
    canvas.id = 'spider-cursor-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      position: 'fixed',
      inset: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '1',
      display: 'block'
    });
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var w = 0, h = 0;
    var sin = Math.sin, cos = Math.cos, PI = Math.PI, hypot = Math.hypot, min = Math.min, max = Math.max;

    function resize() {
      var dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function rnd(x, dx) {
      if (x === undefined) x = 1;
      if (dx === undefined) dx = 0;
      return Math.random() * x + dx;
    }

    function pt(x, y) {
      return { x: x, y: y };
    }

    function many(n, f) {
      var arr = [];
      for (var i = 0; i < n; i++) arr.push(f(i));
      return arr;
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function noise(x, y, t) {
      if (t === undefined) t = 101;
      var w0 = sin(0.3 * x + 1.4 * t + 2.0 + 2.5 * sin(0.4 * y + -1.3 * t + 1.0));
      var w1 = sin(0.2 * y + 1.5 * t + 2.8 + 2.3 * sin(0.5 * x + -1.2 * t + 0.5));
      return w0 + w1;
    }

    function drawCircle(x, y, r) {
      ctx.beginPath();
      ctx.ellipse(x, y, r, r, 0, 0, PI * 2);
      ctx.fill();
    }

    function drawLine(x0, y0, x1, y1) {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      var steps = 30; // 30 smooth spline steps
      for (var i = 1; i <= steps; i++) {
        var frac = i / steps;
        var x = lerp(x0, x1, frac);
        var y = lerp(y0, y1, frac);
        var k = noise(x / 5 + x0, y / 5 + y0) * 1.8;
        ctx.lineTo(x + k, y + k);
      }
      ctx.stroke();
    }

    function spawn() {
      var pts = many(160, function() {
        return {
          x: rnd(window.innerWidth),
          y: rnd(window.innerHeight),
          len: 0,
          r: 0
        };
      });

      var pts2 = many(8, function(i) {
        return {
          x: cos((i / 8) * PI * 2),
          y: sin((i / 8) * PI * 2)
        };
      });

      var seed = rnd(100);
      var tx = rnd(window.innerWidth);
      var ty = rnd(window.innerHeight);
      var x = rnd(window.innerWidth);
      var y = rnd(window.innerHeight);
      var kx = rnd(0.5, 0.5);
      var ky = rnd(0.5, 0.5);
      var walkRadius = pt(rnd(50, 50), rnd(50, 50));
      var r = window.innerWidth / rnd(100, 150);

      function paintPt(p) {
        pts2.forEach(function(pt2) {
          if (!p.len) return;
          drawLine(
            lerp(x + pt2.x * r, p.x, p.len * p.len),
            lerp(y + pt2.y * r, p.y, p.len * p.len),
            x + pt2.x * r,
            y + pt2.y * r
          );
        });
        drawCircle(p.x, p.y, p.r);
      }

      return {
        follow: function(targetX, targetY) {
          tx = targetX;
          ty = targetY;
        },
        tick: function(t) {
          var selfMoveX = cos(t * kx + seed) * walkRadius.x;
          var selfMoveY = sin(t * ky + seed) * walkRadius.y;
          var fx = tx + selfMoveX;
          var fy = ty + selfMoveY;

          x += min(window.innerWidth / 100, (fx - x) / 10);
          y += min(window.innerWidth / 100, (fy - y) / 10);

          // Draw main spider cephalothorax body
          ctx.save();
          drawCircle(x, y, 4.5);
          drawCircle(x - (tx - x) * 0.05, y - (ty - y) * 0.05, 3.0);
          ctx.restore();

          var i = 0;
          pts.forEach(function(p) {
            var dx = p.x - x;
            var dy = p.y - y;
            var len = hypot(dx, dy);
            var rad = min(2.5, window.innerWidth / len / 4);
            var increasing = len < window.innerWidth / 9 && i++ < 8;
            var dir = increasing ? 0.09 : -0.09;
            if (increasing) {
              rad *= 1.6;
            }
            p.r = rad;
            p.len = max(0, min(p.len + dir, 1));
            paintPt(p);
          });
        }
      };
    }

    var spiders = many(2, spawn);

    // Initial targets centered near middle of 404 page
    spiders.forEach(function(s, idx) {
      s.follow(w / 2 + (idx === 0 ? -120 : 120), h / 2);
    });

    function handlePointerMove(e) {
      var clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : w / 2);
      var clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : h / 2);
      spiders.forEach(function(spider, idx) {
        var offset = idx === 0 ? -35 : 35;
        spider.follow(clientX + offset, clientY + (idx * 20));
      });
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });

    var lastTime = 0;
    function anim(t) {
      if (w !== window.innerWidth || h !== window.innerHeight) {
        resize();
      }

      // Transparent clear so the 404 page content and puzzle remain fully visible
      ctx.clearRect(0, 0, w, h);

      // Adaptive color styling for light warm paper vs dark mode
      var isDark = false;
      try {
        isDark = document.documentElement.classList.contains('dark') ||
                 document.body.classList.contains('dark') ||
                 (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      } catch (e) {}

      if (isDark) {
        ctx.fillStyle = '#75c5de';
        ctx.strokeStyle = 'rgba(117, 197, 222, 0.4)';
        ctx.lineWidth = 1.0;
      } else {
        // High-contrast ink & teal threads on warm paper
        ctx.fillStyle = '#171817';
        ctx.strokeStyle = 'rgba(19, 112, 142, 0.38)';
        ctx.lineWidth = 1.1;
      }

      var timeSec = t / 1000;
      spiders.forEach(function(spider) {
        spider.tick(timeSec);
      });

      requestAnimationFrame(anim);
    }

    requestAnimationFrame(anim);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

