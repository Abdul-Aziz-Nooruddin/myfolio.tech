/**
 * Canonical Founder Candidate Profile
 * Single source of truth for fallback synthesis, custom domain previews, and VIP routes.
 */

const DEFAULT_FOUNDER_PROFILE = {
  name: 'Abdul Aziz Nooruddin',
  role: 'Computer Science & AI Student • Web3 Developer',
  title: 'Computer Science & AI Student • Web3 Developer',
  headline: 'CS & AI Student • Algorand & Web3 Protocol Builder',
  careerStage: 'student',
  tagline: 'AI Student & Smart Contract Developer | Building Real-World Web3 Products | Blockchain • DeFi • RegTech 🇮🇳',
  bio: 'Computer Science & Artificial Intelligence student actively engineering open-source Web3 protocols, smart contracts on Algorand and Polygon, and immersive 3D developer experiences. Bridging cutting-edge research with shipped software.',
  about: 'Specialized in decentralized systems, cryptographic verification, and spatial 3D WebGL interfaces. Creator of ConsentChain Algorand (DPDP Act 2023 compliance with automated micro-payment escrow) and builder of MyFolio. Committed to high-integrity architectures with zero boilerplate and mathematical precision.',
  email: 'abdulaziznoor9876@gmail.com',
  location: 'Hyderabad, India • Remote Web3',
  skills: [
    'Python', 'TypeScript', 'JavaScript', 'Solidity', 'Algorand (PyTeal)', 
    'Smart Contracts', 'Web3.js & Ethers.js', 'Three.js & WebGL', 'Node.js & Express', 
    'React', 'Docker & Cloud Architecture', 'PostgreSQL', 'Git & CI/CD', 'DPDP Compliance'
  ],
  projects: [
    {
      name: 'ConsentChain Algorand',
      title: 'ConsentChain Algorand',
      description: 'A decentralized Consent Management application powered by the Algorand blockchain, enabling DPDP Act 2023 compliance with an escrow-based data micro-payment system.',
      tags: ['Algorand', 'Smart Contracts', 'TypeScript', 'Blockchain', 'RegTech'],
      github: 'https://github.com/Abdul-Aziz-Nooruddin/ConsentChain-Algorand',
      live: 'https://consent-chain-algorand.vercel.app'
    },
    {
      name: 'AI Portfolio Generator',
      title: 'AI Portfolio Generator',
      description: 'Turn your GitHub repositories & resume into bespoke 3D WebGL developer portfolios with AI in seconds. Interactive spatial worlds and high-impact scrollytelling.',
      tags: ['WebGL', 'Three.js', 'Node.js', 'JavaScript', 'AI'],
      github: 'https://github.com/Abdul-Aziz-Nooruddin/myfolio.tech',
      live: 'https://myfolio.tech'
    },
    {
      name: 'Pass A Note',
      title: 'Pass A Note',
      description: 'High-performance interactive communication tool engineered for seamless zero-latency peer data transfer with secure encrypted messaging.',
      tags: ['HTML', 'JavaScript', 'CSS', 'P2P', 'Encryption'],
      github: 'https://github.com/Abdul-Aziz-Nooruddin/pass-a-note',
      live: 'https://pass-a-note-iota.vercel.app'
    },
    {
      name: 'LMS User Management',
      title: 'LMS User Management',
      description: 'Enterprise-grade role-based access control and user management system engineered with strict security guarantees and database integrity.',
      tags: ['Node.js', 'Express', 'PostgreSQL', 'Security', 'RBAC'],
      github: 'https://github.com/Abdul-Aziz-Nooruddin/lms-user-management',
      live: 'https://github.com/Abdul-Aziz-Nooruddin/lms-user-management'
    },
    {
      name: 'Dual-Chain Web3 Portfolio',
      title: 'Dual-Chain Web3 Portfolio',
      description: 'Personal developer showcase featuring glassmorphism design, particle animations, and multi-chain protocol verification across Polygon & Algorand.',
      tags: ['TypeScript', 'CSS', 'Polygon', 'Algorand', 'Web3'],
      github: 'https://github.com/Abdul-Aziz-Nooruddin/portfolio',
      live: 'https://portfolio-nine-tawny-39.vercel.app'
    },
    {
      name: 'Algorand Python Smart Contracts',
      title: 'Algorand Python Smart Contracts',
      description: 'Production PyTeal and Python smart contract implementations for Algorand escrow, token distribution, and verifiable state transitions.',
      tags: ['Python', 'Algorand', 'PyTeal', 'Smart Contracts'],
      github: 'https://github.com/Abdul-Aziz-Nooruddin/Algorand-Python-Smart-Contracts',
      live: 'https://github.com/Abdul-Aziz-Nooruddin/Algorand-Python-Smart-Contracts'
    }
  ],
  experience: [
    {
      role: 'Web3 & Smart Contract Developer',
      company: 'Independent & Open Source',
      period: '2024 - Present',
      desc: 'Architecting decentralized applications and smart contracts on Algorand and Polygon. Engineered DPDP Act 2023 compliance escrow micro-payment protocols and high-performance WebGL developer tools.'
    },
    {
      role: 'AI & Software Systems Engineer',
      company: 'Academic & Research Projects',
      period: '2023 - 2024',
      desc: 'Designed full-stack architectures, RESTful API services, role-based access control engines, and distributed communication platforms with automated CI/CD deployments.'
    }
  ],
  education: [],
  certifications: [],
  contact: {
    email: 'abdulaziznoor9876@gmail.com',
    github: 'https://github.com/Abdul-Aziz-Nooruddin',
    linkedin: 'https://linkedin.com'
  },
  social: {
    github: 'https://github.com/Abdul-Aziz-Nooruddin',
    linkedin: 'https://linkedin.com'
  }
};

module.exports = { DEFAULT_FOUNDER_PROFILE };
