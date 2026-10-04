# AGENTS.md

## Mandatory Lifetime Frameworks: /web-design, /ui-ux-pro-max, and /agy-customizations

You MUST strictly consult and apply the following three authoritative design and architecture engines **EVERY SINGLE TIME** when generating, deciding, or refining template structures, styling, 3D live visuals, effects, and any unmentioned architectural features:

1. **Template Structure & Section Geometry**:
   - Apply `/web-design` & `/ui-ux-pro-max` principles to break free from cookie-cutter card grids.
   - Use intentional asymmetry, varied modular bento spans, and content-driven density that scales with the candidate's actual profile data.
   - Decouple dedicated error routes (404), interactive modals, and sub-systems from the main single-page scroll flow.

2. **Styling, Color Physics & Mandatory Custom Typography Engine (Strict Zero Repetitive Fonts Rule)**:
   - Enforce WCAG 2.2 AAA contrast standards (minimum 4.5:1 text-to-background).
   - **MANDATORY CUSTOM TYPOGRAPHY ENGINE**: Under NO circumstances should generated portfolios recycle the same default font pairings (e.g. relying solely on `Inter`, `Plus Jakarta Sans`, or `Syne`). Every single portfolio template and generated portfolio MUST load and apply a distinct, tailored 3-tier font hierarchy:
     1. **Expressive Display Mastheads**: `Orbitron`, `Chakra Petch`, `Cinzel Decorative`, `Playfair Display`, `Syne`, `Syncopate`, `Teko`, `Bebas Neue`, `MedievalSharp`, `Rajdhani`, `Fraunces`, `Clash Display`.
     2. **Tailored Body Typefaces**: `Space Grotesk`, `Instrument Serif`, `Spectral`, `IBM Plex Sans`, `Outfit`, `Manrope`, `Epilogue`, `Titillium Web`, `Exo 2`, `Newsreader`.
     3. **Precision Monospace Accents**: `Share Tech Mono`, `JetBrains Mono`, `Fira Code`, `Space Mono`, `IBM Plex Mono`, `Courier Prime`, `VT323`.
   - **Non-Repeating Typography Cycles**: When generating portfolios iteratively, cycle through distinct typographic identities matching the candidate's archetype (e.g. Systems/Robotics -> `Chakra Petch` + `Space Grotesk` + `Share Tech Mono`; Luxury/Chrono -> `Cinzel Decorative` + `Spectral` + `Space Mono`; Web3/Security -> `VT323` + `Share Tech Mono` + `Fira Code`; Creative Editorial -> `Playfair Display` + `Instrument Serif` + `Courier Prime`). Zero repetition across consecutive generations.
   - Anti-AI-slop heuristics: Reject unmotivated purple/blue gradients, centered hero repetition, and arbitrary glassmorphism. Give every surface authentic material weight (brushed titanium, weathered parchment, obsidian stone, frosted nautical glass, or copper traces).

3. **3D Live Images & Procedural Materials**:
   - Extract reference crops and recreate 3D focal assets using high-end Nano Banana prompts with authentic spatial depth and procedural materials (subsurface scattering, brushed titanium, verdigris brass, iridescent mother-of-pearl, holographic glyphs).
   - Process all 3D assets through alpha background removal (`rembg` / dark-studio alpha matting) yielding clean transparent `_nobg.png` assets with zero halos or dark clipping.
   - Implement organic multi-axis CSS floating keyframes and directional ambient drop-shadows tailored to the theme's lighting source.

4. **Motion Choreography, Shaders & Effects**:
   - Use standard cubic-bezier easing (`power2.out`, `power3.inOut`, `cubic-bezier(0.16, 1, 0.3, 1)`) for all scroll triggers and entrance reveals.
   - Ensure contextual justification for Three.js WebGL/WebGPU canvases (e.g. caustics, starfields, cyber-grids, particle trees).
   - Always implement reduced-motion fallbacks (`prefers-reduced-motion: reduce`) by halting canvas render loops and zeroing out rotational transforms.

5. **Architectural Decisions for Unmentioned Features**:
   - Apply `/agy-customizations` to ensure all new templates, components, and rules are immediately codified in `AGENTS.md` and `.agents/rules/`.
   - Never leak dummy/hardcoded fallback data into generated portfolios.
   - Automatically provide interactive micro-affordances: card lift on hover, interactive sonar/detail modals, audio toggle triggers, and downloadable resume dossiers.

