/**
 * MATCHSTICK MIND - Puzzle Engine & Mathematical Validator
 * 
 * Reusable, framework-agnostic matchstick logic puzzle engine.
 * Supports standard seven-segment digits (0-9) and arithmetic operators (+, -, =).
 * Runs seamlessly in both Node.js (for automated test suites) and modern browsers.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MatchstickEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Standard Seven-Segment Display Digit Segments:
  // a: top, b: top-right, c: bottom-right, d: bottom, e: bottom-left, f: top-left, g: middle
  // [a, b, c, d, e, f, g]
  const DIGIT_SEGMENTS = {
    0: [1, 1, 1, 1, 1, 1, 0],
    1: [0, 1, 1, 0, 0, 0, 0],
    2: [1, 1, 0, 1, 1, 0, 1],
    3: [1, 1, 1, 1, 0, 0, 1],
    4: [0, 1, 1, 0, 0, 1, 1],
    5: [1, 0, 1, 1, 0, 1, 1],
    6: [1, 0, 1, 1, 1, 1, 1],
    7: [1, 1, 1, 0, 0, 0, 0],
    8: [1, 1, 1, 1, 1, 1, 1],
    9: [1, 1, 1, 1, 0, 1, 1]
  };

  const SEGMENT_NAMES = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

  // Inverse lookup map: segment binary string -> digit
  const SEGMENT_TO_DIGIT = {};
  for (let d = 0; d <= 9; d++) {
    SEGMENT_TO_DIGIT[DIGIT_SEGMENTS[d].join('')] = d;
  }

  // 20 Curated Puzzles with mathematically verified solutions & progressive difficulty
  const PUZZLES = [
    // Easy (Levels 1–5): 1 move, simple arithmetic
    {
      id: 1,
      title: "The Pivot of Six",
      initialEquation: "6 + 4 = 4",
      movesAllowed: 1,
      difficulty: "Easy",
      hints: [
        "Focus on the initial number 6 or the plus operator.",
        "6 can become 0 with one shift, or + can donate to 6 to make 8.",
        "Try moving the middle matchstick of 6 to its top-right to create 0 + 4 = 4."
      ],
      explanation: "Move the middle horizontal matchstick of '6' to the top-right to create '0 + 4 = 4', or take the vertical stick of '+' to make '8 - 4 = 4'.",
      verifiedSolutions: ["0 + 4 = 4", "8 - 4 = 4"]
    },
    {
      id: 2,
      title: "Minus Shift",
      initialEquation: "5 + 7 = 2",
      movesAllowed: 1,
      difficulty: "Easy",
      hints: [
        "Notice that 5 + 7 = 12 is too large for 2. The operator must change.",
        "Take the vertical stick from '+' to turn it into '-'.",
        "Place that stick onto 5 to turn it into 9, giving 9 - 7 = 2."
      ],
      explanation: "Take the vertical stick from '+' (turning it into '-') and add it to the top-right of '5' (turning it into '9'), creating '9 - 7 = 2'.",
      verifiedSolutions: ["9 - 7 = 2"]
    },
    {
      id: 3,
      title: "Crossing the Void",
      initialEquation: "8 - 3 = 9",
      movesAllowed: 1,
      difficulty: "Easy",
      hints: [
        "8 has 7 matchsticks. It has plenty to spare.",
        "Change the minus sign into a plus sign.",
        "Take the bottom-right stick of 8 to make 6, and complete the '+' sign."
      ],
      explanation: "Take the bottom-right matchstick from '8' (leaving '6') and place it vertically across '-' to make '+', yielding '6 + 3 = 9'.",
      verifiedSolutions: ["6 + 3 = 9"]
    },
    {
      id: 4,
      title: "Zero to Hero",
      initialEquation: "0 + 2 = 6",
      movesAllowed: 1,
      difficulty: "Easy",
      hints: [
        "The right-hand side is 6. Can the left-hand side become 8 - 2?",
        "Turn the plus sign into a minus sign.",
        "Place the extra stick right in the middle of 0 to form 8."
      ],
      explanation: "Move the vertical matchstick of '+' to the middle horizontal position of '0' to make '8 - 2 = 6'.",
      verifiedSolutions: ["8 - 2 = 6"]
    },
    {
      id: 5,
      title: "The Seven Trim",
      initialEquation: "9 - 6 = 7",
      movesAllowed: 1,
      difficulty: "Easy",
      hints: [
        "7 has 3 matchsticks and can be trimmed to 1.",
        "Give the removed stick to 6 to make 8.",
        "The resulting equation is 9 - 8 = 1."
      ],
      explanation: "Remove the top horizontal stick of '7' (leaving '1') and place it at the top-right of '6' (making '8') to produce '9 - 8 = 1'.",
      verifiedSolutions: ["9 - 8 = 1"]
    },

    // Medium (Levels 6–12): 1–2 moves, operator shifts, dual digit mutations
    {
      id: 6,
      title: "Twin Threes",
      initialEquation: "3 + 3 = 8",
      movesAllowed: 1,
      difficulty: "Medium",
      hints: [
        "3 + 5 = 8 or 5 + 3 = 8. How do you turn a 3 into a 5?",
        "Look at the top-right stick of either 3.",
        "Shift the top-right vertical stick to top-left to convert 3 into 5."
      ],
      explanation: "Move the top-right vertical matchstick of either '3' to its top-left position to turn it into '5', giving '3 + 5 = 8' or '5 + 3 = 8'.",
      verifiedSolutions: ["3 + 5 = 8", "5 + 3 = 8"]
    },
    {
      id: 7,
      title: "Null Balance",
      initialEquation: "7 - 1 = 8",
      movesAllowed: 1,
      difficulty: "Medium",
      hints: [
        "8 can give a stick to 1 to make another 7.",
        "Removing the middle stick from 8 turns it into 0.",
        "Adding a stick to 1 turns it into 7, giving 7 - 7 = 0."
      ],
      explanation: "Take the middle horizontal matchstick of '8' (leaving '0') and add it to the top of '1' (making '7') to form '7 - 7 = 0'.",
      verifiedSolutions: ["7 - 7 = 0"]
    },
    {
      id: 8,
      title: "The Five Exchange",
      initialEquation: "6 - 3 = 9",
      movesAllowed: 1,
      difficulty: "Medium",
      hints: [
        "9 can spare a stick from its top-left to become 5.",
        "Place that stick onto 6 to turn it into 8.",
        "Result: 8 - 3 = 5."
      ],
      explanation: "Move the top-left vertical stick of '9' (turning it into '5') to the top-right of '6' (turning it into '8'), creating '8 - 3 = 5'.",
      verifiedSolutions: ["8 - 3 = 5"]
    },
    {
      id: 9,
      title: "Duality of Nine",
      initialEquation: "9 - 3 = 8",
      movesAllowed: 1,
      difficulty: "Medium",
      hints: [
        "You can either turn '-' into '+' or turn 8 into 0.",
        "Take the top-left stick of 9 to make 5, and turn - into +.",
        "The resulting equation is 5 + 3 = 8."
      ],
      explanation: "Move the top-left stick of '9' to turn '-' into '+', leaving '5 + 3 = 8', or shift the middle of 8 to 3 to get '9 - 9 = 0'.",
      verifiedSolutions: ["5 + 3 = 8", "9 - 9 = 0"]
    },
    {
      id: 10,
      title: "Inversion Arc",
      initialEquation: "8 - 2 = 9",
      movesAllowed: 1,
      difficulty: "Medium",
      hints: [
        "8 - 2 should equal 6.",
        "Can 9 become 6 in a single matchstick move?",
        "Move the top-right stick of 9 to the bottom-left position."
      ],
      explanation: "Move the top-right vertical stick of '9' to the bottom-left slot to convert it into '6', resulting in '8 - 2 = 6'.",
      verifiedSolutions: ["8 - 2 = 6"]
    },
    {
      id: 11,
      title: "Dual Rebuild",
      initialEquation: "0 + 1 = 5",
      movesAllowed: 2,
      difficulty: "Medium",
      hints: [
        "Two matchstick moves are required.",
        "Transform 0 into 5, and 5 into 6.",
        "Move 1 stick from 0 to 5 to make 6, and rearrange 0 into 5."
      ],
      explanation: "Move 2 matchsticks from '0' to shape it into '5', adding 1 matchstick to '5' to make '6', producing '5 + 1 = 6'.",
      verifiedSolutions: ["5 + 1 = 6"]
    },
    {
      id: 12,
      title: "Prime Shift",
      initialEquation: "0 + 2 = 1",
      movesAllowed: 2,
      difficulty: "Medium",
      hints: [
        "The answer 1 needs 1 stick to become 7.",
        "Transform 0 into 5 or 9.",
        "Move 2 sticks from 0 to create 5 + 2 = 7 or 9 - 2 = 7."
      ],
      explanation: "Move 2 sticks from '0': add one to '1' to form '7', and reposition the other to turn '0' into '5', creating '5 + 2 = 7'.",
      verifiedSolutions: ["5 + 2 = 7", "9 - 2 = 7"]
    },

    // Hard (Levels 13–17): 2 moves, complex multi-token rearrangement
    {
      id: 13,
      title: "Zero Theorem",
      initialEquation: "0 + 0 = 2",
      movesAllowed: 2,
      difficulty: "Hard",
      hints: [
        "Two moves allowed. Look at changing 2 into 0.",
        "You can make 0 - 0 = 0.",
        "Move the vertical stick from '+' to '-', and rearrange 2 into 0."
      ],
      explanation: "Move the vertical stick of '+' and rearrange '2' into '0' to construct '0 - 0 = 0', or rearrange into '8 - 6 = 2'.",
      verifiedSolutions: ["0 - 0 = 0", "8 - 6 = 2"]
    },
    {
      id: 14,
      title: "Eight of Spades",
      initialEquation: "0 + 1 = 0",
      movesAllowed: 2,
      difficulty: "Hard",
      hints: [
        "Change '+' into '-' and make the right side 8.",
        "First 0 becomes 9, last 0 becomes 8.",
        "Result: 9 - 1 = 8."
      ],
      explanation: "Move the vertical stick from '+' into the second '0' to create '8', and move the bottom-left stick of the first '0' to its middle to make '9', yielding '9 - 1 = 8'.",
      verifiedSolutions: ["9 - 1 = 8"]
    },
    {
      id: 15,
      title: "Twin Sevens",
      initialEquation: "0 + 1 = 4",
      movesAllowed: 2,
      difficulty: "Hard",
      hints: [
        "Can both 1 and 4 become 7s?",
        "Take 2 matchsticks from 4 and reposition them.",
        "1 becomes 7, 4 becomes 7. 0 + 7 = 7!"
      ],
      explanation: "Move 2 sticks: take the middle and vertical sticks of '4' (leaving '7') and place one on '1' to make '7', resulting in '0 + 7 = 7'.",
      verifiedSolutions: ["0 + 7 = 7"]
    },
    {
      id: 16,
      title: "The Reset",
      initialEquation: "3 + 8 = 4",
      movesAllowed: 2,
      difficulty: "Hard",
      hints: [
        "8 has 7 matchsticks. Remove its middle stick to make 0.",
        "Change 4 into 3 with the extra matchsticks.",
        "The equation balances as 3 + 0 = 3."
      ],
      explanation: "Remove the middle stick from '8' to create '0', and reconfigure '4' into '3', resulting in '3 + 0 = 3'.",
      verifiedSolutions: ["3 + 0 = 3"]
    },
    {
      id: 17,
      title: "The Mirror Swap",
      initialEquation: "5 + 9 = 4",
      movesAllowed: 2,
      difficulty: "Hard",
      hints: [
        "Look at 9 and 4. They can swap their shapes!",
        "Move 2 matchsticks from 9 into 4.",
        "9 becomes 4, and 4 becomes 9: 5 + 4 = 9."
      ],
      explanation: "Transfer 2 matchsticks from '9' to '4', turning '9' into '4' and '4' into '9', producing '5 + 4 = 9'.",
      verifiedSolutions: ["5 + 4 = 9"]
    },

    // Expert (Levels 18–20): 2–3 moves, deep logical transformations
    {
      id: 18,
      title: "The Colossus of Eights",
      initialEquation: "8 + 8 = 3",
      movesAllowed: 2,
      difficulty: "Expert",
      hints: [
        "Two eights contain 14 matchsticks — an enormous reservoir.",
        "Change '+' into '-' and rebuild 3 into 8.",
        "Turn one 8 into 0 to achieve 8 - 0 = 8 or 8 - 8 = 0."
      ],
      explanation: "Move the vertical stick of '+' and 1 stick from '8' to transform '3' into '8' and '8' into '0', achieving '8 - 0 = 8' or '8 - 8 = 0'.",
      verifiedSolutions: ["8 - 0 = 8", "8 - 8 = 0"]
    },
    {
      id: 19,
      title: "Tri-Phase Cascade",
      initialEquation: "0 + 2 = 4",
      movesAllowed: 3,
      difficulty: "Expert",
      hints: [
        "Three matchsticks must move across the equation.",
        "Convert 0 into 3, and convert 4 into 5.",
        "The resulting balance is 3 + 2 = 5."
      ],
      explanation: "Shift 3 matchsticks: reconfigure '0' into '3' (releasing 1 stick) and reshape '4' into '5' using the freed matchsticks to achieve '3 + 2 = 5'.",
      verifiedSolutions: ["3 + 2 = 5"]
    },
    {
      id: 20,
      title: "The Master Equation",
      initialEquation: "0 + 4 = 7",
      movesAllowed: 3,
      difficulty: "Expert",
      hints: [
        "Final challenge: The answer 7 remains unchanged.",
        "Redistribute 3 matchsticks between 0 and 4.",
        "0 becomes 2 (5 sticks), and 4 becomes 5 (5 sticks). 2 + 5 = 7!"
      ],
      explanation: "Move 3 matchsticks between the first two numbers: '0' becomes '2' (5 sticks) and '4' becomes '5' (5 sticks), creating '2 + 5 = 7'.",
      verifiedSolutions: ["2 + 5 = 7"]
    }
  ];

  /**
   * Helper: Parses an equation string like "6 + 4 = 4" into structured tokens
   */
  function parseEquation(eqStr) {
    const parts = eqStr.trim().split(/\s+/);
    const tokens = [];

    parts.forEach((part, tokenIndex) => {
      if (part === '+' || part === '-') {
        tokens.push({
          id: `token-${tokenIndex}`,
          type: 'operator',
          val: part,
          slots: {
            h: 1,
            v: part === '+' ? 1 : 0
          }
        });
      } else if (part === '=') {
        tokens.push({
          id: `token-${tokenIndex}`,
          type: 'equals',
          val: '=',
          slots: {
            top: 1,
            bottom: 1
          }
        });
      } else {
        // Multi-digit or single digit
        for (let i = 0; i < part.length; i++) {
          const char = part[i];
          const digit = parseInt(char, 10);
          const segs = DIGIT_SEGMENTS[digit] || [0, 0, 0, 0, 0, 0, 0];
          const slotMap = {};
          SEGMENT_NAMES.forEach((name, idx) => {
            slotMap[name] = segs[idx] || 0;
          });
          tokens.push({
            id: `token-${tokenIndex}-${i}`,
            type: 'digit',
            val: char,
            slots: slotMap
          });
        }
      }
    });

    return tokens;
  }

  /**
   * Helper: Decodes a token's current slots into a character or null if invalid
   */
  function decodeToken(token) {
    if (token.type === 'digit') {
      const key = SEGMENT_NAMES.map(s => token.slots[s] ? '1' : '0').join('');
      if (SEGMENT_TO_DIGIT.hasOwnProperty(key)) {
        return String(SEGMENT_TO_DIGIT[key]);
      }
      return null; // Invalid 7-segment digit
    }
    if (token.type === 'operator') {
      if (token.slots.h === 1 && token.slots.v === 1) return '+';
      if (token.slots.h === 1 && token.slots.v === 0) return '-';
      return null;
    }
    if (token.type === 'equals') {
      if (token.slots.top === 1 && token.slots.bottom === 1) return '=';
      return null;
    }
    return null;
  }

  /**
   * Clones a tokens array deep copy
   */
  function cloneTokens(tokens) {
    return tokens.map(t => ({
      id: t.id,
      type: t.type,
      val: t.val,
      slots: { ...t.slots }
    }));
  }

  /**
   * Counts the matchstick difference (moves) between initial and current board states
   */
  function calculateMoves(initialTokens, currentTokens) {
    let add = 0;
    let rem = 0;

    for (let i = 0; i < initialTokens.length; i++) {
      const initSlots = initialTokens[i].slots;
      const currSlots = currentTokens[i].slots;
      for (const slotKey in initSlots) {
        const initVal = initSlots[slotKey] || 0;
        const currVal = currSlots[slotKey] || 0;
        if (initVal < currVal) add += (currVal - initVal);
        if (initVal > currVal) rem += (initVal - currVal);
      }
    }

    return {
      added: add,
      removed: rem,
      // If sticks were moved within the board, add === rem
      isConserved: add === rem,
      movesUsed: Math.max(add, rem)
    };
  }

  /**
   * Validates whether the current board tokens form a mathematically correct equation
   */
  function validateBoard(puzzle, currentTokens) {
    // 1. Decode each token
    const decodedTokens = [];
    for (let i = 0; i < currentTokens.length; i++) {
      const char = decodeToken(currentTokens[i]);
      if (char === null) {
        return {
          isValid: false,
          errorType: 'INVALID_GLYPH',
          message: `Position ${i + 1} does not form a valid number or operator.`,
          decodedEquation: null
        };
      }
      decodedTokens.push(char);
    }

    // 2. Format decoded expression string
    // Check structure: [A] [op] [B] = [C]
    const eqIdx = decodedTokens.indexOf('=');
    if (eqIdx === -1 || eqIdx === 0 || eqIdx === decodedTokens.length - 1) {
      return {
        isValid: false,
        errorType: 'MISSING_EQUALS',
        message: 'The equation must include an equals sign (=).',
        decodedEquation: decodedTokens.join(' ')
      };
    }

    const lhsTokens = decodedTokens.slice(0, eqIdx);
    const rhsTokens = decodedTokens.slice(eqIdx + 1);

    // Evaluate LHS (e.g. ['6', '+', '4'] or multi-digit)
    const lhsExpr = lhsTokens.join(' ');
    const rhsExpr = rhsTokens.join(' ');

    let lhsVal, rhsVal;
    try {
      // Safe arithmetic evaluator for digits and +/- only
      lhsVal = evaluateSimpleArithmetic(lhsTokens);
      rhsVal = evaluateSimpleArithmetic(rhsTokens);
    } catch (e) {
      return {
        isValid: false,
        errorType: 'SYNTAX_ERROR',
        message: 'Equation syntax is invalid.',
        decodedEquation: `${lhsExpr} = ${rhsExpr}`
      };
    }

    // 3. Check conservation of matchsticks and move limits
    const initialTokens = parseEquation(puzzle.initialEquation);
    const moveStats = calculateMoves(initialTokens, currentTokens);

    if (!moveStats.isConserved) {
      return {
        isValid: false,
        errorType: 'STICKS_NOT_CONSERVED',
        message: `Matchstick count altered! Removed: ${moveStats.removed}, Placed: ${moveStats.added}.`,
        decodedEquation: `${lhsExpr} = ${rhsExpr}`,
        moveStats
      };
    }

    if (moveStats.movesUsed === 0) {
      return {
        isValid: false,
        errorType: 'NO_MOVES',
        message: 'You have not moved any matchsticks yet.',
        decodedEquation: `${lhsExpr} = ${rhsExpr}`,
        moveStats
      };
    }

    if (moveStats.movesUsed > puzzle.movesAllowed) {
      return {
        isValid: false,
        errorType: 'EXCEEDED_MOVES',
        message: `Used ${moveStats.movesUsed} moves, but this puzzle only allows ${puzzle.movesAllowed}.`,
        decodedEquation: `${lhsExpr} = ${rhsExpr}`,
        moveStats
      };
    }

    // 4. Check Mathematical Equality
    const isMathCorrect = (lhsVal === rhsVal);
    const formattedEquation = `${lhsExpr} = ${rhsExpr}`;

    return {
      isValid: isMathCorrect,
      isMathCorrect,
      lhsVal,
      rhsVal,
      decodedEquation: formattedEquation,
      moveStats,
      errorType: isMathCorrect ? null : 'MATH_MISMATCH',
      message: isMathCorrect
        ? 'Brilliant! The equation is mathematically balanced.'
        : `Equation evaluates to ${lhsVal} = ${rhsVal}, which is incorrect.`
    };
  }

  /**
   * Safely evaluates simple sequences of numbers and +/- operators
   */
  function evaluateSimpleArithmetic(tokens) {
    if (tokens.length === 0) throw new Error('Empty');
    let total = 0;
    let currentOp = '+';
    let currentNumStr = '';

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t === '+' || t === '-') {
        if (currentNumStr === '') {
          // leading sign or consecutive signs
          if (t === '-') currentOp = currentOp === '+' ? '-' : '+';
          continue;
        }
        const num = parseInt(currentNumStr, 10);
        total = currentOp === '+' ? total + num : total - num;
        currentOp = t;
        currentNumStr = '';
      } else if (/^\d$/.test(t)) {
        currentNumStr += t;
      } else {
        throw new Error('Invalid token');
      }
    }

    if (currentNumStr !== '') {
      const num = parseInt(currentNumStr, 10);
      total = currentOp === '+' ? total + num : total - num;
    } else {
      throw new Error('Trailing operator');
    }

    return total;
  }

  return {
    PUZZLES,
    DIGIT_SEGMENTS,
    SEGMENT_NAMES,
    parseEquation,
    decodeToken,
    cloneTokens,
    calculateMoves,
    validateBoard,
    evaluateSimpleArithmetic
  };
});

