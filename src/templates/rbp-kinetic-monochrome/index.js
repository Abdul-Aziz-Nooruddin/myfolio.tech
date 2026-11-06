/**
 * Template: RBP Kinetic Monochrome ("rbp-kinetic-monochrome")
 * Inspired by DavidHDev/rbp-portfolio
 * 
 * Aesthetic & Technical DNA:
 * - Color System:
 *     Dark Mode (default): Background #0a0a0a, Foreground #fafafa, Muted #171717, Border #262626
 *     Light Mode: Background #ffffff, Foreground #0a0a0a, Muted #f5f5f5, Border #e5e5e5
 * - Typography: Inter, Fraunces (Serif accent), JetBrains Mono
 * - Visual Highlights:
 *     1. Signature WebGL Flow Shader: aspect-correct circular fade baked into fragment, theme-aware bg sync
 *     2. Signature WebGL Morphing Portrait: hover-driven WebGL displacement ripple/warp shader with magnetic cursor follow
 *     3. Dual Gender & Photo Persona Support:
 *        - Male character: /assets/designs/rbp-portfolio/josh.webp -> josh_wave.webp
 *        - Female character: /assets/designs/rbp-portfolio/maya.webp -> maya_wave.webp
 *        - Custom Photo mode: candidate's actual avatar/photo
 *        - Interactive in-situ switcher pill: [ 👦 Josh | 👧 Maya | 📷 Photo ]
 *     4. Dribbble-style Project Cards with hover lift, image zoom, tag pills, and external links
 *     5. Interactive Physics Tech Stack Chips: colliding gravity physics where skills bounce and can be dragged/thrown
 *     6. Interactive Polaroid Strip with spring physics hover lift and dotted backs
 *     7. Expandable Experience Timeline with accordion collapse
 *     8. Shader-backed Contact Card with single-click copy email button and social CTAs
 *     9. Fixed Site Frame with sleek rails and rounded corners
 */

const { TemplateHelper } = require('../template-helper');
const { ProjectArtworkSynthesizer } = require('../project-artwork-synthesizer');

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

  const art = ProjectArtworkSynthesizer.resolveProjectArtwork(project, 'rbp-kinetic-monochrome', index, usedSet, userSeed);
  return art.src;
}

