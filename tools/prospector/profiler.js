/**
 * Prospector - Profiling Engine
 * Inspects business websites for technical and design gaps.
 */

const axios = require('axios');

async function profileWebsite(business) {
  const profile = {
    ...business,
    hasWebsite: Boolean(business.website && business.website.startsWith('http')),
    isAlive: false,
    statusCode: null,
    emails: business.contactEmail ? [business.contactEmail] : [],
    phoneNumbers: [],
    techStack: [],
    detectedGaps: [],
    title: ''
  };

  if (!profile.hasWebsite) {
    profile.detectedGaps.push('NO_WEBSITE: Business has no modern website listed.');
    return profile;
  }

  try {
    const res = await axios.get(business.website, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      maxRedirects: 3
    });

    profile.isAlive = true;
    profile.statusCode = res.status;
    const html = res.data;

    if (typeof html === 'string') {
      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) profile.title = titleMatch[1].trim();

      // Extract emails
      const emailMatches = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      const cleanEmails = [...new Set(emailMatches)].filter(e => 
        !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.webp') && !e.includes('sentry')
      );
      if (cleanEmails.length > 0) {
        profile.emails = [...new Set([...profile.emails, ...cleanEmails])];
      }

      // Tech Stack Detection
      if (html.includes('wp-content')) profile.techStack.push('WordPress');
      if (html.includes('elementor')) profile.techStack.push('Elementor');
      if (html.includes('wix.com')) profile.techStack.push('Wix');
      if (html.includes('squarespace')) profile.techStack.push('Squarespace');
      if (html.includes('shopify')) profile.techStack.push('Shopify');
      if (html.includes('framer.com')) profile.techStack.push('Framer');
      if (html.includes('webflow.com')) profile.techStack.push('Webflow');

      // Gap Detection
      if (!html.includes('name="viewport"')) {
        profile.detectedGaps.push('POOR_MOBILE_SUPPORT: Missing standard mobile viewport tag.');
      }
      if (!html.includes('og:image')) {
        profile.detectedGaps.push('MISSING_SOCIAL_PREVIEWS: Missing OpenGraph social cards.');
      }
      if (profile.techStack.includes('WordPress') || profile.techStack.includes('Wix')) {
        profile.detectedGaps.push(`SLOW_TEMPLATE_BUILD: Built on ${profile.techStack.join(', ')} rather than modern 3D WebGL/Next-gen stacks.`);
      }
      if (!html.includes('booking') && !html.includes('calendly') && !html.includes('schedule')) {
        profile.detectedGaps.push('NO_DIRECT_BOOKING: No online scheduling or appointment workflow.');
      }
    }
  } catch (err) {
    profile.isAlive = false;
    profile.statusCode = err.response ? err.response.status : 'TIMEOUT_OR_BLOCKED';
    profile.detectedGaps.push('SITE_UNREACHABLE_OR_SLOW: Website timed out or returned an error.');
  }

  return profile;
}

module.exports = { profileWebsite };
