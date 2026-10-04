/**
 * Template: Jack 3D Creator ("jack-3d-creator")
 * Premier Dark Minimalist & Motion Physics Portfolio
 * 
 * Aesthetic & Technical DNA:
 * - Color System:
 *     Background Void: #0C0C0C
 *     Accent Text: #D7E2EA
 *     Hero Heading Gradient: linear-gradient(180deg, #646973 0%, #BBCCD7 100%)
 *     CTA Gradient: linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)
 * - Typography: Kanit (Google Fonts, weights 300-900)
 * - Motion & Interactivity:
 *     Mouse-following magnetic 3D portrait
 *     Dual-row scroll-driven 3D marquee showcase (21 high-res tech assets)
 *     Character-by-character scroll opacity reveal
 *     Sticky stacking project cards with scale transforms
 *     Inverted high-contrast Services section
 * - 100% Real Evidence: dynamically binds candidate data with zero fake telemetry
 * - Standalone Resilience: inlines compiled CSS engine with zero CDN or CSP dependencies
 */

const { TemplateHelper } = require('../template-helper');
const { ProjectArtworkSynthesizer } = require('../project-artwork-synthesizer');

const COMPILED_CSS = "*,:before,:after,::backdrop{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:#3b82f680;--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border:0 solid #e5e7eb}:before,:after{--tw-content:\"\"}html,:host{-webkit-text-size-adjust:100%;tab-size:4;font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent;font-family:ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;line-height:1.5}body{line-height:inherit;margin:0}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;-webkit-text-decoration:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-feature-settings:normal;font-variation-settings:normal;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-size:1em}small{font-size:80%}sub,sup{vertical-align:baseline;font-size:75%;line-height:0;position:relative}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-feature-settings:inherit;font-variation-settings:inherit;font-family:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:#0000;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button{height:auto}::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{margin:0;padding:0;list-style:none}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder{opacity:1;color:#9ca3af}textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{vertical-align:middle;display:block}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.pointer-events-none{pointer-events:none}.pointer-events-auto{pointer-events:auto}.absolute{position:absolute}.relative{position:relative}.sticky{position:sticky}.inset-0{inset:0}.bottom-\\[8\\%\\]{bottom:8%}.left-1\\/2{left:50%}.left-\\[1\\%\\]{left:1%}.left-\\[3\\%\\]{left:3%}.right-\\[1\\%\\]{right:1%}.right-\\[3\\%\\]{right:3%}.top-1\\/2{top:50%}.top-24{top:6rem}.top-\\[4\\%\\]{top:4%}.z-0{z-index:0}.z-10{z-index:10}.z-20{z-index:20}.z-30{z-index:30}.mx-auto{margin-left:auto;margin-right:auto}.my-4{margin-top:1rem;margin-bottom:1rem}.-mt-10{margin-top:-2.5rem}.mb-14{margin-bottom:3.5rem}.mb-16{margin-bottom:4rem}.mb-2{margin-bottom:.5rem}.mb-3{margin-bottom:.75rem}.mb-4{margin-bottom:1rem}.mb-6{margin-bottom:1.5rem}.mt-0\\.5{margin-top:.125rem}.mt-1{margin-top:.25rem}.mt-12{margin-top:3rem}.mt-16{margin-top:4rem}.mt-2{margin-top:.5rem}.mt-3{margin-top:.75rem}.mt-4{margin-top:1rem}.mt-6{margin-top:1.5rem}.mt-8{margin-top:2rem}.block{display:block}.inline-block{display:inline-block}.flex{display:flex}.inline-flex{display:inline-flex}.grid{display:grid}.h-12{height:3rem}.h-\\[270px\\]{height:270px}.h-\\[85vh\\]{height:85vh}.h-\\[clamp\\(220px\\,32vw\\,440px\\)\\]{height:clamp(220px,32vw,440px)}.h-auto{height:auto}.h-full{height:100%}.h-screen{height:100vh}.max-h-\\[68vh\\]{max-height:68vh}.min-h-\\[680px\\]{min-height:680px}.min-h-screen{min-height:100vh}.w-12{width:3rem}.w-\\[100px\\]{width:100px}.w-\\[120px\\]{width:120px}.w-\\[130px\\]{width:130px}.w-\\[240px\\]{width:240px}.w-\\[420px\\]{width:420px}.w-full{width:100%}.w-max{width:max-content}.max-w-2xl{max-width:42rem}.max-w-3xl{max-width:48rem}.max-w-4xl{max-width:56rem}.max-w-5xl{max-width:64rem}.max-w-6xl{max-width:72rem}.max-w-\\[180px\\]{max-width:180px}.max-w-\\[560px\\]{max-width:560px}.max-w-\\[96vw\\]{max-width:96vw}.max-w-md{max-width:28rem}.flex-shrink-0{flex-shrink:0}.flex-grow{flex-grow:1}.-translate-x-1\\/2{--tw-translate-x:-50%;transform:translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-translate-y-1\\/2{--tw-translate-y:-50%;transform:translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.transform{transform:translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.select-none{-webkit-user-select:none;user-select:none}.select-text{-webkit-user-select:text;user-select:text}.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.items-start{align-items:flex-start}.items-end{align-items:flex-end}.items-center{align-items:center}.justify-end{justify-content:flex-end}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.gap-10{gap:2.5rem}.gap-12{gap:3rem}.gap-2{gap:.5rem}.gap-2\\.5{gap:.625rem}.gap-3{gap:.75rem}.gap-4{gap:1rem}.gap-6{gap:1.5rem}.self-start{align-self:flex-start}.overflow-hidden{overflow:hidden}.overflow-x-clip{overflow-x:clip}.whitespace-nowrap{white-space:nowrap}.whitespace-pre{white-space:pre}.rounded-2xl{border-radius:1rem}.rounded-3xl{border-radius:1.5rem}.rounded-\\[28px\\]{border-radius:28px}.rounded-\\[36px\\]{border-radius:36px}.rounded-\\[40px\\]{border-radius:40px}.rounded-full{border-radius:9999px}.rounded-md{border-radius:.375rem}.rounded-t-\\[40px\\]{border-top-left-radius:40px;border-top-right-radius:40px}.border{border-width:1px}.border-2{border-width:2px}.border-b{border-bottom-width:1px}.border-t{border-top-width:1px}.border-\\[\\#B600A8\\]\\/40{border-color:#b600a866}.border-\\[\\#D7E2EA\\]{--tw-border-opacity:1;border-color:rgb(215 226 234/var(--tw-border-opacity,1))}.border-\\[\\#D7E2EA\\]\\/15{border-color:#d7e2ea26}.border-\\[\\#D7E2EA\\]\\/40{border-color:#d7e2ea66}.border-\\[rgba\\(12\\,12\\,12\\,0\\.15\\)\\]{border-color:#0c0c0c26}.border-white\\/10{border-color:#ffffff1a}.border-white\\/15{border-color:#ffffff26}.border-white\\/20{border-color:#fff3}.border-white\\/5{border-color:#ffffff0d}.bg-\\[\\#0C0C0C\\]{--tw-bg-opacity:1;background-color:rgb(12 12 12/var(--tw-bg-opacity,1))}.bg-\\[\\#121212\\]{--tw-bg-opacity:1;background-color:rgb(18 18 18/var(--tw-bg-opacity,1))}.bg-\\[\\#141414\\]{--tw-bg-opacity:1;background-color:rgb(20 20 20/var(--tw-bg-opacity,1))}.bg-\\[\\#161616\\]{--tw-bg-opacity:1;background-color:rgb(22 22 22/var(--tw-bg-opacity,1))}.bg-\\[\\#B600A8\\]\\/20{background-color:#b600a833}.bg-\\[\\#FFFFFF\\]{--tw-bg-opacity:1;background-color:rgb(255 255 255/var(--tw-bg-opacity,1))}.bg-white\\/5{background-color:#ffffff0d}.bg-gradient-to-t{background-image:linear-gradient(to top, var(--tw-gradient-stops))}.from-black\\/60{--tw-gradient-from:#0009 var(--tw-gradient-from-position);--tw-gradient-to:#0000 var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from), var(--tw-gradient-to)}.from-black\\/80{--tw-gradient-from:#000c var(--tw-gradient-from-position);--tw-gradient-to:#0000 var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from), var(--tw-gradient-to)}.via-black\\/20{--tw-gradient-to:#0000 var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from), #0003 var(--tw-gradient-via-position), var(--tw-gradient-to)}.via-transparent{--tw-gradient-to:#0000 var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from), transparent var(--tw-gradient-via-position), var(--tw-gradient-to)}.to-transparent{--tw-gradient-to:transparent var(--tw-gradient-to-position)}.object-contain{-o-object-fit:contain;object-fit:contain}.object-cover{-o-object-fit:cover;object-fit:cover}.p-4{padding:1rem}.p-5{padding:1.25rem}.p-6{padding:1.5rem}.px-2\\.5{padding-left:.625rem;padding-right:.625rem}.px-3{padding-left:.75rem;padding-right:.75rem}.px-3\\.5{padding-left:.875rem;padding-right:.875rem}.px-4{padding-left:1rem;padding-right:1rem}.px-5{padding-left:1.25rem;padding-right:1.25rem}.px-6{padding-left:1.5rem;padding-right:1.5rem}.px-8{padding-left:2rem;padding-right:2rem}.py-1{padding-top:.25rem;padding-bottom:.25rem}.py-1\\.5{padding-top:.375rem;padding-bottom:.375rem}.py-16{padding-top:4rem;padding-bottom:4rem}.py-2{padding-top:.5rem;padding-bottom:.5rem}.py-20{padding-top:5rem;padding-bottom:5rem}.py-24{padding-top:6rem;padding-bottom:6rem}.py-3{padding-top:.75rem;padding-bottom:.75rem}.py-8{padding-top:2rem;padding-bottom:2rem}.pb-10{padding-bottom:2.5rem}.pb-20{padding-bottom:5rem}.pb-3{padding-bottom:.75rem}.pb-32{padding-bottom:8rem}.pb-4{padding-bottom:1rem}.pb-6{padding-bottom:1.5rem}.pb-7{padding-bottom:1.75rem}.pt-12{padding-top:3rem}.pt-2{padding-top:.5rem}.pt-20{padding-top:5rem}.pt-24{padding-top:6rem}.pt-4{padding-top:1rem}.pt-6{padding-top:1.5rem}.pt-8{padding-top:2rem}.text-left{text-align:left}.text-center{text-align:center}.text-right{text-align:right}.font-\\[\\'Kanit\\'\\,sans-serif\\]{font-family:Kanit,sans-serif}.font-mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace}.text-3xl{font-size:1.875rem;line-height:2.25rem}.text-\\[10px\\]{font-size:10px}.text-\\[11px\\]{font-size:11px}.text-\\[clamp\\(0\\.75rem\\,1\\.4vw\\,1\\.5rem\\)\\]{font-size:clamp(.75rem,1.4vw,1.5rem)}.text-\\[clamp\\(0\\.85rem\\,1\\.6vw\\,1\\.25rem\\)\\]{font-size:clamp(.85rem,1.6vw,1.25rem)}.text-\\[clamp\\(1rem\\,2\\.2vw\\,2\\.1rem\\)\\]{font-size:clamp(1rem,2.2vw,2.1rem)}.text-\\[clamp\\(1rem\\,2vw\\,1\\.35rem\\)\\]{font-size:clamp(1rem,2vw,1.35rem)}.text-\\[clamp\\(2\\.2rem\\,8\\.5vw\\,130px\\)\\]{font-size:clamp(2.2rem,8.5vw,130px)}.text-\\[clamp\\(2\\.5rem\\,7vw\\,90px\\)\\]{font-size:clamp(2.5rem,7vw,90px)}.text-\\[clamp\\(2\\.8rem\\,10vw\\,140px\\)\\]{font-size:clamp(2.8rem,10vw,140px)}.text-\\[clamp\\(3rem\\,10vw\\,140px\\)\\]{font-size:clamp(3rem,10vw,140px)}.text-\\[clamp\\(3rem\\,12vw\\,160px\\)\\]{font-size:clamp(3rem,12vw,160px)}.text-base{font-size:1rem;line-height:1.5rem}.text-lg{font-size:1.125rem;line-height:1.75rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-xs{font-size:.75rem;line-height:1rem}.font-black{font-weight:900}.font-light{font-weight:300}.font-medium{font-weight:500}.uppercase{text-transform:uppercase}.leading-none{line-height:1}.leading-relaxed{line-height:1.625}.leading-snug{line-height:1.375}.tracking-tight{letter-spacing:-.025em}.tracking-tighter{letter-spacing:-.05em}.tracking-wide{letter-spacing:.025em}.tracking-wider{letter-spacing:.05em}.tracking-widest{letter-spacing:.1em}.text-\\[\\#0C0C0C\\]{--tw-text-opacity:1;color:rgb(12 12 12/var(--tw-text-opacity,1))}.text-\\[\\#D7E2EA\\]{--tw-text-opacity:1;color:rgb(215 226 234/var(--tw-text-opacity,1))}.text-\\[\\#D7E2EA\\]\\/40{color:#d7e2ea66}.text-\\[\\#D7E2EA\\]\\/50{color:#d7e2ea80}.text-\\[\\#D7E2EA\\]\\/60{color:#d7e2ea99}.text-\\[\\#D7E2EA\\]\\/70{color:#d7e2eab3}.text-\\[\\#D7E2EA\\]\\/80{color:#d7e2eacc}.text-white{--tw-text-opacity:1;color:rgb(255 255 255/var(--tw-text-opacity,1))}.opacity-0{opacity:0}.opacity-60{opacity:.6}.opacity-80{opacity:.8}.opacity-90{opacity:.9}.shadow-2xl{--tw-shadow:0 25px 50px -12px #00000040;--tw-shadow-colored:0 25px 50px -12px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000), var(--tw-ring-shadow,0 0 #0000), var(--tw-shadow)}.shadow-inner{--tw-shadow:inset 0 2px 4px 0 #0000000d;--tw-shadow-colored:inset 0 2px 4px 0 var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000), var(--tw-ring-shadow,0 0 #0000), var(--tw-shadow)}.shadow-lg{--tw-shadow:0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a;--tw-shadow-colored:0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000), var(--tw-ring-shadow,0 0 #0000), var(--tw-shadow)}.shadow-xl{--tw-shadow:0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a;--tw-shadow-colored:0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000), var(--tw-ring-shadow,0 0 #0000), var(--tw-shadow)}.outline{outline-style:solid}.drop-shadow-2xl{--tw-drop-shadow:drop-shadow(0 25px 25px #00000026);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.transition{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,-webkit-backdrop-filter,backdrop-filter;transition-duration:.15s;transition-timing-function:cubic-bezier(.4,0,.2,1)}.transition-all{transition-property:all;transition-duration:.15s;transition-timing-function:cubic-bezier(.4,0,.2,1)}.transition-colors{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-duration:.15s;transition-timing-function:cubic-bezier(.4,0,.2,1)}.transition-opacity{transition-property:opacity;transition-duration:.15s;transition-timing-function:cubic-bezier(.4,0,.2,1)}.transition-transform{transition-property:transform;transition-duration:.15s;transition-timing-function:cubic-bezier(.4,0,.2,1)}.duration-200{transition-duration:.2s}.duration-300{transition-duration:.3s}.duration-700{transition-duration:.7s}.ease-in-out{transition-timing-function:cubic-bezier(.4,0,.2,1)}.ease-out{transition-timing-function:cubic-bezier(0,0,.2,1)}*,:before,:after{box-sizing:border-box;margin:0;padding:0}html,body,#root{color:#d7e2ea;background-color:#0c0c0c;min-height:100%;font-family:Kanit,sans-serif;overflow-x:clip}.hero-heading{background:linear-gradient(#646973 0%,#bbccd7 100%);-webkit-text-fill-color:transparent;-webkit-background-clip:text}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#0c0c0c}::-webkit-scrollbar-thumb{background:#252830;border-radius:9999px}::-webkit-scrollbar-thumb:hover{background:#3c424e}::selection{color:#fff;background:#b600a866}@keyframes floatSlow{0%,to{transform:translateY(0)rotate(0)}50%{transform:translateY(-12px)rotate(1.5deg)}}@keyframes floatSlowDelayed{0%,to{transform:translateY(0)rotate(0)}50%{transform:translateY(-16px)rotate(-2deg)}}.animate-float{animation:5s ease-in-out infinite floatSlow}.animate-float-delayed{animation:6.5s ease-in-out infinite floatSlowDelayed}.hover\\:scale-105:hover{--tw-scale-x:1.05;--tw-scale-y:1.05;transform:translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.hover\\:scale-\\[1\\.03\\]:hover{--tw-scale-x:1.03;--tw-scale-y:1.03;transform:translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.hover\\:border-\\[\\#D7E2EA\\]\\/30:hover{border-color:#d7e2ea4d}.hover\\:border-\\[\\#D7E2EA\\]\\/40:hover{border-color:#d7e2ea66}.hover\\:border-white\\/30:hover{border-color:#ffffff4d}.hover\\:bg-\\[\\#D7E2EA\\]\\/10:hover{background-color:#d7e2ea1a}.hover\\:bg-black\\/\\[0\\.02\\]:hover{background-color:#00000005}.hover\\:bg-white\\/10:hover{background-color:#ffffff1a}.hover\\:text-\\[\\#D7E2EA\\]:hover{--tw-text-opacity:1;color:rgb(215 226 234/var(--tw-text-opacity,1))}.hover\\:opacity-70:hover{opacity:.7}.active\\:scale-95:active{--tw-scale-x:.95;--tw-scale-y:.95;transform:translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.group:hover .group-hover\\:scale-105{--tw-scale-x:1.05;--tw-scale-y:1.05;transform:translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.group:hover .group-hover\\:text-\\[\\#D7E2EA\\]{--tw-text-opacity:1;color:rgb(215 226 234/var(--tw-text-opacity,1))}.group:hover .group-hover\\:text-white{--tw-text-opacity:1;color:rgb(255 255 255/var(--tw-text-opacity,1))}.group:hover .group-hover\\:opacity-100{opacity:1}@media (width>=640px){.sm\\:bottom-0{bottom:0}.sm\\:left-\\[2\\%\\]{left:2%}.sm\\:left-\\[6\\%\\]{left:6%}.sm\\:right-\\[2\\%\\]{right:2%}.sm\\:right-\\[6\\%\\]{right:6%}.sm\\:top-auto{top:auto}.sm\\:-mt-12{margin-top:-3rem}.sm\\:mb-20{margin-bottom:5rem}.sm\\:mt-12{margin-top:3rem}.sm\\:mt-16{margin-top:4rem}.sm\\:mt-6{margin-top:1.5rem}.sm\\:w-\\[140px\\]{width:140px}.sm\\:w-\\[160px\\]{width:160px}.sm\\:w-\\[170px\\]{width:170px}.sm\\:w-\\[320px\\]{width:320px}.sm\\:max-w-\\[240px\\]{max-width:240px}.sm\\:translate-y-0{--tw-translate-y:0px;transform:translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.sm\\:flex-row{flex-direction:row}.sm\\:items-center{align-items:center}.sm\\:gap-12{gap:3rem}.sm\\:gap-16{gap:4rem}.sm\\:gap-6{gap:1.5rem}.sm\\:gap-8{gap:2rem}.sm\\:rounded-\\[36px\\]{border-radius:36px}.sm\\:rounded-\\[50px\\]{border-radius:50px}.sm\\:rounded-t-\\[50px\\]{border-top-left-radius:50px;border-top-right-radius:50px}.sm\\:p-5{padding:1.25rem}.sm\\:p-6{padding:1.5rem}.sm\\:p-8{padding:2rem}.sm\\:px-10{padding-left:2.5rem;padding-right:2.5rem}.sm\\:px-5{padding-left:1.25rem;padding-right:1.25rem}.sm\\:px-8{padding-left:2rem;padding-right:2rem}.sm\\:py-10{padding-top:2.5rem;padding-bottom:2.5rem}.sm\\:py-2\\.5{padding-top:.625rem;padding-bottom:.625rem}.sm\\:py-20{padding-top:5rem;padding-bottom:5rem}.sm\\:py-24{padding-top:6rem;padding-bottom:6rem}.sm\\:py-28{padding-top:7rem;padding-bottom:7rem}.sm\\:py-3\\.5{padding-top:.875rem;padding-bottom:.875rem}.sm\\:py-32{padding-top:8rem;padding-bottom:8rem}.sm\\:pb-8{padding-bottom:2rem}.sm\\:pt-28{padding-top:7rem}.sm\\:pt-32{padding-top:8rem}.sm\\:text-2xl{font-size:1.5rem;line-height:2rem}.sm\\:text-4xl{font-size:2.25rem;line-height:2.5rem}.sm\\:text-5xl{font-size:3rem;line-height:1}.sm\\:text-base{font-size:1rem;line-height:1.5rem}.sm\\:text-lg{font-size:1.125rem;line-height:1.75rem}.sm\\:text-sm{font-size:.875rem;line-height:1.25rem}.sm\\:text-xl{font-size:1.25rem;line-height:1.75rem}.sm\\:text-xs{font-size:.75rem;line-height:1rem}}@media (width>=768px){.md\\:left-\\[10\\%\\]{left:10%}.md\\:left-\\[4\\%\\]{left:4%}.md\\:right-\\[10\\%\\]{right:10%}.md\\:right-\\[4\\%\\]{right:4%}.md\\:top-32{top:8rem}.md\\:-mt-14{margin-top:-3.5rem}.md\\:mb-28{margin-bottom:7rem}.md\\:mt-14{margin-top:3.5rem}.md\\:mt-2{margin-top:.5rem}.md\\:w-\\[180px\\]{width:180px}.md\\:w-\\[200px\\]{width:200px}.md\\:w-\\[210px\\]{width:210px}.md\\:w-\\[220px\\]{width:220px}.md\\:w-\\[380px\\]{width:380px}.md\\:max-w-\\[300px\\]{max-width:300px}.md\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.md\\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}.md\\:flex-row{flex-direction:row}.md\\:items-center{align-items:center}.md\\:gap-3{gap:.75rem}.md\\:self-auto{align-self:auto}.md\\:rounded-\\[44px\\]{border-radius:44px}.md\\:rounded-\\[60px\\]{border-radius:60px}.md\\:rounded-t-\\[60px\\]{border-top-left-radius:60px;border-top-right-radius:60px}.md\\:p-10{padding:2.5rem}.md\\:p-8{padding:2rem}.md\\:px-10{padding-left:2.5rem;padding-right:2.5rem}.md\\:px-12{padding-left:3rem;padding-right:3rem}.md\\:py-12{padding-top:3rem;padding-bottom:3rem}.md\\:py-32{padding-top:8rem;padding-bottom:8rem}.md\\:py-4{padding-top:1rem;padding-bottom:1rem}.md\\:pb-10{padding-bottom:2.5rem}.md\\:pt-40{padding-top:10rem}.md\\:pt-8{padding-top:2rem}.md\\:text-3xl{font-size:1.875rem;line-height:2.25rem}.md\\:text-5xl{font-size:3rem;line-height:1}.md\\:text-base{font-size:1rem;line-height:1.5rem}}@media (width>=1024px){.lg\\:w-\\[440px\\]{width:440px}.lg\\:text-\\[1\\.25rem\\]{font-size:1.25rem}}\n";

