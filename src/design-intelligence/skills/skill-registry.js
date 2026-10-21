/**
 * Skill Registry with Dynamic Custom Skill Discovery
 * Explicitly registers, tracks, and verifies all mandatory free open-source design skills.
 * Automatically discovers any custom skill placed under .agents/skills/<name>/SKILL.md.
 * Fails closed if any mandatory skill file is missing.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MANDATORY_SKILLS = {
  'ui-ux-pro-max': {
    name: 'ui-ux-pro-max',
    relativePath: '.agents/skills/ui-ux-pro-max/SKILL.md',
    category: 'ui-ux',
    required: true,
    description: 'UI/UX design intelligence, typography scales, color palettes, and anti-AI-slop heuristics.'
  },
  'design-it': {
    name: 'design-it',
    relativePath: '.agents/skills/design-it/SKILL.md',
    category: 'creative-direction',
    required: true,
    description: 'Aesthetic art direction, visual universe divergence, and anti-repetition guidance.'
  },
  'better-interface': {
    name: 'better-interface',
    relativePath: '.agents/skills/better-interface/SKILL.md',
    category: 'interface-critique',
    required: true,
    description: 'Typographic rhythm, contrast heuristics, surface physics, and touch ergonomics.'
  },
  'web-design': {
    name: 'web-design',
    relativePath: '.agents/skills/web-design/SKILL.md',
    category: 'web-composition',
    required: true,
    description: 'LIBERA layout systems, motion choreography, and reference-study principles.'
  },
  'gsap': {
    name: 'gsap',
    relativePath: '.agents/skills/gsap/SKILL.md',
    category: 'motion',
    required: true,
    description: 'GSAP 3.12+ ScrollTrigger rules, GPU transform best practices, and reduced-motion architecture.'
  }
};

class SkillRegistry {
  constructor(baseDir = process.cwd()) {
    this.baseDir = baseDir;
    this.registry = { ...MANDATORY_SKILLS };
    this.discoverCustomSkills();
  }

  /**
   * Dynamically discovers any custom skills under .agents/skills/
   */
  discoverCustomSkills() {
    const skillsDir = path.join(this.baseDir, '.agents', 'skills');
    if (!fs.existsSync(skillsDir)) return;

    try {
      const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('ponytail') && !entry.name.startsWith('rea-') && !entry.name.startsWith('reverse-engineer')) {
          const skillFile = path.join(skillsDir, entry.name, 'SKILL.md');
          if (fs.existsSync(skillFile) && !this.registry[entry.name]) {
            this.registry[entry.name] = {
              name: entry.name,
              relativePath: `.agents/skills/${entry.name}/SKILL.md`,
              category: 'custom-skill',
              required: false,
              description: `Custom discovered skill: ${entry.name}`
            };
          }
        }
      }
    } catch (err) {
      console.warn('[SkillRegistry] Error discovering custom skills:', err.message);
    }
  }

  /**
   * Retrieves the absolute path for a skill
   */
  getSkillPath(skillName) {
    const entry = this.registry[skillName];
    if (!entry) return null;
    return path.join(this.baseDir, entry.relativePath);
  }

  /**
   * Calculates cryptographic hash of a skill file
   */
  getSkillHash(skillName) {
    const skillPath = this.getSkillPath(skillName);
    if (!skillPath || !fs.existsSync(skillPath)) return null;
    const content = fs.readFileSync(skillPath, 'utf8');
    return crypto.createHash('sha256').update(content).digest('hex').slice(0, 12);
  }

  /**
   * Verifies all mandatory skills are present and accessible
   * @throws {Error} if any mandatory skill is missing
   */
  verifyAllSkills() {
    const verificationResults = [];
    const missing = [];

    for (const [key, skill] of Object.entries(this.registry)) {
      const fullPath = path.join(this.baseDir, skill.relativePath);
      const exists = fs.existsSync(fullPath);
      const hash = exists ? this.getSkillHash(key) : null;

      if (!exists && skill.required) {
        missing.push(key);
      }

      verificationResults.push({
        name: key,
        category: skill.category,
        required: skill.required,
        path: fullPath,
        exists,
        hash
      });
    }

    if (missing.length > 0) {
      throw new Error(`[SKILL REGISTRY FAILURE] Mandatory design skills missing: ${missing.join(', ')}`);
    }

    return verificationResults;
  }

  getAllSkills() {
    return Object.values(this.registry);
  }

  getSkill(skillName) {
    return this.registry[skillName] || null;
  }
}

module.exports = { SkillRegistry, MANDATORY_SKILLS };
