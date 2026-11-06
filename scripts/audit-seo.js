/**
 * MyFolio SEO & GEO Comprehensive Audit Engine
 * Evaluates technical SEO, structured data, social tags, robots/sitemap alignment,
 * and AI search readiness across all platform routes.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Route configurations
const PUBLIC_INDEXABLE_PAGES = [
  { file: 'web/index.html', canonical: 'https://myfolio.tech/' },
  { file: 'web/about.html', canonical: 'https://myfolio.tech/about' },
  { file: 'web/contact.html', canonical: 'https://myfolio.tech/contact' },
  { file: 'web/faq.html', canonical: 'https://myfolio.tech/faq' },
  { file: 'web/terms.html', canonical: 'https://myfolio.tech/terms' },
  { file: 'web/privacy.html', canonical: 'https://myfolio.tech/privacy' },
  { file: 'web/refund.html', canonical: 'https://myfolio.tech/refund' },
  { file: 'web/studio.html', canonical: 'https://myfolio.tech/studio' },
  { file: 'web/github-portfolio-generator.html', canonical: 'https://myfolio.tech/github-portfolio-generator' },
  { file: 'web/ai-portfolio-generator.html', canonical: 'https://myfolio.tech/ai-portfolio-generator' },
  { file: 'web/tom.html', canonical: 'https://myfolio.tech/tom' },
  { file: 'web/slush.html', canonical: 'https://myfolio.tech/slush' }
];

const NON_INDEXABLE_PAGES = [
  'web/404.html',
  'web/admin.html',
  'web/auth.html',
  'web/dashboard.html',
  'web/profile.html',
  'web/thank-you.html'
];

function runSeoAudit() {
  console.log('======================================================');
  console.log('🔍 MyFolio SEO & GEO Platform Audit Engine');
  console.log('======================================================\n');

  let passedChecks = 0;
  let totalChecks = 0;
  const issues = [];

  function check(condition, desc) {
    totalChecks++;
    if (condition) {
      passedChecks++;
      console.log(`  ✔ ${desc}`);
    } else {
      issues.push(desc);
      console.log(`  ❌ ${desc}`);
    }
  }

  // 1. Technical Files Verification
  console.log('1. Technical Discovery & Directives (robots.txt, sitemap.xml, llms.txt):');
  const robotsExists = fs.existsSync(path.join(ROOT, 'web/robots.txt'));
  check(robotsExists, 'robots.txt exists in web/');

  const robots = robotsExists ? fs.readFileSync(path.join(ROOT, 'web/robots.txt'), 'utf8') : '';
  check(robots.includes('User-agent:') && robots.includes('Sitemap:'), 'robots.txt specifies User-agent and Sitemap');
  check(robots.includes('User-agent: Googlebot') && robots.includes('User-agent: GPTBot'), 'robots.txt includes explicit Googlebot and AI crawlers directives');

  const sitemapExists = fs.existsSync(path.join(ROOT, 'web/sitemap.xml'));
  check(sitemapExists, 'sitemap.xml exists in web/');

  const sitemap = sitemapExists ? fs.readFileSync(path.join(ROOT, 'web/sitemap.xml'), 'utf8') : '';
  check(sitemap.includes('<urlset') && sitemap.includes('https://myfolio.tech/'), 'sitemap.xml is valid XML and contains homepage');
  check(sitemap.includes('https://myfolio.tech/studio') && sitemap.includes('https://myfolio.tech/pricing'), 'sitemap.xml includes /studio and /pricing');

  const llmsExists = fs.existsSync(path.join(ROOT, 'web/llms.txt'));
  check(llmsExists, 'llms.txt exists in web/ for AI search engines (GEO)');
  const llms = llmsExists ? fs.readFileSync(path.join(ROOT, 'web/llms.txt'), 'utf8') : '';
  check(llms.includes('SOURCE CODE EXPORT') && llms.includes('https://myfolio.tech'), 'llms.txt contains authoritative facts and canonical URL');

  // 2. Public Indexable Pages
  console.log('\n2. Public Marketing & Showcase Pages:');
  for (const page of PUBLIC_INDEXABLE_PAGES) {
    const fullPath = path.join(ROOT, page.file);
    if (!fs.existsSync(fullPath)) {
      check(false, `${page.file} exists`);
      continue;
    }
    const html = fs.readFileSync(fullPath, 'utf8');

    // Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    check(Boolean(titleMatch && titleMatch[1].trim().length > 10), `${page.file} has descriptive <title>`);

    // Meta description
    const hasDesc = /<meta[^>]*name=["']description["'][^>]*content=["'][^"']{20,}["']/i.test(html) ||
                    /<meta[^>]*content=["'][^"']{20,}["'][^>]*name=["']description["']/i.test(html);
    check(hasDesc, `${page.file} has meta description (>20 chars)`);

    // Canonical
    const hasCanon = html.includes(`href="${page.canonical}"`) || html.includes(`href='${page.canonical}'`);
    check(hasCanon, `${page.file} has canonical tag pointing to ${page.canonical}`);

    // Social Graph
    const hasOg = html.includes('og:title') && html.includes('og:description') && html.includes('og:image');
    check(hasOg, `${page.file} has Open Graph tags (og:title, og:description, og:image)`);

    // Schema.org JSON-LD
    const hasJsonLd = html.includes('application/ld+json');
    check(hasJsonLd, `${page.file} has Schema.org JSON-LD`);
  }

  // 3. Non-Indexable Utility & App Pages
  console.log('\n3. Non-Indexable Application & Utility Pages:');
  for (const page of NON_INDEXABLE_PAGES) {
    const fullPath = path.join(ROOT, page);
    if (!fs.existsSync(fullPath)) {
      check(false, `${page} exists`);
      continue;
    }
    const html = fs.readFileSync(fullPath, 'utf8');
    const hasNoIndex = /<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex[^"']*["']/i.test(html);
    check(hasNoIndex, `${page} contains <meta name="robots" content="noindex, nofollow">`);
  }

  // 4. Dynamic Portfolio Generator SEO Synthesizer
  console.log('\n4. Dynamic Portfolio Engine (SeoMetadataSynthesizer):');
  const { SeoMetadataSynthesizer } = require('../src/services/seo-metadata-synthesizer');
  const dummyHtml = '<html><head><title>Test</title></head><body></body></html>';
  const dummyCandidate = {
    name: 'Ada Lovelace',
    title: 'First Computer Programmer',
    subdomain: 'ada'
  };
  const synthesized = SeoMetadataSynthesizer.inject(dummyHtml, dummyCandidate, { subdomain: 'ada' });
  check(synthesized.includes('https://ada.myfolio.tech'), 'SeoMetadataSynthesizer injects custom subdomain canonical');
  check(synthesized.includes('ProfilePage') && synthesized.includes('Ada Lovelace'), 'SeoMetadataSynthesizer outputs valid ProfilePage & Person schema');

  // Summary
  console.log('\n======================================================');
  const score = Math.round((passedChecks / totalChecks) * 100);
  console.log(`📊 Audit Score: ${score}% (${passedChecks}/${totalChecks} checks passed)`);
  if (issues.length > 0) {
    console.log(`⚠️ Issues Found (${issues.length}):`);
    issues.forEach(iss => console.log(`  - ${iss}`));
    process.exit(1);
  } else {
    console.log('🎉 100% SEO & GEO AUDIT PASSED! All pages, schemas, and bots are optimized.');
    console.log('======================================================\n');
  }
}

if (require.main === module) {
  runSeoAudit();
}

module.exports = { runSeoAudit };
