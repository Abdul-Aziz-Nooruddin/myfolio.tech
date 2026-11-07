/**
 * GitHub Data Normalizer & Evidence Model Assembler
 * Produces a standardized, evidence-grounded NormalizedDeveloperProfile
 * separating verified facts from inferences.
 */

const { GitHubProjectRanker } = require('./github-project-ranker');

class GitHubNormalizer {
  /**
   * Sanitizes external README content to prevent prompt injections or malicious instructions.
   */
  static sanitizeReadme(rawReadme = '') {
    if (!rawReadme || typeof rawReadme !== 'string') return '';
    return rawReadme
      .replace(/<!--[\s\S]*?-->/g, '') // remove HTML comments
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '') // remove scripts
      .replace(/!\[.*?\]\(.*?\)/g, '') // remove markdown images
      .replace(/[^\x20-\x7E\n\r\t]/g, '') // clean non-standard control characters
      .slice(0, 3000); // cap to 3000 characters
  }

  /**
   * Assembles a normalized developer profile
   * @param {Object} rawGitHubData - Payload from GitHubClient.fetchCompleteProfile
   * @returns {Object} Normalized developer profile with verified evidence
   */
  static normalize(rawGitHubData = {}) {
    const profile = rawGitHubData.profile || {};
    const repos = rawGitHubData.repositories || [];
    const languageStats = rawGitHubData.languageStats || {};
    const sanitizedReadme = this.sanitizeReadme(rawGitHubData.readmeContent || '');

    // Total language bytes across repositories
    const totalBytes = Object.values(languageStats).reduce((a, b) => a + b, 0);

    // List of scripting / config / build languages to categorize as tools rather than primary languages
    const toolLanguages = new Set(['powershell', 'shell', 'makefile', 'batchfile', 'dockerfile', 'cmake', 'qmake', 'vim script', 'autohotkey']);

    // Extract verified primary programming languages sorted by bytes
    const detectedLanguages = Object.entries(languageStats).sort((a, b) => b[1] - a[1]);
    const toolLangsDetected = [];

    let filteredLanguages = detectedLanguages
      .filter(([lang, bytes]) => {
        if (toolLanguages.has(lang.toLowerCase())) {
          toolLangsDetected.push(lang);
          return false;
        }
        // Only prune minor languages (< 1%) if the candidate has more than 10 distinct detected languages
        if (detectedLanguages.length > 10 && totalBytes > 10000 && (bytes / totalBytes) < 0.01) {
          return false;
        }
        return true;
      })
      .map(([lang]) => lang);

    if (filteredLanguages.length === 0) {
      filteredLanguages = detectedLanguages.map(([lang]) => lang);
    }

    const sortedLanguages = filteredLanguages;

    // Extract all unique topics across repos
    const allTopics = new Set();
    repos.forEach(r => {
      if (Array.isArray(r.topics)) {
        r.topics.forEach(t => allTopics.add(t));
      }
    });

    // Rank top projects (preserve all repositories up to 20)
    const topProjects = GitHubProjectRanker.rankAndSelect(repos, 20);

    // Categorize skills based on verified languages, topics, bio, and repository descriptions
    const skills = {
      languages: sortedLanguages.slice(0, 10),
      frontend: [],
      backend: [],
      web3: [],
      ai: [],
      devops: [],
      databases: [],
      tools: [...toolLangsDetected]
    };

    const frontendKeywords = ['react', 'vue', 'svelte', 'nextjs', 'tailwind', 'css', 'html', 'typescript', 'javascript', 'threejs', 'webgl'];
    const backendKeywords = ['nodejs', 'express', 'nest', 'django', 'fastapi', 'flask', 'spring', 'go', 'rust', 'ruby', 'rails', 'php', 'laravel'];
    const web3Keywords = ['web3', 'solidity', 'blockchain', 'algorand', 'ethereum', 'polygon', 'smart contract', 'smart-contract', 'defi', 'ethers', 'crypto', 'escrow'];
    const aiKeywords = ['ai', 'machine learning', 'machine-learning', 'deep learning', 'deep-learning', 'llm', 'nlp', 'pytorch', 'tensorflow', 'agent', 'rag', 'neural'];
    const devopsKeywords = ['docker', 'kubernetes', 'aws', 'gcp', 'terraform', 'ci-cd', 'github-actions', 'linux'];
    const dbKeywords = ['postgres', 'postgresql', 'mysql', 'mongodb', 'redis', 'sqlite', 'prisma', 'supabase', 'graphql'];

    allTopics.forEach(topic => {
      const t = topic.toLowerCase();
      if (web3Keywords.some(k => t.includes(k))) skills.web3.push(topic);
      else if (aiKeywords.some(k => t.includes(k))) skills.ai.push(topic);
      else if (frontendKeywords.some(k => t.includes(k))) skills.frontend.push(topic);
      else if (backendKeywords.some(k => t.includes(k))) skills.backend.push(topic);
      else if (devopsKeywords.some(k => t.includes(k))) skills.devops.push(topic);
      else if (dbKeywords.some(k => t.includes(k))) skills.databases.push(topic);
      else skills.tools.push(topic);
    });

    // Extract technical domains from bio and repo descriptions
    const corpusText = [
      profile.bio || '',
      ...repos.map(r => `${r.name} ${r.description || ''}`)
    ].join(' ').toLowerCase();

    if (/smart\s*contract/i.test(corpusText)) skills.web3.push('Smart Contracts');
    if (/algorand/i.test(corpusText)) skills.web3.push('Algorand');
    if (/polygon/i.test(corpusText)) skills.web3.push('Polygon');
    if (/blockchain/i.test(corpusText)) skills.web3.push('Blockchain');
    if (/defi/i.test(corpusText)) skills.web3.push('DeFi');
    if (/web3/i.test(corpusText)) skills.web3.push('Web3');
    if (/p2p|encrypted|cipher/i.test(corpusText)) skills.tools.push('P2P Encryption');
    if (/three\.?js|webgl|shader|3d/i.test(corpusText)) skills.frontend.push('Three.js / WebGL');
    if (/full-?\s*stack/i.test(corpusText)) skills.backend.push('Full-Stack Architecture');
    if (/rest\s*api|graphql/i.test(corpusText)) skills.backend.push('RESTful APIs');

    // Deduplicate all skill arrays
    for (const k of Object.keys(skills)) {
      skills[k] = [...new Set(skills[k])];
    }

    // Build Verified Facts Evidence List
    const evidence = [
      `Public Repositories: ${profile.public_repos || repos.length}`,
      `Followers: ${profile.followers || 0}`,
      `Primary Languages: ${sortedLanguages.slice(0, 5).join(', ') || 'General Software'}`
    ];

    if (topProjects.length > 0) {
      evidence.push(`Top Project: ${topProjects[0].name} (${topProjects[0].stars} stars, tech: ${topProjects[0].tech})`);
    }

    return {
      identity: {
        username: profile.login || '',
        name: profile.name || profile.login || 'Software Developer',
        avatar: profile.avatar_url || '',
        bio: profile.bio || '',
        location: profile.location || '',
        company: profile.company || '',
        website: profile.blog || '',
        twitter: profile.twitter_username || ''
      },
      github: {
        profileUrl: profile.html_url || `https://github.com/${profile.login}`,
        publicRepositories: profile.public_repos || repos.length,
        followers: profile.followers || 0,
        following: profile.following || 0,
        createdAt: profile.created_at || ''
      },
      skills,
      projects: topProjects,
      readme: sanitizedReadme,
      evidence
    };
  }
}

module.exports = { GitHubNormalizer };
