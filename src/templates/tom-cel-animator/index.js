/**
 * Template: Tom 2D Cel Animation ("tom-cel-animator" / "tom" / "tom-animation")
 * Kinetic 2D Hand-Drawn Cartoon & Comic Newspaper Scrollytelling Engine
 * 
 * Aesthetic & Technical DNA:
 * - Color System:
 *     Warm Comic Newsprint: #F7F3EB / #ECE8E0
 *     Vintage Cherry Cartoon Red: #AC001E
 *     Slapstick Gold / Amber: #FFB702
 *     Charcoal Comic Ink / Borders: #31302B / #1C1C17
 *     Drop-Shadow Offset: 5px-8px solid offset ink shadow
 * - Typography:
 *     Display Masthead: 'Bricolage Grotesque' (Google Fonts, 700-800)
 *     Body & Dialogue: 'Space Grotesk' (Google Fonts, 400-700)
 *     Iconography: 'Material Symbols Outlined'
 * - Hero Scrollytelling Architecture (Apple Canvas-style):
 *     285-frame synchronized frame-by-frame HTML5 2D canvas scrub
 *     Tom & Jerry breaking through newspaper clipping with comic blast FX
 *     Preloaded batches with reduced-motion static fallback
 * - 100% Dynamic Candidate Data Binding:
 *     Binds candidate name, role, bio, projects, skills, metrics, and contacts cleanly.
 */

const fs = require('fs');
const path = require('path');
const { TemplateHelper } = require('../template-helper');
const { ProjectArtworkSynthesizer } = require('../project-artwork-synthesizer');

let cachedTomHtml = null;

function getBaseTomHtml() {
  if (cachedTomHtml) return cachedTomHtml;
  const possiblePaths = [
    path.join(process.cwd(), 'web', 'tom.html'),
    path.join(process.cwd(), 'public', 'tom.html'),
    path.join(process.cwd(), 'web', 'landing-pages', 'tom.html'),
    path.join(process.cwd(), 'public', 'landing-pages', 'tom.html')
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      cachedTomHtml = fs.readFileSync(p, 'utf8');
      return cachedTomHtml;
    }
  }
  throw new Error('Base tom.html template not found in web/tom.html');
}

