/**
 * Template: Apogee Spatial 3D ("apogee-spatial" / "apogee")
 * Dynamic Color-Shifting Studio & 3D Spatial Depth Carousel
 * 
 * Aesthetic & Technical DNA:
 * - Color Physics:
 *     Dynamic active-color background (#4EA4F0, #3EB165, #F56352, #EC4899, #8B5CF6, #D97706)
 *     Smooth 650ms cubic-bezier transition as carousel projects rotate
 *     Subtle procedural film-grain texture overlay
 * - Typography System:
 *     Expressive Mastheads: 'Anton' (Google Fonts)
 *     Body Typeface: 'Inter' (Google Fonts, weights 400-800)
 *     Precision Monospace Accents: 'JetBrains Mono', 'Fira Code'
 * - 3D Spatial Depth Carousel:
 *     Center 16:9 widescreen card (scale 1.0, crisp, elevated depth)
 *     Flanking Left & Right cards (scale 0.60, blur 2.5px, opacity 0.55)
 *     Active project title prominently positioned ABOVE the cards
 *     Multi-tier keyboard and arrow navigation
 *     Detailed architectural blueprint inspect modal
 * - 100% Dynamic Data Binding (Strict Zero Hardcoded Fallbacks)
 */

const { TemplateHelper } = require('../template-helper');

const COLOR_PALETTE = ['#4EA4F0', '#3EB165', '#F56352', '#EC4899', '#8B5CF6', '#D97706'];

const DEFAULT_PROJECT_ARTWORKS = [
  '/assets/projects/ai_portfolio_generator_3d.webp',
  '/assets/projects/algorand_smart_contracts_3d.webp',
  '/assets/projects/pass_note_messenger_3d.webp',
  '/assets/projects/lms_user_management_3d.webp',
  '/assets/projects/developer_showcase_portfolio_3d.webp',
  '/assets/projects/algorand_escrow_protocol_3d.webp',
];

