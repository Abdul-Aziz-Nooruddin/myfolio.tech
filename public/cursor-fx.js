(function(){if(typeof window>"u"||typeof document>"u")return;try{if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches)return}catch{}var C=!1;try{window.matchMedia&&window.matchMedia("(pointer: coarse)").matches&&(C=!0)}catch{}var E=document.createElement("style");E.id="myfolio-cursor-styles",E.textContent=`
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
  `,document.head.appendChild(E);function P(){var d=document.createElement("div");d.className="mf-cursor-dot",d.setAttribute("aria-hidden","true");var f=document.createElement("div");f.className="mf-cursor-ring",f.setAttribute("aria-hidden","true"),document.body.appendChild(d),document.body.appendChild(f);var m=-100,h=-100,_=-100,k=-100,A=-100,B=-100,M=!1,z=!1,H=!1;window.addEventListener("pointermove",function(e){if(e.pointerType==="touch"){C=!0,d.style.opacity="0",f.style.opacity="0";return}m=e.clientX,h=e.clientY,M||(M=!0,d.style.opacity="1",f.style.opacity="1",C||document.body.classList.add("has-custom-cursor"))},{passive:!0}),window.addEventListener("pointerdown",function(e){e.pointerType!=="touch"&&(H=!0,document.body.classList.add("mf-cursor-clicking"))},{passive:!0}),window.addEventListener("pointerup",function(){H=!1,document.body.classList.remove("mf-cursor-clicking")},{passive:!0}),document.addEventListener("mouseover",function(e){var t=e.target;t&&t.closest&&t.closest('a, button, [role="button"], input, select, textarea, .btn, .card, .interactive-card, [data-interactive]')&&(z=!0,document.body.classList.add("mf-cursor-active"))},{passive:!0}),document.addEventListener("mouseout",function(e){var t=e.target;t&&t.closest&&t.closest('a, button, [role="button"], input, select, textarea, .btn, .card, .interactive-card, [data-interactive]')&&(z=!1,document.body.classList.remove("mf-cursor-active"))},{passive:!0});var V=[{color:"#FF2E93",shadow1:"rgba(255, 46, 147, 0.95)",shadow2:"rgba(255, 110, 180, 0.70)"},{color:"#00F0FF",shadow1:"rgba(0, 240, 255, 0.95)",shadow2:"rgba(0, 180, 255, 0.70)"},{color:"#F59E0B",shadow1:"rgba(245, 158, 11, 0.95)",shadow2:"rgba(251, 191, 36, 0.70)"},{color:"#A855F7",shadow1:"rgba(168, 85, 247, 0.95)",shadow2:"rgba(192, 132, 252, 0.70)"},{color:"#10B981",shadow1:"rgba(16, 185, 129, 0.95)",shadow2:"rgba(52, 211, 153, 0.70)"},{color:"#FF4D4D",shadow1:"rgba(255, 77, 77, 0.95)",shadow2:"rgba(255, 128, 128, 0.70)"},{color:"#38BDF8",shadow1:"rgba(56, 189, 248, 0.95)",shadow2:"rgba(14, 165, 233, 0.70)"},{color:"#FB923C",shadow1:"rgba(251, 146, 60, 0.95)",shadow2:"rgba(249, 115, 22, 0.70)"},{color:"#84CC16",shadow1:"rgba(132, 204, 22, 0.95)",shadow2:"rgba(163, 230, 53, 0.70)"},{color:"#FB7185",shadow1:"rgba(251, 113, 133, 0.95)",shadow2:"rgba(244, 63, 94, 0.70)"},{color:"#6366F1",shadow1:"rgba(99, 102, 241, 0.95)",shadow2:"rgba(129, 140, 248, 0.70)"},{color:"#2DD4BF",shadow1:"rgba(45, 212, 191, 0.95)",shadow2:"rgba(20, 184, 166, 0.70)"}],g=[],N=0;function Y(e,t,r,o){if(e.nodeType===3){var i=e.textContent;if(!i||i.trim()==="")return;for(var a=i.match(/\S+|\s+/g)||[],v=document.createDocumentFragment(),w=0;w<a.length;w++){var p=a[w];if(/^\s+$/.test(p)){var c=document.createElement("span");c.className="mf-proximity-space",c.innerHTML="&nbsp;",c.setAttribute("aria-hidden","true"),v.appendChild(c)}else{var s=document.createElement("span");s.className="mf-proximity-word";for(var y=o.count++,D=(r*5+y*2)%V.length,x=V[D],b=0;b<p.length;b++){var T=p[b],n=document.createElement("span");n.className="mf-proximity-letter",n.textContent=T,n._palColor=x.color,n._palShadow1=x.shadow1,n._palShadow2=x.shadow2,n._isTransformed=!1,s.appendChild(n),t.push(n)}v.appendChild(s)}}e.parentNode.replaceChild(v,e)}else if(e.nodeType===1){if(e.classList&&(e.classList.contains("mf-proximity-letter")||e.classList.contains("mf-proximity-word")||e.classList.contains("mf-proximity-space")))return;var u=e.tagName.toLowerCase();if(u==="svg"||u==="script"||u==="style"||u==="canvas"||u==="iframe")return;for(var l=Array.from(e.childNodes),L=0;L<l.length;L++)Y(l[L],t,r,o)}}function j(e){if(!(!e||e.dataset.mfProximityBound)){var t=e.parentElement;if(!(t&&t.closest&&t.closest("[data-mf-proximity-bound]"))){e.dataset.mfProximityBound="true";var r=[],o=N++,i={count:0};Y(e,r,o,i),r.length>0&&g.push({container:e,letters:r,letterOffsets:[],_offsetsValid:!1,hasActive:!1,radius:95})}}}function I(e,t){if(!(e._offsetsValid&&e.letterOffsets&&e.letterOffsets.length===e.letters.length)){var r=e.letters;e.letterOffsets=[];for(var o=0;o<r.length;o++){var i=r[o].getBoundingClientRect();e.letterOffsets.push({x:i.left-t.left+i.width/2,y:i.top-t.top+i.height/2})}e._offsetsValid=!0}}window.addEventListener("resize",function(){for(var e=0;e<g.length;e++)g[e]._offsetsValid=!1},{passive:!0});function F(){for(var e=["#hero-heading",".hero-headline","[data-cursor-proximity]",".text-cursor-proximity"],t=document.querySelectorAll(e.join(",")),r=0;r<t.length;r++){var o=t[r];if(!o.dataset.mfProximityBound&&!o.closest('button, [role="button"], .btn, nav, .desktop-navigation, .header-actions, .ps-persona-picker, input, select, textarea, .burger-button, #adsterra-floating-bar, #mf-cursor-dot, #mf-cursor-ring, .leaves-container, [class*="monetag"], [id*="monetag"], [class*="ad-"], [id*="ad"], iframe, ins, svg, script, style, noscript')){for(var i=!1,a=0;a<o.childNodes.length;a++)if(o.childNodes[a].nodeType===3&&o.childNodes[a].textContent.trim().length>0){i=!0;break}(i||o.children.length===0&&o.textContent.trim().length>0)&&j(o)}}}F();var O=null,S=new MutationObserver(function(e){for(var t=0;t<e.length;t++){var r=e[t].target;if(r&&r.classList&&(r.classList.contains("mf-cursor-dot")||r.classList.contains("mf-cursor-ring")||r.classList.contains("mf-proximity-letter")||r.id==="myfolio-seasonal-leaves"))return}O&&clearTimeout(O),O=setTimeout(function(){F()},300)});S.observe(document.body,{childList:!0,subtree:!0}),setTimeout(F,120),setTimeout(F,600);function q(e){for(var t=e.letters,r=0;r<t.length;r++)t[r]._isTransformed&&(t[r].style.transform="",t[r].style.color="",t[r].style.textShadow="",t[r]._isTransformed=!1);e.hasActive=!1}function X(){if(M&&!C){A+=(m-A)*.55,B+=(h-B)*.55,_+=(m-_)*.18,k+=(h-k)*.18,d.style.transform="translate("+A.toFixed(1)+"px, "+B.toFixed(1)+"px) translate(-50%, -50%)",f.style.transform="translate("+_.toFixed(1)+"px, "+k.toFixed(1)+"px) translate(-50%, -50%)";var e=g.length;if(e>0)for(var t=window.innerHeight,r=0;r<e;r++){var o=g[r],i=o.container,a=i.getBoundingClientRect();if(a.bottom<-60||a.top>t+60){o.hasActive&&q(o);continue}if(m>=a.left-90&&m<=a.right+90&&h>=a.top-90&&h<=a.bottom+90){o.hasActive=!0,I(o,a);for(var v=o.letters,w=o.letterOffsets,p=o.radius,c=0;c<v.length;c++){var s=v[c],y=w[c];if(y){var D=a.left+y.x,x=a.top+y.y,b=m-D,T=h-x,n=Math.sqrt(b*b+T*T);if(n<p){var u=n/(p/2),l=Math.exp(-Math.pow(u,2)/2),L=1+l*.38,$=-l*5.2;s.style.transform="scale("+L.toFixed(3)+") translateY("+$.toFixed(1)+"px)",l>.08?(s.style.color=s._palColor,s.style.textShadow="0 0 "+(l*16).toFixed(1)+"px "+s._palShadow1+", 0 0 "+(l*8).toFixed(1)+"px "+s._palShadow2):(s.style.color="",s.style.textShadow=""),s._isTransformed=!0}else s._isTransformed&&(s.style.transform="",s.style.color="",s.style.textShadow="",s._isTransformed=!1)}}}else o.hasActive&&q(o)}}requestAnimationFrame(X)}requestAnimationFrame(X)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",P):P()})();
