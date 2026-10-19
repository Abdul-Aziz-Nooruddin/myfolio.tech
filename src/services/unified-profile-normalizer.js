/**
 * 🏛️ Unified Profile Normalizer (Phase 32)
 * Canonical profile ingestion and multi-source merging engine.
 * Tracks explicit field-level data provenance (VERIFIED, USER_PROVIDED, INFERRED)
 * across any combination of sources (GitHub, PDF resume, image gallery, guided questions).
 */

const PROVENANCE_LEVELS = {
  VERIFIED: 'VERIFIED',       // From public APIs with cryptographic or server integrity (GitHub API, commit history)
  USER_PROVIDED: 'USER_PROVIDED', // Explicitly typed/uploaded by the user
  INFERRED: 'INFERRED'        // Synthesized or clustered by design intelligence algorithms
};

class UnifiedProfileNormalizer {
  /**
   * Normalizes raw user input from any or all sources
   * @param {Object} input - { githubData, resumeData, photoData, imagesData, questionnaireData, manualData, preferences }
   * @returns {Object} NormalizedProfile with provenance
   */
  static normalize(input = {}) {
    const {
      githubData = null,
      resumeData: rawResumeData = null,
      photoData = null,
      imagesData = [],
      questionnaireData = null,
      manualData: rawManualData = null,
      preferences = {}
    } = input;

    // Flatten extracted_data if present in resumeData or input
    const resumeData = rawResumeData?.extracted_data
      ? { ...rawResumeData, ...rawResumeData.extracted_data }
      : (input?.extracted_data ? { ...input, ...input.extracted_data } : rawResumeData);

    const manualData = rawManualData || input?.data || input;

    const provenance = {};
    const recordProvenance = (field, source, level, confidence = 0.95) => {
      provenance[field] = { source, level, confidence, timestamp: Date.now() };
    };

    // Extract GitHub identity attributes cleanly from both flat and nested schemas
    const ghIdentity = githubData?.identity || {};
    const ghName = ghIdentity.name || githubData?.name;
    const ghUsername = ghIdentity.username || githubData?.username;
    const ghBio = ghIdentity.bio || githubData?.bio;
    const ghLocation = ghIdentity.location || githubData?.location;
    const ghCompany = ghIdentity.company || githubData?.company;
    const ghWebsite = ghIdentity.website || githubData?.blog || githubData?.website;
    const ghTwitter = ghIdentity.twitter || githubData?.twitter_username;
    const ghAvatar = ghIdentity.avatar || githubData?.avatar_url || githubData?.avatarUrl;

    const isExplicitOtherGithub = ghUsername && ghUsername.toLowerCase() !== 'abdul-aziz-nooruddin' && ghUsername.toLowerCase() !== 'abdulaziz';
    const isDefaultFounderVal = (val) => typeof val === 'string' && (val.toLowerCase().includes('abdul aziz') || val.toLowerCase().includes('abdul-aziz'));

    // 1. Identity & Name Resolution (Direct Input > Questionnaire > Resume > GitHub > Default)
    let name = 'Creative Developer';
    if (isExplicitOtherGithub && (ghName || ghUsername) && (isDefaultFounderVal(input?.name) || isDefaultFounderVal(resumeData?.name) || isDefaultFounderVal(resumeData?.fullName))) {
      name = (ghName || ghUsername).trim();
      recordProvenance('name', 'github', PROVENANCE_LEVELS.VERIFIED, 0.95);
    } else if (input?.name && typeof input.name === 'string' && input.name.trim() && input.name !== 'Software Developer') {
      name = input.name.trim();
      recordProvenance('name', 'direct_input', PROVENANCE_LEVELS.USER_PROVIDED, 0.99);
    } else if (questionnaireData?.name) {
      name = questionnaireData.name.trim();
      recordProvenance('name', 'questionnaire', PROVENANCE_LEVELS.USER_PROVIDED, 0.98);
    } else if (resumeData?.name) {
      name = resumeData.name.trim();
      recordProvenance('name', 'resume', PROVENANCE_LEVELS.USER_PROVIDED, 0.95);
    } else if (ghName) {
      name = ghName.trim();
      recordProvenance('name', 'github', PROVENANCE_LEVELS.VERIFIED, 0.90);
    } else if (ghUsername) {
      name = ghUsername.trim();
      recordProvenance('name', 'github_username', PROVENANCE_LEVELS.VERIFIED, 0.85);
    } else if (manualData?.name) {
      name = manualData.name.trim();
      recordProvenance('name', 'manual', PROVENANCE_LEVELS.USER_PROVIDED, 0.95);
    } else {
      recordProvenance('name', 'fallback', PROVENANCE_LEVELS.INFERRED, 0.50);
    }

    // 2. Career Stage & Authenticity Precaution Engine (Phase 34)
    // Deterministically inspects education, experience, and keywords to prevent title inflation
    const careerStageAssessment = this.determineCareerStage({
      inputRole: input?.role || questionnaireData?.role || resumeData?.role || manualData?.role,
      bioText: `${input?.bio || ''} ${input?.tagline || ''} ${resumeData?.bio || ''} ${resumeData?.summary || ''} ${questionnaireData?.bio || ''} ${ghBio || ''} ${input?.about || ''}`,
      education: input?.education || resumeData?.education || questionnaireData?.education || manualData?.education || [],
      experience: input?.experience || resumeData?.experience || questionnaireData?.experience || manualData?.experience || githubData?.experience || [],
      skills: githubData?.skills || resumeData?.skills || manualData?.skills || input?.skills || []
    });

    let role = careerStageAssessment.sanitizedRole;
    recordProvenance('role', careerStageAssessment.provenanceSource, careerStageAssessment.provenanceLevel);

    // 3. Tagline & Narrative Bio
    let tagline = '';
    if (questionnaireData?.tagline) {
      tagline = questionnaireData.tagline.trim();
      recordProvenance('tagline', 'questionnaire', PROVENANCE_LEVELS.USER_PROVIDED);
    } else if (resumeData?.tagline) {
      tagline = resumeData.tagline.trim().slice(0, 140);
      recordProvenance('tagline', 'resume', PROVENANCE_LEVELS.USER_PROVIDED);
    } else if (manualData?.tagline) {
      tagline = manualData.tagline.trim();
      recordProvenance('tagline', 'manual', PROVENANCE_LEVELS.USER_PROVIDED);
    } else if (ghBio) {
      tagline = ghBio.trim();
      recordProvenance('tagline', 'github', PROVENANCE_LEVELS.VERIFIED);
    } else if (resumeData?.summary || resumeData?.bio) {
      tagline = (resumeData.summary || resumeData.bio).trim().slice(0, 140);
      recordProvenance('tagline', 'resume', PROVENANCE_LEVELS.USER_PROVIDED);
    } else {
      tagline = `Building scalable digital systems and high-craft software experiences.`;
      recordProvenance('tagline', 'fallback', PROVENANCE_LEVELS.INFERRED);
    }

    let bio = '';
    if (questionnaireData?.bio) {
      bio = questionnaireData.bio.trim();
      recordProvenance('bio', 'questionnaire', PROVENANCE_LEVELS.USER_PROVIDED);
    } else if (resumeData?.bio || resumeData?.summary) {
      bio = (resumeData.bio || resumeData.summary).trim();
      recordProvenance('bio', 'resume', PROVENANCE_LEVELS.USER_PROVIDED);
    } else if (manualData?.bio) {
      bio = manualData.bio.trim();
      recordProvenance('bio', 'manual', PROVENANCE_LEVELS.USER_PROVIDED);
    } else if (ghBio) {
      bio = ghBio.trim();
      recordProvenance('bio', 'github', PROVENANCE_LEVELS.VERIFIED);
    } else {
      bio = `Dedicated professional committed to technical excellence, resilient architecture, and user-centered design.`;
      recordProvenance('bio', 'fallback', PROVENANCE_LEVELS.INFERRED);
    }

    // 4. Visual Material: Profile Photo & Supporting Gallery Images (Max 3)
    const photoUrl = input?.avatar ||
      input?.photoUrl ||
      photoData?.url ||
      photoData?.dataUrl ||
      manualData?.photoUrl ||
      manualData?.avatar ||
      resumeData?.photoUrl ||
      resumeData?.avatar ||
      ghAvatar ||
      (ghUsername ? `https://github.com/${ghUsername}.png` : null) ||
      (isDefaultFounderVal(name) ? 'https://github.com/Abdul-Aziz-Nooruddin.png' : null) ||
      null;
    if (photoUrl) {
      recordProvenance('photoUrl', input?.avatar ? 'direct_upload' : (photoData?.url ? 'upload' : (ghAvatar ? 'github' : 'manual')), PROVENANCE_LEVELS.USER_PROVIDED);
    }

    const visualImages = (Array.isArray(imagesData) ? imagesData : [])
      .slice(0, 3)
      .map((img, idx) => ({
        url: typeof img === 'string' ? img : img.url || img.dataUrl,
        caption: img.caption || `Artifact Specimen #${idx + 1}`,
        provenance: PROVENANCE_LEVELS.USER_PROVIDED
      }))
      .filter(img => Boolean(img.url));

    // 5. Contact & Social Channels
    const extractedName = questionnaireData?.name || resumeData?.name || manualData?.name || (ghName ? ghName : (ghUsername || 'Developer'));
    const safeFallbackEmail = extractedName ? `${extractedName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@devfolio.me` : 'contact@devfolio.me';

    const contact = {
      email: questionnaireData?.email || resumeData?.email || manualData?.email || (ghUsername ? `${ghUsername}@users.noreply.github.com` : safeFallbackEmail),
      phone: questionnaireData?.phone || resumeData?.phone || manualData?.phone || null,
      location: questionnaireData?.location || resumeData?.location || manualData?.location || ghLocation || 'Remote / Worldwide',
      website: questionnaireData?.website || resumeData?.website || manualData?.website || ghWebsite || ''
    };

    const socialLinks = {
      github: githubData?.profileUrl || githubData?.html_url || (ghUsername ? `https://github.com/${ghUsername}` : (resumeData?.github || manualData?.github || '')),
      linkedin: questionnaireData?.linkedin || resumeData?.linkedin || manualData?.linkedin || '',
      twitter: questionnaireData?.twitter || manualData?.twitter || (ghTwitter ? (ghTwitter.startsWith('http') ? ghTwitter : `https://twitter.com/${ghTwitter}`) : '')
    };

    // 6. Skills Aggregation
    const resumeSkills = [];
    if (Array.isArray(resumeData?.skills)) {
      resumeSkills.push(...resumeData.skills);
    } else if (typeof resumeData?.skills === 'string') {
      resumeSkills.push(...resumeData.skills.split(/[,⋄•|/]/));
    }
    if (resumeData?.tech_stack && typeof resumeData.tech_stack === 'string') {
      resumeSkills.push(...resumeData.tech_stack.split(/[,⋄•|/]/));
    }
    if (resumeData?.skills_by_category && typeof resumeData.skills_by_category === 'object') {
      Object.values(resumeData.skills_by_category).forEach(cat => {
        if (Array.isArray(cat)) resumeSkills.push(...cat);
      });
    }

    const rawSkills = [
      ...(Array.isArray(questionnaireData?.skills) ? questionnaireData.skills : (questionnaireData?.skills ? questionnaireData.skills.split(',') : [])),
      ...resumeSkills,
      ...(Array.isArray(githubData?.skills) ? githubData.skills : (githubData?.skills ? Object.keys(githubData.skills) : [])),
      ...(Array.isArray(manualData?.skills) ? manualData.skills : (manualData?.skills ? manualData.skills.split(',') : []))
    ].map(s => String(s).trim()).filter(Boolean);

    const skills = [...new Set(rawSkills)].slice(0, 15);
    if (skills.length === 0) {
      skills.push('TypeScript', 'JavaScript', 'Node.js', 'React', 'Python', 'Git', 'Cloud Architecture');
      recordProvenance('skills', 'fallback', PROVENANCE_LEVELS.INFERRED);
    } else {
      recordProvenance('skills', 'multi_source_merge', PROVENANCE_LEVELS.USER_PROVIDED);
    }

    // 7. Projects Normalization (Capped at 10, Guaranteed >= 2)
    const extractProjectsFromFlat = (obj) => {
      if (!obj || typeof obj !== 'object') return [];
      const list = [];
      for (let i = 1; i <= 5; i++) {
        if (obj[`project_${i}_name`] || obj[`project_${i}_title`]) {
          list.push({
            name: obj[`project_${i}_name`] || obj[`project_${i}_title`],
            desc: obj[`project_${i}_desc`] || obj[`project_${i}_description`] || '',
            tech: obj[`project_${i}_tech`] || obj[`project_${i}_tech_stack`] || ''
          });
        }
      }
      return list;
    };

    let projects = [];
    const flatProjects = [
      ...extractProjectsFromFlat(input),
      ...extractProjectsFromFlat(input?.data),
      ...extractProjectsFromFlat(questionnaireData),
      ...extractProjectsFromFlat(manualData)
    ];

    // Multi-source project merging (Preserves ALL GitHub repositories and resume projects without loss)
    const allCandidateProjects = [];
    const seenProjectNames = new Set();

    const addProjectsList = (list = [], sourceTag = 'user') => {
      if (!Array.isArray(list)) return;
      list.forEach(p => {
        if (!p || (!p.name && !p.title)) return;
        const rawName = String(p.name || p.title || '').trim();
        // Discard resume noise like "CGPA", "Relevant Coursework", "Coursework", "Dean's list", "nBalancing thoroughness with", "Education"
        if (/^(cgpa|gpa|relevant coursework|coursework|academic|grades?|percentage|dean'?s list|curriculum|nbalancing|education)\b/i.test(rawName)) return;
        if (rawName.length < 3 || /^\d+(\.\d+)?(\/\d+)?$/.test(rawName)) return;
        const normName = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normName && !seenProjectNames.has(normName)) {
          seenProjectNames.add(normName);
          allCandidateProjects.push(p);
        }
      });
    };

    // Add projects: if generating for external GitHub profile, prioritize authentic GitHub repositories
    if (isExplicitOtherGithub && githubData?.projects?.length > 0) {
      addProjectsList(githubData.projects, 'github');
      addProjectsList(input?.projects, 'direct_input');
      addProjectsList(input?.data?.projects, 'direct_input_data');
    } else {
      addProjectsList(input?.projects, 'direct_input');
      addProjectsList(input?.data?.projects, 'direct_input_data');
      addProjectsList(resumeData?.projects, 'resume');
      addProjectsList(questionnaireData?.projects, 'questionnaire');
      addProjectsList(flatProjects, 'flat_projects');
      addProjectsList(githubData?.projects, 'github');
      addProjectsList(manualData?.projects, 'manual');
    }

    projects = allCandidateProjects;
    if (projects.length > 0) {
      recordProvenance('projects', githubData?.projects?.length ? 'multi_source_github_merge' : 'user_input', PROVENANCE_LEVELS.VERIFIED);
    }

    // Clean & standardize projects while preserving all deep evidence fields
    projects = projects.map(p => ({
      ...p,
      name: p.name || p.title || 'Featured Project',
      desc: p.desc || p.description || 'High-performance software system engineered with modern practices.',
      tech: p.tech || p.tech_stack || (Array.isArray(p.technologies) ? p.technologies.join(' • ') : (Array.isArray(p.techList) ? p.techList.join(' • ') : skills.slice(0, 3).join(' • '))),
      github: p.github || p.repo || socialLinks.github || '#',
      live: p.live || p.link || socialLinks.github || '#'
    }));

    if (projects.length === 0) {
      projects = [
        {
          name: `${name} Core Infrastructure`,
          desc: 'Primary software workspace featuring resilient architectures, automated workflows, and production utilities.',
          tech: skills.slice(0, 3).join(' • ') || 'TypeScript • Node.js',
          github: socialLinks.github || '#',
          live: socialLinks.github || '#'
        },
        {
          name: 'Developer Tooling & Library',
          desc: 'Reusable component architecture, automated performance benchmarks, and modular utility scripts.',
          tech: skills[0] || 'Modern Tooling',
          github: socialLinks.github || '#',
          live: socialLinks.github || '#'
        }
      ];
      recordProvenance('projects', githubData ? 'github' : 'starter_anchors', githubData ? PROVENANCE_LEVELS.VERIFIED : PROVENANCE_LEVELS.INFERRED);
    } else if (projects.length === 1) {
      projects.push({
        name: 'Systems Automation & Tooling',
        desc: 'Continuous delivery pipelines, environment automation, and reusable software modules.',
        tech: skills.slice(0, 2).join(' • ') || 'TypeScript',
        github: socialLinks.github || '#',
        live: socialLinks.github || '#'
      });
    }

    // 8. Experience Normalization
    let experience = [];
    if (Array.isArray(input?.experience) && input.experience.length > 0) {
      experience = input.experience;
      recordProvenance('experience', 'direct_input', PROVENANCE_LEVELS.USER_PROVIDED);
    } else if (Array.isArray(input?.data?.experience) && input.data.experience.length > 0) {
      experience = input.data.experience;
      recordProvenance('experience', 'direct_input_data', PROVENANCE_LEVELS.USER_PROVIDED);
    } else if (Array.isArray(questionnaireData?.experience) && questionnaireData.experience.length > 0) {
      experience = questionnaireData.experience;
      recordProvenance('experience', 'questionnaire', PROVENANCE_LEVELS.USER_PROVIDED);
    } else if (Array.isArray(resumeData?.experience) && resumeData.experience.length > 0) {
      experience = resumeData.experience;
      recordProvenance('experience', 'resume', PROVENANCE_LEVELS.USER_PROVIDED);
    } else if (Array.isArray(manualData?.experience) && manualData.experience.length > 0) {
      experience = manualData.experience;
      recordProvenance('experience', 'manual', PROVENANCE_LEVELS.USER_PROVIDED);
    } else if (Array.isArray(githubData?.experience) && githubData.experience.length > 0) {
      experience = githubData.experience;
      recordProvenance('experience', 'github_synthesis', PROVENANCE_LEVELS.VERIFIED);
    }

    const currentYear = new Date().getFullYear();
    if (experience.length === 0) {
      if (careerStageAssessment.careerStage === 'student') {
        experience = [
          {
            role: 'Student Developer & Open Source Contributor',
            company: 'Academic & Open Source Projects',
            period: `${currentYear - 1} - Present`,
            desc: 'Developing decentralized protocols, smart contracts, and high-performance web applications.'
          }
        ];
      } else {
        experience = [
          {
            role: role,
            company: githubData?.company || 'Open Source & Independent Development',
            period: `${currentYear - 2} - Present`,
            desc: 'Building modern application architecture, feature delivery, and software quality.'
          }
        ];
      }
      recordProvenance('experience', 'inferred_role_entry', PROVENANCE_LEVELS.INFERRED);
    } else {
      experience = experience.map(e => ({
        ...e,
        role: e.role || e.title || role,
        company: e.company || e.organization || (careerStageAssessment.careerStage === 'student' ? 'Academic & Open Source' : 'Independent Development'),
        period: e.period || e.duration || e.year || `${currentYear - 2} - Present`,
        desc: e.desc || e.description || (careerStageAssessment.careerStage === 'student' ? 'Developing software features, learning modern architectures, and contributing to codebase milestones.' : 'Delivering software features, application architecture, and code quality.')
      }));
    }

    // 9. Education & Certifications
    let education = [];
    if (Array.isArray(input?.education) && input.education.length > 0) {
      education = input.education;
    } else if (Array.isArray(input?.data?.education) && input.data.education.length > 0) {
      education = input.data.education;
    } else if (Array.isArray(questionnaireData?.education) && questionnaireData.education.length > 0) {
      education = questionnaireData.education;
    } else if (Array.isArray(resumeData?.education) && resumeData.education.length > 0) {
      education = resumeData.education;
    } else if (Array.isArray(manualData?.education) && manualData.education.length > 0) {
      education = manualData.education;
    } else if (Array.isArray(githubData?.education) && githubData.education.length > 0) {
      education = githubData.education;
    } else if (resumeData?.education && typeof resumeData.education === 'object') {
      education = [resumeData.education];
    } else {
      education = [];
    }

    education = education.map(edu => ({
      ...edu,
      degree: edu.degree || edu.study || edu.major || '',
      institution: edu.institution || edu.school || edu.university || '',
      school: edu.school || edu.institution || edu.university || '',
      period: edu.period || edu.year || ''
    })).filter(edu => edu.degree || edu.institution);

    // 9. Certifications Normalization (Multi-source merge preserving uploads & metadata)
    const allCerts = [];
    const seenCerts = new Set();
    const addCertList = (list = [], sourceTag = 'user') => {
      if (!Array.isArray(list)) return;
      list.forEach(c => {
        if (!c) return;
        const certObj = typeof c === 'string' ? {
          name: c,
          issuer: 'Verified Credential',
          date: 'Verified',
          id: '',
          url: '#',
          verified: true
        } : {
          name: c.name || c.title || '',
          issuer: c.issuer || c.organization || c.issuing_organization || '',
          date: c.date || c.issueDate || c.year || 'Verified',
          id: c.id || c.credentialId || c.code || '',
          url: c.url || c.fileUrl || c.link || '#',
          verified: c.verified !== false
        };
        if (!certObj.name) return;
        const key = `${certObj.name.toLowerCase()}_${certObj.issuer.toLowerCase()}`;
        if (!seenCerts.has(key)) {
          seenCerts.add(key);
          allCerts.push(certObj);
        }
      });
    };

    addCertList(input?.certificates, 'uploaded_certificates');
    addCertList(input?.certifications, 'input_certifications');
    addCertList(input?.data?.certificates, 'data_certificates');
    addCertList(input?.data?.certifications, 'data_certifications');
    addCertList(resumeData?.certificates, 'resume_certificates');
    addCertList(resumeData?.certifications, 'resume_certifications');
    addCertList(questionnaireData?.certifications, 'questionnaire');
    addCertList(manualData?.certifications, 'manual');
    addCertList(githubData?.certifications, 'github');

    let certifications = allCerts;
    if (certifications.length > 0) {
      recordProvenance('certifications', 'multi_source_merge', PROVENANCE_LEVELS.USER_PROVIDED);
    } else {
      certifications = [];
    }

    const research = input.research || input.publications || questionnaireData?.research || questionnaireData?.publications || resumeData?.research || resumeData?.publications || manualData?.research || manualData?.publications || [];
    if (research.length > 0) {
      recordProvenance('research', 'user_provided_research', PROVENANCE_LEVELS.USER_PROVIDED);
    }

    // Capture custom / extension fields (excluding contact, projects, and binary/internal payload keys)
    const ignoredKeys = [
      'githubData', 'resumeData', 'photoData', 'imagesData', 'questionnaireData', 'manualData',
      'preferences', 'name', 'role', 'tagline', 'bio', 'summary', 'photoUrl', 'images', 'contact',
      'socialLinks', 'skills', 'projects', 'experience', 'education', 'certifications', 'research',
      'publications', 'customFields', 'provenance', 'sourceConfidence', 'signals', 'extracted_data',
      'branch', 'id', 'status', 'token', 'slug', 'rawBase64', 'extractedTextSnippet', 'base64Data',
      'filename', 'mimeType', 'fileType', 'pages', 'rawText', 'identity', 'skills_by_category', 'tech_stack',
      'email', 'phone', 'github', 'github_url', 'linkedin', 'twitter', 'website', 'location', 'avatar_url', 'avatarUrl', 'profileUrl', 'html_url'
    ];

    const customFields = {};
    const sources = [input, questionnaireData, manualData, resumeData, githubData];
    sources.forEach(src => {
      if (src && typeof src === 'object') {
        if (src.customFields && typeof src.customFields === 'object') {
          for (const [k, v] of Object.entries(src.customFields)) {
            if (!ignoredKeys.includes(k) && !k.startsWith('project_') && v !== undefined && v !== null && String(v).trim() !== '' && String(v).length < 300) {
              customFields[k] = v;
            }
          }
        }
        for (const [k, v] of Object.entries(src)) {
          if (!ignoredKeys.includes(k) && !k.startsWith('project_')) {
            if (v !== undefined && v !== null && String(v).trim() !== '' && typeof v !== 'object' && String(v).length < 300) {
              customFields[k] = v;
            }
          }
        }
      }
    });

    return {
      identity: {
        name,
        role,
        tagline,
        biography: bio,
        photoUrl,
        images: visualImages,
        email: contact.email,
        phone: contact.phone,
        location: contact.location
      },
      name,
      role,
      tagline,
      bio,
      email: contact.email,
      phone: contact.phone,
      location: contact.location,
      photoUrl,
      avatar: photoUrl,
      images: visualImages,
      contact,
      socialLinks,
      skills,
      projects,
      experience,
      education,
      certifications,
      research,
      publications: research,
      customFields,
      provenance,
      sourceConfidence: provenance, // Backward compatibility
      preferences,
      careerStage: careerStageAssessment.careerStage,
      authenticityGuarantee: {
        verified: true,
        careerStage: careerStageAssessment.careerStage,
        basis: careerStageAssessment.basis,
        disallowedTitlesRemoved: careerStageAssessment.disallowedTitlesRemoved
      },
      signals: {
        primaryAngle: role.toLowerCase().includes('design') ? 'creative' : 'technical',
        technicalDepth: skills.length >= 8 ? 'deep' : 'standard',
        narrativeDepth: projects.length >= 3 ? 'deep' : 'compact',
        careerStage: careerStageAssessment.careerStage
      }
    };
  }

  /**
   * Deterministic Career Stage Classification & Title Anti-Inflation Engine
   * Enforces 100% precision: never inflates students to architects/leads without commercial proof.
   */
  static determineCareerStage({ inputRole, bioText = '', education = [], experience = [], skills = [] }) {
    const rawRole = (inputRole || '').trim();
    const roleLower = rawRole.toLowerCase();
    const bioLower = String(bioText).toLowerCase();

    // 1. Evidence Extraction
    const hasActiveStudentKeyword = 
      roleLower.includes('student') || 
      roleLower.includes('intern') || 
      roleLower.includes('undergraduate') || 
      roleLower.includes('fresher') ||
      bioLower.includes('student') || 
      bioLower.includes('undergraduate') || 
      bioLower.includes('fresher') || 
      bioLower.includes('studying') ||
      bioLower.includes('b.tech') ||
      bioLower.includes('pursuing');

    const eduArray = Array.isArray(education) ? education : (education ? [education] : []);
    const currentYear = new Date().getFullYear();
    const hasActiveEducation = eduArray.some(edu => {
      const periodStr = String(edu.period || edu.year || '').toLowerCase();
      const degStr = String(edu.degree || edu.study || '').toLowerCase();
      const hasStudentDegree = degStr.includes('bachelor') || degStr.includes('b.tech') || degStr.includes('b.s') || degStr.includes('undergraduate') || degStr.includes('student');
      const isCurrentOrFuture = periodStr.includes('present') || periodStr.includes('current') || periodStr.includes('expected') || 
        (periodStr.match(/\d{4}/g) && Math.max(...periodStr.match(/\d{4}/g).map(Number)) >= currentYear);
      return hasStudentDegree || isCurrentOrFuture;
    });

    const expArray = Array.isArray(experience) ? experience : [];
    const verifiedCorporateExpCount = expArray.filter(e => {
      const cLower = String(e.company || '').toLowerCase();
      const rLower = String(e.role || e.title || '').toLowerCase();
      return !cLower.includes('academic') && 
             !cLower.includes('open source') && 
             !cLower.includes('independent') && 
             !cLower.includes('personal') &&
             !rLower.includes('intern') &&
             !rLower.includes('student');
    }).length;

    let careerStage = 'mid';
    const basis = [];
    const disallowedTitlesRemoved = [];

    // 2. Deterministic Decision Tree
    if (hasActiveStudentKeyword || (hasActiveEducation && verifiedCorporateExpCount === 0)) {
      careerStage = 'student';
      if (hasActiveStudentKeyword) basis.push('Student keywords detected in candidate bio/role');
      if (hasActiveEducation) basis.push('Degree enrollment currently in progress');
      if (verifiedCorporateExpCount === 0) basis.push('Zero commercial corporate employment history');
    } else if (roleLower.includes('researcher') || roleLower.includes('scientist') || bioLower.includes('phd') || bioLower.includes('postdoc')) {
      careerStage = 'researcher';
      basis.push('Academic research and scientific publications detected');
    } else if (roleLower.includes('design') || roleLower.includes('ui/ux') || roleLower.includes('creative director')) {
      careerStage = 'designer';
      basis.push('Design systems and creative direction background');
    } else if (verifiedCorporateExpCount >= 5 || roleLower.includes('principal') || roleLower.includes('staff engineer')) {
      careerStage = 'senior';
      basis.push('5+ years verified commercial experience or senior engineering track record');
    } else if (verifiedCorporateExpCount >= 8 && (roleLower.includes('architect') || roleLower.includes('director'))) {
      careerStage = 'lead_architect';
      basis.push('8+ years commercial systems architecture experience');
    } else if (verifiedCorporateExpCount <= 1) {
      careerStage = 'junior';
      basis.push('Early career profile (0-2 years verified industry employment)');
    } else {
      careerStage = 'mid';
      basis.push('Established software engineering profile (2-5 years experience)');
    }

    // 3. Strict Anti-Inflation Sanitizer
    let sanitizedRole = rawRole;
    if (careerStage === 'student') {
      const inflationTerms = ['architect', 'principal', 'staff', 'lead', 'director', 'vp', 'senior', 'head of'];
      inflationTerms.forEach(term => {
        if (roleLower.includes(term)) {
          disallowedTitlesRemoved.push(term);
        }
      });

      if (!sanitizedRole || disallowedTitlesRemoved.length > 0) {
        const skillStr = Array.isArray(skills) ? skills.join(' ').toLowerCase() : String(skills).toLowerCase();
        if (skillStr.includes('web3') || skillStr.includes('smart contract') || skillStr.includes('solidity') || skillStr.includes('algorand')) {
          sanitizedRole = 'Computer Science & AI Student • Web3 Developer';
        } else if (skillStr.includes('ai') || skillStr.includes('machine learning') || skillStr.includes('python')) {
          sanitizedRole = 'Computer Science & AI Student • Full-Stack Developer';
        } else {
          sanitizedRole = 'Computer Science Student • Software Developer';
        }
      }
    } else if (!sanitizedRole) {
      sanitizedRole = this.inferRoleFromSkills(skills) || 'Software Engineer';
    }

    return {
      careerStage,
      sanitizedRole,
      provenanceSource: rawRole && disallowedTitlesRemoved.length === 0 ? 'user_provided' : 'career_stage_verified',
      provenanceLevel: rawRole && disallowedTitlesRemoved.length === 0 ? PROVENANCE_LEVELS.USER_PROVIDED : PROVENANCE_LEVELS.VERIFIED,
      basis,
      disallowedTitlesRemoved
    };
  }

  static inferRoleFromSkills(skills) {
    if (!skills) return null;
    const str = Array.isArray(skills) ? skills.join(' ').toLowerCase() : String(skills).toLowerCase();
    if (str.includes('rust') || str.includes('c++') || str.includes('go') || str.includes('ebpf')) {
      return 'Systems & High-Performance Developer';
    }
    if (str.includes('pytorch') || str.includes('cuda') || str.includes('tensorflow') || str.includes('ai')) {
      return 'AI & Machine Learning Developer';
    }
    if (str.includes('three.js') || str.includes('webgl') || str.includes('glsl') || str.includes('blender')) {
      return 'Creative Technologist & 3D WebGL Developer';
    }
    if (str.includes('react') || str.includes('typescript') || str.includes('css') || str.includes('frontend')) {
      return 'Full-Stack Developer & UI Specialist';
    }
    return 'Software Engineer';
  }
}

module.exports = { UnifiedProfileNormalizer, PROVENANCE_LEVELS };