6. **Mandatory 3D, Motion & Scrollytelling Plugin Suite**:
   - Every template generation and render MUST incorporate the authoritative plugin stack:
     - **`lenis`**: Universal smooth inertia scrolling (smooth wheel, responsive touch, and zero lag) synchronized with `gsap.ticker`.
     - **`gsap` & `ScrollTrigger`**: Scroll-driven section pinning, staggered text reveals, velocity skew, and timeline choreography.
     - **`motion`**: Hardware-accelerated spring physics, magnetic CTAs, and layout morphing for detail modals.
     - **`three` & `@react-three/fiber` / `@react-three/drei`**: High-performance spatial 3D viewports, WebGL/WebGPU particles, and interactive 3D model loaders.
     - **`postprocessing` & `@react-three/postprocessing`**: Cinematic shader passes including selective bloom on glowing runes/neon, vignette, and chromatic aberration.
     - **`@theatre/core` & `@theatre/r3f`**: Scrollytelling choreography binding camera fly-throughs, lighting changes, and 3D rotations to user scroll progress.
     - **`ThreeUI (@designcodeio/threeui)`**: MengTo's WebGL & Three.js UI shader library (`https://github.com/MengTo/threeui`). Features production-ready Liquid Metal chromatic shader buttons, Synaptic Constellation living node linkages, Holographic Spark Badges, and 3D Warp Portal background fields.
   - Always implement reduced-motion fallbacks (`prefers-reduced-motion: reduce`) by disabling Lenis smooth wheel and zeroing out rotational transforms.

7. **Always-On Engineering Principle: Ponytail (Lazy Senior Dev Mode)**:
   - **The Ladder (Stop at First Rung that Holds)**:
     1. Does this need to be built at all? (YAGNI). Speculative need = skip it.
     2. Already in this codebase? Reuse existing helpers, utils, and patterns. Look before writing.
     3. Does the standard library do it? Use it.
     4. Does a native platform feature cover it? Native first (CSS over JS, native inputs over bloated libs).
     5. Does an already-installed dependency solve it? Use it. Never add an unrequested dependency.
     6. Can this be one line? Make it one line.
     7. Only then: write the minimum code that works.
   - **Root Cause Fixes**: Fix the shared root function once across all callers rather than patching surface symptoms.
   - **No Unrequested Abstractions**: No factories for one product, no interfaces for one implementation, no boilerplate nobody asked for. Shortest working diff wins.
   - **Leave a Check**: Non-trivial logic must leave ONE runnable check behind (self-check assert or small test file).

8. **Strict Port Constraint (STRICT ZERO PORT 3000 POLICY)**:
   - Under **NO circumstances** should port 3000 ever be used, bound, tested, configured, or suggested in commands, URLs, terminal outputs, or documentation.
   - Port 3000 is strictly reserved for another external project.
   - Always respect the `.env` configuration (`PORT=5050`), or dynamic fallback ports (`5051+`, `10000+`).

9. **Strict Zero Fake Telemetry / Tech Debug Text Rule (NEVER WRITE FAKE TELEMETRY HEADERS)**:
   - Under **NO circumstances** should fake developer telemetry banners, artificial 'LIVE TELEMETRY // ...', fake 'FPS: 60', 'WebGL 2.0', status dots, or developer debug labels be added to cards, hero showcases, or portfolio artifacts.
   - Keep cards and viewports clean, sleek, and focused on real content, visual depth, and natural interactions without fake tech-jargon headers or artificial metrics.

10. **AI Portfolio Identity & Content Engine (Strict Zero Predefined Template Filling Rule)**:
    - **Never fill a predefined template**: Understand WHO the user is first. Build the User Identity Model (role, career stage, technical discipline, positioning) and determine their central story from real evidence.
    - **Strict Zero Fabricated Information**: Never invent employers, metrics, clients, awards, testimonials, or claims. If evidence does not exist, omit the section.
    - **Dynamic Section Architecture**: Select sections based on relevance and proof (Relevance, Evidence, Audience Value, Differentiation). Remove empty or redundant sections.
    - **Content Hierarchy**: Structure into Primary (must-see core evidence), Secondary (supporting credentials), and Supporting (deep dives).
    - **Project Intelligence**: Treat projects as authentic technical case studies (problem, solution, architecture, technical challenge, live demo link) rather than generic thumbnail cards.
    - **Content-First Pipeline**: Follow the strict order: `CONTENT → IDENTITY → STORY → HIERARCHY → SECTION STRUCTURE → VISUAL REPRESENTATION → 3D EXPERIENCE`. MyFolio generates personalized digital worlds around real people, never cookie-cutter templates.

