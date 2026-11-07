/**
 * Template: Kage Temple ("kage-temple" / "kage")
 * ThreeUI Kyoto Mountain Sanctuary & 3D Shinto Sanmon Engine
 * 
 * Aesthetic & Technical DNA:
 * - Color System:
 *     Background Void: #05070A (Ink)
 *     Raised Stone: #0A0E12 (Ink-2)
 *     Pale Sage / Bone: #DFE7E0
 *     Vermilion Accent: #E0231C
 *     Ember Glow: #FF5A3C
 *     Gold Runic Accent: #C9A24A
 * - Typography:
 *     Display & Wordmark: 'Wordmark', 'Onest' (Google Fonts, weights 300-700)
 *     Japanese Calligraphy: 'NotoJP'
 * - 3D Scene Architecture (WebGL / Three.js):
 *     Runtime procedural charred cypress wood pagoda (Sanmon)
 *     Kyoto stone lanterns with irregular guttering flame shaders
 *     Vermilion blood moon with atmospheric haze & craters
 *     Floating maple leaves with aerodynamic drag & 3D turbulence
 *     Multi-layer transparent foreground garden silhouettes (temple wall, pine bonsai, tall grass)
 * - 100% Dynamic Data Binding:
 *     Seamlessly binds candidate name, title, bio, projects, skills, metrics, and contacts.
 */

const fs = require('fs');
const path = require('path');
const { TemplateHelper } = require('../template-helper');

let cachedKageHtml = null;

function getBaseKageHtml() {
  if (cachedKageHtml) return cachedKageHtml;
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'landing-pages', 'kage.html'),
    path.join(process.cwd(), 'web', 'landing-pages', 'kage.html')
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      cachedKageHtml = fs.readFileSync(p, 'utf8');
      return cachedKageHtml;
    }
  }
  throw new Error('Base kage.html template not found in public/landing-pages/kage.html');
}

