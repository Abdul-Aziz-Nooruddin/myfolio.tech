/**
 * Prospector - Smart Multi-Model & Multi-Key Resilient Gemini Client
 * Automatically cascades across models and rotates API keys to prevent 429/503 errors.
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const rawKeys = (process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
let currentKeyIndex = 0;

// High-speed, high-quota free tier models
const CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.7-flash',
  'gemini-3.8-flash'
];

async function callWithRetry(prompt, maxRetries = 6) {
  if (rawKeys.length === 0) {
    throw new Error('GEMINI_API_KEY not found in .env');
  }

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const key = rawKeys[currentKeyIndex % rawKeys.length];
    const modelName = CANDIDATE_MODELS[attempt % CANDIDATE_MODELS.length];
    currentKeyIndex = (currentKeyIndex + 1) % rawKeys.length;

    try {
      const genAI = new GoogleGenerativeAI(key);
      const model = genAI.getGenerativeModel({ model: modelName });
      const res = await model.generateContent(prompt);
      return res.response.text();
    } catch (err) {
      const isTransient = err.message && (
        err.message.includes('429') ||
        err.message.includes('503') ||
        err.message.includes('Quota') ||
        err.message.includes('high demand')
      );

      if (isTransient && attempt < maxRetries - 1) {
        process.stdout.write(` [Demand spike on ${modelName} - shifting to ${CANDIDATE_MODELS[(attempt + 1) % CANDIDATE_MODELS.length]}] `);
        await new Promise(r => setTimeout(r, 1500));
      } else if (attempt === maxRetries - 1) {
        throw err;
      }
    }
  }
}

module.exports = { callWithRetry };