11. **Project Visual Relevancy & Strict Zero Universe Preview Recycling Rule (MANDATORY)**:
    - **NEVER REUSE TEMPLATE / UNIVERSE SHOWCASE THUMBNAILS ON PROJECT CARDS**: Under NO circumstances should project cards in generated portfolios reuse, recycle, or display template/universe preview showcase thumbnails (e.g. `stealth_node_3d.jpg`, `circuit_core_3d.jpg`, `cyber_crystal_3d.jpg`, `botanical_woodcraft_3d.jpg`, `pristine_glass_cube_3d.jpg`, `chrono_obsidian_sanctuary_3d.jpg`, `bio_digital_fusion_3d.jpg`, `cosmic_astronaut_3d.jpg`, etc., which are reserved exclusively for the 3D Visual Universe selection in Studio).
    - **STRICT PROJECT TITLE & DOMAIN RELEVANCY**: Every single project image displayed in a generated portfolio MUST be strictly and contextually relevant to the project's title, technical domain, and actual system content:
      - Encrypted Messaging / Note Dispatch (e.g. "Pass A Note", "Messenger", "Chat") -> MUST display secure peer-to-peer message transmission or encrypted origami cipher visuals (`pass_note_messenger_3d.jpg`). NEVER purple fantasy crystals.
      - Developer Portfolio Generators / WebGL Tooling (e.g. "Ai Portfolio Generator", "Portfolio Generator", "DevFolio") -> MUST display 3D holographic developer workspaces rendering WebGL code viewports (`ai_portfolio_generator_3d.jpg`, `webgl_developer_portfolio_3d.jpg`). NEVER an artisanal wooden tree.
      - Autonomous Edge AI / LLM Reasoning (e.g. "Autonomous Edge Agent", "AI Agent", "RAG Pipeline") -> MUST display autonomous edge neural processing units and server telemetry nodes (`autonomous_edge_agent_3d.jpg`). NEVER a botanical tree.
      - Algorand / Smart Contracts (e.g. "Algorand Python Smart Contracts", "Smart Contracts", "EVM DApp") -> MUST display Algorand decentralized algorithmic block consensus and smart contract execution architecture (`algorand_smart_contracts_3d.jpg`, `algorand_escrow_protocol_3d.jpg`). NEVER a template universe icon.
      - Decentralized Privacy / Compliance (e.g. "ConsentChain", "Privacy Vault", "DPDP Compliance") -> MUST display cryptographic privacy shields and compliance verification networks (`consent_chain_privacy_3d.jpg`).
      - LMS / User Administration / Systems (e.g. "Lms User Management", "Student Records", "Admin Hub") -> MUST display educational LMS server racks with user access credentials and database matrices (`lms_user_management_3d.jpg`, `student_database_manager_3d.jpg`).
      - Cloud Architecture & API Gateways -> MUST display distributed load-balanced container networks (`cloud_microservices_gateway_3d.jpg`).
      - Security, Zero-Knowledge & Auth -> MUST display biometric access vaults and authentication shields (`cybersecurity_auth_vault_3d.jpg`).
      - Video / Media Pipelines -> MUST display automated media rendering pipelines (`youtube_shorts_bot_3d.jpg`).
      - Fintech & Risk Engines -> MUST display financial risk terminals and payment ledgers (`loan_approval_finance_3d.jpg`).
      - Climate & Geospatial -> MUST display planetary geospatial telemetry sensors (`forest_fire_climate_3d.jpg`).
    - **Semantic Relevancy Matching Guarantee**: The system must enforce high-affinity keyword and title classification matching. If a project title mentions notes/messaging, it receives messaging artwork; if it mentions portfolio/generator, it receives developer tooling artwork; if it mentions smart contracts/crypto, it receives blockchain ledger artwork. Zero visual-semantic mismatch.

12. **Template Hero Section Preview Standard (Strict Zero Generated / Mismatched AI Images for Templates - MANDATORY)**:
    - **NEVER GENERATE AI IMAGES FOR TEMPLATES**: Under NO circumstances should AI image generation tools (`generate_image`, etc.) be used to create synthetic, abstract, or fantasy preview thumbnails for portfolio templates in Web Studio, Dashboard, template showcases, or registries.
    - **AUTHENTIC HERO SECTION AS TEMPLATE IMAGE**: For ALL templates (both current and any implemented in the future), the template showcase image, thumbnail, and catalog card MUST be an authentic screenshot/capture of the template's actual **Hero Section** (the top hero fold as rendered in the browser).
    - **Standardized Asset Storage**: All template hero preview captures must be saved to `/assets/templates/<template-id>-hero.webp` (with high-quality `.jpg` fallback) synchronized across both `public/assets/templates/` and `web/assets/templates/`.
    - **Template Addition Protocol**: Whenever a new template is created or implemented, immediately capture its real hero section (via automated headless capture or high-fidelity viewport screenshot) and bind it directly to the template's `thumbnail` property, Web Studio cards, and Dashboard showcases.

## Standard Operating Procedure for Template Additions

For **ANY** future template addition or redesign, you MUST strictly follow this mandatory pipeline:

1. **Section Breakdown**:
   - Split the source design/reference into distinct semantic sections (e.g., 01 Hero Stage, 02 About Sonar / Mission, 03 Project Chests / Vaults, 04 Skills Matrix / Tree, 05 Experience Timeline / Nautical Drift, 06 Resume Cartography / Dossier, 07 Articles / Sea Chests, 08 Contact Beacon / Terminal, 09 Dedicated 404 Spatial Monolith, Footer).

2. **3D Asset & Background Identification**:
   - Identify all primary 3D visual focal points (e.g., robotic hands, cyber iris lenses, isometric circuit motherboards, floating glass credentials, low-poly creatures, quantum cores, 3D characters, iridescent nautilus shells, submarine portholes, brass treasure chests, bioluminescent coral trees, giant squids, antique compasses).
   - Identify the background environment (Three.js canvas, particle field, radial space grid, cyber sprawl, underwater ocean caustic mesh).