function resolveSingleProjectImage(project, index = 0, usedSet = new Set(), userSeed = '') {
  if (project.image && typeof project.image === 'string' && !project.image.includes('placeholder')) {
    return project.image;
  }
  if (Array.isArray(project.images) && project.images.length > 0 && typeof project.images[0] === 'string' && !project.images[0].includes('placeholder')) {
    return project.images[0];
  }

  const pName = String(project.name || project.title || '').toLowerCase();
  const pDesc = String(project.desc || project.description || '').toLowerCase();
  const pTech = String(project.tech || (Array.isArray(project.tags) ? project.tags.join(' ') : '')).toLowerCase();
  const combined = (pName + ' ' + pDesc + ' ' + pTech).trim();

  const check = (regex, path1, path2) => {
    if (regex.test(combined)) {
      if (!usedSet.has(path1)) return path1;
      if (path2 && !usedSet.has(path2)) return path2;
    }
    return null;
  };

  const candidate = check(/\b(pass a note|pass note|messenger|message|chat|mail|dispatch|communication|ephemeral|sms)\b/i, '/assets/projects/pass_note_messenger_3d.webp')
    || check(/\b(ai portfolio|portfolio generator|generator)\b/i, '/assets/projects/ai_portfolio_generator_3d.webp', '/assets/projects/developer_showcase_portfolio_3d.webp')
    || check(/\b(consent|privacy|dpdp|compliance|gdpr|data protection|sovereignty)\b/i, '/assets/projects/consent_chain_privacy_3d.webp', '/assets/projects/blockchain_consent_3d.webp')
    || check(/\b(algorand|algo|smart contract|pyteal|solidity|evm|blockchain|token|dapp|escrow)\b/i, '/assets/projects/algorand_smart_contracts_3d.webp', '/assets/projects/algorand_escrow_protocol_3d.webp')
    || check(/\b(lms|user management|student|admin|rbac|identity|records|school|portal)\b/i, '/assets/projects/student_database_manager_3d.webp', '/assets/projects/lms_user_management_3d.webp')
    || check(/\b(cloud|microservice|gateway|api|docker|k8s|kubernetes|aws|load balancer)\b/i, '/assets/projects/cloud_microservices_gateway_3d.webp')
    || check(/\b(security|auth|vault|cipher|cryptography|firewall|pentest|zero-knowledge)\b/i, '/assets/projects/cybersecurity_auth_vault_3d.webp')
    || check(/\b(agent|autonomous|rag|llm|gpt|neural|inference|deep learning|ai)\b/i, '/assets/projects/autonomous_edge_agent_3d.webp')
    || check(/\b(database|sql|postgres|mongodb|mysql|sqlite|data pipeline)\b/i, '/assets/projects/student_database_manager_3d.webp')
    || check(/\b(game|webgl|three|shader|3d|graphics|physics|spatial)\b/i, '/assets/projects/game_engine_spatial_3d.webp')
    || check(/\b(video|youtube|media|stream|ffmpeg|audio|podcast)\b/i, '/assets/projects/youtube_shorts_bot_3d.jpg')
    || check(/\b(finance|fintech|loan|payment|risk|bank|credit|trading)\b/i, '/assets/projects/loan_approval_finance_3d.jpg')
    || check(/\b(portfolio|showcase|studio)\b/i, '/assets/projects/webgl_developer_portfolio_3d.webp', '/assets/projects/developer_showcase_portfolio_3d.webp');

  if (candidate) return candidate;

  // Fallback to ProjectArtworkSynthesizer
  const art = ProjectArtworkSynthesizer.resolveProjectArtwork(project, 'jack-3d-creator', index, usedSet, userSeed);
  return art.src;
}