const RBPKineticMonochromeTemplate = {
  id: 'rbp-kinetic-monochrome',
  name: 'RBP Kinetic Monochrome',
  category: 'Kinetic Monochrome / WebGL Flow Shader / Morphing Portrait Studio',
  description: 'Signature calm black-and-white portfolio scaffold built around an interactive WebGL flow shader, interactive displacement morphing portrait with male/female/photo personas, Matter.js physics skills chips, expandable experience timeline, dribbble-style project cards, and shader-backed contact card.',
  recommendedFor: [
    'Design Engineers',
    'Product Designers',
    'Frontend & Full-Stack Developers',
    'Creative Technologists',
    'Founders & Indie Hackers'
  ],
  palette: ['#0A0A0A', '#FAFAFA', '#171717', '#262626'],
  thumbnail: '/assets/templates/rbp-kinetic-monochrome-hero.webp',

  render(rawCandidateData = {}, options = {}) {
    const data = TemplateHelper.normalize ? TemplateHelper.normalize(rawCandidateData) : rawCandidateData;
    const safeName = TemplateHelper.escapeHtml(data.name || 'Creative Engineer');
    const nameParts = safeName.trim().split(/\s+/);
    const firstName = nameParts[0] || safeName;
    const safeRole = TemplateHelper.escapeHtml(data.role || 'Design Engineer & Full-Stack Developer');
    const safeBio = TemplateHelper.escapeHtml(data.bio || 'Designing and engineering focused software surfaces where ideas, code, and aesthetics coexist cleanly.');
    const safeEmail = TemplateHelper.escapeHtml(data.email || 'hello@example.com');
    const safeLocation = TemplateHelper.escapeHtml(data.location || 'Remote / Worldwide');

    const github = data.github || '';
    const linkedin = data.linkedin || '';
    const twitter = data.twitter || '';
    const website = data.website || '';

    // Automatically identify candidate gender from data, bio, pronouns, and name
    const inferredGender = TemplateHelper.inferGender(data.name || '', (data.bio || '') + ' ' + (data.about || ''));
    const isFemale = (data.gender === 'female') || (data.avatarSet === 'female') || (inferredGender === 'female');
    const hasPhoto = Boolean(data.avatar && data.avatar.trim() && !data.avatar.includes('placeholder'));
    
    let defaultSrcA = '/assets/designs/rbp-portfolio/josh.webp?v=3';
    let defaultSrcB = '/assets/designs/rbp-portfolio/josh_wave.webp?v=3';
    let defaultPersona = 'male';

    if (hasPhoto && options.preferRealPhoto) {
      defaultSrcA = data.avatar;
      defaultSrcB = data.avatar;
      defaultPersona = 'photo';
    } else if (isFemale) {
      defaultSrcA = '/assets/designs/rbp-portfolio/maya.webp?v=3';
      defaultSrcB = '/assets/designs/rbp-portfolio/maya_wave.webp?v=3';
      defaultPersona = 'female';
    }

    // Projects preparation
    const rawProjects = Array.isArray(data.projects) && data.projects.length > 0 ? data.projects : [
      {
        name: 'Autonomous Code Canvas',
        desc: 'A focused creative coding surface with real-time shader pipelines and hardware-accelerated preview states.',
        tech: 'TypeScript • WebGL • Three.js • React',
        live: 'https://example.com/demo1',
        github: github || 'https://github.com'
      },
      {
        name: 'Distributed Privacy Vault',
        desc: 'Zero-knowledge verification and credential privacy engine with tamper-proof audit trails.',
        tech: 'Rust • Zero-Knowledge • TypeScript • Next.js',
        live: 'https://example.com/demo2',
        github: github || 'https://github.com'
      },
      {
        name: 'Microservices Cloud Mesh',
        desc: 'High-throughput distributed edge gateway routing 50k+ req/sec with Prometheus telemetry.',
        tech: 'Go • Docker • Kubernetes • gRPC',
        live: 'https://example.com/demo3',
        github: github || 'https://github.com'
      },
      {
        name: 'Algorand Smart Contract Escrow',
        desc: 'Decentralized automated escrow protocol with atomic state transitions and formal verification.',
        tech: 'Python • PyTeal • Algorand • Smart Contracts',
        live: 'https://example.com/demo4',
        github: github || 'https://github.com'
      }
    ];

    const usedImgs = new Set();
    const projects = rawProjects.map((p, idx) => {
      const imgSrc = resolveSingleProjectImage(p, idx, usedImgs, data.name);
      usedImgs.add(imgSrc);
      return {
        id: 'proj-' + idx,
        title: TemplateHelper.escapeHtml(p.name || p.title || `Project #${idx + 1}`),
        desc: TemplateHelper.escapeHtml(p.desc || p.description || 'Production software implementation with verified telemetry.'),
        tech: TemplateHelper.escapeHtml(p.tech || (Array.isArray(p.tags) ? p.tags.join(' • ') : 'Full-Stack Architecture')),
        live: TemplateHelper.sanitizeUrl(p.live || p.demo || p.url, '#'),
        github: TemplateHelper.sanitizeUrl(p.github || github, '#'),
        image: imgSrc
      };
    });

    // Skills preparation
    const skillsList = Array.isArray(data.skills) && data.skills.length > 0
      ? data.skills.map(s => String(s).trim()).filter(Boolean)
      : ['TypeScript', 'React', 'Next.js', 'Node.js', 'WebGL', 'Three.js', 'Python', 'Tailwind CSS', 'Git', 'Figma'];

    // Experience preparation
    const rawExp = Array.isArray(data.experience) && data.experience.length > 0 ? data.experience : [
      {
        company: 'Design & Software Studio',
        role: 'Senior Design Engineer',
        period: '2023 – Present',
        desc: 'Led core product ergonomics, high-performance WebGL viewports, and reactive state architectures.'
      },
      {
        company: 'Technology Labs',
        role: 'Full-Stack Engineer',
        period: '2021 – 2023',
        desc: 'Engineered resilient microservices, optimized SQL/NoSQL databases, and built accessible frontends.'
      }
    ];

    const experiences = rawExp.map((exp, idx) => ({
      company: TemplateHelper.escapeHtml(exp.company || 'Enterprise Systems'),
      role: TemplateHelper.escapeHtml(exp.role || 'Software Engineer'),
      period: TemplateHelper.escapeHtml(exp.period || 'Recent'),
      desc: TemplateHelper.escapeHtml(exp.desc || exp.description || 'Delivered mission-critical software features with verified performance.')
    }));

    // Education preparation
    const rawEdu = Array.isArray(data.education) && data.education.length > 0 ? data.education : [
      {
        degree: 'B.S. in Computer Science & Engineering',
        institution: 'Institute of Technology',
        period: 'Distinction'
      }
    ];

    const educations = rawEdu.map((edu, idx) => ({
      degree: TemplateHelper.escapeHtml(edu.degree || 'Degree in Computer Science'),
      institution: TemplateHelper.escapeHtml(edu.institution || edu.school || 'University'),
      period: TemplateHelper.escapeHtml(edu.period || edu.year || '')
    }));

    // Photos for polaroid strip: authentic professional engineering studio snapshots (or candidate custom photos)
    const polaroidImages = Array.isArray(data.photos) && data.photos.length >= 4
      ? data.photos.slice(0, 4)
      : [
          '/assets/designs/rbp-portfolio/snapshot_workspace.webp',
          '/assets/designs/rbp-portfolio/snapshot_architecture.webp',
          '/assets/designs/rbp-portfolio/snapshot_code.webp',
          '/assets/designs/rbp-portfolio/snapshot_hardware.webp'
        ];

    const html = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeName} — Portfolio</title>
  <meta name="description" content="${safeBio.slice(0, 160)}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  ${data.canonicalUrl ? `<link rel="canonical" href="${TemplateHelper.escapeHtml(data.canonicalUrl)}">
  <meta property="og:url" content="${TemplateHelper.escapeHtml(data.canonicalUrl)}">` : ''}

  <!-- Open Graph / Social Sharing -->
  <meta property="og:type" content="profile">
  <meta property="og:title" content="${safeName} — Portfolio">
  <meta property="og:description" content="${safeBio.slice(0, 160)}">
  <meta property="og:image" content="https://myfolio.tech/assets/og/og-rbp.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${safeName} Portfolio">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeName} — Portfolio">
  <meta name="twitter:description" content="${safeBio.slice(0, 160)}">
  <meta name="twitter:image" content="https://myfolio.tech/assets/og/og-rbp.jpg">

  <!-- Favicon Suite -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

  <!-- Schema.org JSON-LD ProfilePage -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": "${safeName}",
      "jobTitle": "${safeRole}",
      "description": "${safeBio.slice(0, 200)}",
      "email": "${safeEmail}"${data.canonicalUrl ? `,
      "url": "${TemplateHelper.escapeHtml(data.canonicalUrl)}"` : ''}
    }
  }
  </script>

  <!-- Google Fonts: Inter & Fraunces & JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <!-- StringTune Scroll Engine -->
  <script src="https://unpkg.com/@fiddle-digital/string-tune@1.2.1/dist/index.js"></script>

  <style>
    @property --lerp {
      syntax: '<number>';
      inherits: true;
      initial-value: 0;
    }

    :root {
      --background: #0a0a0a;
      --foreground: #fafafa;
      --muted: #171717;
      --muted-foreground: #a3a3a3;
      --border: #262626;
      --border-subtle: rgba(255, 255, 255, 0.08);
      --card-bg: #111111;
      --accent: #ffffff;
      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-serif: 'Fraunces', Georgia, serif;
      --font-mono: 'JetBrains Mono', monospace;
      --site-frame-width: 12px;
      --site-frame-radius: 28px;
    }

    html.light {
      --background: #ffffff;
      --foreground: #0a0a0a;
      --muted: #f5f5f5;
      --muted-foreground: #666666;
      --border: #e5e5e5;
      --border-subtle: rgba(0, 0, 0, 0.08);
      --card-bg: #f9f9f9;
      --accent: #000000;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html {
      scroll-behavior: smooth;
      font-size: 16px;
      background-color: var(--background);
      color: var(--foreground);
      font-family: var(--font-sans);
    }

    body {
      background-color: var(--background);
      color: var(--foreground);
      overflow-x: hidden;
      min-height: 100vh;
      line-height: 1.6;
      position: relative;
    }

    /* Fixed Site Frame */
    .site-frame-rail {
      position: fixed;
      background: var(--background);
      z-index: 999;
      pointer-events: none;
    }
    .rail-top { top: 0; left: 0; right: 0; height: var(--site-frame-width); }
    .rail-bottom { bottom: 0; left: 0; right: 0; height: var(--site-frame-width); }
    .rail-left { top: 0; bottom: 0; left: 0; width: var(--site-frame-width); }
    .rail-right { top: 0; bottom: 0; right: 0; width: var(--site-frame-width); }

    /* WebGL Flow Shader Canvas Backdrop */
    #flow-shader-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 0;
      pointer-events: none;
      opacity: 0.85;
      transition: opacity 0.5s ease;
    }
    html.light #flow-shader-canvas {
      opacity: 0.45;
    }

    /* Content Layout Container */
    .site-wrapper {
      position: relative;
      z-index: 10;
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* Fixed Floating Pill Nav */
    .pill-nav-container {
      position: fixed;
      top: 24px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      z-index: 900;
      pointer-events: none;
    }
    .pill-nav {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: rgba(18, 18, 18, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--border-subtle);
      border-radius: 9999px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
      transition: background 0.3s ease, border-color 0.3s ease;
    }
    html.light .pill-nav {
      background: rgba(255, 255, 255, 0.82);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    }
    .pill-nav a {
      color: var(--muted-foreground);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      padding: 6px 14px;
      border-radius: 9999px;
      transition: color 0.2s ease, background 0.2s ease;
    }
    .pill-nav a:hover, .pill-nav a.active {
      color: var(--foreground);
      background: var(--border-subtle);
      font-weight: 600;
    }
    .theme-toggle-btn {
      background: none;
      border: none;
      color: var(--muted-foreground);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      margin-left: 4px;
      transition: color 0.2s ease, background 0.2s ease;
    }
    .theme-toggle-btn:hover {
      color: var(--foreground);
      background: var(--border-subtle);
    }

    /* Hero Section */
    .hero-section {
      min-height: 88vh;
      display: flex;
      align-items: center;
      padding: 120px 0 60px 0;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 48px;
      align-items: center;
      width: 100%;
    }
    .hero-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .hero-kicker {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
      color: var(--muted-foreground);
      letter-spacing: 0.02em;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 8px #10b981;
      animation: pulse 2.5s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.9); }
    }
    .hero-title {
      font-size: clamp(2.4rem, 5vw, 3.8rem);
      font-weight: 600;
      line-height: 1.1;
      letter-spacing: -0.03em;
    }
    .hero-title .serif-accent {
      font-family: var(--font-serif);
      font-style: italic;
      font-weight: 400;
    }
    .hero-bio {
      font-size: clamp(1rem, 1.8vw, 1.18rem);
      color: var(--muted-foreground);
      max-width: 540px;
      line-height: 1.6;
    }
    .hero-ctas {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-top: 10px;
      flex-wrap: wrap;
    }
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--foreground);
      color: var(--background);
      font-weight: 600;
      font-size: 14px;
      padding: 12px 24px;
      border-radius: 9999px;
      text-decoration: none;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, opacity 0.2s;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      opacity: 0.95;
    }
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--card-bg);
      color: var(--foreground);
      border: 1px solid var(--border);
      font-weight: 500;
      font-size: 14px;
      padding: 12px 22px;
      border-radius: 9999px;
      text-decoration: none;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease;
    }
    .btn-secondary:hover {
      transform: translateY(-2px);
      background: var(--border-subtle);
    }

    /* Morphing Portrait Card */
    .portrait-card-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .portrait-frame {
      position: relative;
      width: 100%;
      max-width: 420px;
      aspect-ratio: 1 / 1;
      border-radius: 28px;
      overflow: hidden;
      border: 1px solid var(--border-subtle);
      background: var(--card-bg);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
      cursor: crosshair;
      transform-style: preserve-3d;
      transition: transform 0.15s ease-out, box-shadow 0.3s ease;
    }
    .portrait-frame:hover {
      box-shadow: 0 32px 80px rgba(0, 0, 0, 0.55);
    }
    .portrait-fallback-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 28px;
      z-index: 1;
      pointer-events: none;
    }
    #portrait-morph-canvas {
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      display: block;
      border-radius: 28px;
      pointer-events: none;
    }

    /* Avatar Persona Switcher Pill */
    .avatar-switcher-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 14px;
      padding: 4px 6px;
      background: rgba(24, 24, 24, 0.65);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border-subtle);
      border-radius: 9999px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }
    html.light .avatar-switcher-pill {
      background: rgba(240, 240, 240, 0.85);
    }
    .avatar-btn {
      border: none;
      background: transparent;
      color: var(--muted-foreground);
      font-size: 12px;
      font-weight: 500;
      padding: 4px 12px;
      border-radius: 9999px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.2s ease;
    }
    .avatar-btn.active {
      color: var(--foreground);
      background: var(--border-subtle);
      font-weight: 600;
    }
    .avatar-btn:hover:not(.active) {
      color: var(--foreground);
    }

    /* Section Titles */
    .section-header {
      margin-bottom: 36px;
    }
    .section-kicker {
      font-family: var(--font-mono);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--muted-foreground);
      margin-bottom: 6px;
    }
    .section-title {
      font-size: clamp(1.8rem, 3.5vw, 2.5rem);
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    /* Projects Grid */
    .projects-section {
      padding: 80px 0;
    }
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 28px;
    }
    .project-card {
      position: relative;
      background: var(--card-bg);
      border: 1px solid var(--border-subtle);
      border-radius: 24px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      text-decoration: none;
      color: inherit;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease;
    }
    .project-card:hover {
      transform: translateY(-6px);
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
    }
    html.light .project-card:hover {
      border-color: rgba(0, 0, 0, 0.15);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
    }
    .project-image-box {
      width: 100%;
      aspect-ratio: 16 / 10;
      overflow: hidden;
      position: relative;
      background: #141414;
    }
    .project-image-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .project-card:hover .project-image-box img {
      transform: scale(1.05);
    }
    .project-info {
      padding: 24px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    .project-meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .project-tech-tag {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--muted-foreground);
    }
    .project-arrow {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--border-subtle);
      color: var(--foreground);
      transition: transform 0.2s ease, background 0.2s ease;
    }
    .project-card:hover .project-arrow {
      transform: translate(3px, -3px);
      background: var(--foreground);
      color: var(--background);
    }
    .project-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 8px;
      line-height: 1.3;
    }
    /* 03 Kinetic Structure Shift Section (StringTune Scroll Lerp) */
    .lerp-structure-section {
      position: relative;
      margin: 80px 0 120px 0;
      width: 100%;
    }
    .lerp-wrapper {
      display: grid;
      grid-template-columns: repeat(14, 1fr);
      align-items: end;
      column-gap: 0.5rem;
      position: relative;
      height: min(80vh, 85vw);
      min-height: 560px;
      max-height: 880px;
      padding-bottom: 2rem;
    }
    .lerp-note-badge {
      grid-column: 1 / 15;
      grid-row: 1;
      justify-self: center;
      align-self: start;
      text-align: center;
      z-index: 40;
      margin-top: 1rem;
      background: var(--card-bg);
      border: 1px solid var(--border-subtle);
      color: var(--muted-foreground);
      padding: 6px 18px;
      border-radius: 9999px;
      font-family: var(--font-mono);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .lerp-statement {
      grid-column: 3 / 13;
      grid-row: 1;
      justify-self: center;
      align-self: start;
      text-align: center;
      z-index: 40;
      margin-top: 4rem;
      padding: 0 10%;
      font-size: clamp(1.15rem, 2.2vw, 1.55rem);
      line-height: 1.45;
      color: var(--foreground);
      font-family: var(--font-sans);
      font-weight: 500;
      max-width: 640px;
    }
    .lerp-image-frame {
      grid-column: 1 / 15;
      grid-row: 1;
      overflow: hidden;
      transform: translateZ(0);
      align-self: center;
      justify-self: center;
      width: 100%;
      max-width: 520px;
      aspect-ratio: 1 / 1;
      background: #111111;
      border-radius: 24px;
      border: 1px solid var(--border-subtle);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
      clip-path: polygon(
        max(calc(var(--lerp, 0) * 0.25%), 0%) max(calc(var(--lerp, 0) * 0.25%), 0%),
        min(calc(100% - var(--lerp, 0) * -0.25%), 100%) max(calc(var(--lerp, 0) * -0.25%), 0%),
        min(calc(100% - var(--lerp, 0) * 0.25%), 100%) min(calc(100% - var(--lerp, 0) * 0.25%), 100%),
        max(calc(var(--lerp, 0) * -0.25%), 0%) min(calc(100% - var(--lerp, 0) * -0.25%), 100%)
      );
      transition: clip-path 0.04s linear;
    }
    .lerp-image-frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      scale: calc(1 + min((var(--lerp, 0) * var(--lerp, 0) * 0.0001), 1));
      transition: scale 0.04s linear;
      display: block;
    }
    .lerp-masthead-title {
      grid-column: 3 / 15;
      grid-row: 1;
      align-self: end;
      position: relative;
      margin-bottom: 1.5rem;
      font-family: var(--font-serif);
      font-size: clamp(3.5rem, 9.5vw, 7.2rem);
      font-weight: 700;
      line-height: 0.95;
      letter-spacing: -0.04em;
      color: var(--foreground);
      pointer-events: none;
      z-index: 30;
      opacity: 0.92;
      text-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
    }
    @media (min-width: 1024px) {
      .lerp-wrapper {
        min-height: 680px;
        height: min(80vh, 80vw);
      }
      .lerp-statement {
        grid-column: 5 / 11;
      }
      .lerp-image-frame {
        grid-column: 5 / 11;
      }
      .lerp-masthead-title {
        grid-column: 3 / 15;
      }
    }
    @media (min-width: 1600px) {
      .lerp-image-frame {
        grid-column: 6 / 10;
      }
      .lerp-masthead-title {
        grid-column: 5 / 15;
      }
    }

    /* About Section & Polaroid Strip */
    .about-section {
      padding: 80px 0;
    }
    .about-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 40px;
    }
    .polaroid-strip {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding: 24px 8px 36px 8px;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }
    .polaroid-strip::-webkit-scrollbar {
      display: none;
    }
    .polaroid-card {
      flex: 0 0 220px;
      background: #ffffff;
      padding: 12px 12px 30px 12px;
      border-radius: 6px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
      cursor: grab;
      user-select: none;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
    }
    .polaroid-card:nth-child(1) { transform: rotate(-4deg); }
    .polaroid-card:nth-child(2) { transform: rotate(3deg); }
    .polaroid-card:nth-child(3) { transform: rotate(-2deg); }
    .polaroid-card:nth-child(4) { transform: rotate(4deg); }
    .polaroid-card:hover {
      transform: translateY(-8px) scale(1.04) rotate(0deg) !important;
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.45);
      z-index: 20;
    }
    .polaroid-card img {
      width: 100%;
      aspect-ratio: 1 / 1;
      object-fit: cover;
      border-radius: 4px;
      background: #222;
    }

    /* Matter.js Physics Stack Container */
    .physics-stack-card {
      background: var(--card-bg);
      border: 1px solid var(--border-subtle);
      border-radius: 28px;
      padding: 28px;
      position: relative;
      overflow: hidden;
    }
    .physics-stack-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .physics-stack-header h3 {
      font-size: 1.15rem;
      font-weight: 600;
    }
    .btn-reset-physics {
      background: var(--border-subtle);
      border: 1px solid var(--border-subtle);
      color: var(--muted-foreground);
      font-size: 12px;
      padding: 5px 12px;
      border-radius: 9999px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }
    .btn-reset-physics:hover {
      color: var(--foreground);
      background: var(--border);
    }
    #physics-canvas-container {
      width: 100%;
      height: 280px;
      position: relative;
      background: rgba(0, 0, 0, 0.15);
      border-radius: 18px;
      overflow: hidden;
      cursor: grab;
    }
    #physics-canvas-container:active {
      cursor: grabbing;
    }
    #physics-canvas {
      width: 100%;
      height: 100%;
      display: block;
    }

    /* Timeline & Experience Accordion */
    .experience-section {
      margin-top: 40px;
    }
    .experience-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .exp-item {
      background: var(--card-bg);
      border: 1px solid var(--border-subtle);
      border-radius: 20px;
      padding: 20px 24px;
      transition: border-color 0.2s ease;
    }
    .exp-item:hover {
      border-color: rgba(255, 255, 255, 0.16);
    }
    .exp-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .exp-role-title {
      font-size: 1.1rem;
      font-weight: 600;
    }
    .exp-company {
      color: var(--muted-foreground);
      font-size: 0.95rem;
    }
    .exp-period {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--muted-foreground);
    }
    .exp-desc {
      font-size: 0.92rem;
      color: var(--muted-foreground);
      line-height: 1.5;
    }

    /* Contact Card with Embedded Flow Shader */
    .contact-section {
      padding: 80px 0 140px 0;
    }
    .contact-card {
      position: relative;
      background: var(--card-bg);
      border: 1px solid var(--border-subtle);
      border-radius: 36px;
      overflow: hidden;
      padding: 56px 40px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
    }
    #contact-shader-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      pointer-events: none;
      opacity: 0.35;
      mask-image: radial-gradient(ellipse 90% 110% at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 100%);
      -webkit-mask-image: radial-gradient(ellipse 90% 110% at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 100%);
    }
    .contact-content {
      position: relative;
      z-index: 10;
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 40px;
      align-items: center;
    }
    .contact-title {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 600;
      line-height: 1.15;
      letter-spacing: -0.02em;
    }
    .contact-title .serif-accent {
      font-family: var(--font-serif);
      font-style: italic;
      font-weight: 400;
    }
    .contact-desc {
      font-size: 1.05rem;
      color: var(--muted-foreground);
      margin-top: 14px;
      max-width: 480px;
    }
    .contact-actions {
      display: flex;
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;
    }
    .copy-email-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: var(--foreground);
      color: var(--background);
      font-size: 15px;
      font-weight: 600;
      padding: 14px 28px;
      border-radius: 9999px;
      border: none;
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
    }
    .copy-email-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    }
    .social-links-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .social-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--muted-foreground);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 9999px;
      background: var(--border-subtle);
      transition: all 0.2s ease;
    }
    .social-btn:hover {
      color: var(--foreground);
      background: var(--border);
    }

    /* Toast notification */
    #copy-toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: var(--foreground);
      color: var(--background);
      padding: 10px 20px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      z-index: 1000;
      opacity: 0;
      pointer-events: none;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
    }
    #copy-toast.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    /* Footer */
    .site-footer {
      border-top: 1px solid var(--border-subtle);
      padding: 32px 0 60px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--muted-foreground);
      font-size: 13px;
    }

    /* Responsive Mobile Media Queries */
    @media (max-width: 860px) {
      .hero-grid {
        grid-template-columns: 1fr;
        gap: 36px;
        text-align: center;
      }
      .hero-content {
        align-items: center;
      }
      .hero-bio {
        margin: 0 auto;
      }
      .hero-ctas {
        justify-content: center;
      }
      .projects-grid {
        grid-template-columns: 1fr;
      }
      .contact-content {
        grid-template-columns: 1fr;
        text-align: center;
      }
      .contact-actions {
        align-items: center;
      }
      .social-links-row {
        justify-content: center;
      }
    }
  </style>
</head>
<body>

  <!-- Fixed Site Frame Rails -->
  <div class="site-frame-rail rail-top"></div>
  <div class="site-frame-rail rail-bottom"></div>
  <div class="site-frame-rail rail-left"></div>
  <div class="site-frame-rail rail-right"></div>

  <!-- Background WebGL Flow Shader Canvas -->
  <canvas id="flow-shader-canvas"></canvas>

  <!-- Fixed Pill Nav -->
  <div class="pill-nav-container">
    <nav class="pill-nav">
      <a href="#hero" class="active">Home</a>
      <a href="#projects">Projects</a>
      <a href="#structure-shift">Structure</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
      <button class="theme-toggle-btn" id="theme-toggle" title="Toggle Light/Dark Mode" aria-label="Toggle Theme">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      </button>
    </nav>
  </div>

  <div class="site-wrapper">

    <!-- 01 Hero Section -->
    <section class="hero-section" id="hero">
      <div class="hero-grid">
        <div class="hero-content">
          <div class="hero-kicker">
            <span class="status-dot"></span>
            <span>Available for innovative projects & roles</span>
          </div>

          <h1 class="hero-title">
            Hey 👋, I'm ${firstName}<br>
            <span class="serif-accent">${safeRole}</span>
          </h1>

          <p class="hero-bio">${safeBio}</p>

          <div class="hero-ctas">
            <a href="#contact" class="btn-primary">Get in touch →</a>
            <a href="#projects" class="btn-secondary">View projects</a>
            ${data.resumeUrl ? `<a href="${TemplateHelper.escapeHtml(data.resumeUrl)}" target="_blank" class="btn-secondary">Download CV ↗</a>` : ''}
          </div>
        </div>

        <div class="portrait-card-wrapper">
          <div class="portrait-frame" id="portrait-frame">
            <img id="portrait-fallback-img" src="${TemplateHelper.escapeHtml(data.avatar || defaultSrcA)}" alt="${safeName}" class="portrait-fallback-img" />
            <canvas id="portrait-morph-canvas"></canvas>
          </div>
        </div>
      </div>
    </section>

    <!-- 02 Projects Section -->
    <section class="projects-section" id="projects">
      <div class="section-header">
        <div class="section-kicker">01 // Selected Work</div>
        <h2 class="section-title">Case Studies & Production Code</h2>
      </div>

      <div class="projects-grid">
        ${projects.map(p => `
          <a href="${p.live !== '#' ? p.live : p.github}" target="_blank" rel="noopener" class="project-card">
            <div class="project-image-box">
              <img src="${p.image}" alt="${p.title}" loading="lazy">
            </div>
            <div class="project-info">
              <div class="project-meta-row">
                <span class="project-tech-tag">${p.tech}</span>
                <div class="project-arrow">↗</div>
              </div>
              <h3 class="project-title">${p.title}</h3>
              <p class="project-desc">${p.desc}</p>
            </div>
          </a>
        `).join('')}
      </div>
    </section>

    <!-- 03 Kinetic Structure Shift Section (StringTune Scroll Lerp) -->
    <section class="lerp-structure-section" id="structure-shift">
      <div class="lerp-wrapper">
        <span class="lerp-note-badge">Kinetic Structure Shift // Scroll Responsive</span>
        <p class="lerp-statement">The surface stays calm while the structure shifts underneath.</p>

        <figure class="lerp-image-frame" id="lerp-figure" string="lerp[]">
          <img src="/assets/designs/rbp-portfolio/lerp_structure.webp" onerror="this.onerror=null;this.src='/assets/designs/rbp-portfolio/lerp_structure.png'" alt="Developer Workspace Kinetic Distortion" loading="lazy">
        </figure>

        <h2 class="lerp-masthead-title" aria-hidden="true">
          Build /<br>Ship
        </h2>
      </div>
    </section>

    <!-- 04 About & Physics Stack Section -->
    <section class="about-section" id="about">
      <div class="section-header">
        <div class="section-kicker">02 // Profile & Engineering Stack</div>
        <h2 class="section-title">Philosophy, Tools & Experience</h2>
      </div>

      <div class="about-grid">
        <!-- Interactive Polaroid Strip -->
        <div class="polaroid-strip" id="polaroid-strip">
          ${polaroidImages.map((img, i) => {
            const captions = ['Workspace & Code Editor', 'Architecture & System Design', 'Terminal & Compilation', 'Hardware Lab & Maker Studio'];
            return `
            <div class="polaroid-card" style="transform: rotate(${(i % 2 === 0 ? -1 : 1) * (2 + i * 1.5)}deg);">
              <img src="${img}" alt="${captions[i % captions.length]}" loading="lazy">
            </div>
            `;
          }).join('')}
        </div>

        <!-- Interactive Physics Tech Stack Chips -->
        <div class="physics-stack-card">
          <div class="physics-stack-header">
            <h3>Interactive Tech Constellation</h3>
            <button class="btn-reset-physics" id="reset-physics-btn">
              <span>↺</span> Reset Gravity
            </button>
          </div>
          <div id="physics-canvas-container">
            <canvas id="physics-canvas"></canvas>
          </div>
        </div>

        <!-- Expandable Experience Timeline -->
        <div class="experience-section">
          <div class="experience-list">
            ${experiences.map(exp => `
              <div class="exp-item">
                <div class="exp-header">
                  <div>
                    <h4 class="exp-role-title">${exp.role}</h4>
                    <span class="exp-company">${exp.company}</span>
                  </div>
                  <span class="exp-period">${exp.period}</span>
                </div>
                <p class="exp-desc">${exp.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>

    <!-- 04 Contact Card with Embedded Flow Shader -->
    <section class="contact-section" id="contact">
      <div class="contact-card">
        <canvas id="contact-shader-canvas"></canvas>

        <div class="contact-content">
          <div>
            <h2 class="contact-title">
              Have a project in mind?<br>
              <span class="serif-accent">Let's build something great.</span>
            </h2>
            <p class="contact-desc">
              Currently based in ${safeLocation}. Available for contract engineering, full-time design engineering roles, and open source collaboration.
            </p>
          </div>

          <div class="contact-actions">
            <button class="copy-email-btn" id="copy-email-btn" data-email="${safeEmail}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              <span>Copy Email Address</span>
            </button>

            <div class="social-links-row">
              ${github ? `<a href="${github}" target="_blank" rel="noopener" class="social-btn">GitHub ↗</a>` : ''}
              ${linkedin ? `<a href="${linkedin}" target="_blank" rel="noopener" class="social-btn">LinkedIn ↗</a>` : ''}
              ${twitter ? `<a href="${twitter}" target="_blank" rel="noopener" class="social-btn">Twitter / X ↗</a>` : ''}
              ${website ? `<a href="${website}" target="_blank" rel="noopener" class="social-btn">Website ↗</a>` : ''}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="site-footer">
      <div>© ${new Date().getFullYear()} ${safeName}. Crafted with precision.</div>
      <div><a href="https://myfolio.tech?ref=portfolio" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">Synthesized with <strong>MyFolio ✦</strong></a></div>
      <div>Kinetic Monochrome Studio</div>
    </footer>

  </div>

  <div id="copy-toast">Email copied to clipboard!</div>

  <!-- Client JavaScript for Flow Shader, Morph Shader & Physics Chips -->
  <script>
    (function() {
      // 1. Theme Toggle
      const themeToggle = document.getElementById('theme-toggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', () => {
          document.documentElement.classList.toggle('light');
          document.documentElement.classList.toggle('dark');
        });
      }

      // 2. Click to Copy Email
      const copyBtn = document.getElementById('copy-email-btn');
      const toast = document.getElementById('copy-toast');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          const email = copyBtn.getAttribute('data-email');
          if (navigator.clipboard) {
            navigator.clipboard.writeText(email).then(() => {
              showToast('Email copied to clipboard!');
            });
          } else {
            showToast('Email: ' + email);
          }
        });
      }

      function showToast(msg) {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2800);
      }

      // 3. WebGL Flow Shader Implementation
      function initFlowShader(canvasId, scaleFactor = 6.0, brightnessFactor = 1.0) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const gl = canvas.getContext('webgl');
        if (!gl) return;

        const vsSource = "attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }";
        const fsSource = "precision highp float;\\n" +
          "uniform vec2 uR;\\n" +
          "uniform float uT;\\n" +
          "uniform vec2 uV;\\n" +
          "uniform float uS;\\n" +
          "uniform float uTw;\\n" +
          "uniform float uDe;\\n" +
          "uniform float uMs;\\n" +
          "uniform float uB;\\n" +
          "uniform int uIt;\\n" +
          "uniform vec3 uColorLow;\\n" +
          "uniform vec3 uColorHigh;\\n" +
          "uniform vec3 uBgColor;\\n" +
          "uniform vec4 uFadeShape;\\n" +
          "float h(vec2 p){ return sin(p.x+sin(p.y+uT*uV.x))*sin(p.y*p.x*0.1+uT*uV.y); }\\n" +
          "float fadeAlpha(float d){ float t=clamp(1.0-d,0.0,1.0); return t*t*(3.0-2.0*t); }\\n" +
          "void main(){\\n" +
          "  vec2 frag=gl_FragCoord.xy/uR;\\n" +
          "  vec2 p=frag-0.5;\\n" +
          "  p.x*=uR.x/uR.y;\\n" +
          "  p*=uS;\\n" +
          "  float ms=uT*uMs*0.1;\\n" +
          "  vec2 d=vec2(sin(ms),cos(ms))*0.1;\\n" +
          "  float kt=uTw*0.01;\\n" +
          "  float kd=1.0/uDe;\\n" +
          "  vec2 e=vec2(0.05,0.);\\n" +
          "  vec2 r=vec2(0.);\\n" +
          "  for(int i=0;i<16;i++){\\n" +
          "    if(i>=uIt)break;\\n" +
          "    float a=h(p);\\n" +
          "    float b=h(p+e.xy);\\n" +
          "    float c=h(p+e.yx);\\n" +
          "    vec2 q=vec2(b-a,c-a)*20.;\\n" +
          "    p+=vec2(-q.y,q.x)*kt+q*kd+d;\\n" +
          "    r=q;\\n" +
          "  }\\n" +
          "  float t=clamp(length(r)*0.5,0.0,1.0);\\n" +
          "  vec3 col=mix(uColorLow,uColorHigh,t)*uB;\\n" +
          "  vec2 ndc=vec2(frag.x,1.0-frag.y);\\n" +
          "  float aspect=uR.x/uR.y;\\n" +
          "  float dx=((ndc.x-uFadeShape.x)*aspect)/uFadeShape.z;\\n" +
          "  float dy=(ndc.y-uFadeShape.y)/uFadeShape.w;\\n" +
          "  float fa=fadeAlpha(sqrt(dx*dx+dy*dy));\\n" +
          "  vec3 outColor=mix(uBgColor,col,fa);\\n" +
          "  gl_FragColor=vec4(outColor,1.0);\\n" +
          "}";

        function compileShader(src, type) {
          const s = gl.createShader(type);
          gl.shaderSource(s, src);
          gl.compileShader(s);
          return s;
        }

        const prog = gl.createProgram();
        gl.attachShader(prog, compileShader(vsSource, gl.VERTEX_SHADER));
        gl.attachShader(prog, compileShader(fsSource, gl.FRAGMENT_SHADER));
        gl.linkProgram(prog);
        gl.useProgram(prog);

        const posBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

        const posLoc = gl.getAttribLocation(prog, "position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        const uR = gl.getUniformLocation(prog, "uR");
        const uT = gl.getUniformLocation(prog, "uT");
        const uV = gl.getUniformLocation(prog, "uV");
        const uS = gl.getUniformLocation(prog, "uS");
        const uTw = gl.getUniformLocation(prog, "uTw");
        const uDe = gl.getUniformLocation(prog, "uDe");
        const uMs = gl.getUniformLocation(prog, "uMs");
        const uB = gl.getUniformLocation(prog, "uB");
        const uIt = gl.getUniformLocation(prog, "uIt");
        const uColorLow = gl.getUniformLocation(prog, "uColorLow");
        const uColorHigh = gl.getUniformLocation(prog, "uColorHigh");
        const uBgColor = gl.getUniformLocation(prog, "uBgColor");
        const uFadeShape = gl.getUniformLocation(prog, "uFadeShape");

        function resize() {
          const rect = canvas.getBoundingClientRect();
          canvas.width = rect.width * (window.devicePixelRatio || 1);
          canvas.height = rect.height * (window.devicePixelRatio || 1);
          gl.viewport(0, 0, canvas.width, canvas.height);
        }
        window.addEventListener('resize', resize);
        resize();

        let startTime = performance.now();

        function render() {
          const now = (performance.now() - startTime) * 0.001;
          const isDark = document.documentElement.classList.contains('dark');

          gl.useProgram(prog);
          gl.uniform2f(uR, canvas.width, canvas.height);
          gl.uniform1f(uT, now);
          gl.uniform2f(uV, 0.1, 0.2);
          gl.uniform1f(uS, scaleFactor);
          gl.uniform1f(uTw, 40.0);
          gl.uniform1f(uDe, 30.0);
          gl.uniform1f(uMs, 0.2);
          gl.uniform1f(uB, brightnessFactor);
          gl.uniform1i(uIt, 14);

          if (isDark) {
            gl.uniform3f(uColorLow, 0.12, 0.14, 0.18);
            gl.uniform3f(uColorHigh, 0.38, 0.38, 0.42);
            gl.uniform3f(uBgColor, 0.04, 0.04, 0.04);
          } else {
            gl.uniform3f(uColorLow, 0.85, 0.85, 0.90);
            gl.uniform3f(uColorHigh, 0.65, 0.65, 0.70);
            gl.uniform3f(uBgColor, 0.98, 0.98, 0.98);
          }

          gl.uniform4f(uFadeShape, 0.5, 0.0, 1.4, 0.6);
          gl.drawArrays(gl.TRIANGLES, 0, 6);

          requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
      }

      initFlowShader('flow-shader-canvas', 6.0, 1.0);
      initFlowShader('contact-shader-canvas', 3.0, 1.2);

      // 4. WebGL Displacement Morphing Portrait Shader
      function initPortraitMorph() {
        const frame = document.getElementById('portrait-frame');
        const canvas = document.getElementById('portrait-morph-canvas');
        if (!frame || !canvas) return;
        const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
        if (!gl) return;

        const vsSource = "attribute vec2 position; varying vec2 vUv; void main() { vUv = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }";
        const fsSource = "precision highp float;\\n" +
          "uniform sampler2D uTexA;\\n" +
          "uniform sampler2D uTexB;\\n" +
          "uniform float uProgress;\\n" +
          "uniform float uTime;\\n" +
          "uniform vec2 uResolution;\\n" +
          "uniform vec2 uOrigin;\\n" +
          "uniform vec2 uDirection;\\n" +
          "varying vec2 vUv;\\n" +
          "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\\n" +
          "float noise(vec2 p){\\n" +
          "  vec2 i=floor(p); vec2 f=fract(p); f=f*f*(3.0-2.0*f);\\n" +
          "  return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), f.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), f.x), f.y);\\n" +
          "}\\n" +
          "float fbm(vec2 p){\\n" +
          "  float v=0.0; float a=0.5;\\n" +
          "  for(int i=0; i<4; i++){ v+=a*noise(p); p*=2.0; a*=0.5; }\\n" +
          "  return v;\\n" +
          "}\\n" +
          "void main(){\\n" +
          "  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);\\n" +
          "  float p = uProgress;\\n" +
          "  float bell = 4.0 * p * (1.0 - p);\\n" +
          "  vec2 dir = normalize(uDirection + vec2(0.0001));\\n" +
          "  float along = dot(vUv - uOrigin, dir);\\n" +
          "  float warp = fbm(vUv * 3.5 + uTime * 0.1) - 0.5;\\n" +
          "  float field = (along + 1.2) / 2.4 + warp * 0.45;\\n" +
          "  float remapped = mix(-0.25, 1.25, p);\\n" +
          "  float mask = 1.0 - smoothstep(remapped - 0.08, remapped + 0.08, field);\\n" +
          "  vec2 perp = vec2(-dir.y, dir.x);\\n" +
          "  float ripple = sin((field - remapped) * 12.0) * 0.5 + 0.5;\\n" +
          "  vec2 push = perp * ripple * 0.02 * bell;\\n" +
          "  vec4 texA = texture2D(uTexA, uv + push);\\n" +
          "  vec4 texB = texture2D(uTexB, uv + push);\\n" +
          "  gl_FragColor = mix(texA, texB, mask);\\n" +
          "}";

        function compileShader(src, type) {
          const s = gl.createShader(type);
          gl.shaderSource(s, src);
          gl.compileShader(s);
          return s;
        }

        const prog = gl.createProgram();
        gl.attachShader(prog, compileShader(vsSource, gl.VERTEX_SHADER));
        gl.attachShader(prog, compileShader(fsSource, gl.FRAGMENT_SHADER));
        gl.linkProgram(prog);
        gl.useProgram(prog);

        const posBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

        const posLoc = gl.getAttribLocation(prog, "position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        const uTexA = gl.getUniformLocation(prog, "uTexA");
        const uTexB = gl.getUniformLocation(prog, "uTexB");
        const uProgress = gl.getUniformLocation(prog, "uProgress");
        const uTime = gl.getUniformLocation(prog, "uTime");
        const uResolution = gl.getUniformLocation(prog, "uResolution");
        const uOrigin = gl.getUniformLocation(prog, "uOrigin");
        const uDirection = gl.getUniformLocation(prog, "uDirection");

        function createAndInitTexture() {
          const tex = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          return tex;
        }

        let texA = createAndInitTexture();
        let texB = createAndInitTexture();

        function loadTexture(glTex, url) {
          if (!glTex || !url) return;
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, glTex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          };
          img.src = url;
        }

        const personas = {
          male: { a: '/assets/designs/rbp-portfolio/josh.webp?v=3', b: '/assets/designs/rbp-portfolio/josh_wave.webp?v=3' },
          female: { a: '/assets/designs/rbp-portfolio/maya.webp?v=3', b: '/assets/designs/rbp-portfolio/maya_wave.webp?v=3' },
          photo: { a: '${TemplateHelper.escapeHtml(data.avatar || defaultSrcA)}', b: '${TemplateHelper.escapeHtml(data.avatar || defaultSrcB)}' }
        };

        function setPersona(key) {
          const p = personas[key] || personas.male;
          const fallback = document.getElementById('portrait-fallback-img');
          if (fallback) fallback.src = p.a;
          loadTexture(texA, p.a);
          loadTexture(texB, p.b);
        }

        setPersona('${defaultPersona}');

        function resize() {
          const rect = frame.getBoundingClientRect();
          canvas.width = rect.width * (window.devicePixelRatio || 1);
          canvas.height = rect.height * (window.devicePixelRatio || 1);
          gl.viewport(0, 0, canvas.width, canvas.height);
        }
        window.addEventListener('resize', resize);
        resize();

        let progress = 0;
        let targetProgress = 0;
        let origin = [0.5, 0.5];
        let direction = [0.0, 1.0];
        let startTime = performance.now();

        frame.addEventListener('pointerenter', (e) => {
          targetProgress = 1.0;
          const rect = frame.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = 1.0 - (e.clientY - rect.top) / rect.height;
          origin = [x, y];
          direction = [x - 0.5, y - 0.5];
        });

        frame.addEventListener('pointerleave', () => {
          targetProgress = 0.0;
          frame.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
        });

        frame.addEventListener('pointermove', (e) => {
          const rect = frame.getBoundingClientRect();
          const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
          // Magnetic 3D tilt
          frame.style.transform = 'perspective(800px) rotateX(' + (ny * 6) + 'deg) rotateY(' + (nx * 8) + 'deg)';
        });

        function render() {
          progress += (targetProgress - progress) * 0.1;
          const now = (performance.now() - startTime) * 0.001;

          gl.useProgram(prog);
          gl.uniform2f(uResolution, canvas.width, canvas.height);
          gl.uniform1f(uTime, now);
          gl.uniform1f(uProgress, progress);
          gl.uniform2f(uOrigin, origin[0], origin[1]);
          gl.uniform2f(uDirection, direction[0], direction[1]);

          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, texA);
          gl.uniform1i(uTexA, 0);

          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, texB);
          gl.uniform1i(uTexB, 1);

          gl.drawArrays(gl.TRIANGLES, 0, 6);
          requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
      }

      initPortraitMorph();

      // 5. Physics Tech Stack Simulation (Matter-like Canvas Gravity & Collision)
      function initPhysicsChips() {
        const container = document.getElementById('physics-canvas-container');
        const canvas = document.getElementById('physics-canvas');
        if (!container || !canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const skills = ${JSON.stringify(skillsList)};
        const colors = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2', '#4f46e5', '#db2777'];

        let width = canvas.width = container.clientWidth;
        let height = canvas.height = container.clientHeight;

        function resize() {
          width = canvas.width = container.clientWidth;
          height = canvas.height = container.clientHeight;
        }
        window.addEventListener('resize', resize);

        class Chip {
          constructor(text, x, y, idx) {
            this.text = text;
            ctx.font = '600 13px Inter, sans-serif';
            this.width = ctx.measureText(text).width + 32;
            this.height = 36;
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = Math.random() * 2 + 1;
            this.color = colors[idx % colors.length];
            this.radius = 18;
          }

          update() {
            this.vy += 0.35; // gravity
            this.x += this.vx;
            this.y += this.vy;

            // Floor & wall bounds
            if (this.y + this.height / 2 > height) {
              this.y = height - this.height / 2;
              this.vy *= -0.55; // bounce
              this.vx *= 0.92; // friction
            }
            if (this.x - this.width / 2 < 0) {
              this.x = this.width / 2;
              this.vx *= -0.7;
            }
            if (this.x + this.width / 2 > width) {
              this.x = width - this.width / 2;
              this.vx *= -0.7;
            }
          }

          draw() {
            ctx.save();
            ctx.translate(this.x, this.y);

            // Chip rounded background
            ctx.beginPath();
            const w = this.width;
            const h = this.height;
            const r = this.radius;
            ctx.roundRect(-w/2, -h/2, w, h, r);
            ctx.fillStyle = this.color;
            ctx.fill();

            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.stroke();

            // Label text
            ctx.fillStyle = '#ffffff';
            ctx.font = '600 13px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.text, 0, 1);

            ctx.restore();
          }
        }

        let chips = [];

        function spawnChips() {
          chips = [];
          skills.forEach((skill, i) => {
            const startX = 60 + (i % 5) * 120 + (Math.random() - 0.5) * 30;
            const startY = 20 + Math.floor(i / 5) * 45;
            chips.push(new Chip(skill, startX, startY, i));
          });
        }
        spawnChips();

        const resetBtn = document.getElementById('reset-physics-btn');
        if (resetBtn) {
          resetBtn.addEventListener('click', spawnChips);
        }

        // Mouse Drag / Toss interaction
        let draggingChip = null;
        let dragOffset = [0, 0];
        let lastMousePos = [0, 0];
        let mouseSpeed = [0, 0];

        container.addEventListener('pointerdown', (e) => {
          const rect = container.getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const my = e.clientY - rect.top;

          for (let i = chips.length - 1; i >= 0; i--) {
            const c = chips[i];
            if (Math.abs(mx - c.x) < c.width / 2 && Math.abs(my - c.y) < c.height / 2) {
              draggingChip = c;
              dragOffset = [c.x - mx, c.y - my];
              lastMousePos = [mx, my];
              break;
            }
          }
        });

        window.addEventListener('pointermove', (e) => {
          if (!draggingChip) return;
          const rect = container.getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const my = e.clientY - rect.top;

          mouseSpeed = [mx - lastMousePos[0], my - lastMousePos[1]];
          lastMousePos = [mx, my];

          draggingChip.x = mx + dragOffset[0];
          draggingChip.y = my + dragOffset[1];
          draggingChip.vx = 0;
          draggingChip.vy = 0;
        });

        window.addEventListener('pointerup', () => {
          if (draggingChip) {
            draggingChip.vx = mouseSpeed[0] * 0.8;
            draggingChip.vy = mouseSpeed[1] * 0.8;
            draggingChip = null;
          }
        });

        function animatePhysics() {
          ctx.clearRect(0, 0, width, height);

          // Simple pair collisions
          for (let i = 0; i < chips.length; i++) {
            for (let j = i + 1; j < chips.length; j++) {
              const c1 = chips[i];
              const c2 = chips[j];
              const dx = c2.x - c1.x;
              const dy = c2.y - c1.y;
              const minDist = (c1.width + c2.width) * 0.35;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < minDist && dist > 0) {
                const overlap = (minDist - dist) * 0.5;
                const nx = dx / dist;
                const ny = dy / dist;

                if (c1 !== draggingChip) {
                  c1.x -= nx * overlap;
                  c1.y -= ny * overlap;
                  c1.vx -= nx * 0.5;
                  c1.vy -= ny * 0.5;
                }
                if (c2 !== draggingChip) {
                  c2.x += nx * overlap;
                  c2.y += ny * overlap;
                  c2.vx += nx * 0.5;
                  c2.vy += ny * 0.5;
                }
              }
            }
          }

          chips.forEach(c => {
            if (c !== draggingChip) c.update();
            c.draw();
          });

          requestAnimationFrame(animatePhysics);
        }
        requestAnimationFrame(animatePhysics);
      }

      initPhysicsChips();

      // 6. Pill Navigation Active Scroll Spy & Smooth Clicking
      function initPillNavSpy() {
        const navLinks = Array.from(document.querySelectorAll('.pill-nav a[href^="#"]'));
        if (!navLinks.length) return;

        const sections = navLinks.map(link => {
          const id = link.getAttribute('href').slice(1);
          const el = document.getElementById(id);
          return { id, link, el };
        }).filter(item => item.el !== null);

        if (!sections.length) return;

        function setActive(targetLink) {
          navLinks.forEach(l => l.classList.remove('active'));
          if (targetLink) targetLink.classList.add('active');
        }

        // Smooth click handler
        navLinks.forEach(link => {
          link.addEventListener('click', (e) => {
            const id = link.getAttribute('href').slice(1);
            const targetEl = document.getElementById(id);
            if (targetEl) {
              e.preventDefault();
              const offsetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - 50;
              window.scrollTo({ top: offsetTop, behavior: 'smooth' });
              setActive(link);
            }
          });
        });

        // Dynamic scroll spy
        let isTicking = false;
        function onScroll() {
          const scrollY = window.pageYOffset || document.documentElement.scrollTop;
          const windowHeight = window.innerHeight;
          const docHeight = document.documentElement.scrollHeight;

          // If scrolled near bottom of page, highlight Contact
          if (scrollY + windowHeight >= docHeight - 80) {
            setActive(sections[sections.length - 1].link);
            return;
          }

          const triggerPoint = scrollY + windowHeight * 0.35;
          let current = sections[0];

          for (let i = 0; i < sections.length; i++) {
            if (triggerPoint >= sections[i].el.offsetTop) {
              current = sections[i];
            }
          }

          if (current) {
            setActive(current.link);
          }
        }

        window.addEventListener('scroll', () => {
          if (!isTicking) {
            requestAnimationFrame(() => {
              onScroll();
              isTicking = false;
            });
            isTicking = true;
          }
        }, { passive: true });

        onScroll();
      }

      initPillNavSpy();

      // 6. Kinetic Structure Shift: StringTune & Smooth RAF Scroll Lerp Engine
      try {
        if (window.StringTune && window.StringTune.StringTune) {
          const stringTune = window.StringTune.StringTune.getInstance();
          window.StringTuneContext = stringTune;
          if (window.StringTune.StringLazy) stringTune.use(window.StringTune.StringLazy);
          if (window.StringTune.StringLerp) stringTune.use(window.StringTune.StringLerp);
          stringTune.start(0);
        }
      } catch (e) {
        console.warn('StringTune start fallback:', e);
      }

      const lerpFig = document.getElementById('lerp-figure');
      if (lerpFig) {
        let currentLerp = 0;
        let targetLerp = 0;

        function calcLerp() {
          const rect = lerpFig.getBoundingClientRect();
          const vh = window.innerHeight || 800;
          const center = rect.top + rect.height / 2;
          const offset = center - (vh / 2);
          // When figure is dead center, lerp is 0. Ranges from -120 to +120 as user scrolls past
          targetLerp = Math.max(-120, Math.min(120, (offset / (vh * 0.65)) * 100));
        }

        window.addEventListener('scroll', calcLerp, { passive: true });
        window.addEventListener('resize', calcLerp, { passive: true });
        calcLerp();

        function lerpTick() {
          currentLerp += (targetLerp - currentLerp) * 0.12;
          lerpFig.style.setProperty('--lerp', currentLerp.toFixed(3));
          requestAnimationFrame(lerpTick);
        }
        requestAnimationFrame(lerpTick);
      }

    })();
  </script>

