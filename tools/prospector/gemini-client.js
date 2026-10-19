/**
 * Prospector - Smart Gemini Client with Multi-Key Rotation and 429 Retry
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const rawKeys = (process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
let currentKeyIndex = 0;

function getNextModel() {
  if (rawKeys.length === 0) {
    throw new Error('GEMINI_API_KEY not found in .env');
  }
  const key = rawKeys[currentKeyIndex % rawKeys.length];
  currentKeyIndex = (currentKeyIndex + 1) % rawKeys.length;
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });
}

async function callWithRetry(prompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const model = getNextModel();
      const res = await model.generateContent(prompt);
      return res.response.text();
    } catch (err) {
      const isRateLimit = err.message && (err.message.includes('429') || err.message.includes('Quota exceeded'));
      if (isRateLimit && attempt < retries) {
        // Rotate to next key and wait a moment
        const waitSec = attempt * 4;
        process.stdout.write(` [429 Quota - rotating key & waiting ${waitSec}s] `);
        await new Promise(r => setTimeout(r, waitSec * 1000));
      } else {
        throw err;
      }
    }
  }
}

module.exports = { callWithRetry };
