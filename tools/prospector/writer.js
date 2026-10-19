/**
 * Prospector - Cold Email Sequence Writer
 * Uses Gemini 3.8 Flash to write personalized 3-email sequences.
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

function getGeminiModel() {
  const keys = (process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
  const genAI = new GoogleGenerativeAI(keys[0]);
  return genAI.getGenerativeModel({ model: 'gemini-3.8-flash' });
}

async function writeEmailSequence(profile, senderInfo = {}) {
  const model = getGeminiModel();
  const senderName = senderInfo.name || 'Abdul-Aziz';
  const myProduct = senderInfo.product || 'MyFolio (myfolio.tech)';

  const prompt = `You are an elite, non-salesy B2B copywriter.
Write a 3-touch hyper-personalized cold email sequence for this specific business prospect:

Business Name: ${profile.name}
Website: ${profile.website || 'No website'}
Specialization / Context: ${profile.specialization || 'Not specified'}
Tech Stack Detected: ${profile.techStack.join(', ') || 'Custom/None'}
Observed Gaps / Signals: ${profile.detectedGaps.join('; ') || 'Standard portfolio'}

Sender: ${senderName} from ${myProduct}
Value Proposition: We build high-conversion, award-winning 3D spatial portfolios and mobile-first websites (https://myfolio.tech) that turn visitors into high-ticket clients, replacing outdated WordPress/Wix sites with interactive digital worlds.

Guidelines:
1. Touch 1 (Initial Hook): Compliment their actual work/projects first. Point out one specific observation or opportunity (e.g. 3D showcase or mobile responsiveness). Keep it under 90 words. Low-friction ask (e.g. "Open to seeing a quick 30-sec demo?").
2. Touch 2 (Value Bump): Sent 3 days later. 2-3 sentences. Share a concrete example of how spatial 3D portfolios double engagement.
3. Touch 3 (Polite Breakup): Sent 5 days later. Friendly, no pressure closure.

Return ONLY valid JSON matching this schema:
{
  "touch1": {
    "subject": "Subject line",
    "body": "Email body text"
  },
  "touch2": {
    "subject": "Re: Subject line",
    "body": "Email body text"
  },
  "touch3": {
    "subject": "Re: Subject line",
    "body": "Email body text"
  }
}`;

  const res = await model.generateContent(prompt);
  let text = res.response.text().trim();
  
  if (text.startsWith('```json')) text = text.substring(7);
  if (text.startsWith('```')) text = text.substring(3);
  if (text.endsWith('```')) text = text.substring(0, text.length - 3);

  try {
    return JSON.parse(text.trim());
  } catch (e) {
    return {
      touch1: { subject: `Quick question regarding ${profile.name}`, body: text },
      touch2: { subject: `Follow-up on ${profile.name}`, body: 'Checking back on this.' },
      touch3: { subject: `Final note`, body: 'All the best with your projects!' }
    };
  }
}

module.exports = { writeEmailSequence };
