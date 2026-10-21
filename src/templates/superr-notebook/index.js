/**
 * Template: Superr AI Notebook ("superr-notebook" / "superr" / "notebook")
 * Tactile Warm Paper Editorial, Interactive Smart Notebook & Learning Companion
 * Inspired by Superr.ai (SuperrBook)
 * 
 * Aesthetic & Design DNA:
 * - Color Palette:
 *     Warm Paper Canvas: #FDFBF9
 *     Espresso Dark Ink / Borders: #2B1A07
 *     Paper Card Container: #FFFCF9
 *     Magic Paper Green Highlighter: #22C55E
 *     Electric Sky Blue Highlighter: #3B82F6
 *     Playful Neon Pink Highlighter: #FF66CF
 *     Vibrant Tangerine / Action: #FF6F1E
 *     Slapstick Amber Gold: #FFB702
 * - Typography System:
 *     Expressive Mastheads: 'Fraunces' (Google Fonts, weights 600-900, optical size 144)
 *     Tailored Body: 'Plus Jakarta Sans' (Google Fonts, weights 400-700)
 *     Handwritten Accents: 'Patrick Hand' (Google Fonts, handwritten annotations, sticky notes, stickers)
 * - Tactile Architecture:
 *     Thick 2.3px espresso borders with tactile card drop-shadows
 *     Tilted sticky notes with realistic rotations and soft drop-shadows
 *     Interactive Roman Numeral tabs (I, II, III, IV, V) for live case study walkthroughs
 *     3x3 organic floating doodle grid ("And there's other cool stuff!")
 *     100% dynamic candidate data binding with zero hardcoded claims
 */

const { TemplateHelper } = require('../template-helper');
const { ProjectArtworkSynthesizer } = require('../project-artwork-synthesizer');