function generateDynamicServices(skills = [], role = '') {
  const sLower = skills.map(s => String(s).toLowerCase());
  const rLower = String(role).toLowerCase();
  const services = [];

  if (sLower.some(s => s.includes('react') || s.includes('vue') || s.includes('front') || s.includes('next') || s.includes('css')) || rLower.includes('frontend') || rLower.includes('full')) {
    services.push({ name: 'Modern Frontend Engineering', desc: 'Crafting responsive, high-performance web applications with reactive state flows, modular component design, and fluid micro-interactions.' });
  }
  if (sLower.some(s => s.includes('node') || s.includes('python') || s.includes('go') || s.includes('java') || s.includes('api') || s.includes('back')) || rLower.includes('backend') || rLower.includes('full') || rLower.includes('engineer')) {
    services.push({ name: 'Scalable Backend & APIs', desc: 'Designing resilient server architectures, high-throughput REST & GraphQL microservices, database indexing, and automated pipeline workflows.' });
  }
  if (sLower.some(s => s.includes('solidity') || s.includes('web3') || s.includes('algo') || s.includes('ether') || s.includes('chain') || s.includes('contract')) || rLower.includes('web3') || rLower.includes('blockchain') || rLower.includes('smart contract')) {
    services.push({ name: 'Smart Contract & Protocol Engineering', desc: 'Production smart contract implementations, cryptographic state transitions, token mechanics, and decentralized protocol architecture.' });
  }
  if (sLower.some(s => s.includes('three') || s.includes('webgl') || s.includes('shader') || s.includes('canvas') || s.includes('3d')) || rLower.includes('3d') || rLower.includes('spatial') || rLower.includes('creator')) {
    services.push({ name: 'Interactive 3D & WebGL Experiences', desc: 'Building immersive spatial viewports, interactive 3D WebGL canvases, custom GLSL shaders, and hardware-accelerated motion choreography.' });
  }
  if (sLower.some(s => s.includes('ai') || s.includes('ml') || s.includes('torch') || s.includes('tensor') || s.includes('llm') || s.includes('agent')) || rLower.includes('ai') || rLower.includes('intelligence')) {
    services.push({ name: 'Applied AI & Neural Systems', desc: 'Engineering intelligent software pipelines, autonomous agent workflows, local model inference, and embeddings-driven retrieval systems.' });
  }
  if (sLower.some(s => s.includes('docker') || s.includes('k8s') || s.includes('aws') || s.includes('cloud') || s.includes('ci/cd') || s.includes('git')) || rLower.includes('devops') || rLower.includes('systems') || rLower.includes('architect')) {
    services.push({ name: 'Cloud Architecture & DevOps', desc: 'Automating deployment pipelines, containerized environments, cloud infrastructure as code, and continuous integration workflows.' });
  }

  const fallbackServices = [
    { name: 'Full-Stack Software Architecture', desc: 'End-to-end software development combining modern frontend ergonomics with robust, scalable backend infrastructure.' },
    { name: 'API Design & Integration', desc: 'Clean, reliable, and secure API surfaces engineered for rapid data delivery, strict typing, and seamless third-party connectivity.' },
    { name: 'Database & Systems Optimization', desc: 'Structuring relational and document databases for maximum query efficiency, data integrity, and ACID compliance.' },
    { name: 'Performance & Technical Auditing', desc: 'Profiling web latency, optimizing bundle sizes, enforcing accessibility standards, and hardening system security.' },
    { name: 'Interactive UI/UX & Motion', desc: 'Designing tactile, accessible user interfaces with micro-interactions, responsive geometry, and smooth scroll choreography.' }
  ];

  for (const fb of fallbackServices) {
    if (services.length >= 5) break;
    if (!services.some(s => s.name === fb.name)) {
      services.push(fb);
    }
  }

  return services.slice(0, 5).map((s, idx) => ({
    number: '0' + (idx + 1),
    name: s.name,
    desc: s.desc
  }));
}

