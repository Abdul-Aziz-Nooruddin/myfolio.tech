/**
 * falling-leaves v0.1.0 (Official npm package: falling-leaves)
 * Dependency-free canvas animation of falling autumn / seasonal leaves.
 * Specially tuned for December / seasonal vibe on MyFolio.
 */
(function(global) {
  var module = { exports: {} };
  var exports = module.exports;

"use strict";var b=Object.defineProperty;var A=Object.getOwnPropertyDescriptor;var x=Object.getOwnPropertyNames;var I=Object.prototype.hasOwnProperty;var q=(e,t)=>{for(var i in t)b(e,i,{get:t[i],enumerable:!0})},_=(e,t,i,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of x(t))!I.call(e,o)&&o!==i&&b(e,o,{get:()=>t[o],enumerable:!(n=A(t,o))||n.enumerable});return e};var H=e=>_(b({},"__esModule",{value:!0}),e);var $={};q($,{DEFAULT_COLORS:()=>M,DEFAULT_SHAPES:()=>m,FallingLeaves:()=>v,LEAF_SHAPES:()=>T});module.exports=H($);var u={sway:1,swayFreq:1,spin:1,flip:1,rock:0};function c(e,t){if(typeof e=="number")return e;let[i,n]=e;return i+(n-i)*t}function g(e){return typeof e=="number"?e:Math.max(e[0],e[1])}function y(e,t,i,n,o,a){let r=o(),s=c(e.size,r);return{x:o()*t,y:a?o()*i:-s-o()*i*.2,rotation:o()*360,swayPhase:o()*Math.PI*2,flipPhase:o()*Math.PI*2,variant:Math.floor(o()*Math.max(1,n)),rSize:r,rSpeed:o(),rWind:o(),rSway:o(),rRotation:o(),rSwayFreq:o(),rFlipFreq:o()}}function P(e,t,i,n,o,a,r,s=u){let h=c(i.size,e.rSize),p=(.01+e.rSwayFreq*.02)*s.swayFreq,E=(.02+e.rFlipFreq*.04)*s.flip;e.swayPhase+=p*t,e.flipPhase+=E*t;let F=Math.sin(e.swayPhase)*c(i.sway,e.rSway)*s.sway;e.x+=(c(i.wind,e.rWind)+F)*t;let k=.6+.4*Math.abs(Math.cos(e.swayPhase));if(e.y+=c(i.speed,e.rSpeed)*k*t,e.rotation+=c(i.rotationSpeed,e.rRotation)*s.spin*t,e.y-h>o){Object.assign(e,y(i,n,o,a,r,!1));return}let f=h;e.x>n+f?e.x=-f:e.x<-f&&(e.x=n+f)}var T=["maple","oak","ginkgo","birch","oval"],m=["maple"],R={ginkgo:["#e0a800","#f2c12e","#d99a00","#c9a227"]},D={maple:.45,oak:.6,ginkgo:.45,birch:.65,oval:.8},C={ginkgo:{sway:2.2,swayFreq:1.4,spin:.15,flip:.4,rock:35},birch:{sway:1.9,swayFreq:1.3,spin:.2,flip:.5,rock:30}},d=128,U=[[0,-1],[.15,-.6],[.35,-.75],[.3,-.35],[.75,-.55],[.62,-.25],[.95,-.1],[.55,.1],[.62,.3],[.25,.25],[.08,.45]];function w(e,t){e.beginPath(),t.forEach(([i,n],o)=>o===0?e.moveTo(i,n):e.lineTo(i,n));for(let i=t.length-1;i>=0;i--){let[n,o]=t[i];e.lineTo(-n,o)}e.closePath()}function z(e,t,i,n=60){let o=[];for(let a=0;a<=n;a++){let r=a/n;o.push([Math.max(0,i(r)),e+(t-e)*r])}return o}function W(e){return e-Math.floor(e)}var G=z(-.95,.6,e=>{let t=.85*Math.pow(Math.sin(Math.PI*e),.6),i=.45+.55*Math.abs(Math.sin(e*Math.PI*4.5));return t*i},90),K=z(-1,.65,e=>{let t=.72*Math.pow(Math.sin(Math.PI*e),.85)*(.75+.25*e);return t>.06?t-W(e*22)*.05:t},88);function j(e){e.beginPath(),e.moveTo(0,.45),e.quadraticCurveTo(-.35,.2,-.95,-.4),e.quadraticCurveTo(-.6,-.95,-.12,-.85),e.lineTo(0,-.55),e.lineTo(.12,-.85),e.quadraticCurveTo(.6,-.95,.95,-.4),e.quadraticCurveTo(.35,.2,0,.45),e.closePath()}function B(e){e.beginPath(),e.moveTo(0,-1),e.bezierCurveTo(.75,-.55,.6,.5,0,.8),e.bezierCurveTo(-.6,.5,-.75,-.55,0,-1),e.closePath()}function L(e,t){switch(t){case"maple":return w(e,U);case"oak":return w(e,G);case"birch":return w(e,K);case"ginkgo":return j(e);default:return B(e)}}function S(e,t,i,n,o){e.moveTo(0,t),e.lineTo(0,i);for(let a of n)for(let r of[1,-1])e.moveTo(0,a+.15),e.lineTo(o*r,a-.1)}function N(e,t){switch(e.beginPath(),t){case"maple":e.moveTo(0,.95),e.lineTo(0,.4),e.lineTo(0,-.85);for(let i of[1,-1])e.moveTo(0,.4),e.lineTo(.82*i,-.1),e.moveTo(0,.4),e.lineTo(.62*i,-.48);break;case"oak":S(e,.95,-.85,[-.6,-.3,0,.3],.45);break;case"birch":S(e,.95,-.9,[-.55,-.3,-.05,.2,.42],.4);break;case"ginkgo":e.moveTo(0,1),e.lineTo(0,.45);for(let i=-4;i<=4;i++){if(i===0)continue;let n=i/4*.95;e.moveTo(0,.45),e.lineTo(Math.sin(n)*1.05,.45-Math.cos(n)*1.2)}break;default:S(e,1,-.85,[-.4,0,.35],.38)}e.stroke()}function O(e,t){let i=document.createElement("canvas");i.width=i.height=d;let n=i.getContext("2d");if(!n)return i;n.translate(d/2,d/2),n.scale(d*.47,d*.47),L(n,t),n.fillStyle=e,n.fill(),n.globalCompositeOperation="source-atop";let o=n.createLinearGradient(-1,-1,1,1);return o.addColorStop(0,"rgba(255,255,255,0.25)"),o.addColorStop(1,"rgba(0,0,0,0.15)"),n.fillStyle=o,n.fillRect(-1,-1,2,2),n.globalCompositeOperation="source-over",n.strokeStyle="rgba(60,25,0,0.35)",n.lineCap="round",n.save(),L(n,t),n.clip(),n.lineWidth=.045,N(n,t),n.restore(),n.lineWidth=.06,n.beginPath(),n.moveTo(0,D[t]),n.lineTo(0,1),n.stroke(),i}var M=["#d9480f","#e8590c","#f08c00","#c92a2a","#a61e4d","#b5651d","#e0a800"],l={count:30,size:[14,30],speed:[.6,1.5],wind:[-.3,.8],sway:[.4,1.4],rotationSpeed:[-1.5,1.5],opacity:1},V=3,v=class{constructor(t={}){this.leaves=[];this.drawables=[];this.profiles=[];this.spriteKey="";this.width=0;this.height=0;this.frame=0;this.lastTime=0;this.running=!1;this.onReducedMotionChange=()=>{var t;this.prefersStill()?(this.stop(),(t=this.ctx)==null||t.clearRect(0,0,this.width,this.height)):this.options.autoStart!==!1&&this.start()};this.resize=()=>{var n;let t=this.fullPage?{width:window.innerWidth,height:window.innerHeight}:this.container.getBoundingClientRect(),i=window.devicePixelRatio||1;this.width=t.width,this.height=t.height,this.canvas.width=Math.round(t.width*i),this.canvas.height=Math.round(t.height*i),(n=this.ctx)==null||n.setTransform(i,0,0,i,0,0)};this.tick=t=>{if(!this.running)return;let i=this.lastTime?Math.min((t-this.lastTime)/(1e3/60),V):1;this.lastTime=t;let n=this.motion,o=this.drawables.length;for(let a of this.leaves)P(a,i,n,this.width,this.height,o,Math.random,this.profiles[a.variant]);this.draw(),this.frame=requestAnimationFrame(this.tick)};var i,n,o,a,r;this.options={...t},this.fullPage=!t.container,this.container=(i=t.container)!=null?i:document.body,this.canvas=document.createElement("canvas"),this.canvas.setAttribute("aria-hidden","true"),this.canvas.dataset.fallingLeaves="",Object.assign(this.canvas.style,{position:this.fullPage?"fixed":"absolute",inset:"0",width:"100%",height:"100%",pointerEvents:"none",zIndex:String((n=t.zIndex)!=null?n:this.fullPage?9999:0)}),this.ctx=this.canvas.getContext("2d"),!this.fullPage&&getComputedStyle(this.container).position==="static"&&(this.container.style.position="relative"),this.container.appendChild(this.canvas),this.resize(),typeof ResizeObserver!="undefined"&&!this.fullPage?(this.resizeObserver=new ResizeObserver(this.resize),this.resizeObserver.observe(this.container)):window.addEventListener("resize",this.resize),this.reducedMotion=(o=window.matchMedia)==null?void 0:o.call(window,"(prefers-reduced-motion: reduce)"),(r=(a=this.reducedMotion)==null?void 0:a.addEventListener)==null||r.call(a,"change",this.onReducedMotionChange),this.refreshDrawables(),this.syncCount(!0),t.autoStart!==!1&&this.start()}start(){this.running||this.prefersStill()||(this.running=!0,this.lastTime=0,this.frame=requestAnimationFrame(this.tick))}stop(){this.running=!1,cancelAnimationFrame(this.frame)}update(t){this.options={...this.options,...t},t.zIndex!==void 0&&(this.canvas.style.zIndex=String(t.zIndex)),this.refreshDrawables(),this.syncCount(!1),this.running||this.draw()}destroy(){var t,i,n;this.stop(),(t=this.resizeObserver)==null||t.disconnect(),window.removeEventListener("resize",this.resize),(n=(i=this.reducedMotion)==null?void 0:i.removeEventListener)==null||n.call(i,"change",this.onReducedMotionChange),this.canvas.remove(),this.leaves=[]}get motion(){var i,n,o,a,r;let t=this.options;return{size:(i=t.size)!=null?i:l.size,speed:(n=t.speed)!=null?n:l.speed,wind:(o=t.wind)!=null?o:l.wind,sway:(a=t.sway)!=null?a:l.sway,rotationSpeed:(r=t.rotationSpeed)!=null?r:l.rotationSpeed}}prefersStill(){var t;return this.options.respectReducedMotion!==!1&&!!((t=this.reducedMotion)!=null&&t.matches)}refreshDrawables(){var a,r,s;let{images:t,colors:i,shapes:n=m}=this.options;if(t&&t.length>0){this.drawables=t,this.profiles=t.map(()=>u),this.spriteKey="";return}let o=`${(a=i==null?void 0:i.join(","))!=null?a:""}|${n.join(",")}`;if(o!==this.spriteKey){this.spriteKey=o,this.drawables=[],this.profiles=[];for(let h of n)for(let p of(r=i!=null?i:R[h])!=null?r:M)this.drawables.push(O(p,h)),this.profiles.push((s=C[h])!=null?s:u)}}syncCount(t){var o;let i=Math.max(0,Math.floor((o=this.options.count)!=null?o:l.count)),n=this.drawables.length;for(;this.leaves.length<i;){let a=y(this.motion,this.width,this.height,n,Math.random,!0);t||(a.y-=this.height+g(this.motion.size)),this.leaves.push(a)}this.leaves.length=i;for(let a of this.leaves)a.variant>=n&&(a.variant=a.variant%Math.max(1,n))}draw(){var o,a;let t=this.ctx;if(!t)return;t.clearRect(0,0,this.width,this.height),t.globalAlpha=(o=this.options.opacity)!=null?o:l.opacity;let i=this.motion.size,n=g(i);for(let r of this.leaves){let s=this.drawables[r.variant];if(!s)continue;let h=c(i,r.rSize);if(r.y<-n||r.y>this.height+n)continue;t.save(),t.translate(r.x,r.y);let p=((a=this.profiles[r.variant])!=null?a:u).rock*Math.cos(r.swayPhase);t.rotate((r.rotation+p)*Math.PI/180),t.scale(Math.cos(r.flipPhase),1),t.drawImage(s,-h/2,-h/2,h,h),t.restore()}t.globalAlpha=1}};0&&(module.exports={DEFAULT_COLORS,DEFAULT_SHAPES,FallingLeaves,LEAF_SHAPES});
//# sourceMappingURL=index.cjs.map

  global.FallingLeaves = module.exports.FallingLeaves;
  global.LEAF_SHAPES = module.exports.LEAF_SHAPES;
  global.DEFAULT_COLORS = module.exports.DEFAULT_COLORS;
  global.DEFAULT_SHAPES = module.exports.DEFAULT_SHAPES;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

// Auto-initialize December seasonal falling leaves on MyFolio landing page
(function initDecemberVibe() {
  function startLeaves() {
    if (typeof window === 'undefined' || !window.FallingLeaves) return;
    if (document.getElementById('myfolio-seasonal-leaves')) return;

    // Check reduced motion preference
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
    } catch (e) {}

    // Refined December / late-autumn palette (rich maple crimson, golden ginkgo, bronze oak, warm amber)
    var decemberColors = [
      '#e0a800', // golden ginkgo
      '#d9480f', // deep amber
      '#c92a2a', // maple crimson
      '#b5651d', // warm bronze
      '#f08c00', // persimmon gold
      '#c9a227', // antique gold
      '#9e3a1b'  // rustic copper
    ];

    try {
      var leaves = new window.FallingLeaves({
        count: 28, // refined, elegant density — never distracting
        shapes: ['maple', 'oak', 'ginkgo', 'birch'],
        size: [14, 26],
        speed: [0.5, 1.2],
        wind: [-0.2, 0.5],
        sway: [0.4, 1.3],
        rotationSpeed: [-1.2, 1.2],
        opacity: 0.85,
        colors: decemberColors,
        zIndex: 10, // above background mesh, below high-priority interactive docks & modals
        respectReducedMotion: true
      });

      if (leaves && leaves.canvas) {
        leaves.canvas.id = 'myfolio-seasonal-leaves';
        leaves.canvas.style.pointerEvents = 'none'; // 100% click-through, zero interaction interference
      }

      window.__myfolioLeaves = leaves;

      // === Gyroscope & Dynamic Motion Wind Engine ===
      (function attachGyroscopeAndMotion(leavesInstance) {
        if (!leavesInstance) return;

        var baseWind = [-0.2, 0.5];
        var baseSpeed = [0.5, 1.2];
        var baseSway = [0.4, 1.3];

        var targetWindOffset = 0;
        var currentWindOffset = 0;
        var targetSpeedMult = 1.0;
        var currentSpeedMult = 1.0;
        var targetSwayMult = 1.0;
        var currentSwayMult = 1.0;

        var hasGyroData = false;

        // Pointer tracking for direct leaf air-wake displacement
        var pointerX = null;
        var pointerY = null;
        var pointerVelX = 0;
        var pointerVelY = 0;
        var lastPointerX = null;
        var lastPointerY = null;
        var lastPointerTime = 0;
        var pointerActive = false;
        var pointerDecayTimer = null;

        // 1. Device Orientation (Physical Gyroscope / Accelerometer)
        function onDeviceOrientation(e) {
          if (e.gamma === null && e.beta === null) return;
          hasGyroData = true;

          // gamma: left-to-right tilt in degrees [-90, 90]
          // Tilting device to the right -> positive wind -> leaves blow right
          // Tilting device to the left -> negative wind -> leaves blow left
          var gamma = Math.max(-60, Math.min(60, e.gamma || 0));
          targetWindOffset = (gamma / 30) * 8.5; // Strong, immediately noticeable wind tilt

          // beta: front-to-back tilt in degrees [-180, 180]
          // Standard handheld angle is ~45°
          var beta = Math.max(0, Math.min(90, e.beta || 45));
          var pitchRatio = (beta - 45) / 35; // -1 to +1
          targetSpeedMult = Math.max(0.4, Math.min(2.8, 1.0 + pitchRatio * 1.2));

          // Sway expands on tilt
          targetSwayMult = Math.max(0.6, Math.min(2.4, 1.0 + Math.abs(gamma) / 25));
        }

        // 2. Desktop & Touch Pointer Gust & Air-Wake
        function onPointerMove(e) {
          var now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
          var x = e.clientX;
          var y = e.clientY;

          if (lastPointerX !== null && lastPointerY !== null && lastPointerTime > 0) {
            var dt = Math.max(1, now - lastPointerTime);
            // Instantaneous velocity in pixels per frame (~16ms)
            var rawVx = ((x - lastPointerX) / dt) * 16;
            var rawVy = ((y - lastPointerY) / dt) * 16;
            pointerVelX = pointerVelX * 0.4 + rawVx * 0.6;
            pointerVelY = pointerVelY * 0.4 + rawVy * 0.6;
          }

          pointerX = x;
          pointerY = y;
          lastPointerX = x;
          lastPointerY = y;
          lastPointerTime = now;
          pointerActive = true;

          if (!hasGyroData) {
            var halfW = window.innerWidth / 2;
            var posRatio = (x - halfW) / (halfW || 1); // -1 to +1 across viewport

            // Global wind combines cursor position breeze + cursor velocity gust
            var velocityGust = Math.max(-9.0, Math.min(9.0, pointerVelX * 0.65));
            targetWindOffset = (posRatio * 4.5) + velocityGust;
            targetSwayMult = Math.min(2.2, 1.0 + Math.abs(pointerVelX) * 0.08);

            clearTimeout(pointerDecayTimer);
            pointerDecayTimer = setTimeout(function() {
              // Smoothly settle back to cursor position wind
              targetWindOffset = posRatio * 3.0;
              pointerVelX = 0;
              pointerVelY = 0;
              targetSwayMult = 1.0;
            }, 180);
          }
        }

        function onPointerLeave() {
          pointerActive = false;
          pointerX = null;
          pointerY = null;
          pointerVelX = 0;
          pointerVelY = 0;
          targetWindOffset = 0;
          targetSpeedMult = 1.0;
          targetSwayMult = 1.0;
        }

        // 3. iOS 13+ Gyroscope permission handshake
        function requestGyroPermission() {
          if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
              .then(function(state) {
                if (state === 'granted') {
                  window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
                }
              })
              .catch(function() {});
          }
        }

        // Bind event listeners safely
        if (typeof window !== 'undefined') {
          if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
          }
          window.addEventListener('pointermove', onPointerMove, { passive: true });
          window.addEventListener('pointerleave', onPointerLeave, { passive: true });
          window.addEventListener('click', requestGyroPermission, { once: true });
          window.addEventListener('touchstart', requestGyroPermission, { once: true, passive: true });

          // Pause animation when tab or window is hidden to save 100% background CPU
          document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
              leavesInstance.stop();
            } else if (!leavesInstance.prefersStill()) {
              leavesInstance.start();
            }
          });

          // Interactive Lerp & Proximity Air-Wake Loop
          function stepPhysics() {
            if (!document.hidden && leavesInstance.running) {
              // Responsive exponential lerp (fast & snappy, ~0.14)
              currentWindOffset += (targetWindOffset - currentWindOffset) * 0.14;
              currentSpeedMult += (targetSpeedMult - currentSpeedMult) * 0.12;
              currentSwayMult += (targetSwayMult - currentSwayMult) * 0.12;

              // Apply global wind & speed vectors to simulation options
              leavesInstance.options.wind = [
                baseWind[0] + currentWindOffset,
                baseWind[1] + currentWindOffset
              ];
              leavesInstance.options.speed = [
                baseSpeed[0] * currentSpeedMult,
                baseSpeed[1] * currentSpeedMult
              ];
              leavesInstance.options.sway = [
                baseSway[0] * currentSwayMult,
                baseSway[1] * currentSwayMult
              ];

              // Direct Leaf Air-Wake / Vortex interaction (scattering leaves near pointer)
              if (pointerActive && pointerX !== null && pointerY !== null && leavesInstance.leaves) {
                var leaves = leavesInstance.leaves;
                var radius = 220; // 220px interaction bubble
                var radiusSq = radius * radius;

                for (var i = 0; i < leaves.length; i++) {
                  var leaf = leaves[i];
                  var dx = leaf.x - pointerX;
                  var dy = leaf.y - pointerY;
                  var distSq = dx * dx + dy * dy;

                  if (distSq < radiusSq && distSq > 4) {
                    var dist = Math.sqrt(distSq);
                    var norm = 1 - (dist / radius); // 1 at pointer, 0 at outer edge
                    var repelForce = norm * norm * 7.5; // quadratic outward push

                    // Outward repulsive air pressure
                    leaf.x += (dx / dist) * repelForce;
                    leaf.y += (dy / dist) * repelForce * 0.6;

                    // Drag along with pointer velocity
                    leaf.x += pointerVelX * norm * 0.7;
                    leaf.y += pointerVelY * norm * 0.4;

                    // Aerodynamic rotational flutter
                    leaf.rotation += (pointerVelX * 1.5 + (dx > 0 ? 3.0 : -3.0)) * norm;
                    leaf.flipPhase += 0.12 * norm;
                  }
                }
              }
            }
            requestAnimationFrame(stepPhysics);
          }

          requestAnimationFrame(stepPhysics);
        }
      })(leaves);
    } catch (err) {
      console.warn('[falling-leaves] seasonal leaves init:', err);
    }
  }

  if (typeof window !== 'undefined') {
    function deferStart() {
      var started = false;
      function trigger() {
        if (started) return;
        started = true;
        window.removeEventListener("scroll", trigger);
        window.removeEventListener("pointerdown", trigger);
        window.removeEventListener("keydown", trigger);
        if ("requestIdleCallback" in window) {
          requestIdleCallback(startLeaves, { timeout: 5000 });
        } else {
          setTimeout(startLeaves, 2500);
        }
      }
      window.addEventListener("scroll", trigger, { passive: true, once: true });
      window.addEventListener("pointerdown", trigger, { passive: true, once: true });
      window.addEventListener("keydown", trigger, { passive: true, once: true });
      setTimeout(trigger, 6000);
    }
    if (document.readyState === 'complete') {
      deferStart();
    } else {
      window.addEventListener('load', deferStart);
    }
  }
})();
