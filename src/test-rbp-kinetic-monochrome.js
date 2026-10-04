/**
 * Test Suite: RBP Kinetic Monochrome Template & Gender / Avatar Resolution
 */

const assert = require('assert');
const { test, describe } = require('node:test');
const { TemplateRegistry } = require('./templates/template-registry');
const { TemplateHelper } = require('./templates/template-helper');

describe('🎨 RBP Kinetic Monochrome Template & Gender/Avatar Intelligence', () => {
  const maleCandidate = {
    name: 'Josh Miller',
    role: 'Design Engineer & Creative Coder',
    bio: 'He builds focused digital products, WebGL shaders, and design systems.',
    email: 'josh@example.com',
    skills: ['TypeScript', 'WebGL', 'React', 'Tailwind CSS'],
    projects: [
      { name: 'Loom AI Surface', desc: 'Focused writing surface without chat clutter.', tech: 'TypeScript • WebGL' }
    ],
    experience: [
      { role: 'Senior Design Engineer', company: 'Linear', period: '2024 – Present' }
    ]
  };

  const femaleCandidate = {
    name: 'Maya Lin',
    role: 'Product Designer & Frontend Engineer',
    bio: 'She crafts calm, focused interfaces and accessible design systems.',
    email: 'maya@example.com',
    skills: ['Figma', 'React', 'Next.js', 'CSS Architecture'],
    projects: [
      { name: 'Calm Analytics', desc: 'Digest transforming raw product metrics into clear narratives.', tech: 'Next.js • Tailwind' }
    ],
    experience: [
      { role: 'Lead Product Designer', company: 'Stripe', period: '2023 – Present' }
    ]
  };

  test('1. TemplateRegistry discovers and lists RBP Kinetic Monochrome', () => {
    const templates = TemplateRegistry.getAllTemplates();
    const rbp = templates.find(t => t.id === 'rbp-kinetic-monochrome');
    assert.ok(rbp, 'Template rbp-kinetic-monochrome must be registered');
    assert.strictEqual(rbp.id, 'rbp-kinetic-monochrome');

    // Aliases
    assert.strictEqual(TemplateRegistry.getTemplate('rbp-portfolio').id, 'rbp-kinetic-monochrome');
    assert.strictEqual(TemplateRegistry.getTemplate('kinetic-monochrome').id, 'rbp-kinetic-monochrome');
    assert.ok(TemplateRegistry.studioTemplateIds.includes('rbp-kinetic-monochrome'), 'Must be in Web Studio templates');
  });

  test('2. Dynamic Content Replacement & Shaders Integration', () => {
    const res = TemplateRegistry.render('rbp-kinetic-monochrome', maleCandidate);
    assert.ok(res.html.includes('Josh'), 'Must include candidate name');
    assert.ok(res.html.includes('Loom AI Surface'), 'Must include project title');
    assert.ok(res.html.includes('josh@example.com'), 'Must include candidate email');
    assert.ok(res.html.includes('flow-shader-canvas'), 'Must include WebGL Flow Shader canvas');
    assert.ok(res.html.includes('portrait-morph-canvas'), 'Must include WebGL Morphing Portrait canvas');
    assert.ok(res.html.includes('physics-canvas'), 'Must include Physics stack canvas');
    assert.ok(res.html.includes('contact-shader-canvas'), 'Must include Contact card shader canvas');
  });

  test('3. Gender & Avatar Resolution: Female Candidate gets Maya 3D Character', () => {
    // Explicit female gender
    const resExplicit = TemplateRegistry.render('rbp-kinetic-monochrome', { ...femaleCandidate, gender: 'female' });
    assert.ok(resExplicit.html.includes('maya.webp'), 'Female candidate must receive maya.webp portrait');
    assert.ok(resExplicit.html.includes('maya_wave.webp'), 'Female candidate must receive maya_wave.webp portrait');

    // Inferred female by pronouns and first name
    const resInferred = TemplateRegistry.render('rbp-kinetic-monochrome', femaleCandidate);
    assert.ok(resInferred.html.includes('maya.webp'), 'Inferred female candidate must receive maya.webp portrait');
  });

  test('4. Gender & Avatar Resolution: Male Candidate gets Josh 3D Character', () => {
    // Explicit male gender
    const resExplicit = TemplateRegistry.render('rbp-kinetic-monochrome', { ...maleCandidate, gender: 'male' });
    assert.ok(resExplicit.html.includes('josh.webp'), 'Male candidate must receive josh.webp portrait');
    assert.ok(resExplicit.html.includes('josh_wave.webp'), 'Male candidate must receive josh_wave.webp portrait');

    // Inferred male by pronouns and first name
    const resInferred = TemplateRegistry.render('rbp-kinetic-monochrome', maleCandidate);
    assert.ok(resInferred.html.includes('josh.webp'), 'Inferred male candidate must receive josh.webp portrait');
  });

  test('5. TemplateHelper.inferGender linguistic heuristics', () => {
    assert.strictEqual(TemplateHelper.inferGender('Sarah Connor', 'Software Engineer'), 'female');
    assert.strictEqual(TemplateHelper.inferGender('Elena Rostova', 'Full Stack Developer'), 'female');
    assert.strictEqual(TemplateHelper.inferGender('Priya Sharma', 'Backend Engineer'), 'female');
    assert.strictEqual(TemplateHelper.inferGender('Engineer', 'She is passionate about distributed systems.'), 'female');
    assert.strictEqual(TemplateHelper.inferGender('David Miller', 'Systems Architect'), 'male');
    assert.strictEqual(TemplateHelper.inferGender('Engineer', 'He specializes in Linux kernel optimization.'), 'male');
  });

  test('6. Custom Avatar / Photo Override support', () => {
    const photoCandidate = {
      name: 'Taylor Swift',
      avatar: 'https://images.example.com/taylor.jpg'
    };
    const res = TemplateRegistry.render('rbp-kinetic-monochrome', photoCandidate, { preferRealPhoto: true });
    assert.ok(res.html.includes('https://images.example.com/taylor.jpg'), 'Real photo must be supported');
  });

  test('7. Clean 404 Route decoupled from main page', () => {
    const page404 = TemplateRegistry.render404Page('my-site', femaleCandidate, 'rbp-kinetic-monochrome');
    assert.ok(page404.includes('404'), 'Must contain 404');
    assert.ok(page404.includes('Return to Base'), 'Must contain Return to Base');
    assert.ok(page404.includes('/p/my-site'), 'Must contain return link to site');
  });

  test('8. Kinetic Structure Shift (StringTune scroll lerp) section is fully rendered', () => {
    const res = TemplateRegistry.render('rbp-kinetic-monochrome', maleCandidate);
    assert.ok(res.html.includes('id="structure-shift"'), 'Must contain structure-shift section');
    assert.ok(res.html.includes('id="lerp-figure"'), 'Must contain lerp-figure element');
    assert.ok(res.html.includes('string="lerp[]"'), 'Must contain StringTune lerp attribute');
    assert.ok(res.html.includes('lerp_structure.webp'), 'Must render lerp_structure image asset');
    assert.ok(res.html.includes('string-tune@1.2.1'), 'Must include StringTune CDN script');
    assert.ok(res.html.includes('--lerp'), 'Must contain --lerp CSS custom property declaration');
  });
});