3. **Asset Extraction & Nano Banana 3D Recreation (Strict Zero Flat SVGs / Stick Figures Rule)**:
   - Extract the reference crop/bounding box of the focal element from the source portfolio design.
   - **Send to Nano Banana**: Use `generate_image` with procedural 3D spatial prompts to enhance and synthesize a brand new ultra-high-quality 3D asset (authentic spatial depth, procedural subsurface scattering, brushed titanium, glowing neon wiring, iridescent mother-of-pearl, antique nautical brass) under cinematic studio lighting.
   - **CRITICAL MANDATE - ZERO FLAT SVGS / PRIMITIVE LINES**: Under NO circumstances should flat 2D SVGs, stickmen, primitive vector paths, or basic line drawings be used as placeholders for 3D elements (such as cyborg holograms, gyroscopes, skill radar charts, or career trees). Every visual focal element across all templates (existing and future) MUST be generated as an authentic 3D spatial asset by Gemini Nano Banana or a fully interactive 3D WebGL mesh.

4. **Background Removal & Portfolio Insertion**:
   - Process all generated 3D images through the clean background removal pipeline (`rembg` / dark-studio alpha matting).
   - Output authentic transparent alpha PNGs (`_nobg.png`) with zero dark halos, clipping, or bounding boxes.
   - Deploy the transparent PNGs to both `public/assets/designs/<theme>/` and `web/assets/designs/<theme>/`.
   - Insert the clean 3D asset into the portfolio template with CSS floating keyframes and ambient directional glow.

5. **Apple Canvas-Like Scrollytelling Standard**:
   - Hero and narrative showcases MUST feature an **Apple-style canvas scroll animation**:
     - Pinned scroll track (`pin: true`, generous scroll depth like `250vh` - `350vh`, smooth `scrub: 1` or `1.2`).
     - WebGL / Three.js canvas where camera position, Z-depth fly-through, and 3D rotational geometry are directly driven by user scroll progress.
     - Synchronized milestone narrative/telemetry overlays that enter, pin, and crossfade smoothly as the user travels through the spatial 3D canvas.

6. **Volumetric Living Background Standard (No Plain Revolving Dots)**:
   - Reject plain empty space backgrounds with isolated revolving dots.
   - Backgrounds MUST be living volumetric environments: dynamic neural constellation networks with distance-threshold synaptic connecting lines, deep-field particle nebulae, interactive ocean caustics, or reactive cyber grids with undulating wave passes.

5. **3D Treasure Chest Multi-Variant Standard**:
   - In oceanic, curio, exploration, and archival templates, **each project card MUST be rendered as an authentic 3D Treasure Chest / Vault**.
   - Cycle through distinct 3D lid/chest variants (`treasure_chest_wheel_nobg.png`, `chest_compass_lid_nobg.png`, `chest_wheel_lid_nobg.png`) across project items so no two adjacent cards look identical.
   - Include authentic physical micro-interactions: rotational steer on hover, subtle chest opening/glow elevation, "Inspect Artifact ↗", and modal "Sonar Scan ✦".

6. **Dedicated 404 Route Decoupling**:
   - **NEVER append the 404 error page to the main single-page scroll layout.**
   - The 404 page is rendered exclusively on 404 HTTP routes via `TemplateRegistry.render404Page(templateId, candidateData)`.
   - The 404 page must feature its own themed 3D center focal asset (e.g. `stone_404_nobg.png` with nautical compass, or `quantum_cube_nobg.png`), themed error typography ("NAUTICAL COURSE LOST // 404"), and a clear "Return to Base" action.

7. **Strict Zero Hardcoded Content Policy**:
   - **NO hardcoded dummy/mock content** may be displayed in generated portfolios.
   - All text, candidate titles, biographies, skill tags, project cards, experience items, education, verified certifications, contact coordinates, and social links MUST dynamically bind to the user's parsed candidate data (`data.name`, `data.title`, `data.bio`, `data.skills`, `data.projects`, `data.experience`, `data.education`, `data.certifications`, `data.contact`).
   - If optional fields are absent, gracefully omit or adapt the section without leaking dummy placeholder text.

8. **Universal Motion, 3D & Scrollytelling Standard**:
   - All templates automatically inherit the unified `UniversalScrollMotion` pipeline:
     - Mount **`lenis`** smooth inertia scrolling with `gsap.ticker` synchronization.
     - Provide 3D card tilt physics with perspective (`preserve-3d`) and dynamic specular lighting.
     - Implement continuous 3D rotation and scrub for hero stages on scroll up and down.
     - Provide **`@theatre/core`** scrollytelling camera spline hooks (`__folioScrollytelling.bindCameraToScroll`).
     - Always respect `prefers-reduced-motion: reduce` by disabling smooth wheel and zeroing transform rotations.

---

## Visual Template Model Knowledge Base (Catalog & Persona Matrix)

Antigravity models must draw from this standardized catalog when generating, matching, or styling portfolios:

### 1. Cyber-Architect Sprawl (`cyber-architect-sprawl`)
- **Aesthetic DNA**: High-fidelity cyberpunk engineering sprawl, isometric architecture, glowing holographic schematics.
- **Color Palette**: Void `#05050A`, Neon Magenta `#FF007A`, Electric Cyan `#00F0FF`, Circuit Amber `#FFB800`, Grid Slate `#1F293D`.
- **Typography**: Display `Syne` & `Orbitron`, Body `Inter`, Mono `JetBrains Mono`.
- **3D Assets**: `robotic_hand_3d_nobg.png`, `cyber_iris_lens_nobg.png`, `circuit_motherboard_nobg.png`, `quantum_core_3d_nobg.png`.
- **Key Features**: Holographic 3D cyber hand stage, live ping terminal, interactive holographic blueprints, floating credential badges, spatial audio switch.
- **Recommended For**: Systems Architects, DevOps/SRE, Web3 Core Devs, Game Engine Engineers, Cyber Security Specialists.

### 3. Swiss Editorial Monograph (`swiss-editorial-monograph`)
- **Aesthetic DNA**: High-fashion editorial brutalism, strict typographic grid, museum exhibition curation.
- **Color Palette**: Warm Canvas `#F4F3EF`, Editorial Black `#0A0A0A`, Vermilion Accent `#FF3B30`, Muted Stone `#8E8E93`.
- **Typography**: Display `Playfair Display`, Body `Instrument Serif` & `Inter`, Mono `Space Mono`.
- **Key Features**: Asymmetric typographic mastheads, stark high-contrast imagery, archival index cards, tactile scroll progress bar.
- **Recommended For**: Creative Directors, UX Architects, Design Technologists, Editorial Writers, Typographic Designers.

### 4. Solarpunk Horizon (`solarpunk-horizon`)
- **Aesthetic DNA**: Lush utopian ecology, solar-powered clean technology, biophilic stained glass.
- **Color Palette**: Eco Obsidian `#0C1810`, Leaf Emerald `#10B981`, Solar Amber `#F59E0B`, Sky Aqua `#06B6D4`, Sunlight Cream `#FEF3C7`.
- **Typography**: Display `Outfit`, Body `Plus Jakarta Sans`, Mono `Fira Code`.
- **Key Features**: Biophilic foliage animations, floating solar rings, energy telemetry gauges, greenhouse project vitrines.
- **Recommended For**: Climate Tech Engineers, Green Energy Researchers, Biotech Founders, Sustainable AI Pioneers.

### 5. Chrono-Obsidian Sanctuary (`chrono-obsidian-sanctuary`)
- **Aesthetic DNA**: Temporal dark luxury, astronomical timekeeping, obsidian stone with liquid gold.
- **Color Palette**: Obsidian Void `#070709`, Celestial Gold `#D4AF37`, Horizon Azure `#38BDF8`, Starlight White `#F8FAFC`.
- **Typography**: Display `Cinzel`, Body `Inter`, Mono `Space Mono`.
- **Key Features**: Astrolabe gear telemetry, chronological career pendulum, etched gold runes, starlight particles.
- **Recommended For**: AI Researchers, FinTech Quants, Blockchain Protocol Engineers, Luxury Brand Technologists.

### 6. Neon Aurora Cyber (`neon-aurora-cyber`)
- **Aesthetic DNA**: Cyber-minimalist aurora borealis, midnight velvet with flowing wave fields.
- **Color Palette**: Midnight `#0A051B`, Aurora Violet `#8B5CF6`, Cyan Flare `#06B6D4`, Electric Pink `#EC4899`.
- **Typography**: Display `Syncopate`, Body `Plus Jakarta Sans`, Mono `JetBrains Mono`.
- **Recommended For**: Frontend Wizards, Creative Coders, Generative Artists, Interaction Designers.

### 7. Circuit Core (`circuit-core`)
- **Aesthetic DNA**: Industrial hardware engineering, copper PCB traces, dark solder mask, polished brass.
- **Color Palette**: Substrate `#080C0E`, Polished Brass `#D97706`, Trace Teal `#14B8A6`, Soldermask Green `#047857`.
- **Typography**: Display `Chakra Petch`, Body `IBM Plex Sans`, Mono `IBM Plex Mono`.
- **Recommended For**: Embedded Systems, Robotics Engineers, Firmware Developers, IoT Architects.

### 8. Kinetic Brutalism (`kinetic-brutalism`)
- **Aesthetic DNA**: Bold high-contrast zine aesthetic, stark yellow and black, thick neo-brutalist borders.
- **Color Palette**: Acid Yellow `#FDE047`, Ink Black `#09090B`, Clean White `#FFFFFF`, Halftone Red `#EF4444`.
- **Typography**: Display `Syne` (Black 900), Body `Space Grotesk`, Mono `Space Mono`.
- **Recommended For**: Full-Stack Hackers, Indie Hackers, Growth Engineers, High-Energy Founders.

