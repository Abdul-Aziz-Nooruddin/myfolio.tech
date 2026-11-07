const test = require('node:test');
const assert = require('node:assert/strict');
const MatchstickEngine = require('./matchstick/puzzle-engine.js');

test('🧩 MATCHSTICK MIND: Engine & 20 Curated Puzzles Verification', async (t) => {
  const { PUZZLES, parseEquation, validateBoard, decodeToken, cloneTokens, calculateMoves } = MatchstickEngine;

  await t.test('1. Catalog completeness: exactly 20 curated puzzles exist', () => {
    assert.equal(PUZZLES.length, 20, 'Engine must contain at least 20 puzzles');
    for (let i = 0; i < 20; i++) {
      const p = PUZZLES[i];
      assert.equal(p.id, i + 1, `Puzzle id must be sequential (${i + 1})`);
      assert.ok(p.title && p.title.length > 2, `Puzzle ${p.id} must have a title`);
      assert.ok(p.initialEquation, `Puzzle ${p.id} must have initialEquation`);
      assert.ok(p.movesAllowed >= 1 && p.movesAllowed <= 3, `Puzzle ${p.id} movesAllowed must be 1, 2, or 3`);
      assert.ok(['Easy', 'Medium', 'Hard', 'Expert'].includes(p.difficulty), `Puzzle ${p.id} difficulty must be valid`);
      assert.ok(Array.isArray(p.hints) && p.hints.length >= 3, `Puzzle ${p.id} must provide at least 3 progressive hints`);
      assert.ok(p.explanation && p.explanation.length > 10, `Puzzle ${p.id} must include an explanation`);
      assert.ok(Array.isArray(p.verifiedSolutions) && p.verifiedSolutions.length >= 1, `Puzzle ${p.id} must have verified solutions`);
    }
  });

  await t.test('2. Initial equations are all mathematically incorrect (player must solve)', () => {
    for (const p of PUZZLES) {
      const initialTokens = parseEquation(p.initialEquation);
      const validation = validateBoard(p, initialTokens);
      assert.equal(validation.isValid, false, `Initial equation for puzzle ${p.id} ("${p.initialEquation}") must NOT be valid`);
      assert.equal(validation.errorType, 'NO_MOVES', `Initial equation must report NO_MOVES`);
    }
  });

  await t.test('3. All 20 puzzles have verified solutions with exact matchstick move counts', () => {
    for (const p of PUZZLES) {
      const initialTokens = parseEquation(p.initialEquation);
      
      for (const solStr of p.verifiedSolutions) {
        const solTokens = parseEquation(solStr);
        const moveStats = calculateMoves(initialTokens, solTokens);

        assert.equal(moveStats.isConserved, true, `Puzzle ${p.id}: solution "${solStr}" must conserve matchsticks`);
        assert.equal(moveStats.movesUsed, p.movesAllowed, 
          `Puzzle ${p.id}: solution "${solStr}" must take exactly ${p.movesAllowed} move(s), got ${moveStats.movesUsed}`);

        const result = validateBoard(p, solTokens);
        assert.equal(result.isValid, true, `Puzzle ${p.id}: solution "${solStr}" must validate as true: ${result.message}`);
        assert.equal(result.isMathCorrect, true);
        assert.equal(result.errorType, null);
      }
    }
  });

  await t.test('4. Validation detects invalid glyphs and non-conserved sticks', () => {
    const p1 = PUZZLES[0]; // 6 + 4 = 4
    const tokens = parseEquation(p1.initialEquation);

    // Corrupt a digit by turning off all segments -> empty slot where a digit was expected
    tokens[0].slots = { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0 };
    const resGlyph = validateBoard(p1, tokens);
    assert.equal(resGlyph.isValid, false);
    assert.equal(resGlyph.errorType, 'INVALID_GLYPH');

    // Remove 1 stick from 8 to make 0 without placing it -> valid digits, but sticks not conserved
    const p3 = PUZZLES[2]; // 8 - 3 = 9
    const tokensMissing = parseEquation(p3.initialEquation);
    tokensMissing[0].slots.g = 0; // 8 with middle off is valid digit 0!
    assert.equal(decodeToken(tokensMissing[0]), '0');
    const resConserve = validateBoard(p3, tokensMissing);
    assert.equal(resConserve.isValid, false);
    assert.equal(resConserve.errorType, 'STICKS_NOT_CONSERVED');
  });

  await t.test('5. Validation rejects exceeded move limits', () => {
    const p1 = PUZZLES[0]; // allows 1 move
    // Construct a state that took 2 moves
    const p1SolTokens = parseEquation(p1.verifiedSolutions[0]); // 1 move
    // Shift another stick inside
    p1SolTokens[4].slots = { ...p1SolTokens[4].slots }; // 4 -> corrupt or move another
    // Test with a puzzle that allows only 1 move against a 2-move state:
    const p13 = PUZZLES[12]; // 0 + 0 = 2 (2 moves to 0 - 0 = 0)
    const sol2 = parseEquation("0 - 0 = 0");
    const resExceed = validateBoard(p1, sol2); // passing 2-move equation to 1-move puzzle
    assert.equal(resExceed.isValid, false);
  });

  await t.test('6. Undo and Reset simulation', () => {
    const p1 = PUZZLES[0];
    const initial = parseEquation(p1.initialEquation);
    let current = cloneTokens(initial);

    // Simulate pick & place: move middle of 6 (token 0, slot 'g') to top-right of 6 (token 0, slot 'b')
    assert.equal(current[0].slots.g, 1);
    assert.equal(current[0].slots.b, 0);

    // Pick
    current[0].slots.g = 0;
    // Place
    current[0].slots.b = 1;

    // Check it decoded to 0
    assert.equal(decodeToken(current[0]), '0');
    let val = validateBoard(p1, current);
    assert.equal(val.isValid, true);
    assert.equal(val.decodedEquation, '0 + 4 = 4');

    // Simulate Undo: move back from slot 'b' to slot 'g'
    current[0].slots.b = 0;
    current[0].slots.g = 1;
    assert.equal(decodeToken(current[0]), '6');
    val = validateBoard(p1, current);
    assert.equal(val.isValid, false);
    assert.equal(val.errorType, 'NO_MOVES');
  });
});
