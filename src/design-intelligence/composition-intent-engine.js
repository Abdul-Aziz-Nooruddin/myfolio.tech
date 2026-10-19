/**
 * 🏛️ Composition Intent Engine (Phase 38)
 * Derives multi-dimensional developer evidence signals and maps them to tailored
 * Information Architecture Grammars, Page Topologies, Dynamic Vocabulary, and Evidence Plans.
 */

const { InformationArchitectureGrammars, IA_GRAMMARS } = require('./information-architecture-grammars');

class CompositionIntentEngine {
  /**
   * Derives 14 deep semantic evidence dimensions from user content or CanonicalEvidenceModel
   * @param {Object} profile - Normalized profile or CanonicalEvidenceModel
   * @returns {Object} Semantic evidence intent profile
   */
  static deriveIntent(profile = {}) {
    const isCanonical = Boolean(profile.work && profile.identity);
    
    const roleLower = String(isCanonical ? (profile.identity.role?.value || profile.identity.role || '') : (profile.role || '')).toLowerCase();
    const bioLower = String(isCanonical ? (profile.identity.bio?.value || profile.identity.bio || '') : (profile.bio || '')).toLowerCase();
    const taglineLower = String(isCanonical ? (profile.identity.tagline?.value || profile.identity.tagline || '') : (profile.tagline || '')).toLowerCase();
    
    const rawSkills = profile.skills || [];
    const skillsText = Array.isArray(rawSkills) 
      ? rawSkills.join(' ').toLowerCase() 
      : String(rawSkills).toLowerCase();
    
    const projects = Array.isArray(isCanonical ? profile.work : profile.projects) ? (isCanonical ? profile.work : profile.projects) : [];
    const experience = Array.isArray(isCanonical ? profile.career : profile.experience) ? (isCanonical ? profile.career : profile.experience) : [];
    const education = Array.isArray(isCanonical ? profile.education : profile.education) ? (isCanonical ? profile.education : profile.education) : [];
    const research = Array.isArray(isCanonical ? profile.research : profile.publications) ? (isCanonical ? profile.research : profile.publications) : [];

    // 1. Project Count & Depth
    const projectCount = projects.length;
    let projectDepth = 'compact';
    const totalProjectDescLength = projects.reduce((acc, p) => acc + (p.desc || p.description || '').length, 0);
    if (projectCount >= 3 && totalProjectDescLength > 350) projectDepth = 'deep';
    else if (projectCount >= 2 || totalProjectDescLength > 150) projectDepth = 'moderate';
    else if (projectCount === 0) projectDepth = 'minimal';

    // 2. Technical Evidence
    let technicalEvidence = 'standard';
    const deepTechTokens = ['rust', 'c++', 'kernel', 'ebpf', 'distributed', 'raft', 'cuda', 'compiler', 'assembly', 'tokio', 'consensus', 'microarchitecture', 'concurrency', 'gpu'];
    const highTechTokens = ['kubernetes', 'docker', 'go', 'python', 'typescript', 'grpc', 'graphql', 'aws', 'terraform', 'postgresql', 'redis', 'kafka'];
    const deepMatches = deepTechTokens.filter(t => skillsText.includes(t) || bioLower.includes(t) || roleLower.includes(t)).length;
    const highMatches = highTechTokens.filter(t => skillsText.includes(t) || bioLower.includes(t) || roleLower.includes(t)).length;
    if (deepMatches >= 2) technicalEvidence = 'deep';
    else if (deepMatches >= 1 || highMatches >= 3) technicalEvidence = 'high';
    else if (highMatches >= 1) technicalEvidence = 'moderate';

    // 3. Visual & Creative Evidence
    let visualEvidence = 'low';
    const visualTokens = ['three.js', 'webgl', 'glsl', 'shader', 'figma', 'ui/ux', 'design', 'animation', 'creative developer', 'photographer', '3d', 'render', 'blender', 'canvas'];
    const visualMatches = visualTokens.filter(t => skillsText.includes(t) || bioLower.includes(t) || roleLower.includes(t)).length;
    const hasProjectImages = projects.some(p => p.image || p.screenshot || p.visualEvidence);
    if (visualMatches >= 2 || (visualMatches >= 1 && hasProjectImages)) visualEvidence = 'high';
    else if (visualMatches >= 1 || hasProjectImages) visualEvidence = 'moderate';

    // 4. Research Evidence
    let researchEvidence = 'none';
    const researchTokens = ['ph.d.', 'phd', 'arxiv', 'paper', 'publication', 'citation', 'research', 'ieee', 'acm', 'neural', 'transformer', 'algorithm', 'investigation'];
    const researchMatches = researchTokens.filter(t => skillsText.includes(t) || bioLower.includes(t) || roleLower.includes(t) || education.some(e => String(e.degree).toLowerCase().includes('ph'))).length;
    if (researchMatches >= 2 || research.length > 0 || education.some(e => String(e.degree).toLowerCase().includes('ph'))) researchEvidence = 'academic';
    else if (researchMatches >= 1) researchEvidence = 'applied_research';

    // 5. Experience Depth
    let experienceDepth = 'early';
    const expCount = experience.length;
    if (roleLower.includes('principal') || roleLower.includes('architect') || roleLower.includes('staff') || roleLower.includes('fellow') || roleLower.includes('director') || roleLower.includes('vp') || roleLower.includes('founder') || expCount >= 4) {
      experienceDepth = 'veteran';
    } else if (roleLower.includes('senior') || roleLower.includes('lead') || expCount >= 2) {
      experienceDepth = 'mid';
    } else if (roleLower.includes('intern') || roleLower.includes('student') || bioLower.includes('student') || (expCount === 0 && education.length > 0)) {
      experienceDepth = 'student';
    }

    // 6. Education Depth
    let educationDepth = 'bachelors';
    if (education.some(e => String(e.degree).toLowerCase().includes('ph.d') || String(e.degree).toLowerCase().includes('doctor'))) educationDepth = 'phd';
    else if (education.some(e => String(e.degree).toLowerCase().includes('master') || String(e.degree).toLowerCase().includes('m.s') || String(e.degree).toLowerCase().includes('msc'))) educationDepth = 'masters';
    else if (education.length === 0) educationDepth = 'self-taught';

    // 7. Repository Depth
    let repositoryDepth = 'moderate';
    const hasGithub = Boolean(profile.github || profile.github_username || profile.identity?.githubUsername?.value);
    const starCount = projects.reduce((acc, p) => acc + (parseInt(p.stars, 10) || 0), 0);
    if (hasGithub && (starCount > 100 || projectCount >= 4)) repositoryDepth = 'heavy_oss';
    else if (!hasGithub && projectCount <= 1) repositoryDepth = 'minimal';

    // 8. Dominant Work Type
    let dominantWorkType = 'fullstack_web';
    if (researchEvidence === 'academic' || roleLower.includes('researcher') || roleLower.includes('scientist')) dominantWorkType = 'ai_ml_research';
    else if (roleLower.includes('security') || roleLower.includes('crypt') || roleLower.includes('exploit')) dominantWorkType = 'security_network';
    else if (technicalEvidence === 'deep' || roleLower.includes('kernel') || roleLower.includes('systems') || roleLower.includes('distributed') || roleLower.includes('backend')) dominantWorkType = 'systems_kernel';
    else if (visualEvidence === 'high' || roleLower.includes('3d') || roleLower.includes('creative') || roleLower.includes('photographer')) dominantWorkType = 'creative_visual';
    else if (roleLower.includes('devops') || roleLower.includes('sre') || roleLower.includes('infrastructure') || roleLower.includes('cloud')) dominantWorkType = 'devops_cloud';
    else if (roleLower.includes('design') || roleLower.includes('ui/ux') || roleLower.includes('product designer')) dominantWorkType = 'design_systems';
    else if (roleLower.includes('robot') || roleLower.includes('hardware') || roleLower.includes('embedded')) dominantWorkType = 'embedded_robotics';

    // 9. Career Stage (Honors verified CareerStageAssessment and authentic signals)
    let careerStage = profile.careerStage || profile.authenticityGuarantee?.careerStage || 'mid_engineer';
    if (profile.careerStage) {
      careerStage = profile.careerStage === 'junior' ? 'junior_dev' : (profile.careerStage === 'lead_architect' ? 'principal_architect' : profile.careerStage);
    } else if (experienceDepth === 'student' || roleLower.includes('student') || bioLower.includes('student')) {
      careerStage = 'student';
    } else if (experienceDepth === 'veteran') {
      careerStage = 'principal_architect';
    } else if (experienceDepth === 'early') {
      careerStage = 'junior_dev';
    } else if (dominantWorkType === 'ai_ml_research') {
      careerStage = 'academic_researcher';
    } else if (dominantWorkType === 'design_systems') {
      careerStage = 'lead_designer';
    }

    // 10. Profile Completeness (0 - 100)
    let completeness = 30;
    if (profile.name || profile.identity?.name?.value) completeness += 10;
    if (profile.role || profile.identity?.role?.value) completeness += 10;
    if (profile.bio || profile.identity?.bio?.value) completeness += 10;
    if (projectCount >= 2) completeness += 20;
    if (experience.length >= 1) completeness += 10;
    if (skillsText.length > 10) completeness += 10;

    return {
      projectCount,
      projectDepth,
      visualEvidence,
      technicalEvidence,
      researchEvidence,
      experienceDepth,
      educationDepth,
      repositoryDepth,
      dominantWorkType,
      careerStage,
      profileCompleteness: Math.min(100, completeness)
    };
  }