### 9. Stealth Node (`stealth-node`)
- **Aesthetic DNA**: Web3 cypherpunk command line interface, phosphor green CRT phosphor glow, dark telemetry.
- **Color Palette**: Terminal Void `#040D06`, Phosphor Green `#22C55E`, Matrix Mint `#86EFAC`, Signal Amber `#F59E0B`.
- **Typography**: Display `VT323` & `Share Tech Mono`, Body `Fira Code`, Mono `JetBrains Mono`.
- **Recommended For**: Cryptographers, Smart Contract Auditors, Penetration Testers, Security Researchers.

### 10. Abyssal Ascent (`abyssal-ascent`)
- **Aesthetic DNA**: Dark fantasy RPG codex, gilded dungeon stone, runic gold sigils, deep velvet crimson.
- **Color Palette**: Dungeon Ash `#0A080C`, Runic Gold `#EAB308`, Crimson Blood `#991B1B`, Relic Parchment `#E2E8F0`.
- **Typography**: Display `MedievalSharp` / `Cinzel`, Body `Spectral`, Mono `Cormorant Garamond`.
- **Recommended For**: Game Developers, Narrative Designers, Fantasy Illustrators, 3D Worldbuilders.

### 11. Stellar Architect (`stellar-architect`)
- **Aesthetic DNA**: Deep navy celestial blueprint, astronomical coordinates, astrolabe rings, orbital mechanics.
- **Color Palette**: Deep Cosmos `#04091A`, Cyan Blueprint `#38BDF8`, Solar Gold `#FBBF24`, Deep Void `#02040A`.
- **Typography**: Display `Orbitron`, Body `Outfit`, Mono `Space Mono`.
- **Recommended For**: Aerospace Engineers, Data Visualization Scientists, Cloud Infrastructure Engineers.

### 12. Cosmic Cyber Geometry (`cosmic-cyber-geometry`)
- **Aesthetic DNA**: Sacred cyber geometry, prismatic amethyst crystals, floating platonic polyhedra.
- **Color Palette**: Obsidian `#05020C`, Amethyst Prism `#A855F7`, Hologram Cyan `#22D3EE`, Neon Crimson `#F43F5E`.
- **Typography**: Display `Rajdhani`, Body `Inter`, Mono `JetBrains Mono`.
- **Recommended For**: 3D Graphics Engineers, Shader Artists, Computer Vision Engineers.

### 13. Engineering Archive (`engineering-archive`)
- **Aesthetic DNA**: Swiss blueprint technical drafting, millimeter grid paper, cyan cyanotype, crisp registration marks.
- **Color Palette**: Blueprint Blue `#0B2545`, Drafting Cyan `#134074`, Grid White `#EEF4F8`, Signal Orange `#EE6C4D`.
- **Typography**: Display `Space Grotesk`, Body `Inter`, Mono `Space Mono`.
- **Recommended For**: Mechanical Engineers, CAD Specialists, Structural Designers, Precision Engineers.

### 14. System Awakening (`system-awakening`)
- **Aesthetic DNA**: Solo Leveling hunter status window, glowing purple mana runes, quest log telemetry.
- **Color Palette**: Mana Void `#080417`, Hunter Violet `#8B5CF6`, S-Rank Gold `#F59E0B`, Shadow Black `#02010A`.
- **Typography**: Display `Teko` & `Orbitron`, Body `Inter`, Mono `Fira Code`.
- **Recommended For**: Competitive Programmers, Full-Stack Powerhouses, Algorithm Specialists.

### 15. Eco-Tech Steampunk (`eco-tech-steampunk`)
- **Aesthetic DNA**: Hand-turned brass gears, vacuum tubes, mossy copper, warm glowing Edison bulbs.
- **Color Palette**: Dark Walnut `#1A1108`, Antique Brass `#C59B27`, Copper Patina `#2E8B57`, Edison Amber `#FFB703`.
- **Typography**: Display `Cinzel Decorative`, Body `Cinzel`, Mono `Courier Prime`.
- **Recommended For**: Hardware Hackers, Maker Culture, Vintage Enthusiasts, Creative Engineers.

### 16. Cosmic Astronaut Studio (`cosmic-astronaut`)
- **Aesthetic DNA**: Deep interstellar nebula, floating 3D astronaut helmet, zero-gravity orbital dust.
- **Color Palette**: Space Dark `#030712`, Starlight Blue `#38BDF8`, Solar Flare `#F97316`, Nebula Purple `#A855F7`.
- **Typography**: Display `Syne`, Body `Inter`, Mono `JetBrains Mono`.
- **Recommended For**: Explorers, Space Tech, High-Altitude Telemetry, Mission-Driven Founders.

### 17. Cyber Crystal Studio (`cyber-crystal`)
- **Aesthetic DNA**: Prismatic quartz crystals, dark glassmorphism, iridescent refractions.
- **Color Palette**: Dark Obsidian `#0B0F19`, Crystal Ice `#E0F2FE`, Neon Indigo `#6366F1`, Emerald Spark `#10B981`.
- **Typography**: Display `Outfit`, Body `Plus Jakarta Sans`, Mono `JetBrains Mono`.
- **Recommended For**: Product Designers, Web3 Builders, SaaS Founders.

