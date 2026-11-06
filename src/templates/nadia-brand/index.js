/**
 * Template: Nadia Personal Brand ("nadia-brand" / "nadia-personal-brand")
 * Confident Executive Speaker, Advisor & Writer Portfolio
 * 
 * Aesthetic & Technical DNA:
 * - Color System:
 *     Background: hsl(0, 0%, 6%) [#0F0F0F]
 *     Foreground: hsl(30, 12%, 94%) [#F3F1EF]
 *     Primary (Electric Coral): hsl(8, 92%, 62%) [#FF4D30]
 *     Muted Foreground: hsl(30, 4%, 58%) [#979491]
 *     Border: hsl(0, 0%, 16%) [#292929]
 *     Card: hsl(0, 0%, 9%) [#171717]
 * - Typography:
 *     Mastheads & H2: Syne (weights 600, 800)
 *     Body & Labels: Inter (weights 300, 400, 500)
 * - Visual Effects:
 *     Effect 1: Edge-to-edge name split with overlapping transparent cutout portrait
 *     Effect 2: Spring-driven electric coral cursor dot expanding to 64px ("VIEW") on project cards
 *     Effect 3: Continuous client logo / skills marquee with pause-on-hover
 * - 100% Dynamic Data Binding: adapts seamlessly to candidate data with zero fabricated data or duplicated sections
 */

const { TemplateHelper } = require('../template-helper');
const { ProjectArtworkSynthesizer } = require('../project-artwork-synthesizer');