  /**
   * Recommends complete Information Architecture, Page Topology, and Vocabulary
   * @param {Object} intent
   * @returns {Object} { iaGrammar, compatibleTopologies, recommendedSectionSequence, recommendedOpeningTopology, vocabularyPlan }
   */
  static recommendCompositionGrammar(intent = {}) {
    const iaGrammar = InformationArchitectureGrammars.selectBestGrammar(intent);
    const { dominantWorkType, careerStage, researchEvidence, visualEvidence } = intent;

    let compatibleTopologies = ['edge-to-edge-editorial', 'asymmetric-split-canvas'];
    let recommendedOpeningTopology = 'editorial-thesis';

    if (dominantWorkType === 'systems_kernel' || dominantWorkType === 'security_network') {
      compatibleTopologies = ['command-console-interface', 'vertical-identity-rail', 'asymmetric-split-canvas', 'architectural-plate'];
      recommendedOpeningTopology = 'terminal-boot-sequence';
    } else if (dominantWorkType === 'ai_ml_research' || researchEvidence === 'academic') {
      compatibleTopologies = ['narrow-reading-column', 'edge-to-edge-editorial', 'newspaper-column-grid', 'data-observatory'];
      recommendedOpeningTopology = 'research-abstract-monograph';
    } else if (dominantWorkType === 'creative_visual' || visualEvidence === 'high') {
      compatibleTopologies = ['image-led-gallery', 'floating-spatial-composition', 'full-viewport-stage', 'offset-poster-canvas'];
      recommendedOpeningTopology = 'full-viewport-stage';
    } else if (careerStage === 'student' || careerStage === 'junior_dev') {
      compatibleTopologies = ['offset-poster-canvas', 'asymmetric-split-canvas', 'edge-to-edge-editorial'];
      recommendedOpeningTopology = 'editorial-thesis';
    } else if (dominantWorkType === 'design_systems') {
      compatibleTopologies = ['magazine-spread', 'asymmetric-split-canvas', 'offset-poster-canvas'];
      recommendedOpeningTopology = 'newspaper-front-page';
    }

    return {
      iaGrammar,
      compatibleTopologies,
      recommendedSectionSequence: iaGrammar.sequence,
      recommendedOpeningTopology,
      vocabularyPlan: iaGrammar.vocabulary
    };
  }