### 18. Bioluminescent Eco-Tech (`bioluminescent-wireframe`)
- **Aesthetic DNA**: Deep ocean neon wireframes, glowing particle networks, underwater bio-intelligence.
- **Color Palette**: Ocean Trench `#020B14`, Neon Mint `#00F5D4`, Deep Blue `#0369A1`, Biolume Green `#4ADE80`.
- **Typography**: Display `Chakra Petch`, Body `Inter`, Mono `Space Mono`.
- **Recommended For**: Data Scientists, Bioinformaticians, Network Engineers.

### 19. Botanical Woodcraft Codex (`botanical-woodcraft`)
- **Aesthetic DNA**: Warm cedar timber, hand-carved leaf veins, organic earth tones, tactile woodwork.
- **Color Palette**: Deep Forest `#0F1A12`, Warm Cedar `#8B5A2B`, Leaf Green `#2D6A4F`, Parchment Gold `#D4A373`.
- **Typography**: Display `Playfair Display`, Body `Plus Jakarta Sans`, Mono `Courier Prime`.
- **Recommended For**: Craft Artisans, Sustainability Advocates, Organic Brands.

### 20. Bio-Digital Circuit Fusion (`bio-digital-fusion`)
- **Aesthetic DNA**: Synaptic neuron tree, glowing cyber DNA helix, electric teal and lime circuits.
- **Color Palette**: Neuro Void `#050D10`, Synapse Teal `#06B6D4`, Neural Lime `#84CC16`, Core White `#F8FAFC`.
- **Typography**: Display `Syne`, Body `Inter`, Mono `JetBrains Mono`.
- **Recommended For**: Neuroscientists, AI Bio-Engineers, Computational Biologists.

### 21. Emerald Cyber Sanctuary (`emerald-cyber-sanctuary`)
- **Aesthetic DNA**: Deep obsidian and neon mint cyber jungle with 3D biodome laboratory.
- **Color Palette**: Obsidian Jungle `#040D08`, Neon Mint `#10B981`, Bio Gold `#F59E0B`, Dark Glass `#0B2014`.
- **Typography**: Display `Plus Jakarta Sans`, Body `Inter`, Mono `Fira Code`.
- **Recommended For**: CleanTech, Environmental AI, Forestry Telemetry.

### 22. Pristine White Crystal (`pristine-white-crystal`)
- **Aesthetic DNA**: Ultra-clean architectural titanium white, floating diamond facets, crisp shadows.
- **Color Palette**: Pure Titanium `#F8FAFC`, Crisp Slate `#0F172A`, Diamond Aqua `#0EA5E9`, Soft Platinum `#E2E8F0`.
- **Typography**: Display `Syne`, Body `Plus Jakarta Sans`, Mono `JetBrains Mono`.
- **Recommended For**: Minimalist Architects, Executive Founders, FinTech Leaders.

### 23. Abyssal Quantum Jellyfish (`abyssal-quantum-jellyfish`)
- **Aesthetic DNA**: Deep oceanic abyss, translucent glowing jellyfish, floating depth particles.
- **Color Palette**: Oceanic Abyss `#010814`, Jellyfish Cyan `#22D3EE`, Quantum Violet `#C084FC`, Deep Navy `#031E38`.
- **Typography**: Display `Cinzel Decorative`, Body `Inter`, Mono `Space Mono`.
- **Recommended For**: Deep Learning Researchers, Marine Scientists, Cloud Architects.

### 24. Mahogany Brass Steampunk (`mahogany-brass-steampunk`)
- **Aesthetic DNA**: Rich dark walnut woodcraft, brass toggle switches, curio cabinet projects.
- **Color Palette**: Dark Walnut `#180E08`, Polished Brass `#D97706`, Curio Green `#166534`, Amber Glass `#F59E0B`.
- **Typography**: Display `Cinzel`, Body `Spectral`, Mono `Courier Prime`.
- **Recommended For**: Hardware Artisans, Antique Collectors, Mechanical Engineers.

### 25. Lavender Cyber Bridge (`lavender-cyber-bridge`)
- **Aesthetic DNA**: Cybernetic command bridge, lavender cyber avatar, crystal icosahedron.
- **Color Palette**: Deep Space `#0B0817`, Hologram Lavender `#C084FC`, Bridge Azure `#38BDF8`, Warp Pink `#F472B6`.
- **Typography**: Display `Orbitron`, Body `Inter`, Mono `JetBrains Mono`.
- **Recommended For**: VR/AR Developers, Metaverse Architects, Creative Technologists.

### 26. Sand Parchment Botanical (`sand-parchment-botanical`)
- **Aesthetic DNA**: Warm sand parchment, pine timber woodcraft, carved botanical rings.
- **Color Palette**: Warm Sand `#F7F4EB`, Pine Bark `#3E2723`, Sage Leaf `#558B2F`, Sun Amber `#FF8F00`.
- **Typography**: Display `Playfair Display`, Body `Plus Jakarta Sans`, Mono `Courier Prime`.
- **Recommended For**: Herbalists, Botanical Researchers, Traditional Craft Makers.

