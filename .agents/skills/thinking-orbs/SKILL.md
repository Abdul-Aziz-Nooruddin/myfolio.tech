---
name: thinking-orbs
description: Dotted thought-orb loading indicators for AI & agent UIs with nine hand-tuned animated states (working, searching, solving, listening, connecting, weaving, composing, breathing, shaping) on 2D canvas.
---

# Thinking Orbs Skill

## 1. Overview
Thinking Orbs (`https://github.com/Jakubantalik/thinking-orbs`) provides dotted thought-orb loading indicators for AI and agent UIs.
Nine hand-tuned animated states rendered on a plain 2D canvas with zero WebGL dependencies, works identically across Chrome, Safari, Firefox, and mobile browsers.

## 2. Animated States & Semantic Meaning
1. **`searching`**: A scan meridian sweeps a dotted globe — used when querying GitHub API, scanning repositories, or parsing resumes.
2. **`connecting`**: A constellation wires itself — used when linking repositories, fetching commit histories, or establishing network nodes.
3. **`solving`**: Bands scramble, then click back solved — used when AI is synthesizing case studies, computing match scores, or verifying DPDP/compliance tokens.
4. **`weaving`**: Three strands plait around the sphere — used when combining multi-source data (GitHub + Resume + Manual + AI).
5. **`composing`**: An undulating multi-band sash — used when compiling layout trees, assembling sections, and generating DOM.
6. **`working`**: Particles on tilted orbits — general high-performance task execution.
7. **`listening`**: A waveform rolls through rings — used when awaiting user input, recording voice prompts, or waiting for file uploads.
8. **`breathing`**: A ring slowly morphing — used for idle thought state, live assistant readiness, or conversational pause.
9. **`shaping`**: Dotted outline morphing circle → triangle → square — used during visual world selection or template switching.

## 3. Scale Presets
- **Avatar Scale (`64px`)**: Ideal for modal loaders, hero AI badges, synthesis progress screens, and primary actions.
- **Inline / Text Scale (`20px`)**: Ideal for buttons, badge headers, live status pills, and compact table cells.

## 4. Usage in MyFolio Platform
- **Script inclusion**: `<script src="/thinking-orbs.js"></script>`
- **Declarative markup**:
  ```html
  <canvas data-thinking-orb="searching" data-size="64" data-color="#38bdf8"></canvas>
  ```
- **Programmatic API**:
  ```javascript
  const orb = ThinkingOrb.render(canvasElement, {
    state: 'searching',
    size: 64,
    color: '#38bdf8',
    speed: 1,
    dark: true
  });
  // Dynamically update state during progress steps:
  orb.setState('weaving');
  orb.setState('solving');
  orb.stop();
  ```