const KageTempleTemplate = {
  id: 'kage-temple',
  name: 'Kage Temple',
  category: 'Kyoto Mountain Temple 3D / Shinto Sanmon & Charred Cypress / Vermilion Moon',
  description: 'A five-chapter night walk through a Kyoto mountain temple. Charred cypress, lantern light, and a vermilion moon, rendered live in WebGL. Features interactive 3D temple gate, stone lanterns with flame shaders, blood moon atmospheric aura, and interactive foreground layers.',
  recommendedFor: [
    'Systems Engineers',
    'Creative Developers',
    'Game Engine & Spatial Computing Engineers',
    'Architects & 3D Artists',
    'Cryptographers & Security Engineers',
    'Founders who value deep craft, focus, and understated mastery'
  ],
  palette: ['#05070A', '#DFE7E0', '#E0231C', '#C9A24A'],
  thumbnail: '/assets/templates/kage-temple-hero.webp',

  render(rawCandidateData = {}, options = {}) {
    const data = TemplateHelper.normalize ? TemplateHelper.normalize(rawCandidateData) : rawCandidateData;
    const rawHtml = getBaseKageHtml();

    const name = TemplateHelper.escapeHtml(data.name || 'Master Craftsman');
    const role = TemplateHelper.escapeHtml(data.role || data.title || 'Systems Architect & Spatial Technologist');
    const bio = TemplateHelper.escapeHtml(
      data.bio ||
      data.about ||
      'Entering through quiet thresholds where ritual, craft, and architectural memory shape resilient distributed software.'
    );

    const email = TemplateHelper.escapeHtml(data.contact?.email || data.email || 'contact@myfolio.tech');
    const projects = Array.isArray(data.projects) && data.projects.length > 0 ? data.projects : [
      {
        name: 'Pass A Note',
        title: 'Pass A Note',
        description: 'End-to-end encrypted ephemeral messaging terminal with forward secrecy.',
        tags: ['WebCrypto', 'TypeScript', 'Zero-Knowledge'],
        link: 'https://github.com'
      },
      {
        name: 'Algorand Smart Contracts',
        title: 'Algorand Smart Contracts',
        description: 'Decentralized escrow and cryptographic ledger execution engine.',
        tags: ['Algorand', 'Python', 'Smart Contracts'],
        link: 'https://github.com'
      },
      {
        name: 'Autonomous Edge Agent',
        title: 'Autonomous Edge Agent',
        description: 'Sub-millisecond local neural inference node with streaming telemetry.',
        tags: ['Rust', 'ONNX', 'Edge AI'],
        link: 'https://github.com'
      },
      {
        name: 'AI Portfolio Generator',
        title: 'AI Portfolio Generator',
        description: 'Spatial WebGL portfolio synthesizer with continuous camera scrollytelling.',
        tags: ['Three.js', 'WebGL', 'GSAP'],
        link: 'https://github.com'
      }
    ];

    // Compute Wordmark: first name or concise brand acronym (3-6 chars)
    const firstName = (data.name || 'KAGE').trim().split(/\s+/)[0].toUpperCase();
    const wordmark = firstName.length >= 3 && firstName.length <= 6 ? firstName : 'KAGE';

    let html = rawHtml;

    // Ensure assets resolve correctly regardless of path depth
    html = html.replace(/href="secret-pathways-assets\//g, 'href="/landing-pages/secret-pathways-assets/');
    html = html.replace(/src="secret-pathways-assets\//g, 'src="/landing-pages/secret-pathways-assets/');
    html = html.replace(/url\('secret-pathways-assets\//g, "url('/landing-pages/secret-pathways-assets/");

    // Inject document title and description
    html = html.replace(
      /<title>.*?<\/title>/i,
      `<title>${name} — ${role}</title>`
    );
    html = html.replace(
      /<meta name="description" content=".*?">/i,
      `<meta name="description" content="${name} — ${role}. ${bio.slice(0, 150)}">`
    );

    // Inject custom wordmark configuration into the script
    const wordmarkInject = `<script>window.__KAGE_WORDMARK = ${JSON.stringify(wordmark)};</script>`;
    html = html.replace('<head>', `<head>\n${wordmarkInject}`);

    // Update Brand Name & Subtitle in Nav
    html = html.replace(
      /<div class="brand-tx">[\s\S]*?<\/div>/i,
      `<div class="brand-tx">
        <b>${name.toUpperCase()}</b>
        <i>${role.toUpperCase().slice(0, 24)}</i>
      </div>`
    );

    // Update Hero Chapter 00
    html = html.replace(
      /<div class="hero-top">[\s\S]*?<\/div>\s*<div class="hero-spacer">/i,
      `<div class="hero-top">
        <div class="eyebrow" data-rv="fade"><span class="dot"></span>${role}</div>
        <h1 class="display h-hero mask-line word-reveal" data-rv>
          <span>WHERE STILLNESS REVEALS THE UNSEEN.</span>
        </h1>
        <p class="body-lg hero-sub" data-rv="up">${bio}</p>
      </div>
      <div class="hero-spacer">`
    );

    // Update Wordmark Fallback
    html = html.replace(
      /<div class="word-fb" aria-hidden="true">.*?<\/div>/i,
      `<div class="word-fb" aria-hidden="true">${wordmark}</div>`
    );

    // Update Chapter Selector Chips in Hero (<div class="chapters" id="chips">...</div>)
    const chipsHtml = projects.slice(0, 4).map((p, idx) => {
      const pNum = String(idx + 1).padStart(2, '0');
      const pTitle = TemplateHelper.escapeHtml(p.name || p.title || `Chapter ${pNum}`);
      const pDesc = TemplateHelper.escapeHtml((p.description || p.desc || '').slice(0, 55));
      return `
      <div class="chip" data-chip="${idx}" data-rv="up" data-cursor>
        <span class="num">${pNum}</span>
        <span class="tx">
          <b>${pTitle}</b>
          <p>${pDesc || 'Architectural project case study'}</p>
        </span>
      </div>`;
    }).join('\n');

    html = html.replace(
      /<div class="chapters" id="chips">[\s\S]*?<\/div>\s*<\/div>\s*<a class="peek"/i,
      `<div class="chapters" id="chips">\n${chipsHtml}\n    </div>\n  </div>\n\n  <a class="peek"`
    );

    // Update Chapter I: The Gate (About / Metrics)
    const skillsList = Array.isArray(data.skills) ? data.skills : ['WebGL', 'Systems Architecture', 'Distributed Systems', 'Security'];
    const expCount = Array.isArray(data.experience) ? data.experience.length : 4;
    const projCount = projects.length;

    html = html.replace(
      /<div class="gate-grid">[\s\S]*?<div class="gate-stats"/i,
      `<div class="gate-grid">
        <div data-rv="up">
          <div class="eyebrow">Chapter 01 — The Threshold</div>
          <h2 class="display h-sec" style="margin-top:14px">${role.toUpperCase()}</h2>
        </div>
        <div class="gate-copy" data-rv="up">
          <p class="lead">${bio}</p>
          <p class="body">${skillsList.slice(0, 8).join(' · ')}</p>
          <a class="arrowlink" href="#pathways" data-cursor>
            <span>Explore Projects</span>
            <span class="ar">
              <svg viewBox="0 0 14 14" fill="none"><path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" stroke-width="1.3"/></svg>
            </span>
          </a>
        </div>
      </div>
      <div class="gate-stats"`
    );

    html = html.replace(
      /<div class="gate-stats" data-rv="up">[\s\S]*?<\/div>\s*<\/section>/i,
      `<div class="gate-stats" data-rv="up">
        <div><b>${projCount}+</b><span>Live Systems</span></div>
        <div><b>${skillsList.length}+</b><span>Core Domains</span></div>
        <div><b>${expCount * 2}+</b><span>Years Focus</span></div>
        <div><b>∞</b><span>Architectural Mastery</span></div>
      </div>
    </section>`
    );

    // Update Chapter II: Still Gardens (Project Showcase Cards - <div class="cards" id="cards">...</div>)
    const cardsStart = html.indexOf('class="cards" id="cards">');
    if (cardsStart !== -1) {
      const cardsSectionEnd = html.indexOf('</section>', cardsStart);
      if (cardsSectionEnd !== -1) {
        const cardsHtml = projects.slice(0, 3).map((p, idx) => {
          const pTitle = TemplateHelper.escapeHtml(p.name || p.title || `Project ${idx + 1}`);
          const pDesc = TemplateHelper.escapeHtml((p.description || p.desc || '').slice(0, 70));
          const pLink = TemplateHelper.sanitizeUrl(p.link || p.url || p.github || '#lessons');
          const jpGlyphs = ['風の庭', '影の道', '月の水'][idx % 3];
          const glowStyles = [
            '--gx:80.2%; --gy:23.9%; --gr:22%; --gt:6.1s; --gt2:9.7s; --gc1:rgba(255,142,108,.50); --gc2:rgba(212,56,38,.24)',
            '--gx:70.5%; --gy:47.2%; --gr:14%; --gt:3.7s; --gt2:5.3s; --gc1:rgba(255,198,124,.62); --gc2:rgba(226,118,40,.30)',
            '--gx:48.0%; --gy:16.8%; --gr:20%; --gt:7.3s; --gt2:11.2s; --gc1:rgba(255,138,104,.52); --gc2:rgba(208,54,36,.24)'
          ][idx % 3];
          const flameClass = idx === 1 ? ' glow--flame' : '';

          return `
    <a href="${pLink}" target="_blank" rel="noopener noreferrer" class="card" data-rv="up" data-view="${idx}" data-cursor style="text-decoration:none; color:inherit; display:block;">
      <div class="card-fr" data-frame>
        <span class="card-ar"><svg viewBox="0 0 14 14" fill="none"><path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" stroke-width="1.3"/></svg></span>
        <i class="glow${flameClass}" style="${glowStyles}"></i>
        <div class="card-lab"><b>${pTitle}</b><span class="jp">${jpGlyphs}</span></div>
      </div>
      <div class="card-meta"><span>${pDesc}</span><span>0${idx + 1} / 0${Math.min(projects.length, 3)}</span></div>
    </a>`;
        }).join('\n');

        html = html.slice(0, cardsStart + 'class="cards" id="cards">'.length) +
          '\n' + cardsHtml + '\n  </div>\n' +
          html.slice(cardsSectionEnd);
      }
    }

    // Update Chapter III: Sacred Craft (Curriculum / Project Ledger - <div class="cur" id="cur">...</div>)
    const curStart = html.indexOf('class="cur" id="cur">');
    if (curStart !== -1) {
      const curSectionEnd = html.indexOf('</section>', curStart);
      if (curSectionEnd !== -1) {
        const ledgerRows = projects.map((p, idx) => {
          const pNum = String(idx + 1).padStart(2, '0');
          const pTitle = TemplateHelper.escapeHtml(p.name || p.title || `System ${pNum}`);
          const pDesc = TemplateHelper.escapeHtml(p.description || p.desc || 'Technical case study and distributed software architecture.');
          const pTech = Array.isArray(p.tags) ? p.tags.join(' / ') : (p.tech || 'Production');
          const pLink = TemplateHelper.sanitizeUrl(p.link || p.url || p.github || '#eternity');
          const glyph = ['本殿', '庭園', '焼杉', '灯籠', '朱月', '玄門', '天守'][idx % 7];
          return `
    <a href="${pLink}" target="_blank" rel="noopener noreferrer" class="les" data-les="${idx}" data-cursor style="text-decoration:none; color:inherit; display:flex;">
      <span class="k">${pNum}</span>
      <h3>${pTitle}<em class="jp">${glyph}</em></h3>
      <p>${pDesc}</p>
      <span class="t">${pTech}</span><i class="bar"></i>
    </a>`;
        }).join('\n');

        html = html.slice(0, curStart + 'class="cur" id="cur">'.length) +
          '\n' + ledgerRows + '\n  </div>\n' +
          html.slice(curSectionEnd);
      }
    }

    // Update Chapter IV: Afterlight (Contact & CTA)
    html = html.replace(
      /<section class="sec fin" id="eternity" data-cam="4">[\s\S]*?<\/section>/i,
      `<section class="sec fin" id="eternity" data-cam="4">
        <div class="fg" data-fg="eternity" aria-hidden="true">
          <span class="fg-el fg-hill" data-fg-in="up">
            <img crossorigin="anonymous" src="/landing-pages/secret-pathways-assets/foreground/png/hill.webp" alt="Kyoto temple moss hill" width="1774" height="887" loading="lazy" decoding="async">
          </span>
          <span class="fg-el fg-ruins" data-fg-in="left">
            <img crossorigin="anonymous" src="/landing-pages/secret-pathways-assets/foreground/png/shrine-ruins.webp" alt="Ancient Torii shrine ruins" width="1536" height="1001" loading="lazy" decoding="async">
          </span>
          <span class="fg-el fg-grass" data-fg-in="up">
            <img crossorigin="anonymous" src="/landing-pages/secret-pathways-assets/foreground/png/tall-grass.webp" alt="Bowing bamboo tall grass" width="1717" height="916" loading="lazy" decoding="async">
          </span>
          <span class="fg-el fg-sakura" data-fg-in="left">
            <img crossorigin="anonymous" src="/landing-pages/secret-pathways-assets/foreground/png/sakura-branch.webp" alt="Flowering sakura blossom branch" width="1536" height="1024" loading="lazy" decoding="async">
          </span>
        </div>
        <div class="eyebrow" data-rv="fade">Chapter 04 — Afterlight</div>
        <h2 class="display" data-rv="up">INTO THE SILENCE</h2>
        <p class="body-lg" data-rv="up">The temple gates remain open. Explore technical architectures, review cryptographic source code, or initiate transmission.</p>
        <a class="cta" href="mailto:${email}" data-rv="fade" data-cursor>
          <i></i><span>Initiate Contact (${email})</span>
          <svg viewBox="0 0 14 14" fill="none" width="13" height="13"><path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" stroke-width="1.3"/></svg>
        </a>
      </section>`
    );

    // Update Footer Brand & Navigation
    html = html.replace(
      /<div class="foot-brand">[\s\S]*?<\/div>/i,
      `<div class="foot-brand">
        <svg viewBox="0 0 44 44" fill="none" width="34" height="34" aria-hidden="true">
          <circle cx="22" cy="25" r="8.6" fill="#e0231c" fill-opacity=".9"/>
          <path d="M5 13h34M9 18.4h26M22 8.5v27" stroke="#dfe7e0" stroke-width="1.5"/>
        </svg>
        <p>${name} — ${role}. Architectural 3D mountain sanctuary crafted with Three.js, WebGL & procedural PBR shaders.</p>
      </div>`
    );

    // Update Footer Coordinates & Base
    const curYear = new Date().getFullYear();
    html = html.replace(
      /<div class="foot-base">[\s\S]*?<\/div>/i,
      `<div class="foot-base">
        <span>© ${curYear} ${name} — All Rights Reserved</span>
        <span class="jp">静けさは一つの技である</span>
        <a href="https://myfolio.tech?ref=portfolio" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">WebGL · Kyoto Sanctuary · <strong style="text-decoration: underline;">MyFolio ✦</strong></a>
      </div>`
    );

    return {
      html,
      css: '',
      js: ''
    };
  },

  render404Page(siteId = '', candidateProfile = {}) {
    const name = TemplateHelper.escapeHtml(candidateProfile.name || 'Kyoto Temple');
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>404 — Waypoint Lost in Fog | ${name}</title>
  <link rel="stylesheet" href="/landing-pages/secret-pathways-assets/fonts.css">
  <style>
    body {
      margin: 0;
      background: #05070A;
      color: #DFE7E0;
      font-family: 'Onest', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 24px;
    }
    .num { font-size: clamp(64px, 12vw, 140px); font-weight: 300; color: #E0231C; letter-spacing: -0.04em; margin: 0; }
    h1 { font-size: clamp(24px, 4vw, 36px); font-weight: 400; margin: 12px 0; }
    p { color: #8F9A93; max-width: 42ch; line-height: 1.6; margin: 0 0 32px; }
    a {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 14px 28px;
      border: 1px solid rgba(223, 231, 224, 0.2);
      border-radius: 999px;
      color: #DFE7E0;
      text-decoration: none;
      font-size: 11px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      transition: all 0.3s ease;
    }
    a:hover { background: #DFE7E0; color: #05070A; }
  </style>
</head>
<body>
  <div class="num">404</div>
  <h1>SANCTUARY WAYPOINT LOST</h1>
  <p>The mountain mist has concealed this pathway. Return to the main gate to resume the journey.</p>
  <a href="/">Return to Main Gate</a>
</body>
</html>`;
  }
};

module.exports = {
  KageTempleTemplate
};