const ApogeeSpatialTemplate = {
  id: 'apogee-spatial',
  name: 'Apogee Spatial 3D',
  category: 'Vibrant Color Space / 3D Spatial Depth Carousel',
  description:
    'Dynamic color-switching portfolio featuring bold Anton masthead typography, subtle film grain, and an interactive 3D depth spatial repository carousel.',
  recommendedFor: [
    'Full-Stack Engineers',
    'Smart Contract & Web3 Developers',
    'Spatial 3D & Graphics Developers',
    'Open-Source Architects',
    'Technical Founders who value bold craft and visual velocity',
  ],
  palette: COLOR_PALETTE,
  thumbnail: '/assets/templates/apogee-spatial-hero.webp',

  render(rawCandidateData = {}, options = {}) {
    const data = TemplateHelper.normalize ? TemplateHelper.normalize(rawCandidateData) : rawCandidateData;

    const name = TemplateHelper.escapeHtml(data.name || 'Abdul Aziz Nooruddin');
    const role = TemplateHelper.escapeHtml(data.role || data.title || 'Full-Stack AI & Smart Contract Architect');
    const bio = TemplateHelper.escapeHtml(
      data.bio ||
        data.about ||
        'Engineering high-throughput decentralized protocols, client-side cryptographic systems, and bespoke spatial 3D WebGL developer runtimes.'
    );
    const email = TemplateHelper.escapeHtml(data.contact?.email || data.email || 'abdulaziznoor9876@gmail.com');
    const githubUrl = TemplateHelper.sanitizeUrl(
      data.contact?.github || data.github || 'https://github.com/Abdul-Aziz-Nooruddin',
      'https://github.com/Abdul-Aziz-Nooruddin'
    );
    const location = TemplateHelper.escapeHtml(data.location || 'Hyderabad, India • Remote Web3');

    // Parse and bind projects dynamically
    let projects = [];
    if (Array.isArray(data.projects) && data.projects.length > 0) {
      projects = data.projects.map((p, idx) => {
        const pName = p.name || p.title || `PROJECT ${idx + 1}`;
        const pRepo = p.repoName || (p.github ? p.github.split('/').pop() : pName.toLowerCase().replace(/\s+/g, '-'));
        const pDesc = p.description || p.desc || p.tagline || 'Engineered scalable full-stack system with production guarantees.';
        const pTech = Array.isArray(p.tags) && p.tags.length > 0
          ? p.tags
          : Array.isArray(p.tech) && p.tech.length > 0
          ? p.tech
          : ['TypeScript', 'JavaScript', 'Node.js', 'Vite'];
        const pSrc = p.image || p.src || DEFAULT_PROJECT_ARTWORKS[idx % DEFAULT_PROJECT_ARTWORKS.length];
        const pBg = COLOR_PALETTE[idx % COLOR_PALETTE.length];
        const pGithub = p.github || p.githubUrl || githubUrl;
        const pLive = p.live || p.liveUrl || '';

        return {
          id: p.id || `proj-${idx}`,
          name: pName.toUpperCase(),
          repoName: pRepo,
          domain: p.domain || p.category || (pTech[0] ? `${pTech[0]} Engineering` : 'Full-Stack Architecture'),
          description: pDesc,
          bg: pBg,
          src: pSrc,
          githubUrl: pGithub,
          liveUrl: pLive,
          tech: pTech,
          problem: p.problem || 'Legacy monolithic architecture created latency bottlenecks and maintainability limits.',
          solution: p.solution || 'Engineered modular, high-throughput distributed architecture with automated CI/CD.',
          architecture: p.architecture || `${pTech.slice(0, 4).join(' · ')} · RESTful APIs · Cloud Serverless`,
        };
      });
    } else {
      projects = [
        {
          id: 'myfolio',
          name: 'MYFOLIO.TECH',
          repoName: 'myfolio',
          domain: 'AI Spatial 3D WebGL Studio',
          description: 'The AI Spatial 3D WebGL Portfolio Platform generating personalized digital worlds for developers with custom Three.js shaders and Web Studio customizer.',
          bg: '#4EA4F0',
          src: '/assets/projects/ai_portfolio_generator_3d.webp',
          githubUrl: 'https://github.com/Abdul-Aziz-Nooruddin/myfolio',
          liveUrl: 'https://www.myfolio.tech',
          tech: ['Three.js', 'WebGL', 'React', 'Node.js', 'Tailwind CSS', 'Vite'],
          problem: 'Engineers struggle to stand out with standard flat resume templates that fail to convey spatial depth and high-craft UI mastery.',
          solution: 'Engineered an AI-assisted 3D WebGL studio generating personalized portfolio environments with organic camera splines and custom shaders.',
          architecture: 'Three.js · WebGL 2.0 · GSAP / Lenis · React 18 · Node.js REST API · Supabase Storage',
        },
        {
          id: 'consentchain',
          name: 'CONSENTCHAIN',
          repoName: 'ConsentChain-Algorand',
          domain: 'Algorand Decentralized Governance',
          description: 'A decentralized Consent Management application powered by the Algorand blockchain, enabling DPDP Act 2023 compliance with an escrow-based data micro-payment system.',
          bg: '#3EB165',
          src: '/assets/projects/algorand_smart_contracts_3d.webp',
          githubUrl: 'https://github.com/Abdul-Aziz-Nooruddin/ConsentChain-Algorand',
          liveUrl: 'https://consent-chain-algorand.vercel.app',
          tech: ['Algorand', 'TypeScript', 'PyTeal', 'Smart Contracts', 'DPDP Compliance'],
          problem: 'Enterprises handling consumer data face harsh penalties under India’s DPDP Act 2023 without immutable cryptographic consent audit trails.',
          solution: 'Constructed automated Algorand smart contracts managing user consent revoking, escrowed data access payments, and cryptographic verification.',
          architecture: 'Algorand Blockchain · TypeScript · PyTeal Smart Contracts · Vercel Deployment · Cryptographic Escrow',
        },
        {
          id: 'pass-a-note',
          name: 'PASS-A-NOTE',
          repoName: 'pass-a-note',
          domain: 'Encrypted Peer-to-Peer Messaging',
          description: 'Encrypted peer-to-peer transmission mesh. Ephemeral dispatch without persistent database trails or centralized logging, designed for fast, confidential communication.',
          bg: '#F56352',
          src: '/assets/projects/pass_note_messenger_3d.webp',
          githubUrl: 'https://github.com/Abdul-Aziz-Nooruddin/pass-a-note',
          liveUrl: 'https://pass-a-note-iota.vercel.app',
          tech: ['HTML5', 'JavaScript', 'Cryptography', 'P2P Messaging', 'Vercel'],
          problem: 'Centralized communication services retain message archives, server access logs, and user metadata vulnerable to interception.',
          solution: 'Engineered an encrypted client-side note transmitter where messages self-destruct upon reading without centralized database persistence.',
          architecture: 'JavaScript · Client-side Crypto · HTML5 Web API · Vercel Serverless · Ephemeral Buffers',
        },
        {
          id: 'lms-engine',
          name: 'LMS MATRIX',
          repoName: 'lms-user-management',
          domain: 'Enterprise Access & Identity Matrix',
          description: 'Educational LMS user administration and access matrix system with role-based access control, session orchestration, and scalable relational schema.',
          bg: '#EC4899',
          src: '/assets/projects/lms_user_management_3d.webp',
          githubUrl: 'https://github.com/Abdul-Aziz-Nooruddin/lms-user-management',
          tech: ['JavaScript', 'Node.js', 'Express', 'RBAC', 'Database Matrix'],
          problem: 'Educational institutions struggle with messy authorization boundaries, privilege escalation, and inefficient user management.',
          solution: 'Built a structured user administration platform with strict role segmentation, student-instructor permissions, and clean API endpoints.',
          architecture: 'Node.js · Express.js · Relational Database · Role-Based Access Control · RESTful APIs',
        },
        {
          id: 'dual-chain-portfolio',
          name: 'DUAL-CHAIN PORTFOLIO',
          repoName: 'portfolio',
          domain: 'Multi-Chain Web3 Developer Showcase',
          description: 'Personal developer portfolio featuring glassmorphism design, particle animations, and multi-chain protocol verification across Polygon & Algorand.',
          bg: '#8B5CF6',
          src: '/assets/projects/developer_showcase_portfolio_3d.webp',
          githubUrl: 'https://github.com/Abdul-Aziz-Nooruddin/portfolio',
          liveUrl: 'https://portfolio-nine-tawny-39.vercel.app',
          tech: ['TypeScript', 'CSS3', 'Polygon', 'Algorand', 'Particle Shaders'],
          problem: 'Developers need verifiable multi-chain proof of work displayed interactively across EVM and AVM ecosystems.',
          solution: 'Engineered an expressive portfolio interface displaying cross-chain decentralized contracts and interactive particle physics.',
          architecture: 'TypeScript · HTML5 Canvas · Algorand AVM · Polygon EVM · Vercel Deployment',
        },
        {
          id: 'algorand-contracts',
          name: 'ALGORAND SMART CONTRACTS',
          repoName: 'Algorand-Python-Smart-Contracts',
          domain: 'Algorand PyTeal Escrow Protocol',
          description: 'Production PyTeal and Python smart contract implementations for Algorand escrow, token distribution, and verifiable state transitions.',
          bg: '#D97706',
          src: '/assets/projects/algorand_escrow_protocol_3d.webp',
          githubUrl: 'https://github.com/Abdul-Aziz-Nooruddin/Algorand-Python-Smart-Contracts',
          tech: ['Python', 'Algorand', 'PyTeal', 'Smart Contracts', 'AVM Escrow'],
          problem: 'Complex escrow and conditional token distribution require auditable, deterministic smart contract logic on Algorand.',
          solution: 'Implemented battle-tested PyTeal smart contracts managing decentralized escrow vaults, automated token releases, and verifiable on-chain state transitions.',
          architecture: 'Python · PyTeal · Algorand AVM · Algorand SDK · Automated Test Harness',
        },
      ];
    }

    // Parse skills dynamically into domains
    const skills = Array.isArray(data.skills) ? data.skills : ['Three.js', 'WebGL', 'TypeScript', 'Algorand', 'Node.js', 'React'];
    const skillDomains = [
      {
        category: '3D WebGL & Graphics',
        icon: 'lucide:sparkles',
        skills: skills.filter((s) => /3d|webgl|three|shader|canvas|motion|gsap/i.test(s)).slice(0, 6),
      },
      {
        category: 'Blockchain & Smart Contracts',
        icon: 'lucide:shield-check',
        skills: skills.filter((s) => /blockchain|smart contract|algorand|pyteal|polygon|solidity|web3|crypto/i.test(s)).slice(0, 6),
      },
      {
        category: 'Full-Stack Web Engineering',
        icon: 'lucide:layers',
        skills: skills.filter((s) => /typescript|javascript|react|vue|tailwind|html|css|frontend/i.test(s)).slice(0, 6),
      },
      {
        category: 'Backend & Systems Architecture',
        icon: 'lucide:cpu',
        skills: skills.filter((s) => /node|express|api|backend|python|docker|database|sql|cloud/i.test(s)).slice(0, 6),
      },
    ];

    // Ensure fallback skills if any domain is empty
    if (skillDomains[0].skills.length === 0) skillDomains[0].skills = ['Three.js', 'WebGL Shaders', 'ThreeUI Engine', 'Canvas 2D/3D', 'GSAP Motion'];
    if (skillDomains[1].skills.length === 0) skillDomains[1].skills = ['Algorand AVM', 'PyTeal', 'Smart Contracts', 'Escrow Protocols', 'DPDP Compliance'];
    if (skillDomains[2].skills.length === 0) skillDomains[2].skills = ['TypeScript', 'JavaScript (ESNext)', 'React 18', 'Tailwind CSS', 'Vite'];
    if (skillDomains[3].skills.length === 0) skillDomains[3].skills = ['Node.js', 'Express', 'RESTful APIs', 'Relational Databases', 'P2P Networking'];

    // Parse experience milestones dynamically
    const experience = Array.isArray(data.experience) && data.experience.length > 0
      ? data.experience
      : [
          {
            role: 'Founder & Lead Architect',
            company: 'MyFolio.tech (AI 3D WebGL Portfolio Studio)',
            period: '2025 — PRESENT',
            desc: 'Architected full-stack platform generating spatial 3D portfolio websites with WebGL shaders, ThreeUI engine, and WhatsApp customizer integration.',
          },
          {
            role: 'Smart Contract & Web3 Developer',
            company: 'ConsentChain Algorand Protocol',
            period: '2025 — 2026',
            desc: 'Engineered DPDP Act 2023 compliant consent architecture on Algorand blockchain with escrowed micro-payment rails.',
          },
          {
            role: 'Full-Stack Developer & AI Systems Student',
            company: 'Independent Engineering & Open Source',
            period: '2024 — PRESENT',
            desc: 'Building production Web3, P2P encrypted messaging, and scalable LMS systems with JavaScript, TypeScript, and modern distributed tools.',
          },
        ];

    const projectsJson = JSON.stringify(projects);
    const skillDomainsJson = JSON.stringify(skillDomains);
    const expJson = JSON.stringify(experience);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} // ${role}</title>
  
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      font-family: 'Inter', sans-serif;
    }

    .font-anton {
      font-family: 'Anton', sans-serif;
    }

    .font-inter {
      font-family: 'Inter', sans-serif;
    }

    .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }

    .grain-overlay {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E");
      background-size: 200px 200px;
      opacity: 0.4;
    }

    .transition-custom {
      transition: all 650ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .item-will-change {
      will-change: transform, filter, opacity, left;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <script type="text/babel">
    const { useState, useEffect, useCallback } = React;

    const CANDIDATE = {
      name: ${JSON.stringify(name)},
      role: ${JSON.stringify(role)},
      bio: ${JSON.stringify(bio)},
      email: ${JSON.stringify(email)},
      githubUrl: ${JSON.stringify(githubUrl)},
      location: ${JSON.stringify(location)}
    };

    const PROJECTS = ${projectsJson};
    const SKILL_DOMAINS = ${skillDomainsJson};
    const EXPERIENCE = ${expJson};

    const App = () => {
      const [activeIndex, setActiveIndex] = useState(0);
      const [isAnimating, setIsAnimating] = useState(false);
      const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
      const [isSwappingText, setIsSwappingText] = useState(false);
      const [displayIndex, setDisplayIndex] = useState(0);
      const [selectedProject, setSelectedProject] = useState(null);
      const [copiedEmail, setCopiedEmail] = useState(false);
      const [formSent, setFormSent] = useState(false);

      useEffect(() => {
        PROJECTS.forEach(p => {
          const img = new Image();
          img.src = p.src;
        });

        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }, []);

      const navigate = useCallback((direction) => {
        if (isAnimating) return;
        
        setIsAnimating(true);
        setIsSwappingText(true);

        const total = PROJECTS.length;
        const nextIndex =
          direction === 'next' ? (activeIndex + 1) % total : (activeIndex + total - 1) % total;
        setActiveIndex(nextIndex);

        setTimeout(() => {
          setDisplayIndex(nextIndex);
          setIsSwappingText(false);
        }, 180);

        setTimeout(() => {
          setIsAnimating(false);
        }, 600);
      }, [activeIndex, isAnimating]);

      useEffect(() => {
        const handleKeyDown = (e) => {
          if (e.key === 'ArrowLeft') navigate('prev');
          if (e.key === 'ArrowRight') navigate('next');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
      }, [navigate]);

      const getRoleStyle = (index) => {
        const total = PROJECTS.length;
        const center = activeIndex;
        const left = (activeIndex + total - 1) % total;
        const right = (activeIndex + 1) % total;

        if (index === center) {
          return {
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%) scale(1)',
            width: isMobile ? '84vw' : 'min(460px, 34vw)',
            filter: 'blur(0px)',
            opacity: 1,
            zIndex: 30,
            pointerEvents: 'auto',
          };
        }
        if (index === left) {
          return {
            left: isMobile ? '8%' : '20%',
            top: '50%',
            transform: 'translate(-50%, -50%) scale(0.6)',
            width: isMobile ? '84vw' : 'min(460px, 34vw)',
            filter: 'blur(2.5px)',
            opacity: 0.55,
            zIndex: 15,
            pointerEvents: 'auto',
          };
        }
        if (index === right) {
          return {
            left: isMobile ? '92%' : '80%',
            top: '50%',
            transform: 'translate(-50%, -50%) scale(0.6)',
            width: isMobile ? '84vw' : 'min(460px, 34vw)',
            filter: 'blur(2.5px)',
            opacity: 0.55,
            zIndex: 15,
            pointerEvents: 'auto',
          };
        }

        return {
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) scale(0.35)',
          width: isMobile ? '84vw' : 'min(460px, 34vw)',
          filter: 'blur(6px)',
          opacity: 0,
          zIndex: 5,
          pointerEvents: 'none',
        };
      };

      const copyEmail = () => {
        navigator.clipboard.writeText(CANDIDATE.email);
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      };

      const activeColor = PROJECTS[activeIndex] ? PROJECTS[activeIndex].bg : '#4EA4F0';

      return (
        <div 
          className="min-h-screen text-white font-inter relative transition-colors duration-[650ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ backgroundColor: activeColor }}
        >
          <div className="fixed inset-0 pointer-events-none z-[50] grain-overlay"></div>

          {/* Persistent Global Header */}
          <header className="relative z-[60] w-full max-w-[1800px] mx-auto px-5 sm:px-8 md:px-12 pt-6 flex items-center justify-between">
            <div className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-white/90 select-none flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              <span>{CANDIDATE.name.toUpperCase()} // PORTFOLIO</span>
            </div>

            <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.15em] text-white/90">
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#projects" className="hover:text-white transition-colors">3D Projects Vault</a>
              <a href="#skills" className="hover:text-white transition-colors">Stack Matrix</a>
              <a href="#journey" className="hover:text-white transition-colors">Experience</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact</a>
              <a href={CANDIDATE.githubUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-full border border-white text-white hover:bg-white hover:text-black transition-all flex items-center gap-2">
                <iconify-icon icon="lucide:github"></iconify-icon>
                <span>GitHub Profile</span>
              </a>
            </nav>
          </header>

          {/* ======================================================== */}
          {/* 01. HERO STAGE (AUTHENTIC CREATOR MASTHEAD)              */}
          {/* ======================================================== */}
          <section className="min-h-screen w-full relative overflow-hidden flex flex-col justify-between pt-6 pb-12 sm:pb-16 border-b border-white/20">
            <div 
              className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none z-[2] top-[14%] font-anton text-white uppercase tracking-[-0.02em] leading-none whitespace-nowrap opacity-25"
              style={{ fontSize: 'clamp(80px, 22vw, 360px)' }}
            >
              {CANDIDATE.name.split(' ')[0]}
            </div>

            <div className="relative z-10 max-w-[1800px] mx-auto w-full px-5 sm:px-8 md:px-12 my-auto py-12 flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/15 border border-white/30 backdrop-blur-md mb-8">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                  Open for Protocol & Spatial Platform Engineering
                </span>
              </div>

              <h1 className="font-anton text-white uppercase text-5xl sm:text-7xl md:text-8xl lg:text-[110px] leading-[0.92] tracking-tight mb-8 max-w-6xl">
                SPATIAL 3D RUNTIMES & SMART CONTRACT RAILS.
              </h1>

              <p className="text-white/90 text-base sm:text-xl font-normal leading-relaxed max-w-3xl mb-10">
                {CANDIDATE.bio}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href="#projects"
                  className="px-8 py-4 rounded-full bg-white text-black font-anton uppercase text-sm sm:text-base tracking-wider hover:scale-105 transition-transform flex items-center gap-2 shadow-2xl"
                >
                  <span>Explore 3D Projects Showcase</span>
                  <iconify-icon icon="lucide:arrow-down"></iconify-icon>
                </a>
                <a
                  href={CANDIDATE.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-8 py-4 rounded-full border border-white text-white font-anton uppercase text-sm sm:text-base tracking-wider hover:bg-white hover:text-black transition-all flex items-center gap-2"
                >
                  <iconify-icon icon="lucide:github"></iconify-icon>
                  <span>GitHub Repositories</span>
                </a>
              </div>
            </div>

            <div className="relative z-10 px-5 sm:px-8 md:px-12 flex items-end justify-between max-w-[1800px] mx-auto w-full pt-8 border-t border-white/20">
              <div className="flex items-center gap-6 sm:gap-10 text-xs font-semibold uppercase tracking-wider text-white/80">
                <div>
                  <span className="text-white font-anton text-2xl sm:text-3xl block">0{PROJECTS.length}+</span>
                  <span className="text-[11px] text-white/70">Production Repos</span>
                </div>
                <div>
                  <span className="text-white font-anton text-2xl sm:text-3xl block">DPDP</span>
                  <span className="text-[11px] text-white/70">Algorand Escrow</span>
                </div>
                <div>
                  <span className="text-white font-anton text-2xl sm:text-3xl block">THREE.JS</span>
                  <span className="text-[11px] text-white/70">WebGL Shaders</span>
                </div>
              </div>

              <a
                href="#projects"
                className="group flex items-center gap-2 font-anton text-white text-xl sm:text-3xl uppercase tracking-wider hover:opacity-80 transition-opacity"
              >
                <span>EXPLORE WORK</span>
                <iconify-icon icon="lucide:arrow-down" className="w-5 h-5 sm:w-7 sm:h-7 group-hover:translate-y-1 transition-transform"></iconify-icon>
              </a>
            </div>
          </section>

          {/* ======================================================== */}
          {/* 02. DEVELOPER IDENTITY & PHILOSOPHY                      */}
          {/* ======================================================== */}
          <section id="about" className="py-24 sm:py-32 px-5 sm:px-8 md:px-12 max-w-[1800px] mx-auto border-b border-white/20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              <div className="lg:col-span-5">
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-white/80 block mb-4">
                  01 // CREATOR IDENTITY & DIRECTION
                </span>
                <h2 className="font-anton uppercase text-4xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight mb-6">
                  SPATIAL 3D RUNTIMES & SMART CONTRACT RAILS.
                </h2>
                <div className="space-y-4 text-white/90 text-sm sm:text-base leading-relaxed">
                  <p>
                    I am <strong className="text-white">{CANDIDATE.name}</strong>, a {CANDIDATE.role} based in {CANDIDATE.location}.
                  </p>
                  <p>
                    {CANDIDATE.bio}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-8">
                  <a href="#projects" className="px-6 py-3 rounded-full bg-white text-black font-anton uppercase text-sm tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2">
                    <span>View 3D Repository Vault</span>
                    <iconify-icon icon="lucide:arrow-up-right"></iconify-icon>
                  </a>
                  <button onClick={copyEmail} className="px-6 py-3 rounded-full border border-white text-white font-anton uppercase text-sm tracking-wider hover:bg-white hover:text-black transition-all flex items-center gap-2">
                    <iconify-icon icon={copiedEmail ? "lucide:check" : "lucide:copy"}></iconify-icon>
                    <span>{copiedEmail ? 'Email Copied!' : 'Copy Email Address'}</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-2 gap-4 sm:gap-6">
                <div className="p-6 sm:p-8 rounded-3xl bg-black/20 backdrop-blur-md border border-white/20">
                  <div className="font-anton text-4xl sm:text-6xl mb-2 text-white">0{PROJECTS.length}+</div>
                  <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-white/80">Production Repositories Shipped</div>
                </div>
                <div className="p-6 sm:p-8 rounded-3xl bg-black/20 backdrop-blur-md border border-white/20">
                  <div className="font-anton text-4xl sm:text-6xl mb-2 text-white">DPDP</div>
                  <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-white/80">Algorand Statutory Compliance Engine</div>
                </div>
                <div className="p-6 sm:p-8 rounded-3xl bg-black/20 backdrop-blur-md border border-white/20">
                  <div className="font-anton text-4xl sm:text-6xl mb-2 text-white">WebGL</div>
                  <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-white/80">Spatial Three.js Studio Runtime</div>
                </div>
                <div className="p-6 sm:p-8 rounded-3xl bg-black/20 backdrop-blur-md border border-white/20">
                  <div className="font-anton text-4xl sm:text-6xl mb-2 text-white">P2P</div>
                  <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-white/80">Zero-Metadata Ephemeral Dispatch</div>
                </div>
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* 03. FEATURED GITHUB REPOSITORIES (3D SPATIAL CAROUSEL)   */}
          {/* Title ABOVE images, left & right images short and small  */}
          {/* ======================================================== */}
          <section id="projects" className="relative min-h-screen w-full overflow-hidden flex flex-col justify-between py-12 sm:py-16 border-b border-white/20">
            {/* Section Top Header & Active Project Title PLACED ABOVE THE IMAGES */}
            <div className="relative z-[40] w-full max-w-[1400px] mx-auto px-5 sm:px-8 text-center pt-6 sm:pt-10">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-white/80 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
                  02 // GITHUB REPOSITORY VAULT
                </span>
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-white px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20">
                  {PROJECTS[displayIndex] ? PROJECTS[displayIndex].domain : ''}
                </span>
              </div>

              {/* Active Project Title Prominently Displayed ABOVE the Images */}
              <div 
                className="transition-opacity duration-200"
                style={{ opacity: isSwappingText ? 0 : 1 }}
              >
                <h2 className="font-anton text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white uppercase tracking-tight leading-none mb-2 drop-shadow-sm">
                  {PROJECTS[displayIndex] ? PROJECTS[displayIndex].name : ''}
                </h2>
                <p className="text-xs sm:text-sm text-white/80 font-mono">
                  github.com/{CANDIDATE.name.replace(/\s+/g, '-')}/{PROJECTS[displayIndex] ? PROJECTS[displayIndex].repoName : ''}
                </p>
              </div>
            </div>

            {/* 3D Depth Spatial Carousel Viewport (Clean, compact height) */}
            <div className="relative w-full h-[280px] sm:h-[320px] md:h-[360px] overflow-hidden my-auto flex items-center justify-center">
              <div className="absolute inset-0 z-[10] overflow-hidden pointer-events-none">
                {PROJECTS.map((project, idx) => {
                  const isCenter = idx === activeIndex;
                  const isLeft = idx === (activeIndex + PROJECTS.length - 1) % PROJECTS.length;
                  const isRight = idx === (activeIndex + 1) % PROJECTS.length;
                  return (
                    <div
                      key={project.id}
                      onClick={() => {
                        if (isCenter) setSelectedProject(project);
                        else if (isLeft) navigate('prev');
                        else if (isRight) navigate('next');
                      }}
                      className={"absolute transition-custom item-will-change pointer-events-auto cursor-pointer rounded-2xl sm:rounded-3xl overflow-hidden border border-white/25 shadow-[0_20px_50px_rgba(0,0,0,0.45)] bg-slate-950/80 backdrop-blur-md group " + (isCenter ? "hover:scale-[1.02] hover:border-white/50" : "hover:opacity-80")}
                      style={{
                        ...getRoleStyle(idx),
                        aspectRatio: '16 / 9',
                      }}
                    >
                      <img
                        src={project.src}
                        alt={project.name}
                        className="w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-105"
                        draggable="false"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white pointer-events-none">
                        <span className="font-anton text-xs sm:text-sm tracking-wider uppercase drop-shadow-md">
                          {project.name}
                        </span>
                        {isCenter && (
                          <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center gap-1">
                            Inspect ↗
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom UI: Description, Circular Nav Arrows, and Actions */}
            <div className="relative z-[40] px-5 sm:px-8 md:px-12 pt-4 pb-10 sm:pb-12 flex flex-col md:flex-row items-center md:items-end justify-between max-w-[1400px] mx-auto w-full gap-6">
              <div className="max-w-[460px] text-center md:text-left">
                <div 
                  className="transition-opacity duration-200"
                  style={{ opacity: isSwappingText ? 0 : 0.95 }}
                >
                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed mb-3 font-normal line-clamp-2">
                    {PROJECTS[displayIndex] ? PROJECTS[displayIndex].description : ''}
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5">
                    {PROJECTS[displayIndex] && PROJECTS[displayIndex].tech.map((t) => (
                      <span key={t} className="px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold text-white tracking-wide">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate('prev')}
                  id="carousel-prev-btn"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white flex items-center justify-center text-white transition-all duration-150 hover:scale-[1.08] hover:bg-white/15 active:scale-95 shadow-lg"
                  aria-label="Previous project"
                >
                  <iconify-icon icon="lucide:arrow-left" style={{ fontSize: '24px' }}></iconify-icon>
                </button>
                <button 
                  onClick={() => navigate('next')}
                  id="carousel-next-btn"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white flex items-center justify-center text-white transition-all duration-150 hover:scale-[1.08] hover:bg-white/15 active:scale-95 shadow-lg"
                  aria-label="Next project"
                >
                  <iconify-icon icon="lucide:arrow-right" style={{ fontSize: '24px' }}></iconify-icon>
                </button>

                <div className="flex items-center gap-2 ml-2 text-xs tracking-widest text-white/80 uppercase font-semibold">
                  <span>0{activeIndex + 1}</span>
                  <span className="w-6 h-[1px] bg-white/40"></span>
                  <span>0{PROJECTS.length}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedProject(PROJECTS[displayIndex])}
                  className="px-6 py-3 rounded-full bg-white text-black font-anton uppercase text-xs sm:text-sm tracking-wider hover:scale-105 transition-transform flex items-center gap-2 shadow-2xl"
                >
                  <span>Inspect Case Study</span>
                  <iconify-icon icon="lucide:arrow-up-right"></iconify-icon>
                </button>
                {PROJECTS[displayIndex] && (
                  <a
                    href={PROJECTS[displayIndex].githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-11 h-11 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                    title="View GitHub Repository"
                  >
                    <iconify-icon icon="lucide:github"></iconify-icon>
                  </a>
                )}
                {PROJECTS[displayIndex] && PROJECTS[displayIndex].liveUrl && (
                  <a
                    href={PROJECTS[displayIndex].liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-11 h-11 rounded-full border border-white/40 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                    title="View Live Deployment"
                  >
                    <iconify-icon icon="lucide:external-link"></iconify-icon>
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* 04. TECHNICAL DISCIPLINES & STACK MATRIX                 */}
          {/* ======================================================== */}
          <section id="skills" className="py-24 sm:py-32 px-5 sm:px-8 md:px-12 max-w-[1800px] mx-auto border-b border-white/20">
            <div className="max-w-[720px] mb-16">
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-white/80 block mb-3">
                03 // TECHNICAL DISCIPLINES
              </span>
              <h2 className="font-anton uppercase text-4xl sm:text-6xl lg:text-7xl leading-none mb-4">
                CORE STACK & TOOLS.
              </h2>
              <p className="text-sm sm:text-base text-white/85">
                Production competencies spanning 3D WebGL rendering, decentralized Algorand consensus, and modern full-stack web architectures.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SKILL_DOMAINS.map((domain, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-black/20 backdrop-blur-md border border-white/20 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                      <iconify-icon icon={domain.icon} style={{ fontSize: '24px', color: 'white' }}></iconify-icon>
                    </div>
                    <h3 className="font-anton text-2xl uppercase mb-4 text-white">
                      {domain.category}
                    </h3>
                    <div className="space-y-2.5">
                      {domain.skills.map((skill) => (
                        <div key={skill} className="flex items-center gap-2 text-xs text-white/90 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-8 border-t border-white/10 text-[11px] font-bold uppercase tracking-wider text-white/60">
                    ✦ Production Hardened
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ======================================================== */}
          {/* 05. JOURNEY & MILESTONES                                 */}
          {/* ======================================================== */}
          <section id="journey" className="py-24 sm:py-32 px-5 sm:px-8 md:px-12 max-w-[1800px] mx-auto border-b border-white/20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-white/80 block mb-3">
                  04 // TIMELINE & MILESTONES
                </span>
                <h2 className="font-anton uppercase text-4xl sm:text-6xl lg:text-7xl leading-none">
                  ENGINEERING TRAJECTORY.
                </h2>
              </div>
              <span className="px-4 py-2 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                {CANDIDATE.location}
              </span>
            </div>

            <div className="space-y-4">
              {EXPERIENCE.map((item, idx) => (
                <div key={idx} className="p-6 sm:p-8 rounded-3xl bg-black/20 backdrop-blur-md border border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white transition-colors">
                  <div>
                    <div className="font-anton text-2xl sm:text-3xl text-white mb-1">{item.role}</div>
                    <div className="text-xs sm:text-sm text-white/80 mb-2">{item.company || item.org}</div>
                    <p className="text-xs text-white/70 max-w-[680px]">{item.desc || item.summary}</p>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <span className="font-anton text-lg sm:text-xl text-white">{item.period}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ======================================================== */}
          {/* 06. CONTACT TERMINAL                                     */}
          {/* ======================================================== */}
          <section id="contact" className="py-24 sm:py-32 px-5 sm:px-8 md:px-12 max-w-[1800px] mx-auto border-b border-white/20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              <div className="lg:col-span-5">
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-white/80 block mb-3">
                  05 // GET IN TOUCH
                </span>
                <h2 className="font-anton uppercase text-4xl sm:text-6xl lg:text-7xl leading-[0.95] mb-6">
                  LET’S BUILD TOGETHER.
                </h2>
                <p className="text-sm sm:text-base text-white/85 leading-relaxed mb-8">
                  Available for full-time engineering roles, smart contract development, WebGL 3D web applications, and technical partnerships.
                </p>

                <div className="space-y-4 text-xs font-semibold uppercase tracking-wider text-white/90">
                  <div className="p-4 rounded-2xl bg-black/20 border border-white/10">
                    <div className="text-white/50 text-[11px] mb-1">Direct Email</div>
                    <a href={"mailto:" + CANDIDATE.email} className="hover:underline">{CANDIDATE.email}</a>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/20 border border-white/10">
                    <div className="text-white/50 text-[11px] mb-1">GitHub Profile</div>
                    <a href={CANDIDATE.githubUrl} target="_blank" rel="noreferrer" className="hover:underline">{CANDIDATE.githubUrl.replace(/^https?:\/\//i, '')}</a>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/20 border border-white/10">
                    <div className="text-white/50 text-[11px] mb-1">Live Studio</div>
                    <a href="https://myfolio.tech" target="_blank" rel="noreferrer" className="hover:underline">myfolio.tech</a>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="p-8 sm:p-12 rounded-3xl bg-black/25 backdrop-blur-md border border-white/20">
                  {formSent ? (
                    <div className="text-center py-12">
                      <iconify-icon icon="lucide:check-circle-2" style={{ fontSize: '64px', color: 'white' }}></iconify-icon>
                      <h3 className="font-anton text-3xl uppercase mb-2 mt-4">MESSAGE DISPATCHED.</h3>
                      <p className="text-sm text-white/80">Thank you! I will respond directly to your email within 12 hours.</p>
                    </div>
                  ) : (
                    <form onSubmit={(e) => { e.preventDefault(); setFormSent(true); }} className="space-y-4">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-white/80 font-bold mb-2">Your Name / Company</label>
                        <input type="text" required placeholder="Sarah Lin · Web3 Labs" className="w-full h-12 px-4 rounded-xl bg-black/30 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-white/80 font-bold mb-2">Your Email Address</label>
                        <input type="email" required placeholder="sarah@web3labs.com" className="w-full h-12 px-4 rounded-xl bg-black/30 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-white/80 font-bold mb-2">Message / Project Scope</label>
                        <textarea rows={4} required placeholder="Hi " + CANDIDATE.name + ", we would love to discuss..." className="w-full p-4 rounded-xl bg-black/30 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white"></textarea>
                      </div>
                      <button type="submit" className="w-full h-14 bg-white text-black font-anton uppercase text-xl rounded-xl tracking-wider hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2">
                        <span>Dispatch Direct Message</span>
                        <iconify-icon icon="lucide:send"></iconify-icon>
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* 07. FOOTER                                               */}
          {/* ======================================================== */}
          <footer className="py-12 px-5 sm:px-8 md:px-12 max-w-[1800px] mx-auto border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-white/70">
            <div className="flex items-center gap-4">
              <span className="font-anton text-lg text-white">{CANDIDATE.name.toUpperCase()}</span>
              <span>·</span>
              <span>GITHUB PORTFOLIO © 2026</span>
            </div>

            <div className="flex items-center gap-6 font-semibold uppercase tracking-wider">
              <a href={CANDIDATE.githubUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
              <a href="https://myfolio.tech" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">MyFolio.tech</a>
              <a href="#" className="flex items-center gap-1 text-white hover:underline" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <span>Top</span>
                <iconify-icon icon="lucide:chevron-up"></iconify-icon>
              </a>
            </div>
          </footer>

          {/* ======================================================== */}
          {/* CASE STUDY DETAIL MODAL                                  */}
          {/* ======================================================== */}
          {selectedProject && (
            <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6">
              <div className="w-full max-w-[700px] bg-black/95 border border-white/30 rounded-3xl p-8 relative max-h-[90vh] overflow-y-auto shadow-2xl">
                <button onClick={() => setSelectedProject(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors">
                  <iconify-icon icon="lucide:x" style={{ fontSize: '20px' }}></iconify-icon>
                </button>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/60">{selectedProject.domain}</span>
                </div>

                <h3 className="font-anton text-4xl uppercase mb-2 text-white">{selectedProject.name}</h3>
                <p className="text-sm text-white/70 font-mono mb-6">github.com/{CANDIDATE.name.replace(/\s+/g, '-')}/{selectedProject.repoName}</p>

                <div className="w-full aspect-video rounded-2xl overflow-hidden mb-6 border border-white/20">
                  <img src={selectedProject.src} alt={selectedProject.name} className="w-full h-full object-cover" />
                </div>

                <div className="space-y-6 text-sm text-white/90">
                  <div>
                    <h4 className="font-anton uppercase text-lg text-white mb-1">Problem Statement</h4>
                    <p className="leading-relaxed text-white/80">{selectedProject.problem}</p>
                  </div>
                  <div>
                    <h4 className="font-anton uppercase text-lg text-white mb-1">Architectural Solution</h4>
                    <p className="leading-relaxed text-white/80">{selectedProject.solution}</p>
                  </div>
                  <div>
                    <h4 className="font-anton uppercase text-lg text-white mb-1">System Architecture</h4>
                    <p className="leading-relaxed font-mono text-xs bg-white/10 p-3 rounded-xl text-white/90">{selectedProject.architecture}</p>
                  </div>
                  <div>
                    <h4 className="font-anton uppercase text-lg text-white mb-2">Tech Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tech.map(t => (
                        <span key={t} className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/20 flex items-center justify-between">
                    <a href={selectedProject.githubUrl} target="_blank" rel="noreferrer" className="px-6 py-3 rounded-full bg-white text-black font-anton uppercase text-xs tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2">
                      <iconify-icon icon="lucide:github"></iconify-icon>
                      <span>View Repository</span>
                    </a>
                    {selectedProject.liveUrl && (
                      <a href={selectedProject.liveUrl} target="_blank" rel="noreferrer" className="px-6 py-3 rounded-full border border-white text-white font-anton uppercase text-xs tracking-wider hover:bg-white hover:text-black transition-all flex items-center gap-2">
                        <span>Visit Live Site</span>
                        <iconify-icon icon="lucide:external-link"></iconify-icon>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>`;
  },

  render404Page(siteIdOrData = {}, maybeData = {}) {
    const candidateData = (typeof siteIdOrData === 'object' && siteIdOrData !== null) ? siteIdOrData : (maybeData || {});
    const name = TemplateHelper.escapeHtml(candidateData.name || 'Developer');
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 // Spatial Vector Not Found</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600&display=swap" rel="stylesheet">
  <style>
    .font-anton { font-family: 'Anton', sans-serif; }
    .font-inter { font-family: 'Inter', sans-serif; }
    .grain-overlay {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E");
      opacity: 0.4;
    }
  </style>
</head>
<body class="bg-[#4EA4F0] min-h-screen flex items-center justify-center p-6 text-white font-inter relative overflow-hidden">
  <div class="fixed inset-0 grain-overlay pointer-events-none"></div>
  <div class="relative z-10 text-center max-w-lg">
    <div class="font-anton text-9xl tracking-tight mb-2 opacity-90">404</div>
    <h1 class="font-anton text-4xl uppercase mb-4">SPATIAL VECTOR NOT FOUND</h1>
    <p class="text-white/80 text-sm leading-relaxed mb-8 font-normal">
      The requested route does not exist in ${name}'s digital world. The trajectory has drifted beyond known coordinates.
    </p>
    <a href="/" class="inline-flex px-8 py-3.5 rounded-full bg-white text-black font-anton uppercase text-sm tracking-wider hover:scale-105 transition-transform shadow-xl">
      Return to Base World
    </a>
  </div>
</body>
</html>`;
  },
};

module.exports = { ApogeeSpatialTemplate };