const TomCelAnimatorTemplate = {
  id: 'tom-cel-animator',
  name: 'Tom 2D Cel Animation',
  category: '2D Hand-Drawn Cel Animation / Comic Editorial / Slapstick Frame-by-Frame',
  description: 'A kinetic 2D cartoon & cel animation editorial portfolio featuring high-speed 285-frame Apple canvas scrollytelling of Tom & Jerry tearing through newspaper, slapstick physics badges, comic strip process walk, and newspaper bento project showcase.',
  recommendedFor: [
    'Animators & Motion Designers',
    'Storyboard Artists & Illustrators',
    'Comic & Graphic Novel Artists',
    'Character Designers & Visual Development',
    'Game Cinematic & Creative Coders',
    'Founders & Artists crafting kinetic visual storytelling'
  ],
  palette: ['#F7F3EB', '#AC001E', '#FFB702', '#31302B'],
  thumbnail: '/assets/templates/tom-cel-animator-hero.webp',

  render(rawCandidateData = {}, options = {}) {
    const data = TemplateHelper.normalize ? TemplateHelper.normalize(rawCandidateData) : rawCandidateData;
    let html = getBaseTomHtml();

    const name = TemplateHelper.escapeHtml(data.name || 'Felix Vance');
    const role = TemplateHelper.escapeHtml(data.role || data.title || 'Original Cel Animator & Storyboarder');
    const bio = TemplateHelper.escapeHtml(
      data.bio ||
      data.about ||
      'Senior Character Animator, Storyboard Artist, and Comic Illustrator crafting slapstick physics, lovable troublemakers, and kinetic hand-drawn storytelling for feature films, episodic broadcast, and indie game cinematics.'
    );
    const email = TemplateHelper.escapeHtml(data.contact?.email || data.email || 'contact@myfolio.tech');
    const location = TemplateHelper.escapeHtml(data.location || 'Vancouver & Remote Worldwide');
    const github = data.contact?.github || data.github || 'https://github.com/Abdul-Aziz-Nooruddin';
    const linkedin = data.contact?.linkedin || data.linkedin || 'https://linkedin.com';
    const website = data.website || 'https://myfolio.tech';

    // 1. Title & Meta
    html = html.replace(/<title>.*?<\/title>/gi, `<title>${name} | ${role}</title>`);

    // 2. Name replacement across template
    html = html.replace(/Felix Vance/g, name);

    // 3. Status Marquee
    html = html.replace(/Booking Q3\/Q4 2025 • Open for Select Feature, Episodic &amp; Commercial Inquiries/g, `Available for New Projects • ${role}`);
    html = html.replace(/Based in Vancouver &amp; Remote Worldwide/g, `Based in ${location}`);

    // 4. Hero Copy
    html = html.replace(/Original Cel Animator &amp; Storyboarder/g, role);
    html = html.replace(
      /Senior Character Animator, Storyboard Artist, and Comic Illustrator crafting slapstick physics, lovable troublemakers, and kinetic hand-drawn storytelling for feature films, episodic broadcast, and indie game cinematics\./g,
      bio
    );

    // 5. Dynamic Projects Integration (if candidate has projects)
    if (Array.isArray(data.projects) && data.projects.length > 0) {
      const projectItems = data.projects.slice(0, 4);
      const usedSet = new Set();
      
      const projectCardsHtml = projectItems.map((p, idx) => {
        const pTitle = TemplateHelper.escapeHtml(p.title || p.name || `Production Sequence 0${idx + 1}`);
        const pDesc = TemplateHelper.escapeHtml(p.description || p.desc || 'High-fidelity animated sequence engineered with kinetic comic timing charts.');
        const pTags = Array.isArray(p.tags) && p.tags.length > 0 
          ? p.tags 
          : (Array.isArray(p.tech) ? p.tech : ['24fps Cel', 'Clean-Up Inking', 'Storyboarding']);
        const pLink = p.link || p.url || p.github || '#';
        const colSpan = idx % 2 === 0 ? 'lg:col-span-7' : 'lg:col-span-5';

        // Resolve relevant visual
        let artSrc = `/assets/templates/tom/images/tom-asset-${(idx % 4) + 1}.jpg`;
        try {
          const art = ProjectArtworkSynthesizer.resolveProjectArtwork(p, 'jack-3d-creator', idx, usedSet, name);
          if (art && art.src) artSrc = art.src;
        } catch (e) {}

        const tagsPills = pTags.slice(0, 3).map(t => 
          `<span class="font-caption text-caption px-2 py-0.5 bg-surface-container text-on-surface border border-inverse-surface uppercase">${TemplateHelper.escapeHtml(t)}</span>`
        ).join('\n');

        return `
        <div class="${colSpan} bg-surface border-[3px] border-inverse-surface shadow-[6px_6px_0px_#31302b] flex flex-col group hover:-translate-y-1 transition-transform">
          <div class="relative aspect-[16/10] overflow-hidden border-b-[3px] border-inverse-surface bg-surface-container-high">
            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${artSrc}" alt="${pTitle}">
            <div class="absolute top-3 left-3 bg-secondary-container text-on-secondary-container font-label-badge text-caption uppercase px-2 py-1 border-2 border-inverse-surface shadow-[2px_2px_0px_#31302b]">
              REEL // 0${idx + 1}
            </div>
          </div>
          <div class="p-space-md flex flex-col flex-1 justify-between gap-space-sm">
            <div>
              <div class="flex flex-wrap items-center gap-space-xs mb-2">
                ${tagsPills}
              </div>
              <h3 class="font-headline-sm text-headline-sm uppercase text-on-surface">${pTitle}</h3>
              <p class="font-body-md text-body-md text-on-surface-variant mt-2">${pDesc}</p>
            </div>
            <div class="pt-space-sm border-t border-outline-variant flex items-center justify-between">
              <span class="font-caption text-caption text-on-surface-variant uppercase font-bold">Folio Production Verified</span>
              <a class="inline-flex items-center gap-1 font-label-badge text-caption uppercase text-primary font-bold hover:underline" href="${pLink}" target="_blank" rel="noopener noreferrer">
                <span>Inspect Artwork</span>
                <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
        `;
      }).join('\n');

      // Replace the grid container in Section 2
      const gridMarkerStart = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-space-lg">';
      const gridIdx = html.indexOf(gridMarkerStart);
      if (gridIdx !== -1) {
        const nextSectionIdx = html.indexOf('</section>', gridIdx);
        if (nextSectionIdx !== -1) {
          const containerClosing = html.lastIndexOf('</div>', nextSectionIdx);
          const gridClosing = html.lastIndexOf('</div>', containerClosing - 1);
          if (gridClosing !== -1) {
            html = html.substring(0, gridIdx) + 
              `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-space-lg">\n${projectCardsHtml}\n</div>` + 
              html.substring(gridClosing + 6);
          }
        }
      }
    }

    // 6. Contact and Links
    html = html.replace(
      /<span>NDA-ready\. Direct line to senior animator desk\. No agency markup\.<\/span>/g,
      `<span>Direct line: <a href="mailto:${email}" class="text-primary font-bold hover:underline">${email}</a> • NDA-ready senior desk.</span>`
    );
    html = html.replace(/href=\"mailto:[^\"]*\"/g, `href="mailto:${email}"`);
    html = html.replace(/producer@syndicate-studios\.com/g, email);
    html = html.replace(/https:\/\/github\.com[^\"]*/g, github);

    return html;
  },

  render404Page(siteId = 'unknown') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>PRESS STOPPED // 404 — Edition Missing</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #F7F3EB;
      color: #31302B;
      font-family: 'Space Grotesk', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background-image: radial-gradient(#1c1c17 1px, transparent 1px);
      background-size: 14px 14px;
    }
    .comic-box {
      max-width: 640px;
      width: 100%;
      background: #FFFFFF;
      border: 3px solid #31302B;
      box-shadow: 8px 8px 0px #31302B;
      padding: 36px;
      text-align: center;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: #AC001E;
      color: #FFFFFF;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.1em;
      border: 2px solid #31302B;
      box-shadow: 2px 2px 0px #31302B;
      margin-bottom: 20px;
    }
    h1 {
      font-family: 'Bricolage Grotesque', sans-serif;
      font-size: clamp(2rem, 5vw, 3.2rem);
      text-transform: uppercase;
      line-height: 1.05;
      margin-bottom: 16px;
    }
    p {
      color: #5D3F3D;
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 28px;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background: #FFB702;
      color: #31302B;
      font-weight: 700;
      text-transform: uppercase;
      text-decoration: none;
      border: 3px solid #31302B;
      box-shadow: 4px 4px 0px #31302B;
      transition: all 0.15s ease;
    }
    .btn:hover {
      box-shadow: 6px 6px 0px #31302B;
      transform: translate(-1px, -1px);
    }
  </style>
</head>
<body>
  <div class="comic-box">
    <span class="badge">SYNDICATE TRANSMISSION ERROR</span>
    <h1>EXTRA! EXTRA! 404 // ISSUE NOT FOUND</h1>
    <p>The newspaper edition for portfolio <strong>${TemplateHelper.escapeHtml(siteId)}</strong> has not rolled off the printing press yet or was recalled by the ink editors.</p>
    <a href="https://www.myfolio.tech" class="btn">&larr; Return to Studio Headquarters</a>
  </div>
</body>
</html>`;
  }
};

module.exports = { TomCelAnimatorTemplate };