</body>
</html>`;

    return {
      html,
      css: '',
      js: ''
    };
  },

  render404Page(siteId = '', candidateData = {}) {
    const safeName = TemplateHelper.escapeHtml(candidateData.name || 'Creative Engineer');
    return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 — Course Lost</title>
  <style>
    body {
      background: #0a0a0a;
      color: #fafafa;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 24px;
      margin: 0;
    }
    h1 { font-size: clamp(3rem, 8vw, 6rem); margin-bottom: 8px; font-weight: 800; letter-spacing: -0.04em; }
    p { color: #888; font-size: 1.1rem; max-width: 440px; margin-bottom: 28px; line-height: 1.5; }
    .btn-return {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #fafafa;
      color: #0a0a0a;
      font-weight: 600;
      padding: 12px 28px;
      border-radius: 9999px;
      text-decoration: none;
      transition: transform 0.2s ease;
    }
    .btn-return:hover { transform: scale(1.05); }
  </style>
</head>
<body>
  <h1>404</h1>
  <p>The coordinates you entered do not exist on ${safeName}'s portfolio canvas.</p>
  <a href="/p/${siteId || ''}" class="btn-return">Return to Base →</a>
</body>
</html>`;
  }
};

module.exports = { RBPKineticMonochromeTemplate };
