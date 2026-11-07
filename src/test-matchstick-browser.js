const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Test that web/404.html and public/404.html are synchronized and syntactically valid HTML
test('🧩 MATCHSTICK MIND: 404 Page Integration Verification', async (t) => {
  const web404 = fs.readFileSync(path.join(__dirname, '..', 'web', '404.html'), 'utf8');
  const pub404 = fs.readFileSync(path.join(__dirname, '..', 'public', '404.html'), 'utf8');

  await t.test('1. web/404.html and public/404.html are in exact sync', () => {
    assert.equal(web404, pub404, 'web/404.html and public/404.html must be identical');
  });

  await t.test('2. 404 page includes required branding, navigation, and matchstick assets', () => {
    assert.ok(web404.includes('Matchstick Mind'), 'Must include Matchstick Mind title');
    assert.ok(web404.includes('/matchstick/matchstick-game.css'), 'Must include matchstick-game.css');
    assert.ok(web404.includes('/matchstick/puzzle-engine.js'), 'Must include puzzle-engine.js');
    assert.ok(web404.includes('/matchstick/matchstick-game.js'), 'Must include matchstick-game.js');
    assert.ok(web404.includes('id="matchstick-game-root"'), 'Must include game mount root');
    assert.ok(web404.includes('Oops! You\'ve found a missing page.'), 'Must include canonical 404 headline');
    assert.ok(web404.includes('Think you\'ve got what it takes?'), 'Must include bottom section challenge');
    assert.ok(web404.includes('href="/"'), 'Must include return to base link');
    assert.ok(web404.includes('Play Again ✦'), 'Must include play again action');
  });

  await t.test('3. Matchstick engine and game assets exist in both web/ and public/', () => {
    const assets = [
      'matchstick/puzzle-engine.js',
      'matchstick/matchstick-game.js',
      'matchstick/matchstick-game.css'
    ];
    for (const a of assets) {
      const pWeb = path.join(__dirname, '..', 'web', a);
      const pPub = path.join(__dirname, '..', 'public', a);
      assert.ok(fs.existsSync(pWeb), `web/${a} must exist`);
      assert.ok(fs.existsSync(pPub), `public/${a} must exist`);
      assert.equal(fs.readFileSync(pWeb, 'utf8'), fs.readFileSync(pPub, 'utf8'), `${a} must be synchronized between web and public`);
    }
  });

  await t.test('4. End-to-end puzzle engine evaluation via simulated DOM', () => {
    const MatchstickEngine = require('./matchstick/puzzle-engine.js');
    // Test Level 1: 6 + 4 = 4 -> 0 + 4 = 4
    const p1 = MatchstickEngine.PUZZLES[0];
    const initial = MatchstickEngine.parseEquation(p1.initialEquation);
    
    // Pick middle horizontal of 6 (slot g) and place in top-right of 6 (slot b)
    assert.equal(initial[0].slots.g, 1);
    assert.equal(initial[0].slots.b, 0);

    const solved = MatchstickEngine.cloneTokens(initial);
    solved[0].slots.g = 0;
    solved[0].slots.b = 1;

    const res = MatchstickEngine.validateBoard(p1, solved);
    assert.equal(res.isValid, true);
    assert.equal(res.decodedEquation, '0 + 4 = 4');
  });
});