  /**
   * Synthesizes heterogeneous project artifact roles and storytelling strategies
   */
  static synthesizeProjectArtifactPlan(projects = [], intent = {}) {
    const { dominantWorkType, researchEvidence } = intent;

    return projects.map((proj, idx) => {
      let role = 'supporting';
      let strategy = 'technical-dossier';

      if (idx === 0) {
        role = 'primary-deep-dive';
        if (dominantWorkType === 'ai_ml_research' || researchEvidence === 'academic' || proj.workType === 'RESEARCH') strategy = 'research-paper';
        else if (dominantWorkType === 'systems_kernel' || dominantWorkType === 'security_network' || proj.workType === 'SYSTEM' || proj.workType === 'PROTOCOL') strategy = 'technical-dossier';
        else if (dominantWorkType === 'creative_visual' || proj.workType === 'VISUAL_WORK') strategy = 'visual-exhibition';
        else strategy = 'case-study-narrative';
      } else if (idx === 1) {
        role = 'secondary-evidence';
        if (dominantWorkType === 'systems_kernel' || dominantWorkType === 'security_network' || proj.workType === 'POSTMORTEM') strategy = 'failure-recovery';
        else if (dominantWorkType === 'ai_ml_research' || proj.workType === 'DATASET') strategy = 'metrics-observatory';
        else if (dominantWorkType === 'creative_visual' || dominantWorkType === 'design_systems') strategy = 'before-after';
        else strategy = 'repository-archaeology';
      } else if (idx === 2) {
        role = 'technical-telemetry';
        strategy = 'build-journal';
      } else {
        role = 'compact-archive';
        strategy = 'artifact-archive';
      }

      return {
        projectIndex: idx,
        projectName: proj.name || `Project ${idx + 1}`,
        workType: proj.workType || 'PROJECT',
        artifactRole: role,
        artifactStrategy: strategy
      };
    });
  }
}

module.exports = { CompositionIntentEngine };
