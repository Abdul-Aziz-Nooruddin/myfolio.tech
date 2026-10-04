const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');

const { TemplateRegistry } = require('../src/templates/template-registry');

async function captureTemplateHeroes() {
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  console.log('Using Chrome binary at:', chromePath);

  // Set up a temporary Express server on a safe dynamic port (e.g. 54321)
  const app = express();
  const PORT = 54321; // Never use 3000

  // Serve static assets from both public and web
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use(express.static(path.join(__dirname, '..', 'web')));

  const templates = [
    { 
      id: 'jack-3d-creator', 
      filename: 'jack-3d-creator-hero.webp', 
      fallbackJpg: 'jack-3d-creator-hero.jpg',
      profile: {
        name: 'Jack',
        role: 'Creative Developer & 3D Designer',
        bio: 'Crafting spatial web experiences with WebGL, Three.js, and physics.'
      },
      urlQuery: ''
    },
    { 
      id: 'nadia-brand', 
      filename: 'nadia-brand-hero.webp', 
      fallbackJpg: 'nadia-brand-hero.jpg',
      profile: {
        name: 'Nadia Okonjo',
        role: 'Keynote Speaker · Executive Advisor · Author',
        bio: 'I help large organisations make decisions faster without making them worse.'
      },
      urlQuery: ''
    },
    { 
      id: 'kage-temple', 
      filename: 'kage-temple-hero.webp', 
      fallbackJpg: 'kage-temple-hero.jpg',
      profile: {
        name: 'Kage Kyoto',
        role: 'Master Craftsman & Systems Technologist',
        bio: 'Kyoto mountain sanctuary with live Shinto Sanmon, vermilion blood moon, and zen koi.'
      },
      urlQuery: '?shot=0'
    },
    { 
      id: 'rbp-kinetic-monochrome', 
      filename: 'rbp-kinetic-monochrome-hero.webp', 
      fallbackJpg: 'rbp-kinetic-monochrome-hero.jpg',
      profile: {
        name: 'Josh',
        role: 'Design Engineer & Creative Technologist',
        bio: 'Designing and engineering focused software surfaces where ideas and code coexist cleanly.'
      },
      urlQuery: ''
    }
  ];

  // Render endpoints for each template
  app.get('/preview/:templateId', (req, res) => {
    const templateId = req.params.templateId;
    const config = templates.find(t => t.id === templateId) || {};
    const result = TemplateRegistry.render(templateId, config.profile || {}, { isStaticPreview: true });
    const html = typeof result === 'string' ? result : (result.html || '');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Preview server running on port ${PORT}`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: false, // Run with window context to ensure macOS Metal GPU WebGL acceleration
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1600,900',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--enable-gpu-rasterization',
      '--allow-file-access-from-files'
    ]
  });

  const targetDirs = [
    path.join(__dirname, '..', 'public', 'assets', 'templates'),
    path.join(__dirname, '..', 'web', 'assets', 'templates')
  ];

  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  for (const t of templates) {
    console.log(`Capturing hero section for template: ${t.id}...`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 2 });

    const url = `http://localhost:${PORT}/preview/${t.id}${t.urlQuery || ''}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 35000 });

    // Wait for fonts to be loaded
    await page.evaluateHandle('document.fonts.ready').catch(() => {});

    // Wait for all images in the page to complete loading
    await page.waitForFunction(() => {
      const imgs = Array.from(document.images);
      return imgs.every(img => img.complete);
    }, { timeout: 15000 }).catch(() => {});

    // For Kage, wait for WebGL procedural engine to finish boot and paint multiple frames
    if (t.id === 'kage-temple') {
      console.log('Waiting for Kage WebGL engine to finish procedural generation & paint frames...');
      await page.waitForFunction(() => window.__kage && window.__kage.renderer, { timeout: 30000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 6500));
    } else if (t.id === 'jack-3d-creator') {
      await new Promise((r) => setTimeout(r, 4500));
    } else {
      await new Promise((r) => setTimeout(r, 4000));
    }

    // Capture the top hero viewport
    for (const dir of targetDirs) {
      const webpPath = path.join(dir, t.filename);
      const jpgPath = path.join(dir, t.fallbackJpg);

      await page.screenshot({
        path: webpPath,
        type: 'webp',
        quality: 92,
        clip: { x: 0, y: 0, width: 1600, height: 900 }
      });

      await page.screenshot({
        path: jpgPath,
        type: 'jpeg',
        quality: 92,
        clip: { x: 0, y: 0, width: 1600, height: 900 }
      });

      console.log(`Saved ${t.id} hero capture to ${webpPath} & ${jpgPath}`);
    }

    await page.close();
  }

  await browser.close();
  server.close();
  console.log('Finished capturing all template hero preview images successfully!');
}

captureTemplateHeroes().catch((err) => {
  console.error('Error capturing template hero previews:', err);
  process.exit(1);
});
