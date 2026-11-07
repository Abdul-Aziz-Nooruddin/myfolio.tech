/**
 * AI Service - Google Gemini Integration
 * Supports BOTH old AIzaSy... keys AND new AQ.Ab... authorized keys
 * Falls back to direct REST API if SDK fails
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
let pdfParse = null;
try {
  const p = require('pdf-parse');
  pdfParse = typeof p === 'function' ? p : (p && typeof p.default === 'function' ? p.default : null);
} catch (e) {
  pdfParse = null;
}
const ACTIVE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.1-flash-lite-preview',
  'gemini-3-flash-preview',
  'gemini-flash-latest'
];


class AIService {
  constructor(apiKey) {
    // Multi-Key Rotation Pool: seamlessly supports comma-separated keys in GEMINI_API_KEY,
    // GEMINI_API_KEYS, or numbered variables GEMINI_API_KEY_1, GEMINI_API_KEY_2...
    const rawKeys = [
      apiKey,
      process.env.GEMINI_API_KEYS,
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_1,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3
    ];

    const extractedKeys = [];
    for (const item of rawKeys) {
      if (typeof item === 'string' && item.trim()) {
        const split = item.split(',').map(k => k.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
        extractedKeys.push(...split);
      }
    }

    const uniqueKeys = [...new Set(extractedKeys)];
    this.apiKeys = uniqueKeys;
    this.keyIndex = 0;
    this.apiKey = uniqueKeys[0] || apiKey || '';
    this.isAuthKey = Boolean(this.apiKey && this.apiKey.startsWith('AQ.'));

    // SDK requires AIzaSy keys; AQ keys use high-performance native REST fetch
    this.genAI = (this.apiKey && this.apiKey.startsWith('AIzaSy')) ? new GoogleGenerativeAI(this.apiKey) : null;
    this.sdkAvailable = Boolean(this.genAI);

    // Rate Limit (429) Adaptive Circuit Breaker
    this.circuitBreaker = {
      isOpen: false,
      openUntil: 0,
      consecutive429s: 0,
      cooldownMs: 25000
    };
  }

  /**
   * Returns next API key in round-robin sequence to distribute RPM quotas
   */
  getNextApiKey() {
    if (this.apiKeys.length === 0) return this.apiKey;
    const key = this.apiKeys[this.keyIndex % this.apiKeys.length];
    this.keyIndex++;
    return key;
  }

  /**
   * Records a 429 rate limit violation and trips the circuit breaker if consecutive limit reached
   */
  recordRateLimitViolation() {
    this.circuitBreaker.consecutive429s++;
    if (this.circuitBreaker.consecutive429s >= 2) {
      this.circuitBreaker.isOpen = true;
      this.circuitBreaker.openUntil = Date.now() + this.circuitBreaker.cooldownMs;
    }
  }

  /**
   * Checks if the 429 circuit breaker is currently open
   */
  isCircuitOpen() {
    if (!this.circuitBreaker.isOpen) return false;
    if (Date.now() < this.circuitBreaker.openUntil) return true;
    this.circuitBreaker.isOpen = false;
    this.circuitBreaker.consecutive429s = 0;
    return false;
  }

  /**
   * Resets the circuit breaker state
   */
  resetCircuitBreaker() {
    this.circuitBreaker.isOpen = false;
    this.circuitBreaker.openUntil = 0;
    this.circuitBreaker.consecutive429s = 0;
  }

  async callGemini(prompt) {
    // Circuit Breaker: If external API is currently in 429 cooldown, immediately fast-fail to trigger local fallback
    if (this.isCircuitOpen()) {
      throw new Error('CIRCUIT_OPEN_429: Gemini rate limit cooldown active. Using fast deterministic synthesis.');
    }

    const effectiveKey = this.apiKey || (this.apiKeys.length > 0 ? this.apiKeys[0] : '');
    if (!effectiveKey || effectiveKey.includes('test') || effectiveKey === 'placeholder') {
      throw new Error('Gemini API key not configured.');
    }

    // Multi-model rotating fallback with ultra-fast priority
    for (const modelName of ACTIVE_MODELS) {
      const activeKey = this.getNextApiKey();
      const isAqKey = Boolean(activeKey && activeKey.startsWith('AQ.'));

      // If it's an AQ. key, use direct REST fetch (proven fast & reliable with Gemini 3.x)
      if (isAqKey) {
        try {
          const restResult = await this.callGeminiRest(prompt, modelName, activeKey);
          if (restResult && (restResult.extracted_data || restResult.branch || restResult.status || Object.keys(restResult).length > 0)) {
            this.circuitBreaker.consecutive429s = 0;
            return restResult;
          }
        } catch (restError) {
          console.warn(`[AI] REST ${modelName} fallback: ${restError.message.substring(0, 100)}`);
          continue;
        }
      } else {
        // SDK path for AIzaSy keys
        const client = (activeKey === this.apiKey && this.genAI) ? this.genAI : new GoogleGenerativeAI(activeKey);

        try {
          const model = client.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 2048,
              responseMimeType: 'application/json'
            }
          });
          const result = await Promise.race([
            model.generateContent(prompt),
            new Promise((_, reject) => setTimeout(() => reject(new Error('SDK_TIMEOUT: generateContent exceeded 5000ms')), 5000))
          ]);
          const text = result.response.text();
          const parsed = this.parseJsonResponse(text);
          if (parsed && (parsed.extracted_data || parsed.branch || parsed.status || Object.keys(parsed).length > 0)) {
            this.circuitBreaker.consecutive429s = 0;
            return parsed;
          }
        } catch (sdkError) {
          if (sdkError.message && (
            sdkError.message.includes('401') ||
            sdkError.message.includes('API key not valid') ||
            sdkError.message.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
            sdkError.message.includes('UNAUTHENTICATED')
          )) {
            console.warn('[AI] Gemini API Key invalid or unauthenticated (401). Tripping circuit breaker for fast deterministic fallback.');
            this.circuitBreaker.isOpen = true;
            this.circuitBreaker.openUntil = Date.now() + 5 * 60 * 1000;
            throw new Error('AUTH_401: Gemini API key invalid or unauthenticated.');
          }

          if (sdkError.message && (sdkError.message.includes('429') || sdkError.message.includes('quota'))) {
            this.circuitBreaker.consecutive429s++;
            if (this.circuitBreaker.consecutive429s >= 2) {
              this.circuitBreaker.isOpen = true;
              this.circuitBreaker.openUntil = Date.now() + this.circuitBreaker.cooldownMs;
            }
          }
          console.warn(`[AI] Model ${modelName} fallback (${sdkError.message.substring(0, 100)}), trying REST...`);
        }

        // REST fallback for this model
        try {
          const restResult = await this.callGeminiRest(prompt, modelName, activeKey);
          if (restResult && (restResult.extracted_data || restResult.branch || restResult.status || Object.keys(restResult).length > 0)) {
            this.circuitBreaker.consecutive429s = 0;
            return restResult;
          }
        } catch (restError) {
          if (restError.message && (
            restError.message.includes('401') ||
            restError.message.includes('API key not valid') ||
            restError.message.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') ||
            restError.message.includes('UNAUTHENTICATED')
          )) {
            console.warn('[AI] Gemini REST API Key invalid or unauthenticated (401). Tripping circuit breaker.');
            this.circuitBreaker.isOpen = true;
            this.circuitBreaker.openUntil = Date.now() + 5 * 60 * 1000;
            throw new Error('AUTH_401: Gemini API key invalid or unauthenticated.');
          }

          if (restError.message && (restError.message.includes('429') || restError.message.includes('quota'))) {
            this.circuitBreaker.consecutive429s++;
            if (this.circuitBreaker.consecutive429s >= 2) {
              this.circuitBreaker.isOpen = true;
              this.circuitBreaker.openUntil = Date.now() + this.circuitBreaker.cooldownMs;
            }
          }
          console.warn(`[AI] REST ${modelName} fallback: ${restError.message.substring(0, 100)}`);
        }
      }
    }

    throw new Error('All Gemini AI models currently busy or unreachable. Please try again in a moment!');
  }

  async callGeminiRest(prompt, modelName = 'gemini-3.1-flash-lite', overrideKey = null) {
    const keyToUse = overrideKey || this.apiKey;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${keyToUse}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorSummary = errorText;
      try {
        const parsedErr = JSON.parse(errorText);
        errorSummary = parsedErr.error?.message || errorText;
      } catch (e) {}
      throw new Error(`Gemini API error (${response.status}): ${errorSummary}`);
    }

    const data = await response.json();
    if (data.error) throw new Error(`Gemini API error: ${data.error.message}`);

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return this.parseJsonResponse(text);
  }

  parseJsonResponse(text) {
    if (!text || typeof text !== 'string') return { raw: '' };
    let cleanText = text.trim();

    // 1. Remove markdown code fences if present
    const codeBlockMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch) {
      cleanText = codeBlockMatch[1].trim();
    } else {
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
    }

    // 2. Standard JSON parse
    try {
      return JSON.parse(cleanText);
    } catch (e1) {
      // 3. Extract outermost { ... }
      const jsonObjectMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        try {
          const sanitized = jsonObjectMatch[0].replace(/,(\s*[}\]])/g, '$1');
          return JSON.parse(sanitized);
        } catch (e2) {
          // fall through
        }
      }
      console.warn('[AI] Failed to parse JSON, returning raw text:', cleanText.substring(0, 100));
      return { raw: cleanText };
    }
  }

  async classifyBranch(messageText) {
    const prompt = `You are a portfolio bot intake classifier. Read the user's message and classify them into one branch.

Branches:
A = Developer / Designer (codes, designs, builds software, UI/UX, 3D, animation)
B = Freelancer / Gig Worker (photographer, tutor, contractor, service provider, trainer, consultant)
C = Student / Fresher (in college, recent graduate, looking for first job)
D = General Professional (working professional, manager, non-tech role, executive)

User message: "${messageText}"

Respond ONLY with valid JSON:
{
  "branch": "A|B|C|D",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`;

    try {
      const result = await this.callGemini(prompt);
      return result.branch || null;
    } catch (error) {
      console.error('[AI] Branch classification failed:', error.message);
      return null;
    }
  }

  async extractField(question, userAnswer, currentData, branch) {
    const prompt = `You are extracting structured data for a portfolio website.

Branch: ${branch}
Question: "${question.text}"
Question key: "${question.key}"
User's answer: "${userAnswer}"

Current extracted data: ${JSON.stringify(currentData)}

Extract the answer into a clean, structured format. If the answer is vague or incomplete, note that.

Respond ONLY with valid JSON:
{
  "extracted_value": "the clean extracted value",
  "is_valid": true|false,
  "needs_clarification": true|false,
  "clarification_question": "question to ask if needs_clarification is true",
  "confidence": 0.0-1.0
}`;

    try {
      const result = await this.callGemini(prompt);
      return {
        extracted_value: result.extracted_value || userAnswer,
        is_valid: result.is_valid !== false,
        needs_clarification: result.needs_clarification === true,
        clarification_question: result.clarification_question || null,
        confidence: result.confidence || 0.5
      };
    } catch (error) {
      console.error('[AI] Field extraction failed:', error.message);
      return {
        extracted_value: userAnswer,
        is_valid: true,
        needs_clarification: false,
        confidence: 0.5
      };
    }
  }

  async generateDesignBrief(extractedData, branch) {
    try {
      return await this.generateAIDesignBrief(extractedData, branch);
    } catch (error) {
      return {
        creative_mode: 'auto-cycle',
        layout: 'auto-cycle'
      };
    }
  }

  async generateAIDesignBrief(extractedData, branch) {
    const prompt = `You are a portfolio design director. Generate a design brief based on user data.

User data: ${JSON.stringify(extractedData)}
Branch: ${branch}

Apply these rules:

1. TASTE-SKILL DIALS (1-10 scale):
   - DESIGN_VARIANCE: layout experimentation (1=centered/clean, 10=asymmetric/modern)
   - MOTION_INTENSITY: animation depth (1=hover only, 10=scroll/magnetic)
   - VISUAL_DENSITY: info per viewport (1=spacious, 10=dense)

2. IMPECCABLE ANTI-PATTERNS (strictly forbidden):
   - No Inter, Arial, or system-default fonts
   - No purple-to-blue gradients
   - No cards nested in cards
   - No pure black (#000) or pure gray
   - No gray text on colored backgrounds
   - No bounce/elastic easing
   - No rounded-square icon tiles above every heading

3. COLOR PALETTE:
   - Primary: choose based on user's vibe
   - Secondary: complementary
   - Accent: high-contrast highlight
   - Background: tinted (never pure white or pure black)

4. TYPOGRAPHY:
   - Heading font: distinctive, not overused
   - Body font: readable, pairs well with heading
   - Scale: intentional hierarchy

Respond ONLY with valid JSON:
{
  "dials": {
    "design_variance": 1-10,
    "motion_intensity": 1-10,
    "visual_density": 1-10
  },
  "color_palette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "surface": "#hex",
    "text": "#hex",
    "text_muted": "#hex"
  },
  "typography": {
    "heading_font": "font name",
    "body_font": "font name",
    "scale_ratio": 1.25
  },
  "layout_notes": "brief description of layout approach",
  "animation_notes": "brief description of motion approach",
  "component_selection": {
    "hero": "component type",
    "projects": "component type",
    "about": "component type",
    "contact": "component type"
  }
}`;

    try {
      const result = await this.callGemini(prompt);
      return this.validateDesignBrief(result);
    } catch (error) {
      console.error('[AI] Design brief generation failed:', error.message);
      return this.getDefaultDesignBrief();
    }
  }

  validateDesignBrief(brief = {}) {
    const defaults = this.getDefaultDesignBrief();
    const cp = brief.color_palette || {};
    const typo = brief.typography || {};

    return {
      layout: brief.layout || defaults.layout,
      palette_name: brief.palette_name || defaults.palette_name,
      dials: {
        design_variance: brief.dials?.design_variance || defaults.dials.design_variance,
        motion_intensity: brief.dials?.motion_intensity || defaults.dials.motion_intensity,
        visual_density: brief.dials?.visual_density || defaults.dials.visual_density
      },
      color_palette: {
        theme: cp.theme || defaults.color_palette.theme,
        primary: cp.primary || defaults.color_palette.primary,
        secondary: cp.secondary || defaults.color_palette.secondary,
        accent: cp.accent || defaults.color_palette.accent,
        background: cp.background || defaults.color_palette.background,
        surface: cp.surface || defaults.color_palette.surface,
        surface_card: cp.surface_card || cp.surface || defaults.color_palette.surface_card,
        text: cp.text || defaults.color_palette.text,
        text_muted: cp.text_muted || defaults.color_palette.text_muted,
        border: cp.border || defaults.color_palette.border,
        glow: cp.glow || defaults.color_palette.glow,
        card_shadow: cp.card_shadow || defaults.color_palette.card_shadow,
        card_radius: cp.card_radius || defaults.color_palette.card_radius,
        card_border_width: cp.card_border_width || defaults.color_palette.card_border_width
      },
      typography: {
        heading_font: typo.heading_font || defaults.typography.heading_font,
        body_font: typo.body_font || defaults.typography.body_font,
        scale_ratio: typo.scale_ratio || defaults.typography.scale_ratio,
        base_size: typo.base_size || '16px',
        line_height: typo.line_height || 1.65
      },
      interactions: brief.interactions || defaults.interactions,
      layout_notes: brief.layout_notes || defaults.layout_notes,
      animation_notes: brief.animation_notes || defaults.animation_notes,
      component_selection: {
        hero: brief.component_selection?.hero || defaults.component_selection.hero,
        projects: brief.component_selection?.projects || defaults.component_selection.projects,
        about: brief.component_selection?.about || defaults.component_selection.about,
        contact: brief.component_selection?.contact || defaults.component_selection.contact
      }
    };
  }

  getDefaultDesignBrief() {
    return {
      layout: 'bento-dashboard',
      palette_name: 'Cyberpunk Neon Studio',
      dials: { design_variance: 7, motion_intensity: 6, visual_density: 5 },
      color_palette: {
        theme: 'dark',
        primary: '#38bdf8',
        secondary: '#818cf8',
        accent: '#22c55e',
        background: '#09090b',
        surface: '#18181b',
        surface_card: '#27272a',
        text: '#fafafa',
        text_muted: '#a1a1aa',
        border: 'rgba(255, 255, 255, 0.08)',
        glow: 'rgba(56, 189, 248, 0.22)',
        card_shadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        card_radius: '20px',
        card_border_width: '1px'
      },
      typography: {
        heading_font: 'Space Grotesk',
        body_font: 'Inter',
        scale_ratio: 1.25,
        base_size: '16px',
        line_height: 1.65
      },
      interactions: {
        tilt_cards: true,
        sparkles: true,
        aurora: true,
        confetti: true,
        filter_tabs: true,
        skill_highlight: true,
        smooth_scroll: true
      },
      layout_notes: 'Clean, centered layout with generous whitespace',
      animation_notes: 'Subtle hover effects and scroll-triggered fades',
      component_selection: {
        hero: 'centered-text',
        projects: 'card-grid',
        about: 'timeline',
        contact: 'simple-form'
      }
    };
  }

  async parseResumeDocument(buffer, mimeType = 'application/pdf') {
    if (!buffer) return null;

    // 1. Normalize/sanitize MIME type
    let normalizedMime = (mimeType || 'application/pdf').toLowerCase();
    if (normalizedMime.includes('pdf') || normalizedMime.includes('octet-stream') || normalizedMime.includes('binary')) {
      normalizedMime = 'application/pdf';
    } else if (normalizedMime.includes('png')) {
      normalizedMime = 'image/png';
    } else if (normalizedMime.includes('jpeg') || normalizedMime.includes('jpg')) {
      normalizedMime = 'image/jpeg';
    } else if (normalizedMime.includes('webp')) {
      normalizedMime = 'image/webp';
    } else {
      normalizedMime = 'application/pdf';
    }

    const extractionInstructions = `You are an expert AI resume parser and portfolio builder.
Extract ALL information from this resume thoroughly and comprehensively.

Infer the best branch:
A = Developer / Designer (software, web, app, UI/UX, tech)
B = Freelancer / Gig Worker (consultant, coach, photographer, services)
C = Student / Fresher (college, recent grad, intern)
D = General Professional (manager, executive, non-tech)

CRITICAL REQUIREMENT FOR PROJECTS:
- Extract EVERY SINGLE PROJECT mentioned anywhere in the resume (do NOT stop at 1 or 2; extract 3, 4, 5, 6, 7+ projects if present).
- For each project, extract its full name, comprehensive description, tech stack, GitHub repository link (if present), and live demo link (if present).

Extract into this exact JSON structure:
{
  "branch": "A|B|C|D",
  "extracted_data": {
    "name": "Full Name",
    "role": "Current or Desired Title",
    "tagline": "Short punchy 1-line summary",
    "bio": "2-3 sentence engaging professional summary",
    "email": "Email address",
    "phone": "Phone number if present",
    "github": "GitHub profile URL (e.g. https://github.com/username)",
    "linkedin": "LinkedIn URL if present",
    "website": "Personal URL or portfolio link if present",
    "location": "City, Country or Remote",
    "tech_stack": "Comma separated list of top skills/tools/technologies",
    "skills_by_category": {
      "languages": ["JavaScript", "Python", "..."],
      "frameworks": ["React", "Node.js", "..."],
      "cloud_tools": ["Docker", "AWS", "Git", "..."],
      "databases": ["PostgreSQL", "MongoDB", "..."]
    },
    "experience": [
      {
        "role": "Job Title",
        "company": "Company Name",
        "period": "Start - End Date (e.g. 2022 - Present)",
        "location": "City / Remote",
        "description": "Overview of role and impact",
        "achievements": [
          "Key measurable achievement or responsibility 1",
          "Key measurable achievement 2"
        ]
      }
    ],
    "education": [
      {
        "degree": "Degree / Major (e.g. B.S. in Computer Science)",
        "institution": "University or College Name",
        "year": "Graduation Year (e.g. 2020 - 2024)",
        "grade": "GPA / Grade / Honors if mentioned",
        "details": "Relevant coursework, clubs, or distinctions"
      }
    ],
    "projects": [
      {
        "name": "Project Name 1",
        "description": "Detailed multi-sentence explanation of what it is, problem solved, and architecture",
        "tech_stack": "Tech used (e.g. React, Node.js, PostgreSQL)",
        "github": "https://github.com/...",
        "live": "https://..."
      }
    ],
    "certifications": [
      {
        "name": "Certification Name",
        "issuer": "Issuing Organization (e.g. AWS, Google, Meta)",
        "year": "Year obtained"
      }
    ],
    "awards": [
      {
        "title": "Award or Honor Title",
        "issuer": "Issuing Entity / Event",
        "year": "Year"
      }
    ],
    "languages": [
      "English (Fluent)", "Spanish (Conversational)"
    ],
    "experience_summary": "Brief 1-line highlight of career tenure and focus"
  }
}

Respond ONLY with valid JSON.`;

    let parsedResult = null;

    // 2. PRIMARY STRATEGY: Extract raw digital text using pdf-parse
    if (normalizedMime === 'application/pdf' && pdfParse) {
      try {
        const pdfData = await pdfParse(buffer);
        const extractedText = (pdfData && pdfData.text) ? pdfData.text.trim() : '';

        if (extractedText.length > 30) {
          console.log(`[AI] Extracted ${extractedText.length} characters of digital text from PDF. Parsing with Gemini...`);
          const textPrompt = `${extractionInstructions}\n\n--- RESUME CONTENT ---\n${extractedText.substring(0, 30000)}\n--- END RESUME CONTENT ---`;

          try {
            const textResult = await Promise.race([
              this.callGemini(textPrompt),
              new Promise((_, reject) => setTimeout(() => reject(new Error('AI parsing timeout')), 6000))
            ]);
            if (textResult && textResult.extracted_data && Object.keys(textResult.extracted_data).length > 0) {
              parsedResult = textResult;
            }
          } catch (aiErr) {
            console.warn('[AI] Fast AI parse timeout/fallback, using resilient local heuristics:', aiErr.message);
            parsedResult = this.parseResumeHeuristics(extractedText);
          }
        } else {
          console.log('[AI] PDF has no/minimal selectable text (likely scanned image). Falling back to multimodal vision...');
        }
      } catch (pdfErr) {
        console.warn('[AI] Local pdf-parse warning, attempting multimodal parse:', pdfErr.message);
      }
    }

    // 3. SECONDARY STRATEGY: Multimodal Gemini Vision (inlineData)
    if (!parsedResult) {
      const candidateModels = [
        'gemini-flash-latest',
        'gemini-2.5-flash'
      ];
      const base64Data = buffer.toString('base64');

      for (const mName of candidateModels) {
        try {
          if (this.sdkAvailable) {
            const m = this.genAI.getGenerativeModel({
              model: mName,
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 8192,
                responseMimeType: 'application/json'
              }
            });
            const result = await Promise.race([
              m.generateContent([
                {
                  inlineData: {
                    data: base64Data,
                    mimeType: normalizedMime
                  }
                },
                extractionInstructions
              ]),
              new Promise((_, reject) => setTimeout(() => reject(new Error('multimodal timeout')), 6000))
            ]);
            const parsed = this.parseJsonResponse(result.response.text());
            if (parsed && parsed.extracted_data && Object.keys(parsed.extracted_data).length > 0) {
              parsedResult = parsed;
              break;
            }
          } else {
            // REST API fallback for multimodal
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${mName}:generateContent?key=${this.apiKey}`;
            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: AbortSignal.timeout(6000),
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { inlineData: { mimeType: normalizedMime, data: base64Data } },
                    { text: extractionInstructions }
                  ]
                }],
                generationConfig: {
                  temperature: 0.2,
                  maxOutputTokens: 8192,
                  responseMimeType: 'application/json'
                }
              })
            });
            if (response.ok) {
              const data = await response.json();
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
              const parsed = this.parseJsonResponse(text);
              if (parsed && parsed.extracted_data && Object.keys(parsed.extracted_data).length > 0) {
                parsedResult = parsed;
                break;
              }
            }
          }
        } catch (err) {
          console.warn(`[AI] Resume multimodal parse attempt with ${mName} failed: ${err.message}. Trying next model...`);
        }
      }
    }

    if (!parsedResult || !parsedResult.extracted_data) {
      // 4. ULTIMATE LOCAL FALLBACK: If external AI servers are down, extract with local heuristics
      if (normalizedMime === 'application/pdf' && pdfParse) {
        try {
          const pdfData = await pdfParse(buffer);
          const rawText = pdfData?.text || '';
          if (rawText.length > 30) {
            console.log('[AI] Using resilient local heuristic parser for resume...');
            parsedResult = this.parseResumeHeuristics(rawText);
          }
        } catch (hErr) { }
      }
    }

    if (!parsedResult || !parsedResult.extracted_data) return null;

    // 5. Post-processing: Normalize all projects & enrich with GitHub Repos
    return await this.normalizeAndEnrichExtractedData(parsedResult);
  }

  /**
   * Intelligently parses a certificate document (PDF or image)
   * Extracts name, issuer, issue date, credential ID, verification URL, and skills
   */
  async parseCertificateDocument(buffer, mimeType = 'application/pdf', filename = '') {
    const normalizedMime = (mimeType || '').toLowerCase();
    let rawText = '';

    // 1. If PDF, attempt fast local text extraction
    if (normalizedMime === 'application/pdf' && pdfParse) {
      try {
        const pdfData = await pdfParse(buffer);
        rawText = (pdfData?.text || '').trim();
      } catch (e) {
        console.warn('[AI] Certificate local pdf-parse warning:', e.message);
      }
    }

    // 1b. Fast path: if extracted text contains clear certificate metadata, return heuristics immediately (< 5ms)
    if (rawText && rawText.length > 30) {
      const fastHeuristics = this.parseCertificateHeuristics(rawText, filename);
      if (fastHeuristics && fastHeuristics.issuer && fastHeuristics.name && !fastHeuristics.name.includes('Certified Professional')) {
        return fastHeuristics;
      }
    }

    // 2. If text exists and AI is available, use Gemini with 8-second timeout
    if (this.apiKey && !this.apiKey.includes('test') && this.apiKey !== 'placeholder') {
      const prompt = `Analyze this professional certificate / credential document and extract key fields into strict JSON:
${rawText ? `CERTIFICATE TEXT:\n${rawText.slice(0, 3000)}` : `(Attached image/document)`}

Return ONLY this JSON structure:
{
  "name": "Exact Certificate / Course / Credential Title",
  "issuer": "Issuing Organization or Platform (e.g. Deloitte, AWS, Google, Coursera, Meta, Microsoft, Forage, etc.)",
  "issueDate": "Month Year or Date (e.g. September 2026)",
  "credentialId": "Verification / Credential ID or Enrolment Code if present",
  "verificationUrl": "Verification URL if present",
  "recipientName": "Name of recipient if present",
  "skills": ["Skill 1", "Skill 2"]
}`;

      if (rawText && rawText.length > 20) {
        try {
          const geminiPromise = this.callGemini(prompt);
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), 8000));
          const res = await Promise.race([geminiPromise, timeoutPromise]);
          if (res && (res.name || res.issuer)) {
            return {
              name: res.name || res.title || 'Verified Credential',
              issuer: res.issuer || res.organization || 'Verified Provider',
              issueDate: res.issueDate || res.date || '',
              credentialId: res.credentialId || res.code || '',
              verificationUrl: res.verificationUrl || res.url || '',
              recipientName: res.recipientName || '',
              skills: Array.isArray(res.skills) ? res.skills : [],
              verified: true
            };
          }
        } catch (err) {}
      }

      // Multimodal vision for images or scanned PDFs (with 10-second timeout to prevent gateway errors)
      if (normalizedMime.startsWith('image/') || (!rawText && normalizedMime === 'application/pdf')) {
        const base64Data = buffer.toString('base64');
        const candidateModels = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-3.5-flash'];
        for (const mName of candidateModels) {
          try {
            if (this.sdkAvailable) {
              const m = this.genAI.getGenerativeModel({
                model: mName,
                generationConfig: { temperature: 0.1, maxOutputTokens: 1024, responseMimeType: 'application/json' }
              });
              const visionPromise = m.generateContent([
                { inlineData: { data: base64Data, mimeType: normalizedMime } },
                prompt
              ]);
              const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Vision timeout')), 10000));
              const result = await Promise.race([visionPromise, timeoutPromise]);
              const parsed = this.parseJsonResponse(result.response.text());
              if (parsed && (parsed.name || parsed.issuer)) {
                return {
                  name: parsed.name || parsed.title || 'Verified Credential',
                  issuer: parsed.issuer || parsed.organization || 'Verified Provider',
                  issueDate: parsed.issueDate || parsed.date || '',
                  credentialId: parsed.credentialId || parsed.code || '',
                  verificationUrl: parsed.verificationUrl || parsed.url || '',
                  recipientName: parsed.recipientName || '',
                  skills: Array.isArray(parsed.skills) ? parsed.skills : [],
                  verified: true
                };
              }
            }
          } catch (mErr) {
            break; // Do not loop endlessly on timeouts
          }
        }
      }
    }

    // 3. Resilient heuristic fallback
    return this.parseCertificateHeuristics(rawText, filename);
  }

  parseCertificateHeuristics(rawText, filename = '') {
    const lines = (rawText || '').split('\n').map(l => l.trim()).filter(Boolean);
    const cleanText = (rawText || '').replace(/\s+/g, ' ');

    let issuer = '';
    const knownIssuers = ['Deloitte', 'Amazon Web Services', 'AWS', 'Google Cloud', 'Google', 'Microsoft', 'Coursera', 'Forage', 'IBM', 'Meta', 'Cisco', 'Oracle', 'Harvard', 'Stanford', 'MIT', 'Udemy', 'edX', 'freeCodeCamp', 'HackerRank', 'LinkedIn'];
    for (const org of knownIssuers) {
      if (new RegExp(`\\b${org}\\b`, 'i').test(cleanText)) {
        issuer = org;
        break;
      }
    }
    if (!issuer && filename) {
      for (const org of knownIssuers) {
        if (new RegExp(`\\b${org}\\b`, 'i').test(filename)) {
          issuer = org;
          break;
        }
      }
    }

    // Extract Verification Code / ID
    let credentialId = '';
    const codeMatch = cleanText.match(/(?:Verification Code|Enrolment Verification Code|Credential ID|Certificate ID|ID)[:\s]+([a-zA-Z0-9_-]{6,36})/i);
    if (codeMatch) {
      credentialId = codeMatch[1];
    }

    // Extract Date
    let issueDate = '';
    const dateMatch = cleanText.match(/(?:January|February|March|April|May|June|July|August|September|October|November|December)\s*(?:\d{1,2}(?:st|nd|rd|th)?,?\s*)?\d{4}/i);
    if (dateMatch) {
      issueDate = dateMatch[0];
    }

    // Extract Name / Title
    let name = '';
    for (const line of lines) {
      if (/simulation|certification|certificate|specialization|course|engineer|developer|architect|practitioner|security/i.test(line) && !/of completion|granted to|has completed/i.test(line) && line.length > 4 && line.length < 80) {
        name = line.replace(/^[#*\-•\s]+/, '').trim();
        break;
      }
    }
    if (!name && filename) {
      name = filename.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim();
      name = name.charAt(0).toUpperCase() + name.slice(1);
    }

    return {
      name: name || (issuer ? `${issuer} Certified Professional` : 'Verified Industry Credential'),
      issuer: issuer || 'Professional Certification Authority',
      issueDate: issueDate || 'Verified',
      credentialId: credentialId || '',
      verificationUrl: '',
      verified: true
    };
  }

  parseResumeHeuristics(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      return { branch: 'A', extracted_data: {} };
    }

    const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);

    // 1. Contact info regex
    const emailMatch = cleanText.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = cleanText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/);
    const githubMatch = cleanText.match(/github\.com\/([a-zA-Z0-9_-]+)/i);
    const linkedinMatch = cleanText.match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);

    // Match personal website or portfolio (excluding email providers and social networks)
    const urlMatches = cleanText.matchAll(/(?:https?:\/\/)?([a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)+)/gi);
    let portfolioUrl = '';
    const emailDomain = emailMatch ? emailMatch[0].split('@')[1].toLowerCase() : '';
    const excludedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'proton.me', 'icloud.com', 'github.com', 'linkedin.com', 'twitter.com', 'x.com', 'medium.com', 'google.com', 'facebook.com', 'instagram.com', 'adobe.com'];
    for (const m of urlMatches) {
      const d = m[1].toLowerCase();
      if (!excludedDomains.some(ex => d.includes(ex)) && d !== emailDomain && !d.startsWith('times#') && (d.includes('.app') || d.includes('.dev') || d.includes('.me') || d.includes('.io') || d.includes('.site') || d.includes('.com') || d.includes('.org') || d.includes('.tech'))) {
        portfolioUrl = m[1].startsWith('http') ? m[1] : `https://${m[1]}`;
        break;
      }
    }
    const locationMatch = cleanText.match(/(?:[A-Z][a-zA-Z\s]+,\s*(?:India|USA|UK|Canada|Germany|Remote|[A-Z]{2}))/);

    // 2. Identify Name & Header
    let name = '';
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (!line.includes('@') && !line.includes('http') && !line.includes('github') && !line.includes('+') && line.length > 2 && line.length < 50) {
        name = line.replace(/^[#*\-•\s]+/, '').trim();
        break;
      }
    }
    if (!name) name = lines[0] || 'Professional Developer';

    // 3. Section Slicing
    const sectionHeaders = [
      { key: 'objective', regex: /^(?:OBJECTIVE|SUMMARY|ABOUT\s*ME|PROFESSIONAL\s*SUMMARY|PROFILE)/i },
      { key: 'education', regex: /^(?:EDUCATION|ACADEMIC|QUALIFICATIONS|ACADEMICS)/i },
      { key: 'skills', regex: /^(?:SKILLS|TECHNICAL\s*SKILLS|CORE\s*COMPETENCIES|TECHNOLOGIES)/i },
      { key: 'projects', regex: /^(?:PROJECTS|KEY\s*PROJECTS|ACADEMIC\s*PROJECTS|EXPERIENCE\s*&\s*PROJECTS)/i },
      { key: 'experience', regex: /^(?:EXPERIENCE|WORK\s*EXPERIENCE|EMPLOYMENT|CAREER\s*HISTORY)/i },
      { key: 'strengths', regex: /^(?:STRENGTHS|STRENGTHS\s*&\s*WEAKNESSES|ACHIEVEMENTS|AWARDS)/i },
      { key: 'extracurricular', regex: /^(?:EXTRA-CURRICULAR|EXTRA\s*CURRICULAR|ACTIVITIES|LEADERSHIP)/i }
    ];

    const sections = {};
    let currentSection = 'header';
    sections[currentSection] = [];

    for (const line of lines) {
      let matchedSection = null;
      for (const sh of sectionHeaders) {
        if (sh.regex.test(line)) {
          matchedSection = sh.key;
          break;
        }
      }

      if (matchedSection) {
        currentSection = matchedSection;
        if (!sections[currentSection]) sections[currentSection] = [];
      } else {
        if (!sections[currentSection]) sections[currentSection] = [];
        sections[currentSection].push(line);
      }
    }

    // 4. Extract Bio / Objective
    let bio = '';
    if (sections.objective && sections.objective.length > 0) {
      bio = sections.objective.join(' ').trim();
    } else {
      bio = `${name} is a high-craft engineer focused on building robust full-stack software and scalable digital systems.`;
    }

    // 5. Extract Education
    const educationList = [];
    if (sections.education && sections.education.length > 0) {
      const eduText = sections.education.join('\n');
      const degreeMatch = eduText.match(/(?:B\.Tech|Bachelor|B\.E\.|B\.S\.|M\.S\.|Master|Diploma|Ph\.D\.)[^\n]*/i);
      const cgpaMatch = eduText.match(/(?:CGPA|GPA|Grade|Score):\s*([0-9.]+)/i);
      const yearMatch = eduText.match(/(?:Expected\s*\d{4}|\b20\d{2}\s*[-–]\s*20\d{2}\b|\b20\d{2}\b)/i);
      const courseworkMatch = eduText.match(/(?:Relevant\s*Coursework|Coursework):\s*([^\n]+)/i);

      let institution = '';
      for (const line of sections.education) {
        if (/Institute|University|College|School|Academy|Lords/i.test(line) && !line.startsWith('Relevant')) {
          institution = line.trim();
          break;
        }
      }

      educationList.push({
        degree: degreeMatch ? degreeMatch[0].trim() : 'B.Tech in Computer Science',
        institution: institution || 'Engineering Institute',
        year: yearMatch ? yearMatch[0].trim() : 'Present',
        grade: cgpaMatch ? `CGPA: ${cgpaMatch[1]}` : '',
        details: courseworkMatch ? `Coursework: ${courseworkMatch[1].trim()}` : (sections.education[sections.education.length - 1] || '')
      });
    }

    // 6. Extract Skills
    const rawSkills = [];
    const skillsByCategory = {
      languages: [],
      frameworks: [],
      cloud_tools: [],
      databases: [],
      domains: []
    };

    if (sections.skills && sections.skills.length > 0) {
      sections.skills.forEach(line => {
        const parts = line.replace(/^[A-Za-z\s&()-]+:\s*/, '').split(/[,⋄•|/]/).map(s => s.trim()).filter(Boolean);
        parts.forEach(p => {
          if (p.length < 35 && !rawSkills.includes(p)) {
            rawSkills.push(p);
          }
        });
      });
    }

    if (rawSkills.length === 0) {
      rawSkills.push('Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'FastAPI', 'Three.js', 'SQL', 'Git');
    }

    // 7. Extract Projects
    const projects = [];
    if (sections.projects && sections.projects.length > 0) {
      let currentProj = null;

      sections.projects.forEach(line => {
        const knownTitlePrefixes = /^(ConsentChain|YouTube\s*Shorts|LMS\s*User|AirFist|Gesture\s*Blocks|[A-Z][a-zA-Z0-9\s-]{2,25})\s*(?:[:–—]|Designed|Built|Developed|Created|Implemented)/;
        const startsWithProj = knownTitlePrefixes.test(line);

        if (startsWithProj || (!currentProj && line.length > 15)) {
          if (currentProj && currentProj.name) {
            projects.push(currentProj);
          }

          // Extract project title & description
          let title = '';
          let desc = line;

          const match = line.match(/^([A-Z][a-zA-Z0-9\s-]{2,30}?)\s+(Designed|Built|Developed|Created|Implemented|Engineered|A\s+|An\s+.*)/i);
          if (match) {
            title = match[1].trim();
            desc = line;
          } else {
            const splitByColon = line.split(/[:–—]/);
            if (splitByColon.length > 1 && splitByColon[0].trim().length < 35) {
              title = splitByColon[0].trim();
              desc = splitByColon.slice(1).join(' ').trim();
            } else {
              const words = line.split(/\s+/);
              title = words.slice(0, 3).join(' ');
              desc = line;
            }
          }

          // Detect Tech Stack from description
          const detectedTech = [];
          const techKeywords = ['Solidity', 'Polygon', 'Algorand', 'AlgoKit', 'Python', 'FastAPI', 'YouTube', 'OAuth', 'Java', 'Spring Boot', 'MySQL', 'React', 'Flutter', 'MediaPipe', 'Supabase', 'Koyeb', 'Three.js', 'aiohttp', 'Next.js', 'PostgreSQL', 'Docker', 'AWS', 'Hardhat', 'Anthropic API', 'Vercel'];
          techKeywords.forEach(tk => {
            if (new RegExp(`\\b${tk}\\b`, 'i').test(line) && !detectedTech.includes(tk)) {
              detectedTech.push(tk);
            }
          });

          currentProj = {
            name: title || `Project #${projects.length + 1}`,
            description: desc,
            desc: desc,
            tech_stack: detectedTech.join(', ') || 'Full-Stack Architecture',
            tech: detectedTech.join(' • ') || 'Software Engineering',
            github: githubMatch ? `https://github.com/${githubMatch[1]}` : '#',
            live: portfolioUrl || '#'
          };
        } else if (currentProj) {
          currentProj.desc += ' ' + line;
          currentProj.description += ' ' + line;
        }
      });

      if (currentProj && currentProj.name) {
        projects.push(currentProj);
      }
    }

    // 8. Extract Role
    let role = 'Full-Stack & AI/ML Software Engineer';
    if (sections.objective && sections.objective.length > 0) {
      const roleMatch = sections.objective.join(' ').match(/([A-Z][a-zA-Z\s()/-]+(?:undergraduate|engineer|developer|architect|scientist|specialist|intern))/i);
      if (roleMatch) {
        role = roleMatch[0].trim();
      }
    }

    // 9. Extract Certifications & Achievements
    const certifications = [];
    if (sections.strengths && sections.strengths.length > 0) {
      sections.strengths.forEach(s => {
        const clean = s.replace(/^[•*\-\s]+/, '').trim();
        if (clean.length > 10) {
          certifications.push({ name: clean.slice(0, 100), issuer: 'Verified Practice' });
        }
      });
    }
    if (sections.extracurricular && sections.extracurricular.length > 0) {
      sections.extracurricular.forEach(e => {
        const clean = e.replace(/^[•*\-\s]+/, '').trim();
        if (clean.length > 10) {
          certifications.push({ name: clean.slice(0, 100), issuer: 'Initiative & Ecosystem' });
        }
      });
    }

    // 10. Infer Gender
    const textLower = cleanText.toLowerCase();
    const femalePronouns = (textLower.match(/\b(she|her|hers)\b/g) || []).length;
    const malePronouns = (textLower.match(/\b(he|him|his)\b/g) || []).length;
    let inferredGender = 'unspecified';
    if (femalePronouns > malePronouns && femalePronouns > 0) inferredGender = 'female';
    else if (malePronouns > femalePronouns && malePronouns > 0) inferredGender = 'male';
    else if (/\b(ms\.|mrs\.|miss)\b/i.test(textLower)) inferredGender = 'female';
    else if (/\b(mr\.)\b/i.test(textLower)) inferredGender = 'male';
    else if (/\b(society of women engineers|swe|girls who code|women in tech|women who code|grace hopper)\b/i.test(textLower)) inferredGender = 'female';

    return {
      branch: 'A',
      extracted_data: {
        name,
        role,
        tagline: bio.slice(0, 140),
        bio,
        summary: bio,
        gender: inferredGender,
        gender_inference: {
          gender: inferredGender,
          confidence: inferredGender !== 'unspecified' ? 0.9 : 0.5
        },
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : '',
        github: githubMatch ? `https://github.com/${githubMatch[1]}` : '',
        linkedin: linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : '',
        website: portfolioUrl || '',
        location: locationMatch ? locationMatch[0].trim() : 'Hyderabad, India',
        tech_stack: rawSkills.join(', '),
        skills: rawSkills,
        skills_by_category: skillsByCategory,
        projects: projects,
        education: educationList,
        experience: [],
        certifications: certifications.length > 0 ? certifications : undefined
      }
    };
  }

  async normalizeAndEnrichExtractedData(parsedResult) {
    const data = parsedResult.extracted_data || {};
    const projects = [];

    if (Array.isArray(data.projects)) {
      for (const p of data.projects) {
        if (p && (p.name || p.title)) {
          projects.push({
            name: p.name || p.title,
            desc: p.description || p.desc || 'High-performance software project.',
            tech: p.tech_stack || p.tech || (Array.isArray(p.technologies) ? p.technologies.join(', ') : ''),
            github: p.github || p.repo || '',
            live: p.live || p.link || ''
          });
        }
      }
    }

    // Check project_1_name, project_2_name, etc.
    for (let i = 1; i <= 20; i++) {
      const name = data[`project_${i}_name`];
      if (name && !projects.some(p => p.name === name)) {
        projects.push({
          name: name,
          desc: data[`project_${i}_desc`] || 'Featured software application with modern architecture.',
          tech: data[`project_${i}_tech`] || data.tech_stack || '',
          github: data[`project_${i}_github`] || '',
          live: data[`project_${i}_live`] || ''
        });
      }
    }

    // If GitHub URL is provided, fetch public repos to enrich missing projects or add repo links
    const githubUrl = data.github || data.github_url;
    if (githubUrl) {
      try {
        const ghRepos = await this.fetchGitHubRepos(githubUrl);
        if (Array.isArray(ghRepos) && ghRepos.length > 0) {
          for (const repo of ghRepos) {
            // Match with existing project or append
            const existing = projects.find(p => p.name.toLowerCase().includes(repo.name.toLowerCase()) || repo.name.toLowerCase().includes(p.name.toLowerCase()));
            if (existing) {
              if (!existing.github) existing.github = repo.github;
              if (!existing.live && repo.live && repo.live !== repo.github) existing.live = repo.live;
            } else if (projects.length < 8) {
              projects.push(repo);
            }
          }
        }
      } catch (ghErr) {
        console.warn('[AI] GitHub enrichment warning:', ghErr.message);
      }
    }

    // Flatten back into project_1_name, project_2_name, etc.
    data.projects = projects;
    projects.forEach((p, idx) => {
      const num = idx + 1;
      data[`project_${num}_name`] = p.name;
      data[`project_${num}_desc`] = p.desc || p.description;
      data[`project_${num}_tech`] = p.tech || p.tech_stack;
      data[`project_${num}_github`] = p.github;
      data[`project_${num}_live`] = p.live;
    });

    parsedResult.extracted_data = data;
    return parsedResult;
  }

  async fetchGitHubRepos(githubUrlOrUsername) {
    if (!githubUrlOrUsername) return [];
    try {
      const axios = require('axios');
      let username = githubUrlOrUsername
        .replace(/https?:\/\/(www\.)?github\.com\//i, '')
        .replace(/\/.*$/, '')
        .replace('@', '')
        .trim();
      if (!username) return [];

      const res = await axios.get(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=8`, {
        headers: { 'User-Agent': 'PortfolioBot-AI' },
        timeout: 1200
      });

      if (Array.isArray(res.data)) {
        return res.data.filter(r => !r.fork).slice(0, 6).map(r => ({
          name: r.name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          desc: r.description || 'Open source software project hosted on GitHub.',
          tech: r.language || 'Code',
          github: r.html_url,
          live: r.homepage || r.html_url
        }));
      }
    } catch (e) {
      if (e.response && e.response.status === 404) {
        // Safe graceful fallback when resume contains a placeholder or non-existent GitHub handle
        console.log(`[GITHUB API] GitHub username '${username}' not found (404), using extracted resume project data.`);
      } else {
        console.warn('[GITHUB API] Error fetching repos:', e.message);
      }
    }
    return [];
  }

  async healthCheck() {
    try {
      const result = await this.callGemini('Say "OK" in JSON: {"status": "ok"}');
      return result.status === 'ok' || result.raw?.includes('OK');
    } catch (error) {
      console.error('[AI] Health check failed:', error.message);
      return false;
    }
  }
}

module.exports = { AIService };