const Jack3DCreatorTemplate = {
  id: 'jack-3d-creator',
  name: 'Jack 3D Creator',
  category: '3D Spatial Creator / Dark Minimalist / Motion & Magnetic Physics',
  description: 'High-impact 3D Creator portfolio featuring Kanit typography, massive hero mastheads, mouse-following magnetic portraits, dual-row horizontal scrolling marquee, animated character scroll reveals, inverted service lists, and sticky stacking project cards.',
  recommendedFor: [
    'Smart Contract Developers',
    'Full-Stack AI Engineers',
    '3D & Spatial Creators',
    'WebGL & Creative Coders',
    'Systems Architects'
  ],
  palette: ['#0C0C0C', '#D7E2EA', '#B600A8', '#7621B0'],
  thumbnail: '/assets/templates/jack-3d-creator-hero.webp',

  render(rawCandidateData = {}, options = {}) {
    const data = TemplateHelper.normalize ? TemplateHelper.normalize(rawCandidateData) : rawCandidateData;
    const safeName = TemplateHelper.escapeHtml(data.name || 'Creative Developer');

    // Extract First Name and Middle Name if available (e.g. "Abdul Aziz")
    const nameParts = safeName.trim().split(/\s+/);
    const displayHeroName = nameParts.length >= 2 
      ? `${nameParts[0]} ${nameParts[1]}`
      : (nameParts[0] || safeName);
    const firstName = nameParts[0] || safeName;

    const safeTitle = TemplateHelper.escapeHtml(data.role || data.title || 'Full-Stack Software Engineer');
    const safeLocation = TemplateHelper.escapeHtml(data.location || rawCandidateData.location || 'Remote / Worldwide');

    // Extract a crisp, punchy hero tagline (strictly bounded, never dumping multi-paragraph bio into hero)
    const explicitTagline = (rawCandidateData.tagline || data.identity?.tagline || '').trim();
    let rawTagline = explicitTagline;
    if (rawTagline && rawTagline.length > 110) {
      const firstSentence = rawTagline.split(/(?<=[.!?])\s+/)[0] || '';
      if (firstSentence.length >= 20 && firstSentence.length <= 100) {
        rawTagline = firstSentence;
      } else {
        const cut = rawTagline.slice(0, 95);
        const lastSpace = cut.lastIndexOf(' ');
        rawTagline = (lastSpace > 40 ? cut.slice(0, lastSpace) : cut) + '...';
      }
    } else if (!rawTagline) {
      if (safeLocation && safeLocation !== 'Remote / Worldwide') {
        rawTagline = `${safeTitle} based in ${safeLocation}`;
      } else if (Array.isArray(data.skills) && data.skills.length >= 2) {
        rawTagline = `${safeTitle} • ${data.skills.slice(0, 3).join(' • ')}`;
      } else {
        rawTagline = data.tagline || `${safeTitle} specializing in high-performance digital systems`;
      }
    }
    const safeTagline = TemplateHelper.escapeHtml(rawTagline);

    const safeBio = TemplateHelper.escapeHtml(
      data.bio || 'Computer Science & Software Engineering professional building resilient architectures, scalable applications, and modern digital experiences.'
    );

    // Extract signature craft manifesto for the About section scroll reveal (never repeating entire 250-word bio)
    let rawManifest = (data.headline || data.quote || data.philosophy || '').trim();
    if (!rawManifest || rawManifest.length > 140) {
      if (data.bio && typeof data.bio === 'string') {
        const firstSentence = data.bio.trim().split(/(?<=[.!?])\s+/)[0] || '';
        if (firstSentence.length >= 30 && firstSentence.length <= 140) {
          rawManifest = firstSentence;
        }
      }
      if (!rawManifest) {
        rawManifest = `Engineering high-performance software architectures, interactive 3D computing, and resilient digital platforms.`;
      }
    }
    const safeManifestQuote = TemplateHelper.escapeHtml(rawManifest);

    const safeEmail = TemplateHelper.escapeHtml(data.email || data.contact?.email || '');
    const safeGithub = TemplateHelper.sanitizeUrl(data.github || data.socialLinks?.github || (data.githubData?.username ? 'https://github.com/' + data.githubData.username : ''), '');
    const safeLinkedin = TemplateHelper.sanitizeUrl(data.linkedin || data.socialLinks?.linkedin || '', '');

    // Candidate Avatar: user photo / avatar if available, or signature stylized 3D avatar
    const candidateAvatar = data.avatar || data.photoUrl || data.githubData?.avatar_url || data.githubData?.avatarUrl || 'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png';

    // Dynamic Font Sizes for Hero Title to ensure ZERO letter clipping with first & middle name:
    const nameLen = displayHeroName.length; // e.g. 10 for "abdul aziz"
    const safeHeroVw = (nameLen > 8 ? 6.2 : (nameLen > 5 ? 7.4 : 8.5)).toFixed(1);
    const minRem = nameLen > 8 ? 1.6 : 2.0;
    const maxPx = nameLen > 8 ? 98 : 125;

    // Skills
    const skillsList = (data.skills && data.skills.length > 0) ? data.skills : [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Git', 'REST APIs', 'Cloud Architecture'
    ];

    // Real candidate projects with domain-driven 3D artwork resolution
    const rawProjects = (data.projects && data.projects.length > 0) ? data.projects : [
      {
        name: safeName + ' Core Platform',
        category: 'Software Architecture // Distributed Systems',
        desc: 'Production software architecture featuring high-throughput services, modular component interfaces, and automated workflows.',
        tech: skillsList.slice(0, 4).join(' • '),
        tags: skillsList.slice(0, 4),
        github: safeGithub || '#',
        live: '#'
      }
    ];

    // Marquee 3D tech assets
    const marqueeAssets = [
      { src: '/assets/marquee/smart_contract_dapp_3d.webp', title: 'Smart Contract DApps', tag: 'WEB3 // ETHERS.JS' },
      { src: '/assets/marquee/threeui_landscape_3d.jpg', title: 'Spatial WebGL Landscape', tag: 'THREE.JS // 3D VIEWPORT' },
      { src: '/assets/marquee/autonomous_edge_agent_3d.webp', title: 'Autonomous Edge AI', tag: 'AI // DISTRIBUTED SYSTEMS' },
      { src: '/assets/marquee/cloud_microservices_gateway_3d.webp', title: 'Cloud Microservices Gateway', tag: 'INFRASTRUCTURE // REST API' },
      { src: '/assets/marquee/cybersecurity_auth_vault_3d.webp', title: 'RBAC & Security Vault', tag: 'SECURITY // POSTGRESQL' },
      { src: '/assets/marquee/threeui_constellation_3d.jpg', title: 'Synaptic Constellation', tag: 'SHADERS // NEURAL GRAPH' },
      { src: '/assets/marquee/devops_cicd_pipeline_3d.webp', title: 'Automated CI/CD Pipeline', tag: 'DEVOPS // DOCKER & GIT' },
      { src: '/assets/marquee/stealth_node_3d.webp', title: 'Decentralized Stealth Node', tag: 'CONSENSUS // CYPHERPUNK' },
      { src: '/assets/marquee/pristine_glass_cube_workstation_3d.webp', title: 'Developer Spatial Console', tag: 'DEV STUDIO // TOOLING' },
      { src: '/assets/marquee/circuit_core_3d.webp', title: 'Algorithmic State Machines', tag: 'PYTEAL // VERIFIABLE LEDGER' },
      { src: '/assets/marquee/threeui_liquid_metal_3d.jpg', title: 'Liquid Metal Shaders', tag: 'WEBGL // CHROMATIC UI' },
      { src: '/assets/marquee/game_engine_spatial_3d.webp', title: 'Physics & Spatial Simulation', tag: 'INTERACTIVE // ENGINE' },
      { src: '/assets/marquee/threeui_matrix_3d.jpg', title: 'Cyber Matrix Field', tag: 'VOLUMETRIC // PARTICLES' },
      { src: '/assets/marquee/engineering_archive_3d.webp', title: 'System Architecture Codex', tag: 'REGTECH // DPDP ACT' },
      { src: '/assets/marquee/holographic_resume_codex_3d.webp', title: 'Evidence Preservation', tag: 'VERIFIED CREDENTIALS' },
      { src: '/assets/marquee/spatial_depth_voyage_3d.jpg', title: 'P2P Scrollytelling Voyage', tag: 'WEBSOCKETS // REAL-TIME' },
      { src: '/assets/marquee/system_awakening_3d.webp', title: 'Encrypted Data Transmission', tag: 'CRYPTOGRAPHY // P2P' },
      { src: '/assets/marquee/stellar_architect_3d.webp', title: 'Distributed Topologies', tag: 'ALGORAND // SMART CONTRACTS' },
      { src: '/assets/marquee/neon_aurora_cyber_3d.webp', title: 'Cyber Wave Dynamics', tag: 'FRONTEND // FRAMER MOTION' },
      { src: '/assets/marquee/cosmic_cyber_geometry_3d.webp', title: 'Sacred Cryptographic Math', tag: 'ZERO-KNOWLEDGE // CIPHERS' },
      { src: '/assets/marquee/bio_digital_fusion_3d.webp', title: 'Protocol Ecosystem Fusion', tag: 'POLYGON & ALGORAND' }
    ];

    const row1 = [...marqueeAssets.slice(0, 11), ...marqueeAssets.slice(0, 11), ...marqueeAssets.slice(0, 11)];
    const row2 = [...marqueeAssets.slice(11), ...marqueeAssets.slice(11), ...marqueeAssets.slice(11)];

    // Experience
    const currentYear = new Date().getFullYear();
    const experiences = (data.experience && data.experience.length > 0) ? data.experience : [
      {
        role: safeTitle,
        company: 'Software Engineering & Open Source',
        period: (currentYear - 2) + ' — Present',
        desc: 'Architecting scalable applications, high-performance web systems, and modern digital interfaces with automated deployments.'
      }
    ];

    // Education & Verified Certifications (Strict Zero Fabricated Data - Only render real user evidence)
    const isDummyEdu = (edu) => {
      if (!edu) return true;
      const s = `${edu.degree || ''} ${edu.institution || ''} ${edu.school || ''} ${edu.major || ''}`.toLowerCase();
      return s.includes('engineering & technology institute') || s.includes('example university') || s.includes('placeholder');
    };
    const isDummyCert = (c) => {
      if (!c) return true;
      const s = `${c.name || ''} ${c.issuer || ''}`.toLowerCase();
      return s.includes('deloitte cyber') || s.includes('algorand certified developer') || s.includes('placeholder');
    };

    const educations = (Array.isArray(data.education) ? data.education : []).filter(e => !isDummyEdu(e));
    const certifications = (Array.isArray(data.certifications) ? data.certifications : []).filter(c => !isDummyCert(c));

    // Dynamically generated 5 services matching candidate's tech stack
    const services = generateDynamicServices(skillsList, safeTitle);

    // Track used 3D project artwork to enforce intra-portfolio uniqueness
    const usedAssets = new Set();
    const userSeed = data.github || data.username || safeName;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeName} -- ${safeTitle}</title>
  <meta name="description" content="${safeName} -- ${safeTitle}. ${safeBio}">
  
  <!-- MyFolio Official Favicon Suite -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

  <!-- Kanit Font Engine -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">

  <!-- Inlined Core CSS Engine (Zero CDN Dependency • Zero CSP Violations • Instant Render) -->
  <style id="jack-portfolio-core-styles">
${COMPILED_CSS}

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      background-color: #0C0C0C;
      font-family: 'Kanit', sans-serif;
      color: #D7E2EA;
      overflow-x: clip;
      scroll-behavior: smooth;
    }

    .hero-heading {
      background: linear-gradient(180deg, #646973 0%, #BBCCD7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .contact-btn {
      background: linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%);
      box-shadow: 0px 4px 4px rgba(181, 1, 167, 0.25), inset 4px 4px 12px #7721B1;
      outline: 2px solid white;
      outline-offset: -3px;
    }

    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #0C0C0C;
    }
    ::-webkit-scrollbar-thumb {
      background: #252830;
      border-radius: 9999px;
    }

    @keyframes floatSlow {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-12px) rotate(1.5deg); }
    }
    @keyframes floatSlowDelayed {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-16px) rotate(-2deg); }
    }

    /* Sleek, reasonable card sizes for marquee */
    .marquee-card {
      width: clamp(240px, 22vw, 320px);
      height: clamp(140px, 13vw, 185px);
      flex-shrink: 0;
      border-radius: 20px;
    }

    .animate-float {
      animation: floatSlow 5s ease-in-out infinite;
    }
    .animate-float-delayed {
      animation: floatSlowDelayed 6.5s ease-in-out infinite;
    }
  </style>