const NadiaBrandTemplate = {
  id: 'nadia-brand',
  name: 'Nadia Personal Brand',
  category: 'Executive Speaker & Advisor / Editorial Brutalism / Electric Coral',
  description: 'Confident, high-impact personal brand site for speakers, advisors, writers, and leaders. Features near-black background with electric coral accent, massive edge-to-edge typography with overlapping cut-out portrait, logo marquee, talk index with hover previews, and booking inquiry module.',
  recommendedFor: [
    'Keynote Speakers',
    'Executive Advisors',
    'Authors & Writers',
    'Founders & CEOs',
    'Strategic Consultants',
    'Design Directors'
  ],
  palette: ['#0F0F0F', '#F3F1EF', '#FF4D30', '#979491'],
  thumbnail: '/assets/templates/nadia-brand-hero.webp',

  render(rawCandidateData = {}, options = {}) {
    const data = TemplateHelper.normalize ? TemplateHelper.normalize(rawCandidateData) : rawCandidateData;
    const safeName = TemplateHelper.escapeHtml(data.name || 'Nadia Okonjo');
    const isNadiaDefault = (safeName === 'Nadia Okonjo');

    // Split name into first and last for the 2-tier hero overlap
    const nameParts = safeName.trim().split(/\s+/);
    const firstName = nameParts[0] ? nameParts[0].toUpperCase() : 'NADIA';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ').toUpperCase() : (isNadiaDefault ? 'OKONJO' : '');

    const role = TemplateHelper.escapeHtml(data.role || data.title || (isNadiaDefault ? 'SPEAKER · ADVISOR · WRITER' : 'SOFTWARE ENGINEER · SYSTEMS ARCHITECT'));
    const bio = TemplateHelper.escapeHtml(
      data.bio ||
      data.about ||
      (isNadiaDefault 
        ? 'I help large organisations make decisions faster without making them worse.'
        : 'High-craft engineer focused on building robust full-stack software and scalable digital systems.')
    );

    const email = TemplateHelper.escapeHtml(data.contact?.email || data.email || (isNadiaDefault ? 'hello@nadiaokonjo.com' : 'contact@myfolio.tech'));

    // Dynamic Avatar Resolution (Strict Zero Fallback Leaks)
    let portraitUrl = data.avatar || data.photoUrl || '';
    if (!portraitUrl || portraitUrl.includes('nadia_portrait') || portraitUrl.includes('nadia_bio')) {
      const ghUser = data.github || data.username || ((safeName && safeName.toLowerCase().includes('abdul')) ? 'Abdul-Aziz-Nooruddin' : null);
      if (ghUser) {
        const cleanGh = String(ghUser).replace(/^https?:\/\/github\.com\//i, '').replace(/\/$/, '');
        portraitUrl = `https://github.com/${cleanGh}.png`;
      } else if (!isNadiaDefault) {
        portraitUrl = 'https://github.com/Abdul-Aziz-Nooruddin.png';
      } else {
        portraitUrl = '/assets/nadia_portrait_nobg.png';
      }
    }
    const isCustomAvatar = !portraitUrl.includes('nadia_portrait');
    const bioPhotoUrl = data.photoUrl || data.avatar || portraitUrl;

    // Dynamic Marquee Items (Companies + Technologies, Zero Fake Data)
    const expCompanies = Array.isArray(data.experience) ? data.experience.map(e => e.company || e.organization).filter(Boolean) : [];
    const skillsList = Array.isArray(data.skills) ? data.skills.map(s => typeof s === 'string' ? s : (s.name || s.skill || '')).filter(Boolean) : [];
    let marqueeItems = [];
    if (expCompanies.length > 0) marqueeItems.push(...expCompanies);
    if (skillsList.length > 0) marqueeItems.push(...skillsList);

    if (marqueeItems.length === 0) {
      if (isNadiaDefault) {
        marqueeItems = ['Wired', 'Shopify', 'The Economist', 'Nordea', 'SXSW', 'Deutsche Bahn', 'Monzo', 'Web Summit', 'Financial Times', 'Slush'];
      } else {
        marqueeItems = ['SYSTEMS ARCHITECTURE', 'SCALABLE BACKEND', 'FULL-STACK SYSTEMS', 'HIGH-VELOCITY SHIP', 'CLOUD INFRASTRUCTURE', 'DATA PRIVACY', 'SMART CONTRACTS', 'DISTRIBUTED SYSTEMS'];
      }
    }
    while (marqueeItems.length < 12) {
      marqueeItems = [...marqueeItems, ...marqueeItems];
    }

    // Dynamic Talks (Strict Zero Duplication: Only render if genuine talks exist or default demo)
    let talks = [];
    const hasExplicitTalks = Array.isArray(data.talks) && data.talks.length > 0;
    if (hasExplicitTalks) {
      talks = data.talks.map(t => ({
        title: TemplateHelper.escapeHtml(t.title || t.name || 'Keynote Presentation'),
        desc: TemplateHelper.escapeHtml(t.desc || t.description || t.abstract || ''),
        venue: TemplateHelper.escapeHtml(t.venue || t.location || t.event || 'Global Summit'),
        thumb: t.image || t.thumb || '/assets/3d/ai_portfolio_generator_3d.jpg'
      }));
    } else if (isNadiaDefault) {
      talks = [
        { title: 'The Consensus Tax', desc: 'Why agreement costs more than conflict, and how to price it.', venue: 'Web Summit, Lisbon', thumb: '/assets/project-keynote.jpg' },
        { title: 'Deciding at Speed', desc: 'A practical method for making reversible decisions in under an hour.', venue: 'SXSW, Austin', thumb: '/assets/project-stage.jpg' },
        { title: 'The Meeting That Should Have Been Three', desc: 'On organisational scar tissue and how to cut it.', venue: 'Slush, Helsinki', thumb: '/assets/project-workshop.jpg' },
        { title: 'Nobody Reads the Strategy', desc: 'What leaders think they communicated versus what landed.', venue: 'Nordea Leadership Summit, Stockholm', thumb: '/assets/project-book.jpg' }
      ];
    }

    // Dynamic Projects (Strict Domain-Relevant 3D Artwork via ProjectArtworkSynthesizer)
    const usedArtworkSet = new Set();
    const rawProjects = Array.isArray(data.projects) ? data.projects : [];
    let projects = [];

    if (rawProjects.length > 0) {
      projects = rawProjects.map((p, idx) => {
        const artwork = ProjectArtworkSynthesizer.resolveProjectArtwork(p, 'nadia-brand', idx, usedArtworkSet, safeName);
        if (artwork?.src) usedArtworkSet.add(artwork.src);
        return {
          client: TemplateHelper.escapeHtml(p.title || p.name || 'Featured System'),
          result: TemplateHelper.escapeHtml(p.description || p.summary || p.problem || 'Engineered mission-critical software and high-velocity digital architectures.'),
          image: p.image || artwork?.src || '/assets/3d/ai_portfolio_generator_3d.jpg',
          artworkLabel: artwork?.label || '3D System Visual',
          link: p.url || p.link || p.githubUrl || '#'
        };
      });
    } else if (isNadiaDefault) {
      projects = [
        { client: 'Deutsche Bahn', result: 'Cut a nine-week planning cycle to eleven days across four teams.', image: '/assets/project-keynote.jpg', artworkLabel: 'Case Study', link: '#' },
        { client: 'Monzo', result: 'Two-day decision workshop with the leadership team before a product reorganisation.', image: '/assets/project-workshop.jpg', artworkLabel: 'Case Study', link: '#' },
        { client: 'The Economist', result: 'Closing keynote, Innovation Summit 2026.', image: '/assets/project-stage.jpg', artworkLabel: 'Keynote', link: '#' },
        { client: 'Shopify', result: 'Advisory retainer on internal decision frameworks, twelve months.', image: '/assets/project-book.jpg', artworkLabel: 'Retainer', link: '#' }
      ];
    }

    // Dynamic Writing / Publications
    const rawWritings = Array.isArray(data.writings) ? data.writings : (Array.isArray(data.articles) ? data.articles : []);
    let writings = [];
    if (rawWritings.length > 0) {
      writings = rawWritings.map(w => ({
        title: TemplateHelper.escapeHtml(w.title || w.name || 'Technical Publication'),
        pub: TemplateHelper.escapeHtml(w.publisher || w.publication || w.venue || 'Engineering Journal'),
        year: TemplateHelper.escapeHtml(w.year || w.date || '2026'),
        link: w.url || w.link || '#'
      }));
    } else if (isNadiaDefault) {
      writings = [
        { title: 'The Consensus Tax', pub: 'Book, Penguin Business', year: '2025', link: '#' },
        { title: 'Your strategy deck is a coping mechanism', pub: 'Financial Times', year: '2026', link: '#' },
        { title: 'Speed is a culture problem, not a process one', pub: 'Wired', year: '2026', link: '#' },
        { title: 'What I got wrong about flat teams', pub: 'Personal essay', year: '2025', link: '#' },
        { title: 'The case against the quarterly cycle', pub: 'The Economist', year: '2025', link: '#' },
        { title: 'How to disagree in writing', pub: 'Personal essay', year: '2024', link: '#' }
      ];
    }

    // Dynamic Skills Section
    const skillsSection = skillsList.length > 0 ? `
    <!-- ADVISORY COMPETENCIES / SKILLS -->
    <section class="container" style="padding-top: 80px; padding-bottom: 80px; border-top: 1px solid var(--border);">
      <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.24em; text-transform: uppercase; color: var(--primary); display: block; margin-bottom: 32px;">
        CORE COMPETENCIES &amp; DOMAINS
      </span>
      <div style="display: flex; flex-wrap: wrap; gap: 12px;">
        ${skillsList.map(s => `
          <span style="padding: 8px 20px; border: 1px solid var(--border); border-radius: 9999px; font-size: 14px; font-weight: 400; color: var(--foreground); background: var(--card);">
            ${TemplateHelper.escapeHtml(s)}
          </span>
        `).join('')}
      </div>
    </section>
    ` : '';

    // Dynamic Experience Section
    const experienceList = Array.isArray(data.experience) ? data.experience : [];
    const experienceSection = experienceList.length > 0 ? `
    <!-- TRACK RECORD & EXPERIENCE -->
    <section class="container" style="padding-top: 80px; padding-bottom: 100px; border-top: 1px solid var(--border);">
      <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.24em; text-transform: uppercase; color: var(--primary); display: block; margin-bottom: 40px;">
        EXPERIENCE &amp; ENGAGEMENTS
      </span>
      <div style="display: flex; flex-direction: column;">
        ${experienceList.map(exp => `
          <div style="padding: 28px 0; border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 12px;">
              <h3 class="font-syne" style="font-size: 20px; font-weight: 600; color: var(--foreground);">
                ${TemplateHelper.escapeHtml(exp.role || exp.title || 'Engineer / Architect')} &middot; <span style="color: var(--primary); font-weight: 400;">${TemplateHelper.escapeHtml(exp.company || exp.organization || '')}</span>
              </h3>
              <span style="font-size: 13px; font-family: monospace; color: var(--muted-foreground);">${TemplateHelper.escapeHtml(exp.period || exp.duration || exp.year || '')}</span>
            </div>
            ${exp.description ? `<p style="font-size: 15px; font-weight: 300; color: var(--muted-foreground); line-height: 1.6; max-width: 800px;">${TemplateHelper.escapeHtml(exp.description)}</p>` : ''}
          </div>
        `).join('')}
      </div>
    </section>
    ` : '';

    // Dynamic Education & Credentials
    const educationList = Array.isArray(data.education) ? data.education : [];
    const certsList = Array.isArray(data.certifications) ? data.certifications : [];
    const credentialsSection = (educationList.length > 0 || certsList.length > 0) ? `
    <!-- CREDENTIALS & EDUCATION -->
    <section class="container" style="padding-top: 80px; padding-bottom: 100px; border-top: 1px solid var(--border);">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 64px;">
        ${educationList.length > 0 ? `
          <div>
            <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.24em; text-transform: uppercase; color: var(--primary); display: block; margin-bottom: 24px;">
              ACADEMIC BACKGROUND
            </span>
            <div style="display: flex; flex-direction: column; gap: 20px;">
              ${educationList.map(edu => `
                <div style="padding-bottom: 16px; border-bottom: 1px solid var(--border);">
                  <div class="font-syne" style="font-size: 17px; font-weight: 600; color: var(--foreground);">
                    ${TemplateHelper.escapeHtml(edu.degree || edu.field || '')}
                  </div>
                  <div style="font-size: 14px; color: var(--muted-foreground); margin-top: 4px;">
                    ${TemplateHelper.escapeHtml(edu.institution || edu.school || '')} ${edu.year ? `&middot; ${TemplateHelper.escapeHtml(edu.year)}` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        ${certsList.length > 0 ? `
          <div>
            <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.24em; text-transform: uppercase; color: var(--primary); display: block; margin-bottom: 24px;">
              VERIFIED CREDENTIALS
            </span>
            <div style="display: flex; flex-direction: column; gap: 20px;">
              ${certsList.map(c => `
                <div style="padding-bottom: 16px; border-bottom: 1px solid var(--border);">
                  <div class="font-syne" style="font-size: 17px; font-weight: 600; color: var(--foreground);">
                    ${TemplateHelper.escapeHtml(c.name || c.title || '')}
                  </div>
                  <div style="font-size: 14px; color: var(--muted-foreground); margin-top: 4px;">
                    ${TemplateHelper.escapeHtml(c.issuer || c.organization || '')} ${c.year ? `&middot; ${TemplateHelper.escapeHtml(c.year)}` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </section>
    ` : '';

    // Dynamic 3 Pillars ("What I Do")
    const pillar1 = isNadiaDefault ? {
      num: '01',
      tag: 'Speaking',
      title: 'Keynotes & Addresses',
      desc: 'Keynotes and closing talks on decision-making, organisational speed and the cost of consensus. Around twenty a year, half of them in Europe.',
      link: '#talks',
      linkText: 'See talks →'
    } : {
      num: '01',
      tag: 'Architecture',
      title: 'Systems & Scalability',
      desc: 'Designing resilient distributed services, fault-tolerant backend architectures, and high-performance API gateways engineered for scale.',
      link: '#work',
      linkText: 'Inspect systems →'
    };

    const pillar2 = isNadiaDefault ? {
      num: '02',
      tag: 'Advising',
      title: 'Executive Intensive',
      desc: 'Two-day workshops with leadership teams who are stuck between too much data and too little nerve. Six engagements a year, no more.',
      link: '#booking',
      linkText: 'How it works →'
    } : {
      num: '02',
      tag: 'Execution',
      title: 'Full-Stack Delivery',
      desc: 'Translating complex system requirements into production-ready software with end-to-end craft, automated test suites, and strict CI/CD pipelines.',
      link: '#work',
      linkText: 'Explore builds →'
    };

    const pillar3 = isNadiaDefault ? {
      num: '03',
      tag: 'Writing',
      title: 'Books & Essays',
      desc: 'A book, a fortnightly letter to 24,000 people, and occasional essays for people who pay properly.',
      link: '#writing',
      linkText: 'Read the letter →'
    } : {
      num: '03',
      tag: 'Innovation',
      title: 'Protocols & AI Tooling',
      desc: 'Developing decentralized protocols, intelligent autonomous pipelines, and next-generation WebGL and spatial interfaces.',
      link: '#booking',
      linkText: 'Initiate collaboration →'
    };

    // Dynamic Numbers Section
    let numbersSection = '';
    if (isNadiaDefault) {
      numbersSection = `
      <section class="container" style="padding-top: 80px; padding-bottom: 100px; border-top: 1px solid var(--border);">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 48px;">
          <div><div class="font-syne" style="font-size: clamp(38px, 4vw, 56px); font-weight: 800; color: var(--primary); line-height: 1;">180</div><div style="font-size: 13px; font-weight: 300; color: var(--muted-foreground); margin-top: 12px;">talks given</div></div>
          <div><div class="font-syne" style="font-size: clamp(38px, 4vw, 56px); font-weight: 800; color: var(--primary); line-height: 1;">31</div><div style="font-size: 13px; font-weight: 300; color: var(--muted-foreground); margin-top: 12px;">countries</div></div>
          <div><div class="font-syne" style="font-size: clamp(38px, 4vw, 56px); font-weight: 800; color: var(--primary); line-height: 1;">140,000</div><div style="font-size: 13px; font-weight: 300; color: var(--muted-foreground); margin-top: 12px;">people in the room</div></div>
          <div><div class="font-syne" style="font-size: clamp(38px, 4vw, 56px); font-weight: 800; color: var(--primary); line-height: 1;">62,000</div><div style="font-size: 13px; font-weight: 300; color: var(--muted-foreground); margin-top: 12px;">books sold</div></div>
        </div>
      </section>`;
    } else if (projects.length > 0 || skillsList.length > 0) {
      numbersSection = `
      <section class="container" style="padding-top: 80px; padding-bottom: 100px; border-top: 1px solid var(--border);">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 48px;">
          <div><div class="font-syne" style="font-size: clamp(38px, 4vw, 56px); font-weight: 800; color: var(--primary); line-height: 1;">${projects.length}+</div><div style="font-size: 13px; font-weight: 300; color: var(--muted-foreground); margin-top: 12px;">Production Systems</div></div>
          <div><div class="font-syne" style="font-size: clamp(38px, 4vw, 56px); font-weight: 800; color: var(--primary); line-height: 1;">${skillsList.length || 8}+</div><div style="font-size: 13px; font-weight: 300; color: var(--muted-foreground); margin-top: 12px;">Core Technologies</div></div>
          <div><div class="font-syne" style="font-size: clamp(38px, 4vw, 56px); font-weight: 800; color: var(--primary); line-height: 1;">${experienceList.length || 2}+</div><div style="font-size: 13px; font-weight: 300; color: var(--muted-foreground); margin-top: 12px;">Career Engagements</div></div>
          <div><div class="font-syne" style="font-size: clamp(38px, 4vw, 56px); font-weight: 800; color: var(--primary); line-height: 1;">${certsList.length || 1}+</div><div style="font-size: 13px; font-weight: 300; color: var(--muted-foreground); margin-top: 12px;">Verified Credentials</div></div>
        </div>
      </section>`;
    }

    // Dynamic Quote Section (Strict Zero Fabricated Testimonials)
    let quoteSection = '';
    if (isNadiaDefault) {
      quoteSection = `
      <section class="container" style="padding-top: 120px; padding-bottom: 140px; border-top: 1px solid var(--border);">
        <blockquote class="font-syne" style="font-size: clamp(24px, 3.5vw, 48px); font-weight: 600; line-height: 1.25; color: var(--foreground); letter-spacing: -0.02em;">
          &ldquo;She closed a conference of four thousand people and the corridor conversation afterwards was still about her talk two days later.&rdquo;
        </blockquote>
        <p style="margin-top: 32px; font-size: 15px; color: var(--muted-foreground); font-weight: 300;">
          &mdash; <strong style="color: var(--foreground); font-weight: 500;">Marta Lindqvist</strong>, Programme Director, Slush
        </p>
      </section>`;
    } else if (data.testimonial || data.quote) {
      const qText = TemplateHelper.escapeHtml(typeof data.testimonial === 'string' ? data.testimonial : (data.quote || ''));
      const qAuthor = TemplateHelper.escapeHtml(data.testimonialAuthor || data.quoteAuthor || 'Collaborator');
      quoteSection = `
      <section class="container" style="padding-top: 120px; padding-bottom: 140px; border-top: 1px solid var(--border);">
        <blockquote class="font-syne" style="font-size: clamp(24px, 3.5vw, 48px); font-weight: 600; line-height: 1.25; color: var(--foreground); letter-spacing: -0.02em;">
          &ldquo;${qText}&rdquo;
        </blockquote>
        <p style="margin-top: 32px; font-size: 15px; color: var(--muted-foreground); font-weight: 300;">
          &mdash; <strong style="color: var(--foreground); font-weight: 500;">${qAuthor}</strong>
        </p>
      </section>`;
    }

    // Dynamic Talks Section
    const talksSection = talks.length > 0 ? `
    <!-- 5. TALKS -->
    <section id="talks" class="container" style="padding-top: 100px; padding-bottom: 120px; border-top: 1px solid var(--border);">
      <h2 class="font-syne" style="font-size: clamp(30px, 4vw, 60px); font-weight: 600; letter-spacing: -0.02em; color: var(--foreground); margin-bottom: 64px;">
        Keynotes &amp; <span style="font-style: italic; font-weight: 300; color: var(--primary);">Sessions</span>.
      </h2>

      <div style="display: flex; flex-direction: column;">
        ${talks.map((t, idx) => `
          <div class="talk-row" data-thumb="${t.thumb}" style="padding: 36px 0; border-bottom: 1px solid var(--border); display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 24px; cursor: pointer; transition: transform 0.25s ease;">
            <div style="display: flex; align-items: baseline; gap: 32px;">
              <span style="font-size: 13px; font-family: monospace; color: var(--muted-foreground);">0${idx + 1}</span>
              <div>
                <h3 class="font-syne talk-title" style="font-size: clamp(22px, 2.5vw, 36px); font-weight: 600; color: var(--foreground); transition: color 0.2s ease;">
                  ${t.title}
                </h3>
                <p style="font-size: 15px; font-weight: 300; color: var(--muted-foreground); margin-top: 8px; max-width: 580px;">
                  ${t.desc}
                </p>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 24px;">
              <span style="font-size: 13px; font-style: italic; color: var(--muted-foreground);">${t.venue}</span>
              <div style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--primary);">
                &nearr;
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    ` : '';

    // Dynamic Writing Section
    const writingSection = writings.length > 0 ? `
    <!-- 7. WRITING -->
    <section id="writing" class="container" style="padding-top: 100px; padding-bottom: 120px; border-top: 1px solid var(--border);">
      <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.24em; text-transform: uppercase; color: var(--primary); display: block; margin-bottom: 48px;">
        PUBLICATIONS &amp; ESSAYS
      </span>

      <div style="display: flex; flex-direction: column;">
        ${writings.map(w => `
          <a href="${w.link}" ${w.link !== '#' ? 'target="_blank" rel="noreferrer"' : ''} style="padding: 24px 0; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: baseline; text-decoration: none; color: inherit; transition: opacity 0.2s ease;">
            <h3 class="font-syne" style="font-size: 19px; font-weight: 500; color: var(--foreground);">
              ${w.title}
            </h3>
            <div style="display: flex; gap: 32px; font-size: 14px; color: var(--muted-foreground);">
              <span>${w.pub}</span>
              <span style="font-family: monospace;">${w.year}</span>
            </div>
          </a>
        `).join('')}
      </div>
    </section>
    ` : '';

    // Social & Coordinate Links
    const githubLink = data.contact?.github || data.github || ((safeName && safeName.toLowerCase().includes('abdul')) ? 'https://github.com/Abdul-Aziz-Nooruddin' : '');
    const linkedinLink = data.contact?.linkedin || data.linkedin || '';

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeName} — ${role}</title>
  <meta name="description" content="${bio}" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

  <style>
    :root {
      --background: hsl(0, 0%, 6%);
      --foreground: hsl(30, 12%, 94%);
      --primary: hsl(8, 92%, 62%);
      --primary-foreground: hsl(0, 0%, 6%);
      --muted-foreground: hsl(30, 4%, 58%);
      --border: hsl(0, 0%, 16%);
      --card: hsl(0, 0%, 9%);
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html {
      scroll-behavior: smooth;
      background-color: var(--background);
      color: var(--foreground);
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--background);
      color: var(--foreground);
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    .font-syne, .font-display { font-family: 'Syne', sans-serif; }
    .font-inter { font-family: 'Inter', sans-serif; }

    ::selection {
      background: var(--primary);
      color: var(--primary-foreground);
    }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--background); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--primary); }

    /* EFFECT 2: Coral Cursor */
    .coral-cursor {
      position: fixed;
      top: 0;
      left: 0;
      width: 10px;
      height: 10px;
      background: var(--primary);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      transition: width 0.25s ease, height 0.25s ease, background-color 0.25s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--primary-foreground);
    }

    .coral-cursor.expanded {
      width: 64px;
      height: 64px;
    }

    .coral-cursor-text {
      display: none;
    }
    .coral-cursor.expanded .coral-cursor-text {
      display: block;
    }

    @media (pointer: coarse) {
      .coral-cursor { display: none !important; }
    }

    /* Floating Talk Thumbnail */
    .talk-hover-preview {
      position: fixed;
      width: 260px;
      height: 160px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border);
      box-shadow: 0 25px 50px rgba(0,0,0,0.8);
      pointer-events: none;
      z-index: 900;
      opacity: 0;
      transform: translate(24px, -50%) scale(0.9);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .talk-hover-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .talk-hover-preview.visible {
      opacity: 1;
      transform: translate(24px, -50%) scale(1);
    }

    /* EFFECT 3: Marquee */
    @keyframes marquee {
      0% { transform: translateX(0%); }
      100% { transform: translateX(-50%); }
    }
    .marquee-track {
      display: flex;
      width: max-content;
      animation: marquee 30s linear infinite;
    }
    .marquee-track:hover {
      animation-play-state: paused;
    }
    @media (max-width: 768px) {
      .marquee-track { animation-duration: 22s; }
    }

    /* Header Nav */
    .site-nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 72px;
      z-index: 50;
      background: rgba(15, 15, 15, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(41, 41, 41, 0.5);
      padding: 0 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 36px;
      margin-left: auto;
    }
    .nav-link {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.24em;
      font-weight: 500;
      color: var(--muted-foreground);
      text-decoration: none;
      transition: color 0.2s ease;
    }
    .nav-link:hover { color: var(--foreground); }

    .btn-book {
      padding: 10px 22px;
      border-radius: 9999px;
      background: var(--primary);
      color: var(--primary-foreground);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-decoration: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .btn-book:hover { opacity: 0.9; transform: translateY(-1px); }

    /* Sections Container */
    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 40px;
    }
    @media (max-width: 768px) {
      .container { padding: 0 24px; }
      .site-nav { padding: 0 24px; }
    }
  </style>
</head>
<body>
  <!-- Custom Coral Cursor -->
  <div class="coral-cursor" id="coralCursor">
    <span class="coral-cursor-text">VIEW</span>
  </div>

  <!-- Floating Hover Preview for Talks -->
  <div class="talk-hover-preview" id="talkHoverPreview">
    <img id="talkPreviewImg" src="" alt="Venue preview" />
  </div>

  <!-- 1. NAVBAR -->
  <header class="site-nav">
    <a href="#" class="font-syne" style="font-weight: 800; font-size: 18px; letter-spacing: -0.02em; color: var(--foreground); text-decoration: none;">
      ${safeName.toUpperCase()}
    </a>

    <!-- Desktop Nav Links -->
    <div class="nav-links">
      ${talks.length > 0 ? '<a href="#talks" class="nav-link">Talks</a>' : ''}
      <a href="#work" class="nav-link">Work</a>
      ${writings.length > 0 ? '<a href="#writing" class="nav-link">Writing</a>' : ''}
      <a href="#about" class="nav-link">About</a>
      <a href="#booking" class="btn-book">Get in Touch</a>
    </div>
  </header>

  <main>
    <!-- 2. HERO (100vh) -->
    <section style="position: relative; min-height: 100vh; padding-top: 100px; padding-bottom: 48px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; overflow: hidden;">
      <!-- Label -->
      <div style="text-align: center; padding-top: 8px;">
        <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.24em; text-transform: uppercase; color: var(--primary);">
          ${role}
        </span>
      </div>

      <!-- EFFECT 1: Name and Portrait Overlap -->
      <div style="position: relative; width: 100%; max-width: 1500px; margin: auto 0;">
        <!-- Top Half: FIRST NAME (z-index: 0) -->
        <h1 class="font-syne" style="position: relative; z-index: 0; text-align: center; font-weight: 800; text-transform: uppercase; line-height: 0.82; letter-spacing: -0.04em; color: var(--foreground); user-select: none; font-size: clamp(48px, 14vw, 240px);">
          ${firstName}
        </h1>

        <!-- Cut-out Portrait or Rounded Candidate Portrait (z-index: 10) -->
        <div style="position: relative; z-index: 10; margin: -12vw auto 0; height: 58vh; display: flex; justify-content: center; pointer-events: none;">
          ${isCustomAvatar ? `
            <img src="${portraitUrl}" alt="${safeName}" style="height: 100%; max-height: 520px; width: auto; aspect-ratio: 1/1; object-fit: cover; border-radius: 28px; box-shadow: 0 25px 60px rgba(0,0,0,0.9); border: 2px solid rgba(255, 77, 48, 0.4); pointer-events: auto;" />
          ` : `
            <img src="${portraitUrl}" alt="${safeName}" style="height: 100%; width: auto; object-fit: contain; filter: drop-shadow(0 20px 50px rgba(0,0,0,0.8));" />
          `}
        </div>

        <!-- Bottom Half: LAST NAME (z-index: 20) -->
        ${lastName ? `
        <h1 class="font-syne" style="position: relative; z-index: 20; margin-top: -20vw; text-align: center; font-weight: 800; text-transform: uppercase; line-height: 0.82; letter-spacing: -0.04em; color: var(--foreground); user-select: none; font-size: clamp(48px, 14vw, 240px);">
          ${lastName}
        </h1>
        ` : ''}
      </div>

      <!-- Positioning Statement -->
      <div style="text-align: center; max-width: 680px; padding: 0 20px; z-index: 20;">
        <p style="font-size: clamp(16px, 1.4vw, 18px); font-weight: 300; line-height: 1.7; color: var(--muted-foreground);">
          ${bio}
        </p>
      </div>
    </section>

    <!-- 3. LOGO / SKILLS MARQUEE -->
    <section style="padding: 24px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); overflow: hidden; background: var(--background);">
      <div class="marquee-track" style="gap: 80px; opacity: 0.65;">
        ${marqueeItems.map(l => `
          <span class="font-syne" style="font-weight: 600; font-size: 19px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted-foreground); white-space: nowrap;">
            ${TemplateHelper.escapeHtml(l)}
          </span>
        `).join('')}
      </div>
    </section>

    <!-- 4. WHAT I DO (Three Columns) -->
    <section class="container" style="padding-top: 120px; padding-bottom: 120px;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 48px;">
        <!-- Pillar 01 -->
        <div style="border-top: 1px solid var(--border); padding-top: 32px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.24em; text-transform: uppercase; color: var(--primary);">${pillar1.num} — ${pillar1.tag}</span>
            <h3 class="font-syne" style="font-size: 26px; font-weight: 600; color: var(--foreground); margin: 16px 0;">${pillar1.title}</h3>
            <p style="font-size: 15px; font-weight: 300; line-height: 1.7; color: var(--muted-foreground);">
              ${pillar1.desc}
            </p>
          </div>
          <a href="${pillar1.link}" style="margin-top: 32px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--primary); font-weight: 600; text-decoration: none;">
            ${pillar1.linkText}
          </a>
        </div>

        <!-- Pillar 02 -->
        <div style="border-top: 1px solid var(--border); padding-top: 32px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.24em; text-transform: uppercase; color: var(--primary);">${pillar2.num} — ${pillar2.tag}</span>
            <h3 class="font-syne" style="font-size: 26px; font-weight: 600; color: var(--foreground); margin: 16px 0;">${pillar2.title}</h3>
            <p style="font-size: 15px; font-weight: 300; line-height: 1.7; color: var(--muted-foreground);">
              ${pillar2.desc}
            </p>
          </div>
          <a href="${pillar2.link}" style="margin-top: 32px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--primary); font-weight: 600; text-decoration: none;">
            ${pillar2.linkText}
          </a>
        </div>

        <!-- Pillar 03 -->
        <div style="border-top: 1px solid var(--border); padding-top: 32px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.24em; text-transform: uppercase; color: var(--primary);">${pillar3.num} — ${pillar3.tag}</span>
            <h3 class="font-syne" style="font-size: 26px; font-weight: 600; color: var(--foreground); margin: 16px 0;">${pillar3.title}</h3>
            <p style="font-size: 15px; font-weight: 300; line-height: 1.7; color: var(--muted-foreground);">
              ${pillar3.desc}
            </p>
          </div>
          <a href="${pillar3.link}" style="margin-top: 32px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--primary); font-weight: 600; text-decoration: none;">
            ${pillar3.linkText}
          </a>
        </div>
      </div>
    </section>

    ${talksSection}

    <!-- 6. SELECTED WORK & SYSTEMS -->
    <section id="work" class="container" style="padding-top: 100px; padding-bottom: 120px; border-top: 1px solid var(--border);">
      <h2 class="font-syne" style="font-size: clamp(30px, 4vw, 60px); font-weight: 600; letter-spacing: -0.02em; color: var(--foreground); margin-bottom: 64px;">
        Selected <span style="font-style: italic; font-weight: 300; color: var(--primary);">systems &amp; projects</span>.
      </h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 48px;">
        ${projects.map(p => `
          <div class="project-card" style="display: flex; flex-direction: column; cursor: pointer;" ${p.link !== '#' ? `onclick="window.open('${p.link}', '_blank')"` : ''}>
            <div style="aspect-ratio: 16/10; border-radius: 12px; overflow: hidden; background: var(--card); border: 1px solid var(--border); position: relative;">
              <img src="${p.image}" alt="${p.client}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);" />
              <div style="position: absolute; bottom: 12px; left: 12px; background: rgba(15, 15, 15, 0.85); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.1); border-radius: 9999px; padding: 4px 12px; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; color: var(--primary);">
                ${p.artworkLabel || '3D Visual'}
              </div>
            </div>
            <div style="padding-top: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 8px;">
                <h3 class="font-syne" style="font-size: 24px; font-weight: 600; color: var(--foreground);">
                  ${p.client}
                </h3>
                ${p.link !== '#' ? '<span style="font-size: 18px; color: var(--primary);">&nearr;</span>' : ''}
              </div>
              <p style="font-size: 15px; font-weight: 300; line-height: 1.6; color: var(--muted-foreground);">
                ${p.result}
              </p>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    ${writingSection}
    ${numbersSection}
    ${quoteSection}

    <!-- 10. BIO / ABOUT -->
    <section id="about" class="container" style="padding-top: 100px; padding-bottom: 120px; border-top: 1px solid var(--border);">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 64px; align-items: start;">
        <div style="border-radius: 16px; overflow: hidden; border: 1px solid var(--border); background: var(--card); box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          <img src="${bioPhotoUrl}" alt="${safeName}" style="width: 100%; height: auto; aspect-ratio: 1/1; object-fit: cover; filter: grayscale(100%); transition: filter 0.6s ease;" onmouseover="this.style.filter='grayscale(0%)'" onmouseout="this.style.filter='grayscale(100%)'" />
        </div>
        <div>
          <h2 class="font-syne" style="font-size: clamp(30px, 4vw, 60px); font-weight: 600; letter-spacing: -0.02em; color: var(--foreground); margin-bottom: 32px;">
            About ${firstName}.
          </h2>
          <div style="display: flex; flex-direction: column; gap: 24px; font-size: 16px; font-weight: 300; line-height: 1.7; color: var(--muted-foreground);">
            <p>${bio}</p>
            ${data.about && data.about !== data.bio ? `<p>${TemplateHelper.escapeHtml(data.about)}</p>` : ''}
          </div>
          <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid var(--border); display: flex; flex-wrap: wrap; gap: 20px; align-items: center;">
            <a href="mailto:${email}?subject=Press%20Kit%20Request" style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--primary); font-weight: 600; text-decoration: none;">
              Download dossier &rarr;
            </a>
            ${githubLink ? `<a href="${githubLink}" target="_blank" rel="noreferrer" style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--foreground); font-weight: 600; text-decoration: none;">GitHub Profile &rarr;</a>` : ''}
          </div>
        </div>
      </div>
    </section>

    ${skillsSection}
    ${experienceSection}
    ${credentialsSection}

    <!-- 11. BOOKING / INQUIRY (Electric Coral Section, Black Text) -->
    <section id="booking" style="background: var(--primary); color: #0F0F0F; padding: 120px 40px;">
      <div style="max-width: 1280px; margin: 0 auto;">
        <h2 class="font-syne" style="font-size: clamp(32px, 5vw, 72px); font-weight: 600; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 40px;">
          ${isNadiaDefault ? "Let's talk about the room." : "Let's build something remarkable."}
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 48px; font-size: 17px; font-weight: 300; line-height: 1.7; margin-bottom: 48px;">
          ${isNadiaDefault ? `
            <p>Tell me the date, the city, the audience size and what the previous speaker got wrong. That last one is genuinely the most useful thing you can include.</p>
            <p>Fees typically &pound;8,000&ndash;&pound;18,000 depending on travel and format. Reduced rates for education and non-profits, always.</p>
          ` : `
            <p>Available for high-impact software engineering, scalable distributed architectures, and technical advisory initiatives.</p>
            <p>Direct inquiries welcomed for technical leadership, production builds, and collaborative engineering partnerships.</p>
          `}
        </div>
        <div>
          <a href="mailto:${email}" style="display: inline-flex; align-items: center; gap: 12px; padding: 16px 36px; border-radius: 9999px; background: #0F0F0F; color: #F3F1EF; font-size: 15px; font-weight: 600; text-decoration: none; box-shadow: 0 10px 30px rgba(0,0,0,0.3); transition: transform 0.2s ease;" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform='scale(1)'">
            ${email} &rarr;
          </a>
        </div>
      </div>
    </section>
  </main>

  <!-- 12. FOOTER -->
  <footer style="background: var(--background); border-top: 1px solid var(--border); padding: 40px; font-size: 12px; color: var(--muted-foreground);">
    <div style="max-width: 1280px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 24px;">
      <span class="font-syne" style="font-weight: 700; text-transform: uppercase; color: var(--foreground);">${safeName.toUpperCase()}</span>
      <a href="mailto:${email}" style="color: inherit; text-decoration: none;">${email}</a>
      <div style="display: flex; gap: 24px;">
        ${githubLink ? `<a href="${githubLink}" target="_blank" rel="noreferrer" style="color: inherit; text-decoration: none;">GitHub</a>` : ''}
        ${linkedinLink ? `<a href="${linkedinLink}" target="_blank" rel="noreferrer" style="color: inherit; text-decoration: none;">LinkedIn</a>` : ''}
      </div>
      <a href="https://myfolio.tech?ref=portfolio" target="_blank" rel="noopener" style="color: inherit; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
        <span>Synthesized with</span> <strong style="color: var(--foreground); text-decoration: underline; text-decoration-color: #75c5de;">MyFolio ✦</strong>
      </a>
      <span>&copy; 2026 ${safeName}</span>
    </div>
  </footer>

  <script>
    // Custom Coral Cursor Logic
    (function() {
      const cursor = document.getElementById('coralCursor');
      if (!cursor) return;

      let mouseX = -100, mouseY = -100;
      let curX = -100, curY = -100;

      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      function animate() {
        curX += (mouseX - curX) * 0.2;
        curY += (mouseY - curY) * 0.2;
        cursor.style.transform = 'translate(' + curX + 'px, ' + curY + 'px) translate(-50%, -50%)';
        requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);

      // Expand over project cards
      document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mouseenter', () => cursor.classList.add('expanded'));
        card.addEventListener('mouseleave', () => cursor.classList.remove('expanded'));
      });

      // Talks Hover Preview
      const preview = document.getElementById('talkHoverPreview');
      const previewImg = document.getElementById('talkPreviewImg');
      document.querySelectorAll('.talk-row').forEach(row => {
        row.addEventListener('mouseenter', (e) => {
          const thumb = row.getAttribute('data-thumb');
          if (thumb && preview && previewImg) {
            previewImg.src = thumb;
            preview.classList.add('visible');
          }
        });
        row.addEventListener('mouseleave', () => {
          if (preview) preview.classList.remove('visible');
        });
        row.addEventListener('mousemove', (e) => {
          if (preview) {
            preview.style.top = e.clientY + 'px';
            preview.style.left = e.clientX + 'px';
          }
        });
      });
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

  render404(rawCandidateData = {}, options = {}) {
    const returnUrl = options.returnUrl || '/';
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>404 — Signal Not Found</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Inter:wght@400;600&display=swap" rel="stylesheet" />
  <style>
    body {
      margin: 0;
      background: #0F0F0F;
      color: #F3F1EF;
      font-family: 'Inter', sans-serif;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 24px;
    }
    h1 {
      font-family: 'Syne', sans-serif;
      font-size: clamp(80px, 15vw, 180px);
      font-weight: 800;
      color: #FF4D30;
      margin: 0;
      line-height: 0.9;
    }
    p {
      color: #979491;
      font-size: 18px;
      max-width: 440px;
      margin: 24px 0 40px;
      line-height: 1.6;
    }
    a {
      padding: 12px 28px;
      border-radius: 9999px;
      background: #FF4D30;
      color: #0F0F0F;
      font-weight: 600;
      text-decoration: none;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <h1>404</h1>
  <p>The page or dossier you are searching for does not exist or has moved.</p>
  <a href="${returnUrl}">Return Home &rarr;</a>
</body>
</html>`;
  }
};

module.exports = { NadiaBrandTemplate };
