#!/usr/bin/env node
/**
 * ⚡ Harvey Mini - Autonomous Sales Prospector
 * Powered by Google Gemini 3.8 Flash (100% Free)
 * Completely isolated from your main web app codebase.
 */

const path = require('path');
const fs = require('fs');
const { discoverBusinesses } = require('./discover');
const { profileWebsite } = require('./profiler');
const { writeEmailSequence } = require('./writer');
const { generateDashboard } = require('./dashboard');
const { sendOutreachEmail, getTransporter } = require('./sender');

// Parse CLI flags (e.g. --city "Bangalore" --niche "Interior Designers" --limit 5 --auto-send)
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    city: 'Mumbai',
    niche: 'Architectural Studios',
    limit: 3,
    autoSend: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--city' && args[i + 1]) options.city = args[++i];
    if (args[i] === '--niche' && args[i + 1]) options.niche = args[++i];
    if (args[i] === '--limit' && args[i + 1]) options.limit = parseInt(args[++i], 10) || 3;
    if (args[i] === '--auto-send') options.autoSend = true;
  }
  return options;
}

async function main() {
  const { city, niche, limit, autoSend } = parseArgs();

  console.log('\n======================================================');
  console.log('⚡ HARVEY MINI - AUTONOMOUS B2B PROSPECTOR');
  console.log('   Free Tier Engine • Powered by Gemini 3.8 Flash');
  console.log('======================================================');
  console.log(`🎯 Target:   ${niche}`);
  console.log(`📍 Location: ${city}`);
  console.log(`🔢 Quantity: ${limit} prospects`);
  console.log(`✉️  Mode:     ${autoSend ? 'AUTOMATED EMAIL DISPATCH (--auto-send)' : 'LOCAL REVIEW (Manual Approval)'}\n`);

  // Stage 1: Discover
  console.log('🔍 [STAGE 1/3] Discovering real target businesses...');
  let businesses = [];
  try {
    businesses = await discoverBusinesses({ niche, city, limit });
    console.log(`   ✅ Discovered ${businesses.length} businesses.`);
  } catch (err) {
    console.error('   ❌ Discovery failed:', err.message);
    process.exit(1);
  }

  // Stage 2: Profile
  console.log('\n🌐 [STAGE 2/3] Profiling websites & detecting technical gaps...');
  const profiled = [];
  for (const biz of businesses) {
    process.stdout.write(`   Scanning ${biz.name}... `);
    const p = await profileWebsite(biz);
    console.log(p.hasWebsite ? (p.isAlive ? `[200 OK - ${p.techStack.join(', ') || 'Custom'}]` : `[${p.statusCode}]`) : '[NO SITE]');
    profiled.push(p);
  }

  // Stage 3: Write Email Sequences
  console.log('\n✍️  [STAGE 3/3] Generating personalized 3-touch cold emails...');
  const results = [];
  for (const prof of profiled) {
    process.stdout.write(`   Writing sequence for ${prof.name}... `);
    try {
      const seq = await writeEmailSequence(prof);
      results.push({ ...prof, sequence: seq });
      console.log('Done.');
      // Pacing delay between LLM generations
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.log('Failed writing:', err.message);
      results.push({ ...prof, sequence: null });
    }
  }

  // Output: Save Files
  const outDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const jsonPath = path.join(outDir, 'prospects.json');
  const dashPath = path.join(outDir, 'dashboard.html');
  const csvPath = path.join(outDir, 'prospects.csv');

  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf8');
  generateDashboard(results, dashPath);

  // Write simple CSV
  const csvRows = ['Name,City,Website,Email,TechStack,Gaps,Touch1_Subject'];
  for (const r of results) {
    const email = (r.emails && r.emails[0]) || '';
    const gaps = (r.detectedGaps || []).join(' | ');
    const subj = r.sequence && r.sequence.touch1 ? r.sequence.touch1.subject : '';
    csvRows.push(`"${r.name}","${r.city}","${r.website || ''}","${email}","${r.techStack.join(', ')}","${gaps}","${subj}"`);
  }
  fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8');

  // Stage 4 (Optional): Automated Email Dispatch
  if (autoSend) {
    console.log('\n🚀 [STAGE 4/4] Automated Dispatch (--auto-send enabled)...');
    for (const r of results) {
      const recipient = (r.emails && r.emails[0]) || r.contactEmail;
      if (!recipient) {
        console.log(`   ⏭️  Skipping ${r.name} (no email address found).`);
        continue;
      }
      process.stdout.write(`   ✉️  Sending Touch 1 to ${recipient} (${r.name})... `);
      try {
        const sendRes = await sendOutreachEmail(r, { delayMs: 10000 });
        if (sendRes.success) {
          console.log('✅ Sent! (Pacing 10s)');
        } else {
          console.log(`❌ Failed: ${sendRes.reason}`);
        }
      } catch (err) {
        console.log(`❌ Error: ${err.message}`);
      }
    }
  }

  console.log('\n======================================================');
  console.log('🎉 Prospecting Cycle Complete!');
  console.log('======================================================');
  console.log(`📁 JSON Data:  file://${jsonPath}`);
  console.log(`📊 CSV Export: file://${csvPath}`);
  console.log(`🖥️  DASHBOARD:  file://${dashPath}`);
  console.log('\n👉 Open the Dashboard in Chrome to review leads & 1-click copy email drafts:');
  console.log(`   open "${dashPath}"\n`);
}

main().catch(err => {
  console.error('\n❌ Fatal error in prospector:', err);
});