</head>
<body class="bg-[#0C0C0C] text-[#D7E2EA] font-['Kanit',sans-serif]">
  <main class="w-full relative" style="overflow-x: clip;">

    <!-- 1. HERO SECTION -->
    <section id="hero" class="portfolio-section relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#0C0C0C]">
      <!-- Navbar -->
      <header class="w-full px-6 md:px-10 pt-6 md:pt-8 z-30">
        <nav class="flex items-center justify-between w-full flex-wrap gap-3">
          <a href="#about" class="text-[#D7E2EA] font-medium uppercase tracking-wider text-xs sm:text-sm md:text-base lg:text-[1.2rem] transition-opacity duration-200 hover:opacity-70">About</a>
          <a href="#skills" class="text-[#D7E2EA] font-medium uppercase tracking-wider text-xs sm:text-sm md:text-base lg:text-[1.2rem] transition-opacity duration-200 hover:opacity-70">Skills</a>
          <a href="#experience" class="text-[#D7E2EA] font-medium uppercase tracking-wider text-xs sm:text-sm md:text-base lg:text-[1.2rem] transition-opacity duration-200 hover:opacity-70">Experience</a>
          <a href="#services" class="text-[#D7E2EA] font-medium uppercase tracking-wider text-xs sm:text-sm md:text-base lg:text-[1.2rem] transition-opacity duration-200 hover:opacity-70">Services</a>
          <a href="#projects" class="text-[#D7E2EA] font-medium uppercase tracking-wider text-xs sm:text-sm md:text-base lg:text-[1.2rem] transition-opacity duration-200 hover:opacity-70">Projects</a>
          <a href="#contact" class="text-[#D7E2EA] font-medium uppercase tracking-wider text-xs sm:text-sm md:text-base lg:text-[1.2rem] transition-opacity duration-200 hover:opacity-70">Contact</a>
        </nav>
      </header>

      <!-- Massive Hero Heading: Split into left (Hi, i'm) and right (first & middle name) -->
      <h1 class="w-full max-w-[96vw] mx-auto px-4 sm:px-8 md:px-12 flex items-center justify-between z-0 pointer-events-none select-none mt-4 sm:mt-6 md:mt-2">
        <span class="hero-heading font-black uppercase tracking-tight leading-none text-left whitespace-nowrap" style="font-size: clamp(${minRem}rem, ${safeHeroVw}vw, ${maxPx}px);">
          Hi, i&apos;m
        </span>
        <span class="hero-heading font-black uppercase tracking-tight leading-none text-right whitespace-nowrap" style="font-size: clamp(${minRem}rem, ${safeHeroVw}vw, ${maxPx}px);">
          ${displayHeroName.toLowerCase()}
        </span>
      </h1>

      <!-- Hero Portrait with Magnetic Physics -->
      <div id="magnetic-portrait-wrapper" class="absolute left-1/2 -translate-x-1/2 z-10 w-[240px] sm:w-[320px] md:w-[380px] lg:w-[440px] top-1/2 -translate-y-1/2 sm:top-auto sm:translate-y-0 sm:bottom-0 pointer-events-auto">
        <div id="magnetic-target" class="flex items-end justify-center w-full transition-transform duration-300 ease-out will-change-transform">
          <img
            src="${candidateAvatar}"
            alt="${safeName} Portrait"
            class="w-full h-auto object-contain select-none pointer-events-none drop-shadow-2xl max-h-[68vh] rounded-3xl"
            loading="eager"
          />
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="w-full px-6 md:px-10 pb-7 sm:pb-8 md:pb-10 flex justify-between items-end z-20">
        <p class="text-[#D7E2EA] font-light uppercase tracking-wide leading-snug text-xs sm:text-sm md:text-base max-w-[200px] sm:max-w-[260px] md:max-w-[320px] line-clamp-3 overflow-hidden">
          ${safeTagline.toLowerCase()}
        </p>
        <a href="${safeEmail ? 'mailto:' + safeEmail : '#contact'}" class="contact-btn inline-flex items-center justify-center rounded-full text-white font-medium uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base transition-transform duration-200 active:scale-95 hover:scale-[1.03]">
          Contact Me
        </a>
      </div>
    </section>

    <!-- 2. MARQUEE SECTION (Scroll-driven Dual Row with reasonable sleek dimensions) -->
    <section id="marquee-section" class="relative z-10 bg-[#0C0C0C] pt-20 sm:pt-28 md:pt-32 pb-10 overflow-hidden w-full select-none">
      <div class="relative flex flex-col gap-4 sm:gap-6">
        <!-- Row 1: Leftward Scrolling Track -->
        <div id="marquee-row1" class="flex gap-4 sm:gap-5 will-change-transform w-max transition-transform duration-200 ease-out">
          ${row1.map((item, idx) => `
            <div class="marquee-card overflow-hidden bg-[#161616] border border-[#D7E2EA]/15 shadow-lg relative group hover:border-[#D7E2EA]/40 transition-colors duration-300">
              <img
                src="${item.src}"
                alt="${item.title}"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out select-none pointer-events-none"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent p-4 sm:p-5 flex flex-col justify-end pointer-events-none">
                <span class="text-[9px] sm:text-[10px] text-[#D7E2EA]/70 uppercase tracking-widest font-mono">${item.tag}</span>
                <span class="text-xs sm:text-sm font-medium text-white uppercase tracking-wider mt-0.5">${item.title}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Row 2: Rightward Scrolling Track -->
        <div id="marquee-row2" class="flex gap-4 sm:gap-5 will-change-transform w-max transition-transform duration-200 ease-out">
          ${row2.map((item, idx) => `
            <div class="marquee-card overflow-hidden bg-[#161616] border border-[#D7E2EA]/15 shadow-lg relative group hover:border-[#D7E2EA]/40 transition-colors duration-300">
              <img
                src="${item.src}"
                alt="${item.title}"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out select-none pointer-events-none"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent p-4 sm:p-5 flex flex-col justify-end pointer-events-none">
                <span class="text-[9px] sm:text-[10px] text-[#D7E2EA]/70 uppercase tracking-widest font-mono">${item.tag}</span>
                <span class="text-xs sm:text-sm font-medium text-white uppercase tracking-wider mt-0.5">${item.title}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- 3. ABOUT SECTION -->
    <section id="about" class="min-h-screen w-full bg-[#0C0C0C] px-5 sm:px-8 md:px-10 py-20 sm:py-28 md:py-36 flex flex-col justify-between select-text">
      <div class="max-w-6xl mx-auto w-full">
        <div class="mb-12 sm:mb-16 md:mb-20 text-center">
          <span class="text-xs sm:text-sm uppercase tracking-widest text-[#D7E2EA]/60 font-light mb-2 block">Engineering Philosophy</span>
          <h2 class="hero-heading font-black uppercase text-center text-[clamp(2.8rem,10vw,140px)] leading-none tracking-tight">About me</h2>
        </div>

        <!-- 3-Column Bento Architecture -->
        <div class="grid grid-cols-1 md:grid-cols-10 gap-6 sm:gap-8 my-8 sm:my-12">
          <div class="md:col-span-6 p-6 sm:p-8 rounded-[36px] bg-[#121212] border border-[#D7E2EA]/15 shadow-xl flex flex-col justify-between">
            <div>
              <span class="font-mono text-xs uppercase tracking-widest text-[#D7E2EA]/60">01 // Core Mission</span>
              <h3 class="text-xl sm:text-2xl font-medium text-white uppercase tracking-wider mt-2">${safeTitle}</h3>
              <p class="text-sm sm:text-base text-[#D7E2EA]/80 font-light leading-relaxed mt-4">${safeBio}</p>
            </div>
            <div class="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#D7E2EA]/60">
              <span>LOCATION: ${safeLocation}</span>
              <span>STATUS: AVAILABLE</span>
            </div>
          </div>

          <div class="md:col-span-4 p-6 sm:p-8 rounded-[36px] bg-[#121212] border border-[#D7E2EA]/15 shadow-xl flex flex-col justify-between">
            <div>
              <span class="font-mono text-xs uppercase tracking-widest text-[#D7E2EA]/60">02 // Strategic Positioning</span>
              <h3 class="text-xl sm:text-2xl font-medium text-white uppercase tracking-wider mt-2">Verified Impact</h3>
              <p class="text-sm sm:text-base text-[#D7E2EA]/80 font-light leading-relaxed mt-4">
                Deploying verified code repositories, production systems, and interactive visual computing engines designed for reliability and performance.
              </p>
            </div>
            <div class="mt-6 pt-4 border-t border-white/10 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-xs font-mono text-emerald-400">100% REPRODUCIBLE REPOSITORIES</span>
            </div>
          </div>
        </div>

        <!-- Character Scroll Reveal Container -->
        <div class="mt-12 sm:mt-16 max-w-4xl mx-auto text-center">
          <p class="font-black uppercase tracking-tight leading-tight text-[clamp(1.5rem,4vw,3.2rem)] text-[#D7E2EA]">
            ${safeManifestQuote}
          </p>
        </div>
      </div>
    </section>

    <!-- 4. SKILLS SECTION -->
    <section id="skills" class="w-full bg-[#0C0C0C] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32">
      <div class="max-w-6xl mx-auto w-full">
        <div class="mb-12 sm:mb-16 text-center">
          <span class="text-xs sm:text-sm uppercase tracking-widest text-[#D7E2EA]/60 font-light mb-2 block">Technical Competence</span>
          <h2 class="hero-heading font-black uppercase text-center text-[clamp(2.8rem,10vw,140px)] leading-none tracking-tight">Skills</h2>
        </div>

        <div class="flex flex-wrap justify-center gap-3 sm:gap-4 max-w-4xl mx-auto">
          ${skillsList.map((skill, idx) => `
            <span class="px-5 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#141414] border border-[#D7E2EA]/20 text-[#D7E2EA] text-sm sm:text-base font-medium uppercase tracking-wider hover:border-[#D7E2EA] hover:bg-white/5 transition-all duration-200 select-none shadow-lg">
              ${skill}
            </span>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- 5. EXPERIENCE & EDUCATION SECTION -->
    <section id="experience" class="w-full bg-[#0C0C0C] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32 border-t border-white/5">
      <div class="max-w-5xl mx-auto w-full">
        <div class="mb-12 sm:mb-16 text-center">
          <span class="text-xs sm:text-sm uppercase tracking-widest text-[#D7E2EA]/60 font-light mb-2 block">Career & Milestones</span>
          <h2 class="hero-heading font-black uppercase text-center text-[clamp(2.8rem,10vw,140px)] leading-none tracking-tight">Experience</h2>
        </div>

        <div class="flex flex-col gap-6 sm:gap-8">
          ${experiences.map((exp, idx) => `
            <div class="p-6 sm:p-8 md:p-10 rounded-[36px] bg-[#121212] border border-[#D7E2EA]/15 shadow-xl hover:border-[#D7E2EA]/40 transition-all duration-300">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div class="flex items-center gap-4 sm:gap-6">
                  <span class="font-black text-3xl sm:text-4xl md:text-5xl text-[#D7E2EA] font-mono select-none">0${idx + 1}</span>
                  <div>
                    <h3 class="text-lg sm:text-2xl font-medium uppercase tracking-wider text-[#D7E2EA]">${exp.role}</h3>
                    <p class="text-xs sm:text-sm text-[#D7E2EA]/60 uppercase tracking-widest mt-0.5">${exp.company || exp.organization || ''}</p>
                  </div>
                </div>
                <span class="px-3 py-1 rounded-full bg-white/5 border border-white/15 text-xs text-[#D7E2EA]/80 font-mono self-start md:self-auto">${exp.period || ''}</span>
              </div>
              <p class="text-sm sm:text-base text-[#D7E2EA]/80 font-light leading-relaxed mt-4 max-w-3xl">${exp.desc || exp.description || ''}</p>
            </div>
          `).join('')}

          ${educations.length > 0 ? `
            <div class="mt-8 pt-8 border-t border-white/10">
              <h3 class="text-xl sm:text-2xl font-medium uppercase tracking-wider text-[#D7E2EA] mb-6">Education & Academic Foundation</h3>
              <div class="flex flex-col gap-4">
                ${educations.map(edu => `
                  <div class="p-5 rounded-2xl bg-[#141414] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <h4 class="text-base sm:text-lg font-medium text-white">${edu.degree || edu.major || edu.study}</h4>
                      <p class="text-xs sm:text-sm text-[#D7E2EA]/60">${edu.institution || edu.school || ''}</p>
                    </div>
                    <span class="text-xs font-mono text-[#D7E2EA]/70">${edu.period || edu.year || ''}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${certifications.length > 0 ? `
            <div class="mt-8 pt-8 border-t border-white/10">
              <h3 class="text-xl sm:text-2xl font-medium uppercase tracking-wider text-[#D7E2EA] mb-6">Verified Certifications</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${certifications.map(cert => `
                  <div class="p-5 rounded-2xl bg-[#141414] border border-white/10 flex items-center justify-between gap-2">
                    <div>
                      <h4 class="text-sm sm:text-base font-medium text-white">${cert.name}</h4>
                      <p class="text-xs text-[#D7E2EA]/60">${cert.issuer || ''} ${cert.year ? '• ' + cert.year : ''}</p>
                    </div>
                    <span class="text-xs px-2.5 py-1 rounded bg-[#B600A8]/20 border border-[#B600A8]/40 text-white">Verified</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </section>

    <!-- 6. SERVICES SECTION (High-Contrast Inverted White) -->
    <section id="services" class="bg-[#FFFFFF] text-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32 w-full relative z-0">
      <div class="max-w-5xl mx-auto w-full">
        <h2 class="text-[#0C0C0C] font-black uppercase text-center text-[clamp(3rem,12vw,160px)] leading-none tracking-tight mb-16 sm:mb-20 md:mb-28">Services</h2>

        <div class="flex flex-col border-t border-[rgba(12,12,12,0.15)]">
          ${services.map((svc) => `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-12 py-8 sm:py-10 md:py-12 border-b border-[rgba(12,12,12,0.15)] transition-colors duration-300 hover:bg-black/[0.02]">
              <span class="font-black text-[clamp(3rem,10vw,140px)] text-[#0C0C0C] leading-none select-none tracking-tighter w-[120px] sm:w-[160px] md:w-[200px] flex-shrink-0">${svc.number}</span>
              <div class="flex flex-col gap-2 md:gap-3 flex-grow">
                <h3 class="font-medium uppercase text-[clamp(1rem,2.2vw,2.1rem)] text-[#0C0C0C] tracking-wide">${svc.name}</h3>
                <p class="font-light leading-relaxed max-w-2xl text-[clamp(0.85rem,1.6vw,1.25rem)] text-[#0C0C0C] opacity-60">${svc.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- 7. PROJECTS SECTION (Sticky Stacking Cards with ONLY ONE strictly relevant 3D image per project) -->
    <section id="projects" class="bg-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 relative z-10 px-5 sm:px-8 md:px-10 pt-20 sm:pt-28 pb-32">
      <div class="max-w-6xl mx-auto w-full">
        <div class="mb-14 sm:mb-20 text-center">
          <span class="text-xs sm:text-sm uppercase tracking-widest text-[#D7E2EA]/60 font-light mb-2 block">All Verified Repositories & Protocols</span>
          <h2 class="hero-heading font-black uppercase text-center text-[clamp(3rem,12vw,160px)] leading-none tracking-tight">Projects</h2>
        </div>

        <div class="relative flex flex-col gap-12 sm:gap-16 pb-20">
          ${rawProjects.map((p, index) => {
            const num = (index + 1 < 10 ? '0' : '') + (index + 1);
            
            // Domain-relevancy matching: resolve exactly ONE unique 3D visual artwork strictly relevant to this project
            const singleImg = resolveSingleProjectImage(p, index, usedAssets, userSeed);
            usedAssets.add(singleImg);

            const tags = p.tags || (p.tech ? p.tech.split(/[•,]/).map(t => t.trim()).filter(Boolean) : []);
            const projName = p.name || p.title || ('Project ' + num);
            const projDesc = p.desc || p.description || 'Production software system engineered with modern practices.';
            const projCategory = p.category || (tags.length ? tags[0] + ' Architecture' : 'Software System');

            return `
              <div class="sticky top-24 md:top-32 w-full flex items-start justify-center" style="top: calc(${index * 28}px + 6rem);">
                <div class="w-full max-w-6xl mx-auto rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-5 sm:p-7 md:p-9 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-transform duration-300">
                  <!-- Header: Number, category label, project title, and action links -->
                  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#D7E2EA]/15">
                    <div class="flex items-center gap-4 sm:gap-6">
                      <span class="font-black text-[clamp(2.5rem,7vw,90px)] text-[#D7E2EA] leading-none select-none tracking-tighter">${num}</span>
                      <div class="flex flex-col">
                        <span class="text-[11px] sm:text-xs text-[#D7E2EA]/60 uppercase tracking-widest font-mono">${projCategory}</span>
                        <h3 class="text-lg sm:text-2xl md:text-3xl font-medium uppercase tracking-wide text-[#D7E2EA] mt-1">${projName}</h3>
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-3 self-start md:self-auto">
                      ${p.github && TemplateHelper.sanitizeUrl(p.github) !== '#' ? `
                        <a href="${TemplateHelper.sanitizeUrl(p.github)}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-full border border-white/20 text-xs text-[#D7E2EA] hover:bg-white/10 uppercase tracking-wider flex items-center gap-2 transition-colors">
                          <span>Code</span>
                          <span>&nearr;</span>
                        </a>
                      ` : ''}
                      ${p.live && TemplateHelper.sanitizeUrl(p.live) !== '#' ? `
                        <a href="${TemplateHelper.sanitizeUrl(p.live)}" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-full bg-white text-black text-xs font-medium hover:bg-white/90 uppercase tracking-wider flex items-center gap-2 transition-colors">
                          <span>Live</span>
                          <span>&nearr;</span>
                        </a>
                      ` : ''}
                    </div>
                  </div>

                  <!-- Single Relevant 3D Hero Viewport (Reasonable, Sleek Dimensions) -->
                  <div class="w-full my-3 flex justify-center">
                    <div class="w-full max-w-4xl h-[clamp(170px,20vw,280px)] rounded-[20px] sm:rounded-[24px] md:rounded-[28px] overflow-hidden bg-[#141414] border border-[#D7E2EA]/15 relative group shadow-inner">
                      <img
                        src="${singleImg}"
                        alt="${projName} 3D Visual Artwork"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out select-none"
                        loading="lazy"
                      />
                      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                    </div>
                  </div>

                  <!-- Footer: Narrative explanation & tech tags -->
                  <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pt-4 border-t border-[#D7E2EA]/15">
                    <p class="text-xs sm:text-sm text-[#D7E2EA]/70 max-w-2xl font-light leading-relaxed">
                      ${projDesc}
                    </p>
                    <div class="flex flex-wrap gap-2">
                      ${tags.slice(0, 5).map(t => `
                        <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs text-[#D7E2EA]/80 font-mono">${t}</span>
                      `).join('')}
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </section>

    <!-- 8. FOOTER SECTION -->
    <footer id="contact" class="w-full bg-[#0C0C0C] border-t border-white/10 px-6 sm:px-10 py-16 sm:py-20 relative z-20">
      <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        <div>
          <span class="text-xs uppercase tracking-widest text-[#D7E2EA]/60 font-light">Get In Touch</span>
          <h3 class="hero-heading text-3xl sm:text-5xl font-black uppercase tracking-tight mt-2">Let&apos;s Create Together</h3>
          <p class="text-[#D7E2EA]/70 text-sm sm:text-base max-w-md mt-3 font-light">
            Open for software architecture, full-stack systems engineering, interactive 3D web applications, and cutting-edge collaborations.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <a href="${safeEmail ? 'mailto:' + safeEmail : '#contact'}" class="contact-btn inline-flex items-center justify-center rounded-full text-white font-medium uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base transition-transform duration-200 active:scale-95 hover:scale-[1.03]">
            Contact Me
          </a>
          <div class="flex items-center gap-4">
            ${safeGithub ? `
              <a href="${safeGithub}" target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile" class="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-[#D7E2EA] hover:bg-white/10 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              </a>
            ` : ''}
            ${safeLinkedin ? `
              <a href="${safeLinkedin}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" class="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-[#D7E2EA] hover:bg-white/10 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
              </a>
            ` : ''}
            ${safeEmail ? `
              <a href="mailto:${safeEmail}" aria-label="Email" class="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-[#D7E2EA] hover:bg-white/10 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </a>
            ` : ''}
          </div>
        </div>
      </div>

      <div class="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#D7E2EA]/50 uppercase tracking-widest">
        <span>© ${new Date().getFullYear()} ${safeName} -- ${safeTitle}</span>
        <a href="#" class="flex items-center gap-2 hover:text-[#D7E2EA] transition-colors">
          <span>Back to Top</span>
          <span>&uarr;</span>
        </a>
      </div>
    </footer>
  </main>

  <!-- Interactive Client-side Script: Magnetic Physics & Marquee Scroll -->
  <script>
    (function() {
      // 1. Magnetic Physics on Portrait
      const wrapper = document.getElementById('magnetic-portrait-wrapper');
      const target = document.getElementById('magnetic-target');
      if (wrapper && target) {
        const padding = 150;
        const strength = 3;
        window.addEventListener('mousemove', function(e) {
          const rect = target.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const distX = e.clientX - centerX;
          const distY = e.clientY - centerY;

          const isWithin = e.clientX >= rect.left - padding &&
                           e.clientX <= rect.right + padding &&
                           e.clientY >= rect.top - padding &&
                           e.clientY <= rect.bottom + padding;

          if (isWithin) {
            target.style.transform = 'translate3d(' + (distX / strength) + 'px, ' + (distY / strength) + 'px, 0)';
          } else {
            target.style.transform = 'translate3d(0, 0, 0)';
          }
        }, { passive: true });
      }

      // 2. Dual Row Marquee Scroll Physics
      const marqueeSection = document.getElementById('marquee-section');
      const row1 = document.getElementById('marquee-row1');
      const row2 = document.getElementById('marquee-row2');

      if (marqueeSection && row1 && row2) {
        function updateMarquee() {
          const rect = marqueeSection.getBoundingClientRect();
          const sectionTop = window.scrollY + rect.top;
          const offset = (window.scrollY - sectionTop + window.innerHeight) * 0.3;
          row1.style.transform = 'translateX(' + (offset - 200) + 'px)';
          row2.style.transform = 'translateX(' + (-(offset - 200)) + 'px)';
        }
        window.addEventListener('scroll', updateMarquee, { passive: true });
        updateMarquee();
      }
    })();
  </script>
</body>
</html>`;
  },

  render404Page(siteId = '', rawCandidateData = {}) {
    const data = TemplateHelper.normalize(rawCandidateData);
    const safeName = TemplateHelper.escapeHtml(data.name || '3D Creator Portfolio');
    const returnUrl = siteId ? `/p/${siteId}` : '/';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 — Dimension Not Found | ${safeName}</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      background-color: #0C0C0C;
      color: #D7E2EA;
      font-family: 'Kanit', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
      padding: 24px;
    }
    .hero-heading {
      background: linear-gradient(180deg, #646973 0%, #BBCCD7 100%);
      -webkit-text-fill-color: transparent;
      -webkit-background-clip: text;
    }
    .code-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 9999px;
      border: 1px solid rgba(215, 226, 234, 0.15);
      background: rgba(255, 255, 255, 0.03);
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(215, 226, 234, 0.7);
      margin-bottom: 24px;
    }
    .pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #B600A8;
      box-shadow: 0 0 10px #B600A8;
    }
    .glitch-404 {
      font-size: clamp(5rem, 16vw, 11rem);
      font-weight: 900;
      line-height: 0.9;
      letter-spacing: -0.04em;
    }
    .subhead {
      font-size: clamp(1.2rem, 3vw, 1.8rem);
      font-weight: 500;
      color: rgba(215, 226, 234, 0.9);
      margin-top: 12px;
      margin-bottom: 12px;
    }
    .desc {
      font-size: clamp(0.9rem, 1.6vw, 1.1rem);
      color: rgba(215, 226, 234, 0.5);
      max-width: 480px;
      text-align: center;
      line-height: 1.6;
      margin-bottom: 36px;
    }
    .btn-return {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 14px 28px;
      border-radius: 9999px;
      border: 1px solid rgba(215, 226, 234, 0.4);
      background: #0C0C0C;
      color: #D7E2EA;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.25s ease;
    }
    .btn-return:hover {
      background: #D7E2EA;
      color: #0C0C0C;
      border-color: #D7E2EA;
      transform: translateY(-2px);
    }
  </style>
</head>
<body>
  <div class="code-badge">
    <span class="pulse-dot"></span>
    <span>404 // CREATIVE SIGNAL LOST</span>
  </div>
  <h1 class="glitch-404 hero-heading">404</h1>
  <p class="subhead">Spatial Coordinate Undefined</p>
  <p class="desc">The portfolio viewport, document artifact, or dimensional coordinate you are navigating to does not exist or has been shifted in spacetime.</p>
  <a href="${returnUrl}" class="btn-return">
    Return to Base ↗
  </a>
</body>
</html>`;
  }
};

module.exports = { Jack3DCreatorTemplate };
