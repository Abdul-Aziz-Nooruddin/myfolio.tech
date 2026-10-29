const assert = require('assert');
const { SeoMetadataSynthesizer } = require('../src/services/seo-metadata-synthesizer');

function testSeoMetadataSynthesizer() {
  console.log('▶ Testing SeoMetadataSynthesizer...');

  const sampleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Old Title</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>`;

  const candidateData = {
    name: 'Sarah Connor',
    title: 'Staff AI Security Engineer',
    bio: 'Pioneering cybernetic defense systems and neural network integrity protocols.',
    subdomain: 'sarah-connor',
    github: 'sarahconnor',
    skills: ['Cybersecurity', 'Python', 'Three.js', 'Distributed Systems'],
    projects: [
      { title: 'Neural Shield', description: 'Zero-trust agent framework', liveUrl: 'https://github.com/neural-shield' }
    ]
  };

  const enriched = SeoMetadataSynthesizer.inject(sampleHtml, candidateData, {
    siteId: 'site_12345',
    subdomain: 'sarah-connor'
  });

  // 1. Must contain canonical URL pointing to subdomain
  assert(enriched.includes('<link rel="canonical" href="https://sarah-connor.myfolio.tech">'), 'Must contain subdomain canonical URL');

  // 2. Must contain Open Graph tags
  assert(enriched.includes('<meta property="og:title" content="Sarah Connor — Staff AI Security Engineer">'), 'Must contain og:title');
  assert(enriched.includes('<meta property="og:type" content="profile">'), 'Must contain og:type profile');

  // 3. Must contain Twitter Card tags
  assert(enriched.includes('<meta name="twitter:card" content="summary_large_image">'), 'Must contain twitter:card');
  assert(enriched.includes('<meta name="twitter:title" content="Sarah Connor — Staff AI Security Engineer">'), 'Must contain twitter:title');

  // 4. Must contain AI / GEO search link
  assert(enriched.includes('<link rel="help" href="https://www.myfolio.tech/llms.txt"'), 'Must contain llms.txt link');

  // 5. Must contain valid JSON-LD
  assert(enriched.includes('<script type="application/ld+json">'), 'Must contain JSON-LD script block');
  const jsonLdMatch = enriched.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert(jsonLdMatch, 'JSON-LD block must match');
  const parsed = JSON.parse(jsonLdMatch[1].trim());
  assert.strictEqual(parsed['@type'], 'ProfilePage', 'Schema @type must be ProfilePage');
  assert.strictEqual(parsed.mainEntity['@type'], 'Person', 'mainEntity @type must be Person');
  assert.strictEqual(parsed.mainEntity.name, 'Sarah Connor', 'Person name must match');
  assert.strictEqual(parsed.mainEntity.jobTitle, 'Staff AI Security Engineer', 'Person jobTitle must match');
  assert(parsed.mainEntity.sameAs.includes('https://github.com/sarahconnor'), 'sameAs must include GitHub link');
  assert(parsed.mainEntity.knowsAbout.includes('Cybersecurity'), 'knowsAbout must include skills');
  assert.strictEqual(parsed.hasPart[0].name, 'Neural Shield', 'hasPart must include projects');

  // 6. Test idempotent execution (no duplication if run twice)
  const twice = SeoMetadataSynthesizer.inject(enriched, candidateData);
  const jsonLdCount = (twice.match(/<script type="application\/ld\+json">/g) || []).length;
  assert.strictEqual(jsonLdCount, 1, 'Should never duplicate JSON-LD block');

  console.log('✔ SeoMetadataSynthesizer passed all tests successfully!\n');
}

testSeoMetadataSynthesizer();
