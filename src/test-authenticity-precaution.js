const assert = require('assert');
const { UnifiedProfileNormalizer } = require('./services/unified-profile-normalizer');
const { DEFAULT_FOUNDER_PROFILE } = require('./data/default-founder-profile');

console.log('Testing Career Stage & Authenticity Precaution Engine...');

// Test 1: Student Profile with inflated title input
const studentInput = {
  name: 'Student Candidate',
  role: 'Senior Systems Architect & Lead Engineer', // Inflated claim
  bio: 'Computer Science student pursuing B.Tech in Artificial Intelligence. Passionate about Web3.',
  education: [
    {
      degree: 'B.Tech in Computer Science',
      institution: 'Tech University',
      period: '2023 - 2027' // Currently enrolled
    }
  ],
  skills: ['Solidity', 'Algorand', 'Python', 'React'],
  experience: [] // No corporate experience
};

const normalizedStudent = UnifiedProfileNormalizer.normalize(studentInput);

assert.strictEqual(normalizedStudent.careerStage, 'student', 'Must classify as student with 100% certainty');
assert.strictEqual(normalizedStudent.authenticityGuarantee.verified, true, 'Authenticity must be verified');
assert.ok(normalizedStudent.authenticityGuarantee.disallowedTitlesRemoved.length > 0, 'Must strip inflated titles (architect, lead, senior)');
assert.ok(!normalizedStudent.role.toLowerCase().includes('architect'), 'Normalized role must NOT contain Architect');
assert.ok(!normalizedStudent.role.toLowerCase().includes('lead'), 'Normalized role must NOT contain Lead');
assert.ok(normalizedStudent.role.includes('Student'), 'Normalized role must honestly represent Student builder status');
assert.ok(!normalizedStudent.experience[0].desc.includes('Directing application architecture'), 'Must not invent fake director experience');

console.log('✔ Test 1 Passed: Student title inflation successfully intercepted and sanitized.');

// Test 2: Verified Senior Professional
const seniorInput = {
  name: 'Jane Doe',
  role: 'Senior Staff Engineer',
  education: [
    {
      degree: 'B.S. in Computer Science',
      period: '2012 - 2016'
    }
  ],
  experience: [
    {
      role: 'Staff Software Engineer',
      company: 'Stripe Inc',
      period: '2019 - Present'
    },
    {
      role: 'Software Engineer II',
      company: 'Amazon Web Services',
      period: '2016 - 2019'
    }
  ]
};

const normalizedSenior = UnifiedProfileNormalizer.normalize(seniorInput);
assert.ok(normalizedSenior.careerStage === 'senior' || normalizedSenior.careerStage === 'lead_architect', 'Must classify experienced engineer as senior');
assert.strictEqual(normalizedSenior.authenticityGuarantee.disallowedTitlesRemoved.length, 0, 'Must NOT strip titles from legitimate verified seniors');

console.log('✔ Test 2 Passed: Senior engineer credentials preserved with proof.');

// Test 3: Abdul Aziz Nooruddin Profile Verification
const abdulAzizProfile = DEFAULT_FOUNDER_PROFILE;
const normalizedAziz = UnifiedProfileNormalizer.normalize(abdulAzizProfile);

assert.strictEqual(normalizedAziz.careerStage, 'student', 'Abdul Aziz profile must be accurately identified as student builder');
assert.ok(normalizedAziz.role.includes('Student'), 'Abdul Aziz role must contain Student');

console.log('✔ Test 3 Passed: Abdul Aziz profile verified as authentic student builder.');

console.log('✅ ALL CAREER STAGE AUTHENTICITY TESTS PASSED!');
