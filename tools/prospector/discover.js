/**
 * Prospector - Discovery Engine
 * Uses Gemini 3.8 Flash to discover real businesses in any niche & location.
 */

require('dotenv').config();
const { callWithRetry } = require('./gemini-client');

async function discoverBusinesses({ niche = 'architects', city = 'Mumbai', limit = 5 }) {
  const prompt = `You are a B2B sales research assistant.
Find ${limit} real, existing companies or studios in the following category and location:
- Category / Niche: ${niche}
- Location: ${city}

For each company, provide:
1. Company Name
2. Known Website URL (or primary domain/social link if no site)
3. Estimated Team / Company Size or Style
4. Notable Projects or Specialization
5. Contact Email or Contact Page if publicly known (or empty string)

Return ONLY valid JSON array with no extra markdown formatting:
[
  {
    "name": "Studio Name",
    "website": "https://example.com",
    "category": "${niche}",
    "city": "${city}",
    "specialization": "Brief description of their work",
    "contactEmail": "info@example.com"
  }
]`;

  let text = (await callWithRetry(prompt)).trim();
  
  // Clean markdown backticks if present
  if (text.startsWith('```json')) {
    text = text.substring(7);
  }
  if (text.startsWith('```')) {
    text = text.substring(3);
  }
  if (text.endsWith('```')) {
    text = text.substring(0, text.length - 3);
  }

  return JSON.parse(text.trim());
}

module.exports = { discoverBusinesses };