### 27. ThreeUI Synaptic Constellation (`threeui-constellation`)
- **Aesthetic DNA**: High-density volumetric neural constellation, living particle nodes with pointer gravitational attraction and distance-threshold quantum linkages.
- **Color Palette**: Celestial Void `#070914`, Celestial Gold `#E6C879`, Starlight Cyan `#7FC4FF`, Surface Slate `#0E1222`.
- **Typography**: Display `Outfit`, Body `Space Grotesk`, Mono `Space Mono`.
- **Key Features**: ThreeUI Synaptic Constellation living particle network, status indicator, interactive project vault, cognitive capability tree, zero lag.
- **Recommended For**: Neural Systems Architects, AI Research Scientists, Distributed Systems Engineers, Quantum Computing Researchers.

### 28. ThreeUI Liquid Metal Dispersion (`threeui-liquid-metal`)
- **Aesthetic DNA**: Computational luxury editorial, laminar liquid metal dispersion GLSL shader with rainbow spectral plateau fringing and multi-pass ripple wave dynamics.
- **Color Palette**: Obsidian Luxury `#060709`, Liquid Chrome `#E2E8F0`, Horizon Amber `#F59E0B`, Spectral Violet `#A855F7`.
- **Typography**: Display `Playfair Display`, Body `Instrument Serif` & `Inter`, Mono `Share Tech Mono`.
- **Key Features**: ThreeUI Liquid Metal dispersion button stage with real-time GLSL evaluation, ambient chrome pool, curated artifact vault.
- **Recommended For**: Principal Design Technologists, Creative Directors, Shader Engineers, Luxury Brand Technologists.

### 29. ThreeUI Quantum Matrix (`threeui-matrix`)
- **Aesthetic DNA**: High-frequency cryptographic protocol substrate, WebGL procedural lightning shader with reactive electrical arc vectors, coordinate telemetry, and sub-millisecond state runtimes.
- **Color Palette**: Carbon Substrate `#040507`, Electric Cyan `#5DCDE0`, Radiant Magenta `#D352C4`, Matrix Mint `#22C55E`.
- **Typography**: Display `Orbitron` & `Chakra Petch`, Body `IBM Plex Sans`, Mono `JetBrains Mono`.
- **Key Features**: ThreeUI Quantum Matrix WebGL procedural lightning shader, real-time coordinate tracking, zero-GC memory architecture manifesto, verified systems registry.
- **Recommended For**: Distributed Systems Architects, Protocol Engineers, Cryptographers, Web3 Core Developers.

### 30. RBP Kinetic Monochrome (`rbp-kinetic-monochrome`)
- **Aesthetic DNA**: Inspired by DavidHDev/rbp-portfolio. Signature calm monochrome design system with aspect-correct WebGL flow shader backdrop, interactive WebGL displacement ripple/warp morphing portrait with magnetic cursor follow, Matter.js interactive physics skills chips, expandable experience accordion, and shader-backed contact card.
- **Color Palette**: Void Black `#0A0A0A`, Stark White `#FAFAFA`, Substrate Gray `#171717`, Border Stone `#262626`.
- **Typography**: Display `Inter` & `Outfit`, Body `Inter` & `Plus Jakarta Sans`, Serif Accent `Fraunces`, Mono `JetBrains Mono`.
- **Key Features**: WebGL Flow Shader background, interactive WebGL displacement morphing portrait with dual male (`josh.webp`/`josh_wave.webp`) and female (`maya.webp`/`maya_wave.webp`) AI character sets, interactive avatar switcher pill `[ 👦 Josh | 👧 Maya | 📷 Photo ]`, Matter-like colliding physics tech chips with gravity reset, Dribbble-style project showcase cards, and click-to-copy email contact terminal.
- **Recommended For**: Design Engineers, Product Designers, Frontend & Full-Stack Developers, Creative Technologists, Indie Founders.

---

## Website Creation Guidelines

When building or scaffolding a website, landing page, portfolio, or web application:
- **Use the `/design` command**: Always trigger `/design` (or the UI/UX design intelligence workflow) before writing markup or code.
- **Figma MCP Integration**: Whenever a user provides a Figma URL or references a Figma design, leverage the Figma MCP / `FigmaService` to extract authentic color tokens, typography scales, vector SVGs, and component structures directly into the frontend.
- **Design System First**: Generate and establish the design system (color palette, typography pairings, spacing scale, UI style, animation tokens, and UX guidelines).
- **Adhere to Tokens**: Build the frontend strictly adhering to the generated design tokens for maximum visual quality and consistency.
- **Non-Repeating Exhaustive Cycles**: When generating portfolios iteratively, cycle through distinct color palettes, typography scales, and 3D WebGL background/foreground objects without repeating any element until all alternatives are exhausted.
