const puppeteer = require('puppeteer');

async function runAudit(targetUrl) {
  console.log(`\n======================================================`);
  console.log(`🚀 Running In-Depth Performance Audit: ${targetUrl}`);
  console.log(`======================================================\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  
  // Emulate standard mobile device (Moto G Power / Pixel 5 style) for mobile audit
  await page.setUserAgent('Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36');
  await page.setViewport({ width: 393, height: 851, isMobile: true, hasTouch: true });

  const client = await page.target().createCDPSession();
  await client.send('Performance.enable');

  const networkRequests = [];
  page.on('request', req => {
    networkRequests.push({
      url: req.url(),
      resourceType: req.resourceType()
    });
  });

  const responseSizes = [];
  page.on('response', async res => {
    try {
      const headers = res.headers();
      const length = headers['content-length'] ? parseInt(headers['content-length'], 10) : 0;
      responseSizes.push({
        url: res.url(),
        status: res.status(),
        size: length,
        type: headers['content-type'] || ''
      });
    } catch (e) {}
  });

  const startTime = Date.now();
  await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 45000 }).catch(e => {
    console.warn('Navigation warning:', e.message);
  });
  const loadDuration = Date.now() - startTime;

  // Wait 2.5s for dynamic renders / scripts / animations to settle
  await new Promise(r => setTimeout(r, 2500));

  // Extract Core Web Vitals
  const webVitals = await page.evaluate(() => {
    return new Promise(resolve => {
      let fcp = 0;
      let lcp = 0;
      let cls = 0;
      let tbt = 0;
      let longTasks = [];

      const paintEntries = performance.getEntriesByType('paint');
      for (const entry of paintEntries) {
        if (entry.name === 'first-contentful-paint') {
          fcp = entry.startTime;
        }
      }

      // Observer for LCP
      try {
        const poLcp = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) lcp = lastEntry.startTime;
        });
        poLcp.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {}

      // Observer for CLS
      try {
        const poCls = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) {
              cls += entry.value;
            }
          }
        });
        poCls.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {}

      // Observer for Long Tasks (TBT)
      try {
        const poLong = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            const blockingDuration = entry.duration - 50;
            if (blockingDuration > 0) {
              tbt += blockingDuration;
              longTasks.push({
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name
              });
            }
          }
        });
        poLong.observe({ type: 'longtask', buffered: true });
      } catch (e) {}

      // Navigation Timing
      const nav = performance.getEntriesByType('navigation')[0] || {};
      const ttfb = nav.responseStart || 0;
      const domContentLoaded = nav.domContentLoadedEventEnd || 0;
      const completeLoad = nav.loadEventEnd || 0;

      setTimeout(() => {
        resolve({
          fcp: Math.round(fcp),
          lcp: Math.round(lcp || fcp),
          cls: parseFloat(cls.toFixed(4)),
          tbt: Math.round(tbt),
          longTaskCount: longTasks.length,
          ttfb: Math.round(ttfb),
          domContentLoaded: Math.round(domContentLoaded),
          completeLoad: Math.round(completeLoad)
        });
      }, 500);
    });
  });

  // Extract CDP Low-Level Metrics
  const cdpMetrics = await client.send('Performance.getMetrics');
  const metricMap = {};
  for (const m of cdpMetrics.metrics) {
    metricMap[m.name] = m.value;
  }

  console.log(`📊 CORE WEB VITALS (Mobile Emulation):`);
  console.log(`  • First Contentful Paint (FCP):  ${webVitals.fcp} ms ${webVitals.fcp < 1800 ? '🟢 (Good)' : webVitals.fcp < 3000 ? '🟡 (Needs Improvement)' : '🔴 (Poor)'}`);
  console.log(`  • Largest Contentful Paint (LCP):  ${webVitals.lcp} ms ${webVitals.lcp < 2500 ? '🟢 (Good)' : webVitals.lcp < 4000 ? '🟡 (Needs Improvement)' : '🔴 (Poor)'}`);
  console.log(`  • Total Blocking Time (TBT):       ${webVitals.tbt} ms (Long Tasks: ${webVitals.longTaskCount}) ${webVitals.tbt < 200 ? '🟢 (Good)' : webVitals.tbt < 600 ? '🟡 (Needs Improvement)' : '🔴 (Poor)'}`);
  console.log(`  • Cumulative Layout Shift (CLS):   ${webVitals.cls} ${webVitals.cls < 0.1 ? '🟢 (Good)' : webVitals.cls < 0.25 ? '🟡 (Needs Improvement)' : '🔴 (Poor)'}`);
  console.log(`  • Time to First Byte (TTFB):       ${webVitals.ttfb} ms`);
  console.log(`  • DOM Content Loaded:              ${webVitals.domContentLoaded} ms`);
  console.log(`  • Full Page Load Duration:         ${loadDuration} ms\n`);

  console.log(`⚙️  CDP ENGINE METRICS:`);
  console.log(`  • Script Duration:       ${Math.round((metricMap['ScriptDuration'] || 0) * 1000)} ms`);
  console.log(`  • Layout Duration:       ${Math.round((metricMap['LayoutDuration'] || 0) * 1000)} ms (Count: ${metricMap['LayoutCount'] || 0})`);
  console.log(`  • Recalc Style Duration: ${Math.round((metricMap['RecalcStyleDuration'] || 0) * 1000)} ms (Count: ${metricMap['RecalcStyleCount'] || 0})`);
  console.log(`  • JS Heap Memory Used:   ${Math.round((metricMap['JSHeapUsedSize'] || 0) / 1024 / 1024)} MB / ${Math.round((metricMap['JSHeapTotalSize'] || 0) / 1024 / 1024)} MB\n`);

  // Group Network Requests by Domain
  const domains = {};
  for (const req of networkRequests) {
    try {
      const urlObj = new URL(req.url);
      domains[urlObj.hostname] = (domains[urlObj.hostname] || 0) + 1;
    } catch (e) {}
  }

  console.log(`🌐 TOP EXTERNAL REQUEST ORIGINS:`);
  const sortedDomains = Object.entries(domains).sort((a, b) => b[1] - a[1]);
  for (const [host, count] of sortedDomains.slice(0, 10)) {
    console.log(`  • ${host}: ${count} requests`);
  }

  await browser.close();
}

runAudit(process.argv[2] || 'https://myfolio.tech').catch(console.error);