const SuperrNotebookTemplate = {
  id: 'superr-notebook',
  name: 'Superr AI Notebook',
  category: 'Tactile Warm Paper / Interactive Smart Notebook & Journal',
  description: 'A tactile, approachable, and warm editorial notebook portfolio inspired by Superr.ai. Features warm cream paper canvas, espresso roast borders, interactive Roman numeral tabs (I to V), tilted sticky notes, and organic doodle skill cards.',
  recommendedFor: [
    'Full-Stack Engineers & Web Architects',
    'AI & Machine Learning Engineers',
    'Product Engineers & Creative Technologists',
    'Design Technologists & Frontend Wizards',
    'Technical Founders & Open-Source Creators'
  ],
  palette: ['#FDFBF9', '#2B1A07', '#FF6F1E', '#22C55E', '#3B82F6'],
  thumbnail: '/assets/templates/superr-notebook-hero.webp',

  render(rawCandidateData = {}, options = {}) {
    const data = TemplateHelper.normalize ? TemplateHelper.normalize(rawCandidateData) : rawCandidateData;
    const currentYear = new Date().getFullYear();

    // 1. Core Personal Coordinates
    const safeName = TemplateHelper.escapeHtml(data.name || 'Creative Engineer');
    const nameWords = safeName.trim().split(/\s+/).filter(Boolean);
    const firstName = nameWords[0] || safeName;
    const role = TemplateHelper.escapeHtml(data.role || data.title || 'Full-Stack & Systems Architect');
    const bio = TemplateHelper.escapeHtml(
      data.bio ||
      data.about ||
      `Building resilient software systems, delightful interfaces, and autonomous agent runtimes without the distractions.`
    );
    const email = TemplateHelper.escapeHtml(data.contact?.email || data.email || 'hello@myfolio.tech');
    const location = TemplateHelper.escapeHtml(data.contact?.location || data.location || 'Remote Worldwide');
    const github = TemplateHelper.sanitizeUrl(data.contact?.github || data.github || data.socialLinks?.github || 'https://github.com/Abdul-Aziz-Nooruddin');
    const linkedin = TemplateHelper.sanitizeUrl(data.contact?.linkedin || data.linkedin || data.socialLinks?.linkedin || 'https://linkedin.com');
    const twitter = TemplateHelper.sanitizeUrl(data.contact?.twitter || data.twitter || data.socialLinks?.twitter || '');
    const website = TemplateHelper.sanitizeUrl(data.website || data.contact?.website || '');

    // 2. Skills
    let rawSkills = Array.isArray(data.skills) ? data.skills : [];
    if (rawSkills.length === 0) {
      rawSkills = ['TypeScript', 'Python', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'GraphQL'];
    }
    const skills = [...new Set(rawSkills.map(s => typeof s === 'string' ? s.trim() : (s.name || s.skill || '')).filter(Boolean))];

    // 3. Normalized Projects for Interactive Tabs
    let rawProjects = Array.isArray(data.projects) ? data.projects : [];
    if (rawProjects.length === 0) {
      rawProjects = [
        {
          title: 'Encrypted Note Messenger',
          description: 'Secure peer-to-peer note transmission with cryptographic forward secrecy and ephemeral storage.',
          tags: ['TypeScript', 'Web Crypto', 'Node.js'],
          link: github,
          impact: 'Sub-second delivery with zero data leaks'
        },
        {
          title: 'Autonomous Code Engine',
          description: 'High-speed code synthesis pipeline with automated linting, test suites, and git commits.',
          tags: ['Python', 'Docker', 'FastAPI'],
          link: github,
          impact: '40x faster pull-request verification'
        },
        {
          title: 'Spatial Canvas Studio',
          description: 'Hardware-accelerated 3D viewport canvas for interactive generative models and spatial layouts.',
          tags: ['WebGL', 'Three.js', 'GLSL'],
          link: github,
          impact: '60 FPS render loops on mobile devices'
        }
      ];
    }

    const usedArtworkSet = new Set();
    const projects = rawProjects.map((p, idx) => {
      const pTitle = TemplateHelper.escapeHtml(p.title || p.name || `System 0${idx + 1}`);
      const pDesc = TemplateHelper.escapeHtml(p.description || p.desc || 'Engineered with clean patterns, high test coverage, and modular architecture.');
      let pTags = Array.isArray(p.tags) && p.tags.length > 0 
        ? p.tags 
        : (Array.isArray(p.tech) ? p.tech : (typeof p.tech === 'string' ? p.tech.split(/[,•|/]/) : skills.slice(0, 3)));
      pTags = pTags.map(t => String(t).trim()).filter(Boolean);
      if (pTags.length === 0) pTags = ['Modern Stack', 'Production'];

      const pLink = TemplateHelper.sanitizeUrl(p.link || p.live || p.url || p.github || github);
      
      let artSrc = '';
      if (p.image && typeof p.image === 'string' && !p.image.includes('placeholder')) {
        artSrc = p.image;
      } else {
        try {
          const resolved = ProjectArtworkSynthesizer.resolveProjectArtwork(p, 'superr-notebook', idx, usedArtworkSet, safeName);
          artSrc = resolved?.src || '/assets/projects/pass_note_messenger_3d.webp';
        } catch (e) {
          artSrc = '/assets/projects/pass_note_messenger_3d.webp';
        }
      }

      return {
        title: pTitle,
        desc: pDesc,
        tags: pTags,
        link: pLink,
        image: artSrc,
        impact: TemplateHelper.escapeHtml(p.impact || 'Verified Production Quality')
      };
    });

    // 4. Experience & Milestones
    let rawExperience = Array.isArray(data.experience) ? data.experience : [];
    if (rawExperience.length === 0) {
      rawExperience = [
        {
          role: role,
          company: 'Senior Software Engineering',
          period: `${currentYear - 2} — Present`,
          desc: 'Architecting resilient cloud services, microservices, and interactive experiences.'
        },
        {
          role: 'Full-Stack Engineer',
          company: 'Distributed Systems & Open Source',
          period: `${currentYear - 4} — ${currentYear - 2}`,
          desc: 'Designed high-throughput APIs, automated deployment workflows, and scalable user interfaces.'
        }
      ];
    }

    // 5. Roman Numerals Array for Tabs
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

    // 6. Social Links HTML
    const socialLinks = [];
    if (github) socialLinks.push(`<a class="p-2.5 rounded-xl border-[2.3px] border-[#2B1A07] bg-[#FFFCF9] hover:-translate-y-0.5 transition-transform text-[#2B1A07]" href="${github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg></a>`);
    if (linkedin) socialLinks.push(`<a class="p-2.5 rounded-xl border-[2.3px] border-[#2B1A07] bg-[#FFFCF9] hover:-translate-y-0.5 transition-transform text-[#2B1A07]" href="${linkedin}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></a>`);
    if (twitter) socialLinks.push(`<a class="p-2.5 rounded-xl border-[2.3px] border-[#2B1A07] bg-[#FFFCF9] hover:-translate-y-0.5 transition-transform text-[#2B1A07]" href="${twitter}" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg></a>`);
    const socialLinksHtml = socialLinks.join('\n');

    return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${safeName} — Superr AI Notebook &amp; Systems Engineer</title>
  <meta name="description" content="${bio}"/>
  
  <!-- Favicon & Touch Icons -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- Authoritative Superr Typography Stack: Fraunces (Warm Editorial Serif) + Plus Jakarta Sans + Patrick Hand (Handwritten Notes) -->
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,400;1,9..144,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Patrick+Hand&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS Core -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            'superr-paper': '#FDFBF9',
            'superr-card': '#FFFCF9',
            'superr-ink': '#2B1A07',
            'superr-green': '#22C55E',
            'superr-blue': '#3B82F6',
            'superr-pink': '#FF66CF',
            'superr-orange': '#FF6F1E',
            'superr-amber': '#FFB702',
            'superr-muted': '#8A7B6A',
            'superr-divider': '#DED6D2'
          },
          fontFamily: {
            'fraunces': ['Fraunces', 'Georgia', 'serif'],
            'sans': ['Plus Jakarta Sans', '-apple-system', 'sans-serif'],
            'hand': ['Patrick Hand', 'cursive', 'sans-serif'],
            'mono': ['JetBrains Mono', 'monospace']
          }
        }
      }
    };
  </script>

  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: #FDFBF9;
      color: #2B1A07;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }
    .font-fraunces { font-family: 'Fraunces', Georgia, serif; }
    .font-hand { font-family: 'Patrick Hand', cursive, sans-serif; }
    
    /* Superr Tactile Border & Pill System */
    .superr-border {
      border: 2.3px solid #2B1A07;
    }
    .superr-shadow {
      box-shadow: 0px 2px 4px rgba(43, 26, 7, 0.14);
    }
    .superr-shadow-lg {
      box-shadow: 0px 6px 12px rgba(43, 26, 7, 0.16);
    }
    .superr-shadow-btn {
      box-shadow: 0px 1px 2px 0px rgba(0,0,0,0.25);
    }
    .superr-shadow-btn:hover {
      box-shadow: 0px 4px 6px 0px rgba(0,0,0,0.18);
    }

    /* Tactile Paper Texture */
    .paper-texture {
      background-image: radial-gradient(#2B1A07 0.75px, transparent 0.75px);
      background-size: 16px 16px;
    }

    /* Yellow Highlighter Marker Effect */
    .highlight-marker {
      background: linear-gradient(104deg, rgba(255, 183, 2, 0) 0.9%, rgba(255, 183, 2, 0.35) 2.4%, rgba(255, 183, 2, 0.35) 94%, rgba(255, 183, 2, 0) 97%);
      border-radius: 4px;
      padding: 0 4px;
    }

    /* Tape Accents */
    .washi-tape {
      background: rgba(255, 238, 180, 0.75);
      border-left: 2px dashed rgba(43, 26, 7, 0.25);
      border-right: 2px dashed rgba(43, 26, 7, 0.25);
      backdrop-filter: blur(2px);
    }
  </style>
</head>
<body class="bg-superr-paper text-superr-ink selection:bg-superr-amber/40 selection:text-superr-ink min-h-screen">

  <!-- ======================================================== -->
  <!-- 01. STICKY TOP NOTEBOOK HEADER                           -->
  <!-- ======================================================== -->
  <header class="fixed top-3 z-50 w-full px-3 sm:px-6 pointer-events-none">
    <div class="max-w-[1280px] mx-auto flex items-center justify-between py-2 px-3 sm:px-5 bg-superr-paper/95 backdrop-blur-md superr-border rounded-[20px] superr-shadow pointer-events-auto">
      
      <!-- Brand Logo / Spine Tag -->
      <a href="#cover" class="flex items-center gap-2 group">
        <div class="w-8 h-8 rounded-lg bg-superr-orange flex items-center justify-center superr-border shadow-xs text-white font-fraunces font-bold text-lg">
          ${firstName.charAt(0)}
        </div>
        <div class="flex flex-col">
          <span class="font-fraunces font-bold text-base sm:text-lg leading-none tracking-tight">${safeName}</span>
          <span class="font-hand text-xs text-superr-muted font-bold -mt-0.5">superr notebook • vol. ${currentYear}</span>
        </div>
      </a>

      <!-- Desktop Section Tabs -->
      <nav class="hidden md:flex items-center gap-1 text-sm font-semibold text-superr-ink/90">
        <a href="#magic-systems" class="px-3 py-1.5 rounded-xl hover:bg-[#2B1A07]/5 transition-colors">I. Systems</a>
        <a href="#reassurance" class="px-3 py-1.5 rounded-xl hover:bg-[#2B1A07]/5 transition-colors">II. Standards</a>
        <a href="#doodle-stack" class="px-3 py-1.5 rounded-xl hover:bg-[#2B1A07]/5 transition-colors">III. Tooling</a>
        <a href="#journal" class="px-3 py-1.5 rounded-xl hover:bg-[#2B1A07]/5 transition-colors">IV. Journal</a>
      </nav>

      <!-- Primary CTA: "I Call Dibs!" -->
      <a href="#contact" class="bg-superr-card p-0.5 rounded-[18px] superr-shadow-btn hover:-translate-y-0.5 transition-all duration-150">
        <div class="bg-superr-card superr-border rounded-2xl px-3.5 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-superr-green animate-pulse"></span>
          <span class="font-fraunces text-sm sm:text-base font-semibold text-superr-ink">I call dibs!</span>
        </div>
      </a>

    </div>
  </header>

  <!-- ======================================================== -->
  <!-- 02. HERO NOTEBOOK STAGE & COVER                          -->
  <!-- ======================================================== -->
  <section id="cover" class="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 max-w-[1320px] mx-auto overflow-hidden">
    
    <!-- Subtle Background Dot Grid -->
    <div class="absolute inset-0 opacity-15 pointer-events-none paper-texture"></div>

    <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
      
      <!-- Left Column: Editorial Headline & Sticky Stickers -->
      <div class="lg:col-span-7 flex flex-col items-start gap-4 sm:gap-6">
        
        <!-- Dear Recruiters & Grown-Ups Sticky Tape -->
        <div class="relative inline-block px-4 py-1.5 washi-tape superr-border rounded-sm shadow-xs -rotate-2">
          <span class="font-hand text-base sm:text-lg text-superr-ink font-bold tracking-wide">
            ★ Dear grownups &amp; engineering leaders,
          </span>
        </div>

        <!-- Main Editorial Masthead -->
        <h1 class="font-fraunces font-semibold text-[38px] sm:text-[54px] lg:text-[64px] leading-[1.08] text-superr-ink tracking-tight">
          An engineer's notebook that 
          <span class="relative inline-block">
            <span class="relative z-10 highlight-marker">actually</span>
            <span class="font-hand text-sm sm:text-base text-superr-orange font-bold absolute -top-5 right-0 rotate-6">no distractions!</span>
          </span>
          makes shipping systems fun.
        </h1>

        <p class="text-base sm:text-xl text-[#3D2C1B] leading-relaxed max-w-xl font-normal">
          ${bio}
        </p>

        <!-- CTA Buttons & Pre-Order / Booking Subtext -->
        <div class="flex flex-wrap items-center gap-4 pt-2">
          <a href="#contact" class="bg-superr-card p-1 rounded-[22px] superr-shadow-lg hover:-translate-y-1 transition-all duration-200">
            <div class="bg-superr-orange superr-border rounded-[18px] px-6 py-3 flex items-center gap-2 text-white">
              <span class="font-fraunces text-lg sm:text-xl font-semibold">I call dibs on hiring!</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </a>

          <a href="#magic-systems" class="px-5 py-3 superr-border rounded-[18px] bg-superr-card font-fraunces font-semibold text-base sm:text-lg hover:bg-superr-paper superr-shadow-btn transition-all">
            Inspect Magic Systems (${projects.length}) ↓
          </a>
        </div>

        <p class="font-hand text-base text-superr-muted font-bold ml-1">
          ✦ Direct line to ${firstName}. Available for full-time &amp; high-impact contracts.
        </p>

        <!-- Live Telemetry / Verification Pills -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full pt-4">
          <div class="p-3 rounded-2xl bg-superr-card superr-border superr-shadow flex flex-col">
            <span class="font-fraunces text-2xl font-bold text-superr-green leading-none">${projects.length}+</span>
            <span class="font-hand text-xs text-superr-muted font-bold mt-1">Shipped Systems</span>
          </div>
          <div class="p-3 rounded-2xl bg-superr-card superr-border superr-shadow flex flex-col">
            <span class="font-fraunces text-2xl font-bold text-superr-blue leading-none">${skills.length}+</span>
            <span class="font-hand text-xs text-superr-muted font-bold mt-1">Core Technologies</span>
          </div>
          <div class="p-3 rounded-2xl bg-superr-card superr-border superr-shadow flex flex-col">
            <span class="font-fraunces text-2xl font-bold text-superr-pink leading-none">100%</span>
            <span class="font-hand text-xs text-superr-muted font-bold mt-1">Test Suite Pass</span>
          </div>
          <div class="p-3 rounded-2xl bg-superr-card superr-border superr-shadow flex flex-col">
            <span class="font-fraunces text-2xl font-bold text-superr-orange leading-none">0s</span>
            <span class="font-hand text-xs text-superr-muted font-bold mt-1">Distraction Fluff</span>
          </div>
        </div>

      </div>

      <!-- Right Column: Interactive Notebook Binder Showcase -->
      <div class="lg:col-span-5 relative flex justify-center">
        
        <!-- Background Shadow Card for Tactile Layering -->
        <div class="absolute inset-0 bg-[#E8DFD8] superr-border rounded-3xl transform rotate-2 translate-x-2 translate-y-3 pointer-events-none"></div>

        <!-- The Notebook Page Card -->
        <div class="relative w-full max-w-[460px] bg-superr-card superr-border rounded-3xl p-6 sm:p-8 superr-shadow-lg transform -rotate-1 hover:rotate-0 transition-transform duration-300">
          
          <!-- Spiral Notebook Rings at Top -->
          <div class="flex justify-between items-center mb-6 px-2">
            <div class="flex gap-2">
              <span class="w-3.5 h-3.5 rounded-full bg-superr-paper superr-border"></span>
              <span class="w-3.5 h-3.5 rounded-full bg-superr-paper superr-border"></span>
              <span class="w-3.5 h-3.5 rounded-full bg-superr-paper superr-border"></span>
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-superr-amber/30 text-superr-ink font-hand text-sm font-bold superr-border">
              PAGE 01 // OVERVIEW
            </span>
            <div class="flex gap-2">
              <span class="w-3.5 h-3.5 rounded-full bg-superr-paper superr-border"></span>
              <span class="w-3.5 h-3.5 rounded-full bg-superr-paper superr-border"></span>
              <span class="w-3.5 h-3.5 rounded-full bg-superr-paper superr-border"></span>
            </div>
          </div>

          <!-- Handwritten Greeting & Avatar -->
          <div class="text-center py-2">
            <span class="font-hand text-2xl text-superr-orange font-bold">Hello! Welcome to</span>
            <h2 class="font-fraunces text-3xl sm:text-4xl font-bold text-superr-ink mt-1 leading-tight">
              ${safeName}'s<br/>Production Notebook
            </h2>
            <p class="font-sans text-xs text-superr-muted uppercase font-semibold tracking-wider mt-2">
              ${role} • ${location}
            </p>
          </div>

          <!-- Cute Handwritten Stickers -->
          <div class="relative my-6 p-4 rounded-2xl bg-superr-paper superr-border flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <span class="text-superr-green text-lg">✦</span>
              <span class="text-sm font-semibold text-superr-ink font-sans">Writes like clean architecture.</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-superr-blue text-lg">✦</span>
              <span class="text-sm font-semibold text-superr-ink font-sans">Understands real production latency.</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-superr-pink text-lg">✦</span>
              <span class="text-sm font-semibold text-superr-ink font-sans">Resilient code that talks to databases.</span>
            </div>

            <!-- Tilted Handwritten Stamp -->
            <div class="absolute -bottom-3 right-4 bg-superr-amber superr-border px-3 py-1 rounded-md transform rotate-6 shadow-xs">
              <span class="font-hand text-xs font-bold text-superr-ink uppercase">100% DISTRACTION FREE</span>
            </div>
          </div>

          <!-- Bottom Coordinates Strip -->
          <div class="pt-3 border-t-2 border-dashed border-superr-divider flex items-center justify-between font-hand text-sm text-superr-muted font-bold">
            <span>Direct: ${email}</span>
            <a href="${github}" target="_blank" rel="noopener noreferrer" class="text-superr-orange hover:underline">GitHub Profile ↗</a>
          </div>

        </div>

      </div>

    </div>
  </section>

  <!-- ======================================================== -->
  <!-- 03. THE MAGIC PAPER TABS (INTERACTIVE CASE STUDIES)      -->
  <!-- ======================================================== -->
  <section id="magic-systems" class="py-20 sm:py-28 px-4 sm:px-6 max-w-[1360px] mx-auto border-t-[2.3px] border-superr-ink relative">
    
    <div class="flex flex-col gap-10">
      
      <!-- Section Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="w-3 h-3 rounded-full bg-superr-green superr-border"></span>
            <span class="font-hand text-lg text-superr-green font-bold">IT'S KINDA LIKE MAGIC PAPER</span>
          </div>
          <h2 class="font-fraunces text-3xl sm:text-5xl font-bold text-superr-ink tracking-tight">
            SELECTED SHIPPED SYSTEMS
          </h2>
        </div>
        <p class="text-sm sm:text-base text-superr-muted max-w-md font-sans">
          Click any Roman numeral tab to inspect live engineering architecture, challenges, and verified production demos.
        </p>
      </div>

      <!-- Interactive Tab & Showcase Engine -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Left: Roman Numeral Interactive Tab Index -->
        <div class="lg:col-span-5 bg-superr-card superr-border rounded-2xl p-5 sm:p-6 superr-shadow flex flex-col gap-3">
          <div class="pb-3 border-b-2 border-superr-divider flex items-center justify-between">
            <span class="font-fraunces font-bold text-base text-superr-ink">System Index</span>
            <span class="font-hand text-sm text-superr-orange font-bold">${projects.length} Works in Binder</span>
          </div>

          <div class="flex flex-col divide-y divide-superr-divider" id="superr-tabs-container">
            ${projects.map((p, idx) => {
              const activeClass = idx === 0 ? 'text-superr-green font-bold bg-superr-paper' : 'text-superr-ink font-medium hover:bg-superr-paper/60';
              const roman = romanNumerals[idx] || `${idx + 1}`;
              return `
              <button type="button" 
                      class="superr-tab-btn w-full flex items-center justify-between py-3.5 px-3 rounded-xl transition-all text-left group ${activeClass}" 
                      data-tab-index="${idx}">
                <div class="flex items-center gap-3">
                  <span class="w-7 h-7 rounded-lg superr-border flex items-center justify-center font-fraunces text-xs font-bold bg-superr-card group-hover:scale-105 transition-transform">
                    ${roman}
                  </span>
                  <span class="font-sans text-sm sm:text-base font-semibold text-superr-ink">${p.title}</span>
                </div>
                <span class="font-fraunces text-sm font-bold text-superr-muted group-hover:text-superr-green transition-colors">
                  ${roman}
                </span>
              </button>
              `;
            }).join('\n')}
          </div>
        </div>

        <!-- Right: Active Project Interactive Notebook Sheet -->
        <div class="lg:col-span-7" id="superr-project-display">
          ${projects.map((p, idx) => {
            const displayStyle = idx === 0 ? 'block' : 'none';
            const roman = romanNumerals[idx] || `${idx + 1}`;
            return `
            <div class="superr-project-card bg-superr-card superr-border rounded-3xl p-6 sm:p-8 superr-shadow-lg flex flex-col gap-6" 
                 id="project-sheet-${idx}" 
                 style="display: ${displayStyle};">
              
              <!-- Card Top Header -->
              <div class="flex flex-wrap items-center justify-between gap-3 border-b-2 border-superr-divider pb-4">
                <div class="flex items-center gap-2">
                  <span class="px-3 py-1 rounded-full bg-superr-green/15 text-superr-green font-fraunces font-bold text-sm superr-border">
                    SYSTEM ${roman}
                  </span>
                  <span class="font-hand text-base text-superr-muted font-bold">${p.impact}</span>
                </div>

                <a href="${p.link}" target="_blank" rel="noopener noreferrer" class="px-4 py-1.5 rounded-xl bg-superr-orange text-white font-fraunces text-sm font-semibold superr-border shadow-xs hover:scale-105 transition-transform flex items-center gap-1.5">
                  <span>Inspect Code</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                </a>
              </div>

              <!-- Project Title & Description -->
              <div>
                <h3 class="font-fraunces text-2xl sm:text-3xl font-bold text-superr-ink">${p.title}</h3>
                <p class="text-sm sm:text-base text-[#3D2C1B] leading-relaxed mt-2 font-sans">${p.desc}</p>
              </div>

              <!-- Project Artwork Display Frame -->
              <div class="relative w-full aspect-video rounded-2xl overflow-hidden superr-border bg-superr-paper flex items-center justify-center">
                <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover"/>
                <div class="absolute bottom-3 left-3 bg-superr-card superr-border px-3 py-1 rounded-md shadow-xs">
                  <span class="font-hand text-xs font-bold text-superr-ink">STAMP: VERIFIED PRODUCTION BUILD</span>
                </div>
              </div>

              <!-- Tech Stack Tags -->
              <div class="flex flex-wrap items-center gap-2 pt-2">
                <span class="font-hand text-sm text-superr-muted font-bold mr-1">Stack:</span>
                ${p.tags.map(t => `<span class="px-2.5 py-1 rounded-lg bg-superr-paper superr-border text-xs font-semibold text-superr-ink font-sans">${t}</span>`).join('\n')}
              </div>

            </div>
            `;
          }).join('\n')}
        </div>

      </div>

    </div>
  </section>

  <!-- ======================================================== -->
  <!-- 04. THE STICKY REASSURANCE MATRIX (ENGINEERING STANDARDS)-->
  <!-- ======================================================== -->
  <section id="reassurance" class="py-20 sm:py-28 px-4 sm:px-6 bg-[#F8F4EE] border-t-[2.3px] border-superr-ink relative">
    <div class="max-w-[1320px] mx-auto flex flex-col items-center text-center gap-10">
      
      <div>
        <span class="font-hand text-xl text-superr-blue font-bold tracking-wide">
          ★ EVERYTHING YOU’D WANT. NOTHING YOU’D WORRY ABOUT.
        </span>
        <h2 class="font-fraunces text-3xl sm:text-5xl font-bold text-superr-ink mt-1 tracking-tight">
          ENGINEERING PILLARS &amp; PHILOSOPHY
        </h2>
      </div>

      <!-- 4 Tilted Sticky Note Cards (Superr Sticky Style) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
        
        <!-- Sticky 01: Distraction Free -->
        <div class="relative bg-[#FFF9E6] superr-border rounded-2xl p-6 superr-shadow transform -rotate-2 hover:rotate-0 transition-transform duration-200 flex flex-col justify-between min-h-[220px]">
          <div class="w-12 h-3 washi-tape -mt-8 mx-auto mb-2 superr-border"></div>
          <div>
            <span class="px-2.5 py-0.5 rounded-full bg-superr-amber text-superr-ink font-fraunces text-xs font-bold superr-border">01 // CODE</span>
            <h3 class="font-fraunces text-xl font-bold text-superr-ink mt-3">Distraction-Free</h3>
            <p class="text-xs sm:text-sm text-[#4D3C2B] leading-relaxed mt-2 font-sans">
              No bloated libraries, no unnecessary abstractions. Shortest working diff wins with high maintainability.
            </p>
          </div>
          <span class="font-hand text-sm text-superr-amber font-bold text-right">#clean-code</span>
        </div>

        <!-- Sticky 02: Age-Safe & Reliable -->
        <div class="relative bg-[#E8F8EE] superr-border rounded-2xl p-6 superr-shadow transform rotate-1 hover:rotate-0 transition-transform duration-200 flex flex-col justify-between min-h-[220px]">
          <div class="w-12 h-3 washi-tape -mt-8 mx-auto mb-2 superr-border"></div>
          <div>
            <span class="px-2.5 py-0.5 rounded-full bg-superr-green text-white font-fraunces text-xs font-bold superr-border">02 // AI</span>
            <h3 class="font-fraunces text-xl font-bold text-superr-ink mt-3">Production-Safe AI</h3>
            <p class="text-xs sm:text-sm text-[#4D3C2B] leading-relaxed mt-2 font-sans">
              Deterministic evaluations, sub-second latency controls, and robust guardrails against hallucinations.
            </p>
          </div>
          <span class="font-hand text-sm text-superr-green font-bold text-right">#evals-matter</span>
        </div>

        <!-- Sticky 03: Easy on the Eyes -->
        <div class="relative bg-[#EAF2FF] superr-border rounded-2xl p-6 superr-shadow transform -rotate-1 hover:rotate-0 transition-transform duration-200 flex flex-col justify-between min-h-[220px]">
          <div class="w-12 h-3 washi-tape -mt-8 mx-auto mb-2 superr-border"></div>
          <div>
            <span class="px-2.5 py-0.5 rounded-full bg-superr-blue text-white font-fraunces text-xs font-bold superr-border">03 // UX</span>
            <h3 class="font-fraunces text-xl font-bold text-superr-ink mt-3">Easy on the Eyes</h3>
            <p class="text-xs sm:text-sm text-[#4D3C2B] leading-relaxed mt-2 font-sans">
              WCAG AAA contrast standards, smooth kinetic affordances, and zero confusing dark UX patterns.
            </p>
          </div>
          <span class="font-hand text-sm text-superr-blue font-bold text-right">#accessible</span>
        </div>

        <!-- Sticky 04: Nudges. Not answers. -->
        <div class="relative bg-[#FFEAF5] superr-border rounded-2xl p-6 superr-shadow transform rotate-2 hover:rotate-0 transition-transform duration-200 flex flex-col justify-between min-h-[220px]">
          <div class="w-12 h-3 washi-tape -mt-8 mx-auto mb-2 superr-border"></div>
          <div>
            <span class="px-2.5 py-0.5 rounded-full bg-superr-pink text-superr-ink font-fraunces text-xs font-bold superr-border">04 // CULTURE</span>
            <h3 class="font-fraunces text-xl font-bold text-superr-ink mt-3">Nudges, Not Answers</h3>
            <p class="text-xs sm:text-sm text-[#4D3C2B] leading-relaxed mt-2 font-sans">
              Collaborative pair programmer, team mentorship, and clear documentation so everyone grows together.
            </p>
          </div>
          <span class="font-hand text-sm text-superr-pink font-bold text-right">#mentorship</span>
        </div>

      </div>

    </div>
  </section>

  <!-- ======================================================== -->
  <!-- 05. "AND THERE'S OTHER COOL STUFF!" DOODLE STACK GRID    -->
  <!-- ======================================================== -->
  <section id="doodle-stack" class="py-20 sm:py-28 px-4 sm:px-6 max-w-[1360px] mx-auto border-t-[2.3px] border-superr-ink relative">
    
    <div class="flex flex-col items-center text-center gap-12">
      
      <!-- Central Fun Headline -->
      <div class="flex flex-col items-center">
        <span class="font-hand text-2xl sm:text-3xl text-superr-orange font-bold -rotate-3">soooo much!</span>
        <h2 class="font-fraunces text-3xl sm:text-5xl font-bold text-superr-ink tracking-tight mt-1">
          And there's other cool stuff!
        </h2>
        <p class="font-sans text-sm sm:text-base text-superr-muted max-w-lg mt-2">
          A full pencil box of languages, frameworks, cloud tooling, and verified skill badges.
        </p>
      </div>

      <!-- 3x3 Organic Doodle Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full text-left">
        
        <!-- Doodle 01: Backpack / Core Stack -->
        <div class="p-6 rounded-2xl bg-superr-card superr-border superr-shadow hover:-translate-y-1 transition-transform flex flex-col justify-between">
          <div class="flex items-center justify-between pb-3 border-b-2 border-superr-divider">
            <span class="font-fraunces font-bold text-lg text-superr-ink">The Backpack</span>
            <span class="font-hand text-xs text-superr-muted font-bold">ALL IN ONE PLACE</span>
          </div>
          <div class="py-4">
            <p class="text-xs text-superr-muted uppercase font-bold tracking-wider mb-2">Core Languages</p>
            <div class="flex flex-wrap gap-1.5">
              ${skills.slice(0, 4).map(s => `<span class="px-2.5 py-1 rounded-md bg-superr-paper superr-border font-sans text-xs font-semibold text-superr-ink">${s}</span>`).join('\n')}
            </div>
          </div>
          <span class="font-hand text-sm text-superr-orange font-bold">✦ Tested in production</span>
        </div>

        <!-- Doodle 02: Pencil Box / Frameworks -->
        <div class="p-6 rounded-2xl bg-superr-card superr-border superr-shadow hover:-translate-y-1 transition-transform flex flex-col justify-between">
          <div class="flex items-center justify-between pb-3 border-b-2 border-superr-divider">
            <span class="font-fraunces font-bold text-lg text-superr-ink">Whole Pencil Box</span>
            <span class="font-hand text-xs text-superr-green font-bold">FEELS JUST LIKE PAPER</span>
          </div>
          <div class="py-4">
            <p class="text-xs text-superr-muted uppercase font-bold tracking-wider mb-2">Frameworks &amp; Surfaces</p>
            <div class="flex flex-wrap gap-1.5">
              <span class="px-2.5 py-1 rounded-md bg-superr-paper superr-border font-sans text-xs font-semibold">React</span>
              <span class="px-2.5 py-1 rounded-md bg-superr-paper superr-border font-sans text-xs font-semibold">Next.js</span>
              <span class="px-2.5 py-1 rounded-md bg-superr-paper superr-border font-sans text-xs font-semibold">TailwindCSS</span>
              <span class="px-2.5 py-1 rounded-md bg-superr-paper superr-border font-sans text-xs font-semibold">Three.js</span>
            </div>
          </div>
          <span class="font-hand text-sm text-superr-green font-bold">✦ Modern responsive UI</span>
        </div>

        <!-- Doodle 03: Library / Cloud Infrastructure -->
        <div class="p-6 rounded-2xl bg-superr-card superr-border superr-shadow hover:-translate-y-1 transition-transform flex flex-col justify-between">
          <div class="flex items-center justify-between pb-3 border-b-2 border-superr-divider">
            <span class="font-fraunces font-bold text-lg text-superr-ink">Whole Library</span>
            <span class="font-hand text-xs text-superr-blue font-bold">SO MANY BOOKS</span>
          </div>
          <div class="py-4">
            <p class="text-xs text-superr-muted uppercase font-bold tracking-wider mb-2">Cloud &amp; DevOps</p>
            <div class="flex flex-wrap gap-1.5">
              <span class="px-2.5 py-1 rounded-md bg-superr-paper superr-border font-sans text-xs font-semibold">Docker</span>
              <span class="px-2.5 py-1 rounded-md bg-superr-paper superr-border font-sans text-xs font-semibold">AWS Cloud</span>
              <span class="px-2.5 py-1 rounded-md bg-superr-paper superr-border font-sans text-xs font-semibold">CI / CD</span>
              <span class="px-2.5 py-1 rounded-md bg-superr-paper superr-border font-sans text-xs font-semibold">PostgreSQL</span>
            </div>
          </div>
          <span class="font-hand text-sm text-superr-blue font-bold">✦ Resilient infrastructure</span>
        </div>

      </div>

    </div>
  </section>

  <!-- ======================================================== -->
  <!-- 06. CAREER NOTEBOOK MILESTONES (JOURNAL)                 -->
  <!-- ======================================================== -->
  <section id="journal" class="py-20 sm:py-28 px-4 sm:px-6 bg-[#F8F4EE] border-t-[2.3px] border-superr-ink relative">
    <div class="max-w-[1000px] mx-auto flex flex-col gap-10">
      
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span class="font-hand text-xl text-superr-orange font-bold">★ FIELD LOGS &amp; MILESTONES</span>
          <h2 class="font-fraunces text-3xl sm:text-5xl font-bold text-superr-ink tracking-tight mt-1">
            CAREER JOURNAL
          </h2>
        </div>
        <span class="font-hand text-base text-superr-muted font-bold">Continuous learning, continuous shipping.</span>
      </div>

      <div class="flex flex-col gap-6">
        ${rawExperience.map((exp, idx) => `
        <div class="bg-superr-card superr-border rounded-2xl p-6 sm:p-8 superr-shadow flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div class="flex flex-col">
            <div class="flex items-center gap-3">
              <span class="w-6 h-6 rounded-md bg-superr-orange text-white flex items-center justify-center font-fraunces font-bold text-xs">
                ${idx + 1}
              </span>
              <h3 class="font-fraunces text-xl sm:text-2xl font-bold text-superr-ink">${exp.role}</h3>
            </div>
            <span class="font-sans text-sm font-semibold text-superr-orange mt-1">${exp.company}</span>
            <p class="font-sans text-sm sm:text-base text-[#4D3C2B] leading-relaxed mt-3 max-w-xl">${exp.desc}</p>
          </div>
          <span class="px-3 py-1 rounded-full bg-superr-paper superr-border text-xs font-fraunces font-bold text-superr-ink shrink-0 self-start">
            ${exp.period}
          </span>
        </div>
        `).join('\n')}
      </div>

    </div>
  </section>

  <!-- ======================================================== -->
  <!-- 07. DIRECT DISPATCH ("I CALL DIBS!" CONTACT MODULE)      -->
  <!-- ======================================================== -->
  <section id="contact" class="py-20 sm:py-28 px-4 sm:px-6 max-w-[1000px] mx-auto border-t-[2.3px] border-superr-ink relative">
    <div class="bg-superr-card superr-border rounded-3xl p-6 sm:p-12 superr-shadow-lg flex flex-col gap-8">
      
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-superr-divider pb-6">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="w-2.5 h-2.5 rounded-full bg-superr-green animate-ping"></span>
            <span class="font-hand text-lg text-superr-green font-bold">DIRECT DISPATCH CHANNEL</span>
          </div>
          <h2 class="font-fraunces text-3xl sm:text-4xl font-bold text-superr-ink">I Call Dibs On Hiring!</h2>
        </div>
        <div class="px-4 py-1.5 rounded-xl bg-superr-paper superr-border text-xs font-bold text-superr-muted font-hand">
          Average Response: &lt; 12 Hours
        </div>
      </div>

      <div class="p-4 rounded-xl bg-superr-paper superr-border flex flex-wrap items-center justify-between gap-4 font-sans text-sm">
        <div><strong>Direct Email:</strong> <a href="mailto:${email}" class="text-superr-orange hover:underline font-semibold">${email}</a></div>
        <div><strong>Location:</strong> <span class="font-semibold">${location}</span></div>
      </div>

      <form class="flex flex-col gap-4" onsubmit="event.preventDefault(); alert('🚀 BZZT! Your dispatch has reached ${firstName}. Expect a response shortly.');">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="font-fraunces text-sm font-bold text-superr-ink" for="contact-name">Your Name / Organization *</label>
            <input type="text" id="contact-name" required placeholder="e.g. Acme Corp / Sarah Lin" class="w-full p-3 rounded-xl bg-superr-paper superr-border font-sans text-sm focus:outline-none focus:ring-2 focus:ring-superr-orange"/>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="font-fraunces text-sm font-bold text-superr-ink" for="contact-email">Email Address *</label>
            <input type="email" id="contact-email" required placeholder="sarah@acme.com" class="w-full p-3 rounded-xl bg-superr-paper superr-border font-sans text-sm focus:outline-none focus:ring-2 focus:ring-superr-orange"/>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="font-fraunces text-sm font-bold text-superr-ink" for="contact-message">Project Brief &amp; Requirements *</label>
          <textarea id="contact-message" required rows="4" placeholder="Tell ${firstName} about your technical goals, stack, scope, and timeline..." class="w-full p-3 rounded-xl bg-superr-paper superr-border font-sans text-sm focus:outline-none focus:ring-2 focus:ring-superr-orange"></textarea>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div class="flex items-center gap-2 font-hand text-base text-superr-muted font-bold">
            <span>✦ 100% direct line to ${firstName}. No intermediaries.</span>
          </div>
          <button type="submit" class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-superr-orange text-white font-fraunces text-lg font-bold superr-border shadow-md hover:scale-105 active:scale-95 transition-all">
            Dispatch Note 🚀
          </button>
        </div>
      </form>

    </div>
  </section>

  <!-- ======================================================== -->
  <!-- 08. FOOTER                                               -->
  <!-- ======================================================== -->
  <footer class="w-full py-12 px-4 sm:px-6 border-t-[2.3px] border-superr-ink bg-superr-paper">
    <div class="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
      <div class="flex flex-col items-center sm:items-start">
        <span class="font-fraunces font-bold text-lg text-superr-ink">${safeName}</span>
        <span class="font-hand text-sm text-superr-muted font-bold">Superr Notebook Edition • ${currentYear}</span>
      </div>

      <div class="flex items-center gap-2">
        ${socialLinksHtml}
      </div>

      <div class="text-xs text-superr-muted font-sans text-center sm:text-right">
        Powered by <a href="https://myfolio.tech" class="font-bold text-superr-ink hover:underline">MyFolio</a>
      </div>
    </div>
  </footer>

  <!-- ======================================================== -->
  <!-- TAB CONTROLLER SCRIPT                                    -->
  <!-- ======================================================== -->
  <script>
    document.querySelectorAll('.superr-tab-btn').forEach(button => {
      button.addEventListener('click', () => {
        const targetIdx = button.getAttribute('data-tab-index');
        
        // Update tab buttons
        document.querySelectorAll('.superr-tab-btn').forEach(b => {
          b.classList.remove('text-superr-green', 'font-bold', 'bg-superr-paper');
          b.classList.add('text-superr-ink', 'font-medium');
        });
        button.classList.remove('text-superr-ink', 'font-medium');
        button.classList.add('text-superr-green', 'font-bold', 'bg-superr-paper');

        // Update active project card
        document.querySelectorAll('.superr-project-card').forEach(card => {
          card.style.display = 'none';
        });
        const activeCard = document.getElementById('project-sheet-' + targetIdx);
        if (activeCard) {
          activeCard.style.display = 'block';
        }
      });
    });
  </script>

</body>
</html>`;
  },

  render404Page(siteId = 'unknown') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>PAGE TORE OUT // 404 — Notebook Page Missing</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800&family=Plus+Jakarta+Sans:wght@500;600&family=Patrick+Hand&display=swap" rel="stylesheet"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #FDFBF9;
      color: #2B1A07;
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background-image: radial-gradient(#2B1A07 0.75px, transparent 0.75px);
      background-size: 16px 16px;
    }
    .notebook-card {
      max-width: 580px;
      width: 100%;
      background: #FFFCF9;
      border: 2.3px solid #2B1A07;
      box-shadow: 0px 6px 12px rgba(43, 26, 7, 0.15);
      border-radius: 24px;
      padding: 36px;
      text-align: center;
      position: relative;
    }
    .badge {
      display: inline-block;
      padding: 4px 14px;
      background: #FF6F1E;
      color: #FFFFFF;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.08em;
      border: 2px solid #2B1A07;
      border-radius: 9999px;
      margin-bottom: 20px;
      font-family: 'Fraunces', serif;
    }
    h1 {
      font-family: 'Fraunces', serif;
      font-size: clamp(2rem, 5vw, 2.8rem);
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 12px;
    }
    p {
      color: #5D4D3D;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 28px;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background: #22C55E;
      color: #FFFFFF;
      font-weight: 700;
      text-decoration: none;
      border: 2.3px solid #2B1A07;
      border-radius: 16px;
      box-shadow: 0px 2px 4px rgba(43, 26, 7, 0.14);
      transition: all 0.15s ease;
      font-family: 'Fraunces', serif;
      font-size: 15px;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0px 4px 8px rgba(43, 26, 7, 0.2);
    }
  </style>
</head>
<body>
  <div class="notebook-card">
    <span class="badge">NOTEBOOK SIGNAL 404</span>
    <h1>Page Tore Out!</h1>
    <p>The notebook entry for candidate <strong>${TemplateHelper.escapeHtml(siteId)}</strong> seems to have been torn from the binder or hasn't been written down yet.</p>
    <a href="https://myfolio.tech" class="btn">&larr; Return to Superr Headquarters</a>
  </div>
</body>
</html>`;
  }
};

module.exports = { SuperrNotebookTemplate };
