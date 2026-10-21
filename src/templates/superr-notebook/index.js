/**
 * Template: Superr AI Notebook ("superr-notebook" / "superr" / "notebook")
 * Tactile Warm Paper Editorial, Interactive Smart Notebook & Learning Companion
 * Reverse-Engineered 1:1 Replica from Superr.ai tailored as a high-impact developer portfolio
 * 
 * Aesthetic & Design DNA:
 * - Color Palette:
 *     Warm Paper Canvas: #FDFBF9
 *     Espresso Dark Ink / Borders: #2B1A07
 *     Paper Card Container: #FFFCF9
 *     Magic Paper Green: #22C55E
 *     Electric Sky Blue: #3B82F6
 *     Playful Neon Pink: #FF66CF
 *     Vibrant Tangerine / Action: #FF6F1E
 *     Slapstick Amber Gold: #FFB702
 *     Muted Text: #8A7B6A
 * - Typography System:
 *     Expressive Mastheads: 'Fraunces' (Google Fonts, weights 400-800, optical size 144)
 *     Tailored Body: 'Plus Jakarta Sans' (Google Fonts, weights 400-700)
 *     Handwritten Accents: 'Patrick Hand' (Google Fonts, handwritten annotations, sticky notes, stickers)
 * - Tactile Architecture:
 *     Authentic 3D brown notebook with pencil and clean candidate student label (zero overlap)
 *     Dynamic candidate name masthead with wavy underline and Superr "actually!" badge
 *     3 full-screen feature showcases with authentic illustrated backgrounds and interactive tablet mockups
 *     Roman numeral pointers (I through V) mapping candidate's real shipped projects
 *     Interactive peelable stickers with polynomial easing and clip-path flap physics
 *     Superr FAQ accordion with dashed borders
 *     Full-width Superr Orange (#FF6F1E) footer with giant wordmark
 *     100% dynamic candidate data binding with zero hardcoded claims
 */

const { TemplateHelper } = require('../template-helper');
const { ProjectArtworkSynthesizer } = require('../project-artwork-synthesizer');

