/**
 * SEO & GEO Metadata Synthesizer
 * 
 * Injects Google Rich Result schemas (ProfilePage, Person, CreativeWork),
 * OpenGraph, Twitter Cards, canonical links, and AI search (GEO / llms.txt)
 * into all generated candidate portfolios on MyFolio.
 */

const { TemplateHelper } = require('../templates/template-helper');

class SeoMetadataSynthesizer {
  /**
   * Synthesize and inject SEO & GEO metadata into HTML
   * @param {string} html - Raw rendered portfolio HTML
   * @param {object} data - Normalized candidate profile data
   * @param {object} options - Options including siteId, subdomain, baseUrl
   * @returns {string} HTML with injected SEO/GEO tags
   */
  static inject(html, data = {}, options = {}) {
    if (!html || typeof html !== 'string') return html;

    const name = data.name || 'Developer Portfolio';
    const title = data.title || data.headline || 'Software Engineer';
    const bio = data.bio || data.summary || `${name} — ${title}. Interactive 3D portfolio powered by MyFolio.`;
    
    // Clean string values
    const safeName = TemplateHelper.escapeHtml(name);
    const safeTitle = TemplateHelper.escapeHtml(title);
    const safeBio = TemplateHelper.escapeHtml(bio.replace(/[\r\n]+/g, ' ').substring(0, 200).trim());
    
    // Canonical URL
    const subdomain = options.subdomain || data.subdomain || '';
    const siteId = options.siteId || data.siteId || data.id || '';
    let canonicalUrl = 'https://www.myfolio.tech';
    if (subdomain) {
      canonicalUrl = `https://${subdomain}.myfolio.tech`;
    } else if (siteId) {
      canonicalUrl = `https://www.myfolio.tech/p/${encodeURIComponent(siteId)}`;
    }

    // Social image (candidate photo, or default 3D emblem)
    const ogImage = data.photoUrl || data.avatarUrl || data.avatar || 'https://www.myfolio.tech/assets/og/og-default.jpg';

    // Skills for knowsAbout schema
    const skills = Array.isArray(data.skills) 
      ? data.skills.map(s => typeof s === 'string' ? s : s.name).filter(Boolean).slice(0, 15)
      : [];

    // Social URLs for sameAs schema
    const sameAsUrls = [];
    if (data.github) sameAsUrls.push(data.github.startsWith('http') ? data.github : `https://github.com/${data.github}`);
    if (data.linkedin) sameAsUrls.push(data.linkedin.startsWith('http') ? data.linkedin : `https://linkedin.com/in/${data.linkedin}`);
    if (data.twitter) sameAsUrls.push(data.twitter.startsWith('http') ? data.twitter : `https://x.com/${data.twitter}`);
    if (data.website && !sameAsUrls.includes(data.website)) sameAsUrls.push(data.website);

    // Build Schema.org JSON-LD
    const jsonLdPayload = {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "mainEntity": {
        "@type": "Person",
        "name": name,
        "jobTitle": title,
        "description": bio.substring(0, 300).trim(),
        "url": canonicalUrl,
        "image": ogImage
      }
    };

    if (sameAsUrls.length > 0) {
      jsonLdPayload.mainEntity.sameAs = sameAsUrls;
    }

    if (skills.length > 0) {
      jsonLdPayload.mainEntity.knowsAbout = skills;
    }

    // Add projects as CreativeWork if available
    if (Array.isArray(data.projects) && data.projects.length > 0) {
      jsonLdPayload.mainEntity.hasOccupation = {
        "@type": "Occupation",
        "name": title
      };
      jsonLdPayload.hasPart = data.projects.slice(0, 6).map(p => ({
        "@type": "CreativeWork",
        "name": p.title || p.name || 'Project',
        "description": (p.description || p.summary || '').substring(0, 150),
        "url": p.liveUrl || p.repoUrl || p.url || canonicalUrl
      }));
    }

    const jsonLdString = JSON.stringify(jsonLdPayload, null, 2);

    // Build meta tags snippet
    const seoTags = `
  <!-- MyFolio Canonical & Social Meta -->
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="help" href="https://www.myfolio.tech/llms.txt" type="text/plain" title="LLM Knowledge File">

  <!-- Open Graph -->
  <meta property="og:type" content="profile">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${safeName} — ${safeTitle}">
  <meta property="og:description" content="${safeBio}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:site_name" content="MyFolio">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeName} — ${safeTitle}">
  <meta name="twitter:description" content="${safeBio}">
  <meta name="twitter:image" content="${ogImage}">

  <!-- Schema.org JSON-LD (Search Engines & AI Crawlers) -->
  <script type="application/ld+json">
${jsonLdString}
  </script>`;

    // Only inject if </head> exists and tags aren't already duplicated
    if (html.includes('</head>')) {
      // If canonical or JSON-LD is already in template, avoid duplicate schema
      if (!html.includes('application/ld+json')) {
        return html.replace('</head>', `${seoTags}\n</head>`);
      } else if (!html.includes('og:title')) {
        // Just inject OG, Twitter & canonical
        const fallbackTags = `
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:title" content="${safeName} — ${safeTitle}">
  <meta property="og:description" content="${safeBio}">
  <meta property="og:image" content="${ogImage}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeName} — ${safeTitle}">
  <meta name="twitter:description" content="${safeBio}">
  <meta name="twitter:image" content="${ogImage}">`;
        return html.replace('</head>', `${fallbackTags}\n</head>`);
      }
    }

    return html;
  }
}

module.exports = { SeoMetadataSynthesizer };
