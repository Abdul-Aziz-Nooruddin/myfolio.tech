/**
 * IndexNow Instant Search Engine Indexing Submitter
 * Submits all canonical URLs to the IndexNow API (Bing, Yandex, Naver, Seznam)
 */
const https = require('https');

const KEY = '8d7f2a1b9c4e6f3a0d5c8b2e1f4a7c9e';
const HOST = 'myfolio.tech';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const URLS = [
  'https://myfolio.tech/',
  'https://myfolio.tech/portfolio-generator',
  'https://myfolio.tech/portfolio-maker',
  'https://myfolio.tech/developer-portfolio',
  'https://myfolio.tech/portfolio-templates',
  'https://myfolio.tech/studio',
  'https://myfolio.tech/github-portfolio-generator',
  'https://myfolio.tech/ai-portfolio-generator',
  'https://myfolio.tech/pricing',
  'https://myfolio.tech/rbp',
  'https://myfolio.tech/jack-3d',
  'https://myfolio.tech/nadia',
  'https://myfolio.tech/kage',
  'https://myfolio.tech/tom',
  'https://myfolio.tech/slush',
  'https://myfolio.tech/apogee',
  'https://myfolio.tech/about',
  'https://myfolio.tech/contact',
  'https://myfolio.tech/faq',
  'https://myfolio.tech/terms',
  'https://myfolio.tech/privacy',
  'https://myfolio.tech/refund',
  'https://myfolio.tech/compare',
  'https://myfolio.tech/vs-wix',
  'https://myfolio.tech/vs-squarespace',
  'https://myfolio.tech/vs-wordpress',
  'https://myfolio.tech/vs-webflow',
  'https://myfolio.tech/vs-framer',
  'https://myfolio.tech/vs-github-pages'
];

const payload = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: URLS
});

const options = {
  hostname: 'api.indexnow.org',
  port: 443,
  path: '/indexnow',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload)
  }
};

console.log(`📡 Submitting ${URLS.length} URLs to IndexNow (api.indexnow.org)...`);

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 202) {
      console.log(`✅ IndexNow Submission Successful! (HTTP ${res.statusCode})`);
      console.log(`Search engines (Bing, Yandex, Seznam) notified for instant crawl.`);
    } else {
      console.log(`⚠️ IndexNow response status: ${res.statusCode}`, body);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ IndexNow request failed:', err.message);
});

req.write(payload);
req.end();