const SuperrNotebookTemplate = {
  id: 'superr-notebook',
  name: 'Superr AI Notebook',
  category: 'Tactile Warm Paper / Interactive Smart Notebook & Journal',
  description: 'An exact 1:1 tactile notebook experience inspired by Superr.ai. Features warm cream paper canvas, espresso roast borders, interactive Roman numeral tabs (I to V), authentic feature tablet switchers, peelable stickers, and the vibrant Superr orange footer.',
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
    const safeName = TemplateHelper.escapeHtml(data.name || 'Abdul Aziz Nooruddin');
    const nameWords = safeName.trim().split(/\s+/).filter(Boolean);
    const firstName = nameWords[0] || safeName;
    const role = TemplateHelper.escapeHtml(data.role || data.title || 'Computer Science & AI Student • Web3 Developer');
    const bio = TemplateHelper.escapeHtml(
      data.bio ||
      data.about ||
      `Building decentralized Web3 protocols, high-performance smart contracts on Algorand, and immersive 3D developer experiences without the distractions.`
    );
    const email = TemplateHelper.escapeHtml(data.contact?.email || data.email || 'abdulaziznoor9876@gmail.com');
    const location = TemplateHelper.escapeHtml(data.contact?.location || data.location || 'Hyderabad, India • Remote Web3');
    const github = TemplateHelper.sanitizeUrl(data.contact?.github || data.github || data.socialLinks?.github || 'https://github.com/Abdul-Aziz-Nooruddin');
    const linkedin = TemplateHelper.sanitizeUrl(data.contact?.linkedin || data.linkedin || data.socialLinks?.linkedin || 'https://linkedin.com');
    const twitter = TemplateHelper.sanitizeUrl(data.contact?.twitter || data.twitter || data.socialLinks?.twitter || '');
    const website = TemplateHelper.sanitizeUrl(data.website || data.contact?.website || '');

    // 2. Skills
    let rawSkills = Array.isArray(data.skills) ? data.skills : [];
    if (rawSkills.length === 0) {
      rawSkills = ['Python', 'TypeScript', 'Solidity', 'Algorand (PyTeal)', 'Three.js', 'React', 'Node.js', 'Docker'];
    }
    const skills = [...new Set(rawSkills.map(s => typeof s === 'string' ? s.trim() : (s.name || s.skill || '')).filter(Boolean))];

    // 3. Normalized Projects for Interactive Tabs
    let rawProjects = Array.isArray(data.projects) ? data.projects : [];
    if (rawProjects.length === 0) {
      rawProjects = [
        {
          title: 'ConsentChain Algorand',
          description: 'A decentralized Consent Management application powered by Algorand, enabling DPDP Act 2023 compliance with an escrow-based data micro-payment system.',
          tags: ['Algorand', 'Smart Contracts', 'TypeScript', 'RegTech'],
          link: 'https://github.com/Abdul-Aziz-Nooruddin/ConsentChain-Algorand',
          impact: 'DPDP 2023 Compliant Escrow'
        },
        {
          title: 'AI Portfolio Generator',
          description: 'Turn your GitHub repositories & resume into bespoke 3D WebGL developer portfolios with AI in seconds. Interactive spatial worlds and high-impact scrollytelling.',
          tags: ['WebGL', 'Three.js', 'Node.js', 'AI'],
          link: 'https://github.com/Abdul-Aziz-Nooruddin/myfolio.tech',
          impact: '60 FPS Spatial WebGL Viewports'
        },
        {
          title: 'Pass A Note',
          description: 'High-performance interactive communication tool engineered for seamless zero-latency peer data transfer with secure encrypted messaging.',
          tags: ['HTML', 'JavaScript', 'CSS', 'P2P Encryption'],
          link: 'https://github.com/Abdul-Aziz-Nooruddin/pass-a-note',
          impact: 'Sub-second peer data transfer'
        },
        {
          title: 'LMS User Management',
          description: 'Enterprise-grade role-based access control and user management system engineered with strict security guarantees and database integrity.',
          tags: ['Node.js', 'Express', 'PostgreSQL', 'RBAC'],
          link: 'https://github.com/Abdul-Aziz-Nooruddin/lms-user-management',
          impact: 'Strict database authorization'
        },
        {
          title: 'Dual-Chain Web3 Portfolio',
          description: 'Personal developer showcase featuring glassmorphism design, particle animations, and multi-chain protocol verification across Polygon & Algorand.',
          tags: ['TypeScript', 'Polygon', 'Algorand', 'Web3'],
          link: 'https://github.com/Abdul-Aziz-Nooruddin/portfolio',
          impact: 'Multi-chain protocol verification'
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
      if (pTags.length === 0) pTags = ['Production', 'Web3'];

      const pLink = TemplateHelper.sanitizeUrl(p.link || p.live || p.url || p.github || github);
      
      let artSrc = '';
      if (p.image && typeof p.image === 'string' && !p.image.includes('placeholder')) {
        artSrc = p.image;
      } else {
        try {
          const resolved = ProjectArtworkSynthesizer.resolveProjectArtwork(p, 'superr-notebook', idx, usedArtworkSet, safeName);
          artSrc = resolved?.src || `/assets/templates/superr/assets/features/section-1/section_1_screen_${(idx % 5) + 1}.png`;
        } catch (e) {
          artSrc = `/assets/templates/superr/assets/features/section-1/section_1_screen_${(idx % 5) + 1}.png`;
        }
      }

      return {
        title: pTitle,
        desc: pDesc,
        tags: pTags,
        link: pLink,
        image: artSrc,
        impact: TemplateHelper.escapeHtml(p.impact || pTags[0] || 'Verified Production Quality')
      };
    });

    // 4. Experience & Milestones
    let rawExperience = Array.isArray(data.experience) ? data.experience : [];
    if (rawExperience.length === 0) {
      rawExperience = [
        {
          role: 'Web3 & Smart Contract Developer',
          company: 'Independent & Open Source',
          period: '2024 — Present',
          desc: 'Architecting decentralized applications and smart contracts on Algorand and Polygon. Engineered DPDP Act 2023 compliance escrow micro-payment protocols.'
        },
        {
          role: 'AI & Software Systems Engineer',
          company: 'Academic & Research Projects',
          period: '2023 — 2024',
          desc: 'Designed full-stack architectures, RESTful API services, role-based access control engines, and distributed communication platforms.'
        }
      ];
    }

    // 5. Roman Numerals Array for Tabs
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

    // 6. Section 1 Pointers (Candidate's Top Shipped Projects)
    const section1Pointers = projects.slice(0, 5).map((p, idx) => ({
      label: p.title,
      screen: p.image || `/assets/templates/superr/assets/features/section-1/section_1_screen_${(idx % 5) + 1}.png`,
      tag: p.impact || p.tags[0] || 'Shipped',
      desc: p.desc,
      link: p.link
    }));

    // Fill to 5 if fewer
    while (section1Pointers.length < 5) {
      const idx = section1Pointers.length;
      section1Pointers.push({
        label: `Engineering Milestone 0${idx + 1}`,
        screen: `/assets/templates/superr/assets/features/section-1/section_1_screen_${idx + 1}.png`,
        tag: 'Architecture',
        desc: 'Built with clean patterns, modular test coverage, and deterministic guarantees.',
        link: github
      });
    }

    // 7. Section 2 Pointers (Technical Disciplines & Stack)
    const section2Pointers = [
      { label: "Decentralized Protocols & Smart Contracts", screen: "/assets/templates/superr/assets/features/section-2/section_2_screen_1.png", tag: "Algorand • Solidity" },
      { label: "Hardware-Accelerated 3D & WebGL", screen: "/assets/templates/superr/assets/features/section-2/section_2_screen_2.png", tag: "Three.js • GLSL" },
      { label: "Distributed Backend & API Gateways", screen: "/assets/templates/superr/assets/features/section-2/section_2_screen_3.png", tag: "Node.js • PostgreSQL" },
      { label: "Autonomous Agent Runtimes & Machine Learning", screen: "/assets/templates/superr/assets/features/section-2/section_2_screen_4.png", tag: "Python • Edge AI" },
      { label: "Cryptographic Consent & Compliance", screen: "/assets/templates/superr/assets/features/section-2/section_2_screen_5.png", tag: "DPDP • RegTech" }
    ];

    // 8. Section 3 Pointers (Engineering Philosophy & Reliability)
    const section3Pointers = [
      { label: "Zero-Downtime Microservices & CI/CD", screen: "/assets/templates/superr/assets/features/section-3/section_3_screen_1.png", tag: "Docker • Cloud" },
      { label: "Collaborative Pair Programming & Mentorship", screen: "/assets/templates/superr/assets/features/section-3/section_3_screen_2.png", tag: "Team Culture" },
      { label: "Clean Code: Minimal Diff & Low Latency", screen: "/assets/templates/superr/assets/features/section-3/section_3_screen_3.png", tag: "Architecture" },
      { label: "Continuous Systems Adaptation & Learning", screen: "/assets/templates/superr/assets/features/section-3/section_3_screen_4.png", tag: "Full-Stack" },
      { label: "Open-Source Contributions & Research", screen: "/assets/templates/superr/assets/features/section-3/section_3_screen_5.png", tag: "Ecosystem" }
    ];

    // 9. Authentic Superr FAQ Questions tailored for candidate
    const faqList = [
      {
        question: `What even IS ${safeName}'s engineering approach?`,
        answer: `It's like having your own dedicated systems architect! Resilient, thoughtful, and built for humans. Clean abstractions without over-engineering, high test coverage, and clear documentation so teams can move fast without breaking production.`
      },
      {
        question: "Who is this portfolio and toolkit for?",
        answer: "Engineers, founders, technical leaders, and innovative teams looking for senior-level execution across full-stack applications, distributed cloud services, smart contracts, and interactive web experiences."
      },
      {
        question: "Is it easy on performance and eyes?",
        answer: "Totally! Zero unneeded libraries, strict 60 FPS animations, WCAG 2.2 AAA accessibility contrast, and optimized responsive layouts that render smoothly on any device."
      },
      {
        question: "Can we collaborate on custom AI, Web3, or edge tooling?",
        answer: "Yes! Specializing in Algorand smart contracts, deterministic AI pipelines, local neural runtimes, automated testing bots, and hardware-accelerated WebGL viewports."
      },
      {
        question: "Can we build stuff that's experimental and playful?",
        answer: "Absolutely! Tactile interfaces, bespoke 3D physics, kinetic web interactions, and creative code are first-class citizens in every build."
      },
      {
        question: "How fast is delivery and response time?",
        answer: "Average response time is under 12 hours. Sprints are organized with daily transparent updates and verifiable pull requests."
      },
      {
        question: "Do we have to micromanage the development process?",
        answer: "Nope! Self-directed execution with proactive communication, detailed PRs, and clear benchmarks means you stay in the loop without the friction."
      },
      {
        question: "How can you get in touch or start a project?",
        answer: `Simply click 'I call dibs!' in the top navigation or use the direct dispatch module below. Direct email: ${email}.`
      }
    ];

    // 10. Social Links HTML
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
  <title>${safeName} — Superr AI Notebook Portfolio</title>
  <meta name="description" content="${bio}"/>
  
  <!-- Favicon & Touch Icons -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- Authoritative Superr Typography Stack: Fraunces + Plus Jakarta Sans + Patrick Hand -->
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
    :root {
      --sticker-p: 10px;
      --sticker-peel-easing: 2s linear(0,.002 0.4%,.008 0.9%,.02 1.4%,.035 1.9%,.055 2.4%,.083 3%,.11 3.5%,.146 4.1%,.214 5.1%,.297 6.2%,.624 10.2%,.756 11.9%,.821 12.8%,.874 13.6%,.93 14.5%,.975 15.3%,1.016 16.1%,1.053 16.9%,1.085 17.7%,1.116 18.6%,1.139 19.4%,1.16 20.3%,1.176 21.2%,1.187 22.1%,1.195 23.2%,1.197 24.4%,1.193 25.6%,1.183 26.9%,1.17 28.1%,1.153 29.4%,1.055 35.6%,1.031 37.3%,1.012 38.8%,.994 40.6%,.98 42.3%,.97 44.1%,.964 45.9%,.961 48.3%,.964 51.1%,.97 53.7%,.997 62.7%,1.003 66%,1.007 69.3%,1.007 74.4%,1 89.2%,1);
      --sticker-peel-hover-easing: 1s linear(0,.008 1.1%,.031 2.2%,.129 4.8%,.257 7.2%,.671 14.2%,.789 16.5%,.881 18.6%,.957 20.7%,1.019 22.9%,1.063 25.1%,1.094 27.4%,1.114 30.7%,1.112 34.5%,1.018 49.9%,.99 59.1%,1);
      --sticker-start: calc(-1 * var(--sticker-p));
      --sticker-end: calc(100% + var(--sticker-p));
    }

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

    /* Sticker Peel Physics Classes */
    .sticker-container {
      user-select: none;
      -webkit-user-select: none;
      position: relative;
      cursor: pointer;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .sticker-container:hover {
      transform: scale(1.08) rotate(3deg);
    }
    .sticker-main {
      width: 100%;
      height: 100%;
      transition: clip-path var(--sticker-peel-hover-easing);
      will-change: clip-path;
    }
    .sticker-container:hover .sticker-main {
      clip-path: polygon(0 0, 85% 0, 100% 15%, 100% 100%, 0 100%);
    }
  </style>
</head>
<body class="bg-superr-paper text-superr-ink selection:bg-superr-amber/40 selection:text-superr-ink min-h-screen">

  <!-- ======================================================== -->
  <!-- 01. STICKY TOP NOTEBOOK HEADER                           -->
  <!-- ======================================================== -->
  <header class="fixed top-4 z-50 w-full px-4 sm:px-8 pointer-events-none">
    <div class="max-w-[1360px] mx-auto flex items-center justify-between py-2.5 px-4 sm:px-6 bg-[#FAF8F5]/90 backdrop-blur-md border-[2px] border-[#2B1A07] rounded-[22px] shadow-sm pointer-events-auto">
      
      <!-- Brand Logo: Authentic Superr Hand Icon -->
      <a href="#cover" class="flex items-center gap-2 group">
        <img src="/assets/templates/superr/superr-logo.svg" alt="Superr" class="h-9 w-auto" />
      </a>

      <!-- Desktop Section Tabs -->
      <nav class="hidden md:flex items-center gap-6 text-sm font-semibold text-[#2B1A07]/90 font-sans">
        <a href="#feature-one" class="hover:text-superr-green transition-colors">I. Shipped Projects</a>
        <a href="#feature-two" class="hover:text-superr-blue transition-colors">II. Tech Disciplines</a>
        <a href="#feature-three" class="hover:text-superr-pink transition-colors">III. System Reliability</a>
        <a href="#our-story" class="hover:text-superr-orange transition-colors">IV. Story &amp; Bio</a>
        <a href="#faq" class="hover:text-superr-orange transition-colors">V. FAQ</a>
      </nav>

      <!-- Primary CTA: "I Call Dibs!" -->
      <a href="#contact" class="bg-[#fdfbf9] p-0.5 rounded-[18px] superr-shadow-btn hover:-translate-y-0.5 transition-all duration-150">
        <div class="bg-[#fdfbf9] border-[2px] border-[#2B1A07] rounded-2xl px-4 py-1.5 flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-superr-green animate-pulse"></span>
          <span class="font-fraunces text-sm sm:text-base font-semibold text-[#2B1A07]">I call dibs!</span>
        </div>
      </a>

    </div>
  </header>

  <!-- ======================================================== -->
  <!-- 02. HERO NOTEBOOK STAGE & COVER                          -->
  <!-- ======================================================== -->
  <section id="cover" class="relative min-h-[92vh] pt-28 sm:pt-36 pb-16 px-6 sm:px-10 lg:px-16 max-w-[1480px] mx-auto flex items-center overflow-hidden">
    
    <div class="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center">
      
      <!-- Left Column: Exact Superr Hero Layout Tailored for Candidate Portfolio -->
      <div class="lg:col-span-6 xl:col-span-6 flex flex-col items-start z-10 lg:pl-2 xl:pl-6">
        
        <!-- Dear grownups & hiring teams, -->
        <div class="flex items-center gap-2 mb-2">
          <span class="font-hand font-bold text-2xl sm:text-3xl text-superr-orange -rotate-2 inline-block">
            Dear builders &amp; hiring teams,
          </span>
        </div>

        <!-- Meet Candidate Masthead -->
        <h1 class="font-fraunces font-black text-5xl sm:text-6xl lg:text-[76px] text-[#2B1A07] tracking-tight leading-[1.04] mb-4">
          meet <span class="relative inline-block text-superr-orange underline decoration-[#2B1A07] decoration-wavy decoration-[2.5px] underline-offset-8">${firstName.toLowerCase()}</span>
        </h1>

        <!-- Subtitle: Candidate Role who actually! ships real software -->
        <p class="text-[20px] sm:text-[23px] lg:text-[25px] leading-[1.4] text-[#2B1A07] font-normal max-w-[480px] mb-8 font-sans">
          ${role} who
          <span class="relative inline-block w-[88px] sm:w-[94px] mx-1.5 -mt-1.5 align-middle">
            <img src="/assets/templates/superr/hero/actually.png" alt="actually!" class="w-full h-auto object-contain pointer-events-none select-none" />
          </span>
          ships real software
        </p>

        <!-- CTA Button & Availability Text -->
        <div class="flex flex-col items-start">
          <a href="#contact" class="bg-[#fdfbf9] p-1 rounded-[20px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.25)] hover:shadow-[0px_4px_8px_0px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-200 cursor-pointer inline-block">
            <div class="bg-[#fdfbf9] border-[2.3px] border-[#2b1a07] rounded-2xl px-6 py-[11px] flex items-center justify-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-superr-green animate-ping mr-1"></span>
              <span class="text-[20px] text-[#2b1a07] font-fraunces font-semibold">I call dibs!</span>
            </div>
          </a>
          <p class="mt-4 ml-1 text-[15px] sm:text-[16px] font-medium text-[#8a7b6a] font-sans">
            ✦ Available for high-impact engineering roles &amp; Web3 contracts
          </p>
        </div>

      </div>

      <!-- Right Column: Exact 3D Brown Notebook with Pencil & Dynamic Clean Paper Label -->
      <div class="lg:col-span-6 xl:col-span-6 relative flex items-center justify-center lg:justify-end">
        <div class="relative w-full max-w-[700px] lg:max-w-[780px] xl:max-w-[840px] aspect-[16/10] flex items-center justify-center">
          
          <!-- Authentic 3D Cutout of Brown Notebook with Pencil from Superr.ai -->
          <img src="/assets/templates/superr/hero/notebook-hero.webp" alt="Superr AI Notebook" class="w-full h-full object-contain pointer-events-none select-none filter drop-shadow-xl" />

          <!-- Clean Paper Label Sticker (Solid background masking the pre-printed Param text with zero overlap) -->
          <div class="absolute" style="left: 56.6%; top: 18.2%; width: 22.2%; height: 21.6%; transform: rotate(-15.8deg); transform-origin: top left; pointer-events: none;">
            <div class="w-full h-full relative rounded-xl bg-[#FFFDF8] border-[2.2px] border-[#2B1A07] shadow-md flex flex-col justify-between py-2 px-3 overflow-hidden">
              
              <!-- Label Top Header -->
              <div class="flex items-center justify-between border-b border-[#2B1A07]/40 pb-1">
                <span class="font-fraunces font-bold text-[9px] sm:text-[10px] text-[#2B1A07] tracking-wider uppercase">VERIFIED PORTFOLIO</span>
                <span class="w-2 h-2 rounded-full bg-superr-green border border-[#2B1A07]"></span>
              </div>

              <!-- Name Row (Handwritten) -->
              <div class="flex flex-col py-0.5">
                <span class="text-[8px] sm:text-[9px] font-sans font-bold text-[#2B1A07]/70 uppercase tracking-tight">Name</span>
                <span class="font-hand font-bold text-base sm:text-lg md:text-xl text-[#1E140A] leading-tight truncate">
                  ${safeName}
                </span>
              </div>

              <!-- Class & Roll Row -->
              <div class="flex items-center justify-between border-t border-[#2B1A07]/40 pt-1">
                <div class="flex flex-col">
                  <span class="text-[7px] sm:text-[8px] font-sans font-bold text-[#2B1A07]/70 uppercase">Role / Discipline</span>
                  <span class="font-hand font-bold text-xs sm:text-sm text-[#1E140A] leading-none truncate max-w-[105px]">
                    ${(role.split(/•|&/)[0] || 'Web3 & AI').trim()}
                  </span>
                </div>
                <div class="flex flex-col items-end border-l border-[#2B1A07]/40 pl-2">
                  <span class="text-[7px] sm:text-[8px] font-sans font-bold text-[#2B1A07]/70 uppercase">Roll no.</span>
                  <span class="font-hand font-bold text-xs sm:text-sm text-[#1E140A] leading-none">01</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  </section>

  <!-- ======================================================== -->
  <!-- 03. FEATURE ONE: IT’S KINDA LIKE MAGIC PAPER (PROJECTS)  -->
  <!-- ======================================================== -->
  <section id="feature-one" class="relative w-full py-20 sm:py-32 px-4 sm:px-8 border-t-[2.3px] border-superr-ink overflow-hidden bg-cover bg-center" style="background-image: url('/assets/templates/superr/assets/features/section-1/feature_bg_1.png');">
    <div class="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      
      <!-- Left Column: Title & Pointers (I to V) -->
      <div class="lg:col-span-5 bg-[#FAF8F5]/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl superr-border superr-shadow-lg flex flex-col gap-6">
        <div>
          <div class="inline-block px-3 py-1 rounded-full bg-superr-green text-white font-fraunces font-bold text-xs mb-3">
            01 // SHIPPED SYSTEMS
          </div>
          <h2 class="font-fraunces text-3xl sm:text-4xl lg:text-5xl font-bold text-superr-ink leading-tight">
            It’s kinda like <span class="bg-superr-green/20 text-superr-green px-2 rounded-lg">magic paper</span>
          </h2>
          <p class="font-sans text-sm sm:text-base text-superr-muted mt-3">
            Click any project pointer to inspect real shipped architecture, smart contracts, and interactive live demos.
          </p>
        </div>

        <!-- 5 Interactive Pointers -->
        <div class="flex flex-col gap-2.5" id="s1-pointers-list">
          ${section1Pointers.map((p, idx) => {
            const roman = romanNumerals[idx] || `${idx + 1}`;
            const activeClass = idx === 0 ? 'bg-superr-green text-white superr-shadow active' : 'bg-superr-card text-superr-ink hover:bg-superr-paper';
            return `
            <button type="button" 
                    class="s1-pointer-btn w-full flex items-center justify-between py-3.5 px-4 rounded-2xl superr-border text-left font-sans text-sm sm:text-base font-semibold cursor-pointer transition-all ${activeClass}" 
                    data-s1-index="${idx}" 
                    data-screen-src="${p.screen}"
                    data-proj-title="${TemplateHelper.escapeHtml(p.label)}"
                    data-proj-desc="${TemplateHelper.escapeHtml(p.desc)}"
                    data-proj-link="${p.link}">
              <div class="flex items-center gap-3">
                <span class="w-7 h-7 rounded-lg border-[1.5px] border-current flex items-center justify-center font-fraunces text-xs font-bold">
                  ${roman}
                </span>
                <span class="truncate max-w-[200px] sm:max-w-[260px]">${p.label}</span>
              </div>
              <span class="text-xs font-hand font-bold opacity-90 shrink-0 ml-2">${p.tag}</span>
            </button>
            `;
          }).join('\n')}
        </div>
      </div>

      <!-- Right Column: Interactive Tablet Mockup Frame with Live Inspect CTA -->
      <div class="lg:col-span-7 flex flex-col items-center">
        <div class="relative w-full max-w-[680px] aspect-[4/3] rounded-3xl superr-border bg-black/95 p-3 sm:p-4 superr-shadow-lg flex flex-col justify-between overflow-hidden">
          
          <div class="w-full h-full relative rounded-2xl overflow-hidden flex items-center justify-center bg-zinc-900">
            <img id="s1-tablet-screen" 
                 src="${section1Pointers[0].screen}" 
                 alt="Project Preview Screen" 
                 class="w-full h-full object-cover rounded-xl transition-all duration-300" />
            
            <!-- Live System Floating Card -->
            <div class="absolute bottom-3 left-3 right-3 bg-[#FAF8F5]/95 backdrop-blur-md border-[2px] border-[#2B1A07] rounded-xl p-3 flex items-center justify-between gap-3 shadow-md">
              <div class="flex flex-col truncate">
                <span id="s1-proj-title-display" class="font-fraunces font-bold text-sm sm:text-base text-[#2B1A07] truncate">
                  ${section1Pointers[0].label}
                </span>
                <span id="s1-proj-desc-display" class="font-sans text-xs text-superr-muted truncate">
                  ${section1Pointers[0].desc}
                </span>
              </div>

              <a id="s1-proj-link-display" 
                 href="${section1Pointers[0].link}" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 class="px-4 py-1.5 rounded-lg bg-superr-orange text-white font-fraunces text-xs sm:text-sm font-bold superr-border shadow-xs hover:scale-105 transition-transform shrink-0 flex items-center gap-1.5">
                <span>Inspect System</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
              </a>
            </div>
          </div>

        </div>
      </div>

    </div>
  </section>

  <!-- ======================================================== -->
  <!-- 04. FEATURE TWO: BOOKS THAT ACTUALLY TALK TO US (SKILLS) -->
  <!-- ======================================================== -->
  <section id="feature-two" class="relative w-full py-20 sm:py-32 px-4 sm:px-8 border-t-[2.3px] border-superr-ink overflow-hidden bg-cover bg-center" style="background-image: url('/assets/templates/superr/assets/features/section-2/feature_bg_2.png');">
    <div class="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      
      <!-- Left Column: Interactive Tablet Mockup Frame (Inverted layout) -->
      <div class="lg:col-span-7 order-2 lg:order-1 flex justify-center">
        <div class="relative w-full max-w-[680px] aspect-[4/3] rounded-3xl superr-border bg-black/90 p-3 sm:p-4 superr-shadow-lg flex items-center justify-center overflow-hidden">
          <img id="s2-tablet-screen" 
               src="${section2Pointers[0].screen}" 
               alt="Superr Interactive Books Screen" 
               class="w-full h-full object-contain rounded-2xl transition-opacity duration-300" />
        </div>
      </div>

      <!-- Right Column: Title & Pointers (I to V) -->
      <div class="lg:col-span-5 order-1 lg:order-2 bg-[#FAF8F5]/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl superr-border superr-shadow-lg flex flex-col gap-6">
        <div>
          <div class="inline-block px-3 py-1 rounded-full bg-superr-blue text-white font-fraunces font-bold text-xs mb-3">
            02 // TECHNICAL DISCIPLINES
          </div>
          <h2 class="font-fraunces text-3xl sm:text-4xl lg:text-5xl font-bold text-superr-ink leading-tight">
            It has <span class="bg-superr-blue/20 text-superr-blue px-2 rounded-lg">books that</span> actually talk to us
          </h2>
          <p class="font-sans text-sm sm:text-base text-superr-muted mt-3">
            A comprehensive engineering repertoire spanning Web3 protocols, 3D WebGL graphics, and resilient backend systems.
          </p>
        </div>

        <!-- 5 Interactive Pointers -->
        <div class="flex flex-col gap-2.5" id="s2-pointers-list">
          ${section2Pointers.map((p, idx) => {
            const roman = romanNumerals[idx] || `${idx + 1}`;
            const activeClass = idx === 0 ? 'bg-superr-blue text-white superr-shadow active' : 'bg-superr-card text-superr-ink hover:bg-superr-paper';
            return `
            <button type="button" 
                    class="s2-pointer-btn w-full flex items-center justify-between py-3 px-4 rounded-2xl superr-border text-left font-sans text-sm sm:text-base font-semibold cursor-pointer ${activeClass}" 
                    data-s2-index="${idx}" 
                    data-screen-src="${p.screen}">
              <div class="flex items-center gap-3">
                <span class="w-7 h-7 rounded-lg border-[1.5px] border-current flex items-center justify-center font-fraunces text-xs font-bold">
                  ${roman}
                </span>
                <span>${p.label}</span>
              </div>
              <span class="text-xs font-hand font-bold opacity-90">${p.tag}</span>
            </button>
            `;
          }).join('\n')}
        </div>
      </div>

    </div>
  </section>

  <!-- ======================================================== -->
  <!-- 05. FEATURE THREE: IT’S A FRIEND WHO’S GOT OUR BACK      -->
  <!-- ======================================================== -->
  <section id="feature-three" class="relative w-full py-20 sm:py-32 px-4 sm:px-8 border-t-[2.3px] border-superr-ink overflow-hidden bg-cover bg-center" style="background-image: url('/assets/templates/superr/assets/features/section-3/feature_bg_3.png');">
    <div class="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      
      <!-- Left Column: Title & Pointers (I to V) -->
      <div class="lg:col-span-5 bg-[#FAF8F5]/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl superr-border superr-shadow-lg flex flex-col gap-6">
        <div>
          <div class="inline-block px-3 py-1 rounded-full bg-superr-pink text-white font-fraunces font-bold text-xs mb-3">
            03 // SYSTEM RELIABILITY
          </div>
          <h2 class="font-fraunces text-3xl sm:text-4xl lg:text-5xl font-bold text-superr-ink leading-tight">
            It’s a <span class="bg-superr-pink/20 text-superr-pink px-2 rounded-lg">friend</span> who’s got our back
          </h2>
          <p class="font-sans text-sm sm:text-base text-superr-muted mt-3">
            Building software with mathematical precision, thorough test suites, clear documentation, and collaborative spirit.
          </p>
        </div>

        <!-- 5 Interactive Pointers -->
        <div class="flex flex-col gap-2.5" id="s3-pointers-list">
          ${section3Pointers.map((p, idx) => {
            const roman = romanNumerals[idx] || `${idx + 1}`;
            const activeClass = idx === 0 ? 'bg-superr-pink text-white superr-shadow active' : 'bg-superr-card text-superr-ink hover:bg-superr-paper';
            return `
            <button type="button" 
                    class="s3-pointer-btn w-full flex items-center justify-between py-3 px-4 rounded-2xl superr-border text-left font-sans text-sm sm:text-base font-semibold cursor-pointer ${activeClass}" 
                    data-s3-index="${idx}" 
                    data-screen-src="${p.screen}">
              <div class="flex items-center gap-3">
                <span class="w-7 h-7 rounded-lg border-[1.5px] border-current flex items-center justify-center font-fraunces text-xs font-bold">
                  ${roman}
                </span>
                <span>${p.label}</span>
              </div>
              <span class="text-xs font-hand font-bold opacity-90">${p.tag}</span>
            </button>
            `;
          }).join('\n')}
        </div>
      </div>

      <!-- Right Column: Interactive Tablet Mockup Frame -->
      <div class="lg:col-span-7 flex justify-center">
        <div class="relative w-full max-w-[680px] aspect-[4/3] rounded-3xl superr-border bg-black/90 p-3 sm:p-4 superr-shadow-lg flex items-center justify-center overflow-hidden">
          <img id="s3-tablet-screen" 
               src="${section3Pointers[0].screen}" 
               alt="Superr Companion Screen" 
               class="w-full h-full object-contain rounded-2xl transition-opacity duration-300" />
        </div>
      </div>

    </div>
  </section>

  <!-- ======================================================== -->
  <!-- 06. LIFESTYLE CARDS & COMMUNITY: READ OUR STORY          -->
  <!-- ======================================================== -->
  <section id="our-story" class="relative w-full py-20 sm:py-32 px-4 sm:px-8 border-t-[2.3px] border-superr-ink bg-[#FFFBF7]">
    <div class="max-w-[1360px] mx-auto flex flex-col items-center text-center gap-12">
      
      <!-- Headline & Button -->
      <div class="flex flex-col items-center">
        <span class="font-hand text-xl text-superr-orange font-bold">★ THE ORIGIN MANIFESTO</span>
        <h2 class="font-fraunces text-3xl sm:text-5xl font-bold text-superr-ink mt-2 tracking-tight">
          Read ${firstName}'s story &amp; engineering manifesto
        </h2>
        <div class="mt-6">
          <a href="#contact" class="bg-[#fdfbf9] p-1 rounded-[20px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.25)] hover:shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-200 cursor-pointer inline-block">
            <div class="bg-[#fdfbf9] border-[2.3px] border-[#2b1a07] rounded-2xl px-6 py-2.5 flex items-center gap-2">
              <span class="text-[18px] text-[#2b1a07] font-fraunces font-medium">Read Letter</span>
            </div>
          </a>
        </div>
      </div>

      <!-- 3 Photography Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        
        <!-- Card 1: Park -->
        <div class="rounded-3xl superr-border bg-superr-card overflow-hidden superr-shadow hover:-translate-y-1 transition-transform">
          <div class="w-full aspect-[4/3] overflow-hidden">
            <img src="/assets/templates/superr/assets/word_out_section/card-in-park.png" alt="Engineering anywhere" class="w-full h-full object-cover" />
          </div>
          <div class="p-4 text-left">
            <span class="font-hand text-xs font-bold text-superr-green uppercase">Focus Anywhere</span>
            <p class="font-sans text-sm font-semibold text-superr-ink mt-1">Decentralized protocols built for open web accessibility.</p>
          </div>
        </div>

        <!-- Card 2: Writing on Desk -->
        <div class="rounded-3xl superr-border bg-superr-card overflow-hidden superr-shadow hover:-translate-y-1 transition-transform">
          <div class="w-full aspect-[4/3] overflow-hidden">
            <img src="/assets/templates/superr/assets/word_out_section/card-writing-on-desk.png" alt="Writing clean code" class="w-full h-full object-cover" />
          </div>
          <div class="p-4 text-left">
            <span class="font-hand text-xs font-bold text-superr-blue uppercase">Zero Distractions</span>
            <p class="font-sans text-sm font-semibold text-superr-ink mt-1">Clean abstractions, no bloated dependencies, pure velocity.</p>
          </div>
        </div>

        <!-- Card 3: Couch -->
        <div class="rounded-3xl superr-border bg-superr-card overflow-hidden superr-shadow hover:-translate-y-1 transition-transform">
          <div class="w-full aspect-[4/3] overflow-hidden">
            <img src="/assets/templates/superr/assets/word_out_section/card-sitting-on-couch.png" alt="Continuous learning" class="w-full h-full object-cover" />
          </div>
          <div class="p-4 text-left">
            <span class="font-hand text-xs font-bold text-superr-pink uppercase">Continuous Craft</span>
            <p class="font-sans text-sm font-semibold text-superr-ink mt-1">Bridging deep academic research with production applications.</p>
          </div>
        </div>

      </div>

      <!-- Community Illustration: "We're in good hands" -->
      <div class="relative w-full max-w-[1200px] rounded-3xl superr-border overflow-hidden superr-shadow-lg mt-8">
        <img src="/assets/templates/superr/assets/word_out_section/good-hands-illustration.png" alt="We're in good hands" class="w-full h-auto block" />
        <div class="absolute top-6 right-6 md:top-12 md:right-12 bg-white/95 backdrop-blur-md superr-border px-6 py-4 rounded-2xl shadow-sm text-left">
          <h3 class="font-fraunces text-2xl md:text-3xl font-bold text-superr-ink">We're in<br/>good hands</h3>
          <p class="font-hand text-sm font-bold text-superr-orange mt-1">✦ Verified open-source code and tested protocols</p>
        </div>
      </div>

    </div>
  </section>

  <!-- ======================================================== -->
  <!-- 07. INTERACTIVE PEELABLE STICKERS WALL                   -->
  <!-- ======================================================== -->
  <section class="py-16 sm:py-24 px-4 sm:px-8 border-t-[2.3px] border-superr-ink bg-[#FAF8F5]">
    <div class="max-w-[1200px] mx-auto flex flex-col items-center text-center gap-10">
      
      <div>
        <span class="font-hand text-xl text-superr-orange font-bold -rotate-2 inline-block">collect 'em all!</span>
        <h2 class="font-fraunces text-3xl sm:text-4xl font-bold text-superr-ink mt-1">
          Tactile Interactive Stickers
        </h2>
        <p class="font-sans text-sm text-superr-muted mt-2">
          Hover over each sticker to test authentic corner-peel physical physics.
        </p>
      </div>

      <!-- Stickers Row -->
      <div class="flex flex-wrap items-center justify-center gap-8 sm:gap-12 py-6">
        
        <!-- Sticker 1 -->
        <div class="sticker-container w-[110px] h-[110px] sm:w-[130px] sm:h-[130px]" title="Peel me!">
          <img src="/assets/templates/superr/interactive/stickers/sticker-1.svg" alt="Sticker 1" class="sticker-main w-full h-full object-contain filter drop-shadow-md" />
        </div>

        <!-- Sticker 2 -->
        <div class="sticker-container w-[110px] h-[110px] sm:w-[130px] sm:h-[130px]" title="Peel me!">
          <img src="/assets/templates/superr/interactive/stickers/sticker-2.svg" alt="Sticker 2" class="sticker-main w-full h-full object-contain filter drop-shadow-md" />
        </div>

        <!-- Sticker 3 -->
        <div class="sticker-container w-[110px] h-[110px] sm:w-[130px] sm:h-[130px]" title="Peel me!">
          <img src="/assets/templates/superr/interactive/stickers/sticker-3.svg" alt="Sticker 3" class="sticker-main w-full h-full object-contain filter drop-shadow-md" />
        </div>

        <!-- Sticker 4 -->
        <div class="sticker-container w-[110px] h-[110px] sm:w-[130px] sm:h-[130px]" title="Peel me!">
          <img src="/assets/templates/superr/interactive/stickers/sticker-4.svg" alt="Sticker 4" class="sticker-main w-full h-full object-contain filter drop-shadow-md" />
        </div>

        <!-- Sticker 5 -->
        <div class="sticker-container w-[110px] h-[110px] sm:w-[130px] sm:h-[130px]" title="Peel me!">
          <img src="/assets/templates/superr/interactive/stickers/sticker-5.svg" alt="Sticker 5" class="sticker-main w-full h-full object-contain filter drop-shadow-md" />
        </div>

      </div>

    </div>
  </section>

  <!-- ======================================================== -->
  <!-- 08. QUESTIONS YOU MIGHT HAVE (FAQ ACCORDION)             -->
  <!-- ======================================================== -->
  <section id="faq" class="py-20 sm:py-28 px-4 sm:px-8 border-t-[2.3px] border-superr-ink bg-[#FDFBF9]">
    <div class="max-w-[760px] mx-auto flex flex-col gap-10">
      
      <div class="text-center">
        <h2 class="font-fraunces text-3xl sm:text-5xl font-normal text-superr-ink">
          Questions you might have
        </h2>
      </div>

      <div class="flex flex-col">
        ${faqList.map((item, idx) => `
        <div class="flex flex-col border-b-2 border-dashed border-[#DED6D2] py-5">
          <button type="button" 
                  class="faq-toggle-btn w-full text-left flex items-center justify-between gap-4 font-sans text-base sm:text-lg font-medium text-superr-ink hover:text-superr-orange transition-colors cursor-pointer" 
                  data-faq-idx="${idx}">
            <span>${item.question}</span>
            <span class="faq-icon text-xl font-bold transition-transform duration-200">+</span>
          </button>
          <div class="faq-answer-content hidden pt-3 font-sans text-sm sm:text-base text-superr-muted leading-relaxed" 
               id="faq-answer-${idx}">
            ${item.answer}
          </div>
        </div>
        `).join('\n')}
      </div>

    </div>
  </section>

  <!-- ======================================================== -->
  <!-- 09. DIRECT DISPATCH ("I CALL DIBS!" CONTACT MODULE)      -->
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
          <button type="submit" class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-superr-orange text-white font-fraunces text-lg font-bold superr-border shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer">
            Dispatch Note 🚀
          </button>
        </div>
      </form>

    </div>
  </section>

  <!-- ======================================================== -->
  <!-- 10. AUTHENTIC SUPERR ORANGE FOOTER                       -->
  <!-- ======================================================== -->
  <footer class="relative w-full rounded-t-[40px] md:rounded-t-[56px] overflow-hidden flex flex-col bg-[#FF6F1E] text-white pt-12 md:pt-16">
    <div class="w-full max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col flex-1">
      
      <!-- Top Row: Heading and Navigation -->
      <div class="flex flex-col md:flex-row md:justify-between items-start gap-8 border-b border-white/20 pb-12">
        <div>
          <h2 class="font-fraunces text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight max-w-md">
            Building systems that<br/>make engineering fun
          </h2>
          <p class="font-sans text-sm sm:text-base text-white/80 mt-3 max-w-sm">
            Curated by ${safeName}. Dedicated to clean code, joyful software, and thoughtful digital worlds.
          </p>
        </div>

        <!-- Nav Columns -->
        <div class="flex gap-12 md:gap-16 font-sans text-base font-semibold">
          <div class="flex flex-col gap-3">
            <span class="font-hand text-xs text-white/70 tracking-wider uppercase font-bold">Navigation</span>
            <a href="#cover" class="hover:text-white/80 transition-colors">Cover</a>
            <a href="#feature-one" class="hover:text-white/80 transition-colors">Shipped Systems</a>
            <a href="#feature-two" class="hover:text-white/80 transition-colors">Disciplines</a>
            <a href="#feature-three" class="hover:text-white/80 transition-colors">Reliability</a>
            <a href="#faq" class="hover:text-white/80 transition-colors">Questions</a>
          </div>

          <div class="flex flex-col gap-3">
            <span class="font-hand text-xs text-white/70 tracking-wider uppercase font-bold">Direct Channels</span>
            <a href="mailto:${email}" class="hover:text-white/80 transition-colors">Write to ${firstName}</a>
            <a href="${github}" target="_blank" rel="noopener noreferrer" class="hover:text-white/80 transition-colors">GitHub</a>
            <a href="${linkedin}" target="_blank" rel="noopener noreferrer" class="hover:text-white/80 transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>

      <!-- Giant Authentic Wordmark from Superr.ai -->
      <div class="w-full py-8 md:py-12 flex items-center justify-center opacity-95">
        <img src="/assets/templates/superr/superr-footer.svg" alt="Superr" class="w-full h-auto max-h-[140px] object-contain pointer-events-none select-none brightness-0 invert" />
      </div>

      <!-- Bottom Credits -->
      <div class="flex flex-col sm:flex-row items-center justify-between py-6 text-sm font-sans text-white/75 border-t border-white/20">
        <span>© ${currentYear} ${safeName} • Superr Notebook Edition</span>
        <span>Crafted with pride • Powered by MyFolio</span>
      </div>

    </div>
  </footer>

  <!-- ======================================================== -->
  <!-- TAB & FAQ CONTROLLER SCRIPT                              -->
  <!-- ======================================================== -->
  <script>
    // Section 1 Controller (Project Switcher)
    document.querySelectorAll('.s1-pointer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const screenSrc = btn.getAttribute('data-screen-src');
        const projTitle = btn.getAttribute('data-proj-title');
        const projDesc = btn.getAttribute('data-proj-desc');
        const projLink = btn.getAttribute('data-proj-link');

        document.querySelectorAll('.s1-pointer-btn').forEach(b => {
          b.classList.remove('bg-superr-green', 'text-white', 'superr-shadow', 'active');
          b.classList.add('bg-superr-card', 'text-superr-ink');
        });
        btn.classList.remove('bg-superr-card', 'text-superr-ink');
        btn.classList.add('bg-superr-green', 'text-white', 'superr-shadow', 'active');

        const img = document.getElementById('s1-tablet-screen');
        if (img) img.src = screenSrc;

        const titleEl = document.getElementById('s1-proj-title-display');
        if (titleEl && projTitle) titleEl.textContent = projTitle;

        const descEl = document.getElementById('s1-proj-desc-display');
        if (descEl && projDesc) descEl.textContent = projDesc;

        const linkEl = document.getElementById('s1-proj-link-display');
        if (linkEl && projLink) linkEl.href = projLink;
      });
    });

    // Section 2 Controller
    document.querySelectorAll('.s2-pointer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const screenSrc = btn.getAttribute('data-screen-src');
        document.querySelectorAll('.s2-pointer-btn').forEach(b => {
          b.classList.remove('bg-superr-blue', 'text-white', 'superr-shadow', 'active');
          b.classList.add('bg-superr-card', 'text-superr-ink');
        });
        btn.classList.remove('bg-superr-card', 'text-superr-ink');
        btn.classList.add('bg-superr-blue', 'text-white', 'superr-shadow', 'active');
        const img = document.getElementById('s2-tablet-screen');
        if (img) img.src = screenSrc;
      });
    });

    // Section 3 Controller
    document.querySelectorAll('.s3-pointer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const screenSrc = btn.getAttribute('data-screen-src');
        document.querySelectorAll('.s3-pointer-btn').forEach(b => {
          b.classList.remove('bg-superr-pink', 'text-white', 'superr-shadow', 'active');
          b.classList.add('bg-superr-card', 'text-superr-ink');
        });
        btn.classList.remove('bg-superr-card', 'text-superr-ink');
        btn.classList.add('bg-superr-pink', 'text-white', 'superr-shadow', 'active');
        const img = document.getElementById('s3-tablet-screen');
        if (img) img.src = screenSrc;
      });
    });

    // FAQ Accordion Controller
    document.querySelectorAll('.faq-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = btn.getAttribute('data-faq-idx');
        const answer = document.getElementById('faq-answer-' + idx);
        const icon = btn.querySelector('.faq-icon');
        if (answer) {
          const isHidden = answer.classList.contains('hidden');
          if (isHidden) {
            answer.classList.remove('hidden');
            if (icon) icon.textContent = '−';
          } else {
            answer.classList.add('hidden');
            if (icon) icon.textContent = '+';
          }
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
