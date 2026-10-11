const test = require('node:test');
const assert = require('node:assert/strict');
const { TemplateRegistry } = require('./templates/template-registry');
const { SiteGenerator } = require('./services/site-generator');
const { StaticExporter } = require('./export/static-exporter');

test('🎨 Tom 2D Cel Animation Template & Scrollytelling Engine', async (t) => {
  await t.test('1. TemplateRegistry discovers and lists Tom 2D Cel Animation', () => {
    const template = TemplateRegistry.getTemplate('tom-cel-animator');
    assert.ok(template, 'Tom template must be registered');
    assert.equal(template.id, 'tom-cel-animator');
    assert.equal(template.name, 'Tom 2D Cel Animation');
    assert.ok(template.thumbnail.includes('tom-cel-animator-hero.webp'));

    // Check aliases
    assert.equal(TemplateRegistry.getTemplate('tom').id, 'tom-cel-animator');
    assert.equal(TemplateRegistry.getTemplate('tom-animation').id, 'tom-cel-animator');

    // Check studio templates
    const studioTemplates = TemplateRegistry.getStudioTemplates();
    const found = studioTemplates.find(s => s.id === 'tom-cel-animator');
    assert.ok(found, 'Tom template must be listed in studio templates');
    assert.equal(found.name, 'Tom 2D Cel Animation');
  });

  await t.test('2. Dynamic Content Replacement & Candidate Data Binding', () => {
    const template = TemplateRegistry.getTemplate('tom-cel-animator');
    const candidateData = {
      name: 'Maya Lin',
      role: 'Lead Character Animator & Visual Storyteller',
      bio: 'Crafting expressive keyframe animations, kinetic slapstick timing, and hand-drawn feature cinematography.',
      email: 'maya.lin@example.com',
      location: 'Tokyo & Remote',
      projects: [
        {
          title: 'The Cat & Mouse Chronicles',
          description: 'A 6-minute slapstick theatrical chase animated at 24fps with hand-drawn cel FX.',
          tags: ['24fps Cel', 'Clean-Up Inking', 'Squash & Stretch'],
          link: 'https://github.com/maya-lin/cat-mouse'
        },
        {
          title: 'Sunday Morning Cartoon Special',
          description: 'Episodic pilot broadcast short featuring frantic alley chase scenes and expressive acting.',
          tags: ['Character Design', 'Storyboarding', 'Cel Animation'],
          link: 'https://github.com/maya-lin/sunday-special'
        }
      ]
    };

    const rendered = template.render(candidateData);
    assert.ok(typeof rendered === 'string' && rendered.length > 5000);

    // Verify candidate information is dynamically bound
    assert.ok(rendered.includes('Maya Lin'), 'Must contain candidate name');
    assert.ok(rendered.includes('Lead Character Animator'), 'Must contain candidate role');
    assert.ok(rendered.includes('Crafting expressive keyframe animations'), 'Must contain candidate bio');
    assert.ok(rendered.includes('Tokyo &amp; Remote') || rendered.includes('Tokyo'), 'Must contain candidate location');
    assert.ok(rendered.includes('maya.lin@example.com'), 'Must contain candidate email');

    // Verify candidate projects are dynamically bound into comic bento cards
    assert.ok(rendered.includes('The Cat &amp; Mouse Chronicles') || rendered.includes('Cat &amp; Mouse'), 'Must contain project 1 title');
    assert.ok(rendered.includes('A 6-minute slapstick theatrical chase'), 'Must contain project 1 desc');
    assert.ok(rendered.includes('Sunday Morning Cartoon Special'), 'Must contain project 2 title');

    // Verify local assets are referenced
    assert.ok(rendered.includes('/assets/templates/tom/frames/'), 'Must reference local animation frames');
  });

  await t.test('3. Universal Template Selection via Candidate Role', () => {
    const animProfile = { name: 'Alex', role: '2D Cel Animator & Storyboard Artist' };
    const selected = TemplateRegistry.selectTemplate(null, animProfile);
    assert.equal(selected.id, 'tom-cel-animator', 'Should select Tom for animation roles');

    const comicProfile = { name: 'Sam', role: 'Comic Illustrator & Cartoonist' };
    const selectedComic = TemplateRegistry.selectTemplate(null, comicProfile);
    assert.equal(selectedComic.id, 'tom-cel-animator', 'Should select Tom for comic/cartoonist roles');
  });

  await t.test('4. Dedicated Decoupled 404 Error Route', () => {
    const template = TemplateRegistry.getTemplate('tom-cel-animator');
    const html404 = template.render404Page('my-animation-portfolio');

    assert.ok(html404.includes('404'), 'Must have 404 code');
    assert.ok(html404.includes('PRESS STOPPED'), 'Must have themed headline');
    assert.ok(html404.includes('my-animation-portfolio'), 'Must reference site identifier');
    assert.ok(!html404.includes('hero-sequence-fallback'), 'Must NOT bleed main single-page scroll layout');
  });

  await t.test('5. Watermark Enforcement & Static Export Sanitization', () => {
    const template = TemplateRegistry.getTemplate('tom-cel-animator');
    const rendered = template.render({ name: 'Jordan Test' });

    // Inject watermark
    const siteGen = new SiteGenerator();
    const watermarked = siteGen.injectPreviewWatermark(rendered, false, 'tom-cel-animator');

    assert.ok(watermarked.includes('id="preview-watermark-overlay"'), 'Must have watermark overlay');
    assert.ok(watermarked.includes('MYFOLIO • TEMPLATE'), 'Must have watermark branding');

    // Verify unwatermarking on paid export
    const sanitized = StaticExporter.sanitizeHtmlForExport(watermarked);
    assert.ok(!sanitized.includes('id="preview-watermark-overlay"'), 'Watermark must be removed on export');
    assert.ok(!sanitized.includes('preview-watermark-svg'), 'Watermark SVG must be removed on export');
  });

  await t.test('6. Lenis Smooth Inertia Scroll & Scrollytelling Integration', async () => {
    // 1. TemplateRegistry render incorporates Lenis and official CSS
    const res = TemplateRegistry.render('tom-cel-animator', { name: 'Alex Animator' });
    assert.ok(res.html.includes('lenis@1.1.18/dist/lenis.min.js'), 'Must load Lenis from CDN');
    assert.ok(res.html.includes('lenis@1.1.18/dist/lenis.css'), 'Must load official Lenis stylesheet');
    assert.ok(res.html.includes('html.lenis'), 'Must include Lenis CSS layout baseline');
    assert.ok(res.html.includes('window.__folioLenis'), 'Must orchestrate window.__folioLenis instance');
    assert.ok(res.html.includes('lenis.on(\'scroll\''), 'Must bind Lenis scroll listeners');
    assert.ok(res.html.includes('lenis.scrollTo'), 'Must include smooth anchor link scrollTo navigation');

    // 2. SiteGenerator generates full portfolio with Lenis engine
    const siteGen = new SiteGenerator();
    const site = await siteGen.generateSite({ id: 'test-lenis-site' }, {
      name: 'Maya Lin',
      role: 'Character Animator',
      skills: ['Animation', 'Cel Inking']
    }, { templateId: 'tom-cel-animator' });

    assert.ok(site.html.includes('lenis.min.js'), 'Generated site HTML must include Lenis');
    assert.ok(site.html.includes('universal-scroll-motion-engine'), 'Generated site must include motion engine');
  });
});

