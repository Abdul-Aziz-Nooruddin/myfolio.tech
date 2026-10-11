/**
 * AI Portfolio Studio — Client Application Engine (Phase 32)
 * Manages full lifecycle states, multi-input intake, truthful stage tracking,
 * live preview canvas, humanized customization, and resilient error recovery.
 */

// Lifecycle States
const LIFECYCLE_STATES = {
  DRAFT: 'DRAFT',
  COLLECTING_INPUT: 'COLLECTING_INPUT',
  GENERATING: 'GENERATING',
  READY: 'READY',
  CUSTOMIZING: 'CUSTOMIZING',
  EXPORTED: 'EXPORTED',
  FAILED: 'FAILED'
};

const STORAGE_KEY_SESSION = 'ai_portfolio_session_v32';
const STORAGE_KEY_DRAFT = 'ai_portfolio_draft_v32';

// Global Client State & Auth State
let currentUser = null;
let pendingAuthAction = null;
let persistedPortfolio = null; // Declared globally to avoid ReferenceError in openAuthModal

let clientState = {
  lifecycle: LIFECYCLE_STATES.DRAFT,
  siteId: null,
  previewUrl: null,
  profileData: null,
  designBlueprint: null,
  activeTab: 'github',
  sources: {
    github: null,
    resume: null,
    images: [],
    questions: null
  },
  timerInterval: null,
  startTime: null
};

// ==========================================================================
// 0. User Authentication Gate & Nav Bar Controller
// ==========================================================================
async function checkUserAuth() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      currentUser = data.user || data;
      updateNavAuthDock();
      return currentUser;
    }
  } catch (e) {}
  currentUser = null;
  updateNavAuthDock();
  return null;
}

function updateNavAuthDock() {
  const dock = document.getElementById('navAuthDock');
  if (!dock) return;

  if (currentUser) {
    dock.innerHTML = `
      <a href="/studio" class="btn-solar-outline">Web Studio</a>
      <a href="/dashboard" class="btn-solar-primary"><span>Dashboard</span></a>
    `;
  } else {
    dock.innerHTML = `
      <button type="button" class="btn-solar-outline" onclick="openAuthModal('signin')">Sign in</button>
      <button type="button" class="btn-solar-primary" onclick="openAuthModal('signup')">
        <span>Build my portfolio</span>
      </button>
    `;
  }
}

function requireAuth(actionCallback) {
  if (currentUser) {
    return true;
  }
  pendingAuthAction = actionCallback;
  openAuthModal('signup', 'Create a free account or sign in to build and save your portfolio.');
  return false;
}

function handleStartGeneratingClick() {
  document.getElementById('multiInputSection')?.scrollIntoView({ behavior: 'smooth' });
}

function openAuthModal(mode = 'signup') {
  if (mode === 'signin' || mode === 'login') {
    window.location.href = '/login';
    return;
  }
  window.location.href = '/signup';
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.style.display = 'none';
}

function switchAuthModalTab(tab = 'signup') {
  const tabSignup = document.getElementById('authTabSignup');
  const tabSignin = document.getElementById('authTabSignin');
  const formSignup = document.getElementById('modalSignupForm');
  const formSignin = document.getElementById('modalSigninForm');
  const title = document.getElementById('authModalTitle');
  const alertBox = document.getElementById('authModalAlert');

  if (alertBox) alertBox.style.display = 'none';

  if (tab === 'signup') {
    tabSignup?.classList.add('active');
    tabSignin?.classList.remove('active');
    if (formSignup) formSignup.style.display = 'block';
    if (formSignin) formSignin.style.display = 'none';
    if (title) title.textContent = 'Create Free Account';
  } else {
    tabSignin?.classList.add('active');
    tabSignup?.classList.remove('active');
    if (formSignin) formSignin.style.display = 'block';
    if (formSignup) formSignup.style.display = 'none';
    if (title) title.textContent = 'Sign in to AI Portfolio Studio';
  }
}

function showModalAlert(message, type = 'error') {
  const alertBox = document.getElementById('authModalAlert');
  if (!alertBox) return;
  alertBox.className = `auth-modal-alert alert-${type}`;
  alertBox.textContent = message;
  alertBox.style.display = 'block';
}

function togglePasswordVisibility(inputId, button) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (button) button.textContent = 'Hide';
  } else {
    input.type = 'password';
    if (button) button.textContent = 'Show';
  }
}

function updatePasswordStrength(password) {
  const label = document.getElementById('passwordStrengthLabel');
  const bars = [
    document.getElementById('meterBar1'),
    document.getElementById('meterBar2'),
    document.getElementById('meterBar3'),
    document.getElementById('meterBar4')
  ];

  if (!password || password.length === 0) {
    if (label) {
      label.className = 'strength-tag strength-empty';
      label.textContent = '8+ chars required';
    }
    bars.forEach(b => { if (b) b.style.background = 'rgba(255, 255, 255, 0.1)'; });
    return;
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score++;

  const configs = [
    { text: 'Too Weak', class: 'strength-weak', color: '#EF4444' },
    { text: 'Weak', class: 'strength-weak', color: '#EF4444' },
    { text: 'Fair', class: 'strength-fair', color: '#F59E0B' },
    { text: 'Strong', class: 'strength-strong', color: '#38BDF8' },
    { text: 'Quantum Safe ', class: 'strength-safe', color: '#22C55E' }
  ];

  const current = configs[score] || configs[0];
  if (label) {
    label.className = `strength-tag ${current.class}`;
    label.textContent = current.text;
  }

  bars.forEach((bar, index) => {
    if (bar) {
      bar.style.background = index < score ? current.color : 'rgba(255, 255, 255, 0.1)';
    }
  });
}

async function handleSocialAuth(provider = 'google') {
  if (provider === 'google') {
    window.location.href = '/api/auth/google';
    return;
  }
  window.location.href = `/api/auth/${provider}`;
}

async function openForgotPasswordFlow() {
  window.location.href = '/auth.html?view=forgot';
}

async function handleModalSignup(event) {
  if (event) event.preventDefault();
  const name = document.getElementById('modalSignupName')?.value?.trim();
  const email = document.getElementById('modalSignupEmail')?.value?.trim();
  const username = document.getElementById('modalSignupUsername')?.value?.trim();
  const password = document.getElementById('modalSignupPassword')?.value;
  const termsAccepted = document.getElementById('modalTermsAccepted')?.checked;
  const btn = document.getElementById('btnModalSignupSubmit');

  if (!termsAccepted) {
    return showModalAlert('You must agree to the Terms of Service & Privacy Policy.');
  }
  if (!name || !email || !password) {
    return showModalAlert('Please fill in all required fields.');
  }
  if (password.length < 8) {
    return showModalAlert('Password must be at least 8 characters long.');
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>Creating account...</span>';
  }

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, username, password, confirmPassword: password, termsAccepted: true })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Failed to create account');
    }

    currentUser = data.user || { name, email, username };
    updateNavAuthDock();
    showToast('Account Created', `Welcome to AI Portfolio Studio, ${name}!`, 'success');
    closeAuthModal();

    if (pendingAuthAction) {
      const action = pendingAuthAction;
      pendingAuthAction = null;
      action();
    }
  } catch (err) {
    showModalAlert(err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>Create Free Account &amp; Continue</span>';
    }
  }
}

async function handleModalSignin(event) {
  if (event) event.preventDefault();
  const identifier = document.getElementById('modalSigninIdentifier')?.value?.trim();
  const password = document.getElementById('modalSigninPassword')?.value;
  const btn = document.getElementById('btnModalSigninSubmit');

  if (!identifier || !password) {
    return showModalAlert('Please enter your email/username and password.');
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>Signing in...</span>';
  }

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifier, password, rememberMe: true })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Invalid credentials');
    }

    currentUser = data.user || { username: identifier };
    updateNavAuthDock();
    showToast('Signed In', `Welcome back, ${currentUser.name || identifier}!`, 'success');
    closeAuthModal();

    if (pendingAuthAction) {
      const action = pendingAuthAction;
      pendingAuthAction = null;
      action();
    }
  } catch (err) {
    showModalAlert(err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>Sign In to Developer Studio ➔</span>';
    }
  }
}

// Open a template specimen directly in studio
function openStudioWithTemplate(templateId) {
  const templateMap = {
    'jack-3d-creator': {
      name: 'Jack Vance',
      role: 'Creative Developer & 3D WebGL Engineer',
      bio: 'Crafting spatial web experiments, interactive 3D simulations, and high-performance WebGL architectures.',
      skills: ['TypeScript', 'Three.js', 'React', 'WebGL', 'GLSL Shaders', 'Node.js'],
      theme: 'jack-3d-creator'
    },
    'nadia-brand': {
      name: 'Nadia Okonjo',
      role: 'Keynote Speaker, Strategic Advisor & Author',
      bio: 'Helping large organisations make decisions faster without making them worse.',
      skills: ['Strategic Advisory', 'Keynote Speaking', 'Executive Coaching', 'Organizational Design', 'Author'],
      theme: 'nadia-brand'
    },
    'kage-temple': {
      name: 'Kenji Sato',
      role: '3D Spatial Engineer & Graphics Architect',
      bio: 'Crafting atmospheric Kyoto temple sanctuaries and GPU-accelerated spatial environments in Three.js.',
      skills: ['Three.js', 'WebGL', 'GLSL', 'TypeScript', 'Spatial Audio', 'Blender'],
      theme: 'kage-temple'
    },
    'rbp-kinetic-monochrome': {
      name: 'Josh Miller',
      role: 'Design Engineer & Full-Stack Developer',
      bio: 'Designing and engineering focused software surfaces where ideas and code coexist cleanly.',
      skills: ['TypeScript', 'WebGL', 'React', 'Next.js', 'Tailwind CSS', 'Figma'],
      theme: 'rbp-kinetic-monochrome'
    },
    'tom-cel-animator': {
      name: 'Felix Vance',
      role: 'Original Cel Animator & Storyboarder',
      bio: 'Senior Character Animator, Storyboard Artist, and Comic Illustrator crafting slapstick physics and kinetic hand-drawn storytelling.',
      skills: ['2D Cel Animation', 'Storyboarding', 'Character Design', 'Compositing', 'Toon Boom Harmony', 'Frame-by-Frame'],
      theme: 'tom-cel-animator'
    },
    'tom': {
      name: 'Felix Vance',
      role: 'Original Cel Animator & Storyboarder',
      bio: 'Senior Character Animator, Storyboard Artist, and Comic Illustrator crafting slapstick physics and kinetic hand-drawn storytelling.',
      skills: ['2D Cel Animation', 'Storyboarding', 'Character Design', 'Compositing', 'Toon Boom Harmony', 'Frame-by-Frame'],
      theme: 'tom-cel-animator'
    }
  };

  const selected = templateMap[templateId] || templateMap['jack-3d-creator'];
  loadSampleProfile({
    name: selected.name,
    role: selected.role,
    bio: selected.bio,
    skills: selected.skills,
    theme: selected.theme,
    projects: [
      {
        title: `${selected.name} Core Systems`,
        description: `Production-ready software architecture with verified telemetry and modular components.`,
        tags: selected.skills.slice(0, 3),
        impact: 'High-throughput system with sub-millisecond p99 latency'
      }
    ]
  });
}

function openStudioWithSample(personaKey) {
  openStudioWithTemplate(personaKey);
}

// ==========================================================================
// 1. Navigation & Tab Switching (3 Core Upload Options)
// ==========================================================================
function switchInputTab(tabName) {
  clientState.activeTab = tabName;
  const tabs = ['github', 'resume', 'questions'];
  
  tabs.forEach(t => {
    const btn = document.getElementById(`tabBtn${t.charAt(0).toUpperCase() + t.slice(1)}`);
    const panel = document.getElementById(`tabPanel${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (btn) btn.classList.toggle('active', t === tabName);
    if (panel) panel.classList.toggle('active', t === tabName);
  });
}

// ==========================================================================
// 2. Input Handlers: GitHub, Resume (PDF/Image), Questions
// ==========================================================================

// Option 1. GitHub Input Handler
async function handleGithubGenerate(event) {
  if (event) event.preventDefault();

  const inputEl = document.getElementById('githubUsernameInput');
  const themeEl = document.getElementById('githubThemeSelect');
  const rawInput = inputEl?.value?.trim();

  if (!rawInput) {
    showToast('Username Required', 'Please enter a valid GitHub username or profile link.', 'error');
    return;
  }

  // Clean username from full URL or shorthand
  const cleanUsername = rawInput
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/^github\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/.*$/, '')
    .trim();

  if (!cleanUsername) {
    showToast('Invalid Username', 'Could not parse a valid GitHub username from input.', 'error');
    return;
  }

  clientState.sources.github = {
    username: cleanUsername
  };
  saveDraftToStorage();

  const theme = themeEl?.value || 'auto';
  await startGenerationPipeline({
    githubData: { username: clientState.sources.github.username },
    photoData: clientState.sources.photo ? { url: clientState.sources.photo } : null,
    preferences: { theme }
  });
}

// Option 2. Resume PDF / Image Upload Handler & Drag-and-Drop
function processResumeFile(file) {
  if (!file) return;

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name);

  if (!isPdf && !isImage) {
    showStructuredError({
      whatHappened: "Unsupported file format.",
      why: "Resumes must be PDF documents or Image scans (PNG, JPG, WebP).",
      whatYouCanDo: "Please drag and drop or upload your resume in PDF or image format."
    });
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showStructuredError({
      whatHappened: "Resume exceeds 10 MB limit.",
      why: "Large files take too long to process.",
      whatYouCanDo: "Please upload a compressed resume file under 10 MB."
    });
    return;
  }

  const statusEl = document.getElementById('pdfUploadStatus');
  if (statusEl) statusEl.textContent = `Validating ${file.name}...`;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Data = e.target.result;
    try {
      const res = await fetch('/api/upload/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data, filename: file.name })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to validate resume');
      }

      clientState.sources.resume = {
        filename: file.name,
        sizeBytes: file.size,
        fileType: data.fileType || (isPdf ? 'pdf' : 'image'),
        pages: data.pages || 1,
        resumeData: data.resumeData
      };
      saveDraftToStorage();

      if (statusEl) statusEl.textContent = `Ready (${file.name})`;
      const fileTag = document.getElementById('resumeFileSummary');
      const nameTag = document.getElementById('resumeFileName');
      const btnGen = document.getElementById('btnGenerateResume');

      if (fileTag) fileTag.style.display = 'inline-flex';
      if (nameTag) nameTag.textContent = `${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`;
      if (btnGen) btnGen.style.display = 'inline-flex';

      showToast('Resume Verified', `${file.name} loaded and verified.`, 'success');
    } catch (err) {
      showStructuredError(err);
    }
  };
  reader.readAsDataURL(file);
}

function handleResumeFileSelected(event) {
  const file = event.target.files?.[0];
  processResumeFile(file);
}

function removeUploadedResume(event) {
  if (event) event.stopPropagation();
  clientState.sources.resume = null;
  saveDraftToStorage();

  const fileInput = document.getElementById('pdfFileInput');
  const fileTag = document.getElementById('resumeFileSummary');
  const btnGen = document.getElementById('btnGenerateResume');
  const statusEl = document.getElementById('pdfUploadStatus');

  if (fileInput) fileInput.value = '';
  if (fileTag) fileTag.style.display = 'none';
  if (btnGen) btnGen.style.display = 'none';
  if (statusEl) statusEl.textContent = 'Supports PDF, PNG, JPG, WebP • Max 10 MB';
}

// Optional Portrait Photo Upload for 3D Avatar Hologram
function processOptionalPhoto(file) {
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast('Image Too Large', `${file.name} exceeds 5 MB.`, 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Data = e.target.result;
    try {
      const res = await fetch('/api/upload/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data, filename: file.name })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to upload photo');

      clientState.sources.photo = data.dataUrl;
      saveDraftToStorage();

      ['optionalPhotoStatusGithub', 'optionalPhotoStatusResume', 'optionalPhotoStatusQuestions'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'inline-block';
      });

      showToast('Photo Attached', `${file.name} will be projected into your 3D custom avatar hologram!`, 'success');
    } catch (err) {
      showStructuredError(err);
    }
  };
  reader.readAsDataURL(file);
}

function handleOptionalPhotoSelected(event) {
  const file = event.target.files?.[0];
  processOptionalPhoto(file);
}

// Initialize Drag and Drop Listeners
function setupDragAndDropZones() {
  // Prevent default window drop behavior (e.g. browser opening dropped file)
  window.addEventListener('dragover', (e) => e.preventDefault(), false);
  window.addEventListener('drop', (e) => e.preventDefault(), false);

  // 1. Resume Drop Zone
  const resumeZone = document.getElementById('resumeDropZone');
  if (resumeZone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      resumeZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        resumeZone.classList.add('drag-over');
      }, false);
    });

    ['dragleave', 'dragend'].forEach(eventName => {
      resumeZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        resumeZone.classList.remove('drag-over');
      }, false);
    });

    resumeZone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      resumeZone.classList.remove('drag-over');
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        processResumeFile(files[0]);
      }
    }, false);
  }

  // 2. Optional Photo Boxes Drag & Drop
  document.querySelectorAll('.optional-photo-box').forEach(box => {
    ['dragenter', 'dragover'].forEach(eventName => {
      box.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        box.style.borderColor = '#38bdf8';
        box.style.background = 'rgba(56, 189, 248, 0.1)';
      }, false);
    });

    ['dragleave', 'dragend'].forEach(eventName => {
      box.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        box.style.borderColor = '';
        box.style.background = '';
      }, false);
    });

    box.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      box.style.borderColor = '';
      box.style.background = '';
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        processOptionalPhoto(files[0]);
      }
    }, false);
  });
}

async function generateFromResume() {
  if (!clientState.sources.resume) {
    showToast('Resume Required', 'Please upload a PDF or Image resume first.', 'error');
    return;
  }
  const theme = document.getElementById('resumeThemeSelect')?.value || 'auto';
  await startGenerationPipeline({
    resumeData: clientState.sources.resume.resumeData,
    photoData: clientState.sources.photo ? { url: clientState.sources.photo } : null,
    preferences: { theme }
  });
}

// Option 3. Guided Questions Handler
async function handleQuestionnaireSubmit(event) {
  if (event) event.preventDefault();

  const name = document.getElementById('qInputName')?.value?.trim();
  const role = document.getElementById('qInputRole')?.value?.trim();
  const project = document.getElementById('qInputProject')?.value?.trim();
  const skills = document.getElementById('qInputSkills')?.value?.trim();
  const tagline = document.getElementById('qInputTagline')?.value?.trim();

  const email = document.getElementById('qInputEmail')?.value?.trim();
  const phone = document.getElementById('qInputPhone')?.value?.trim();
  const location = document.getElementById('qInputLocation')?.value?.trim();
  const github = document.getElementById('qInputGithub')?.value?.trim();
  const linkedin = document.getElementById('qInputLinkedin')?.value?.trim();
  const twitter = document.getElementById('qInputTwitter')?.value?.trim();

  if (!name || !role || !project || !skills) {
    showToast('Missing Fields', 'Please fill out all required questions.', 'error');
    return;
  }

  clientState.sources.questions = {
    name,
    role,
    tagline,
    email: email || (currentUser?.email ? currentUser.email : null),
    phone: phone || null,
    location: location || null,
    github: github || null,
    linkedin: linkedin || null,
    twitter: twitter || null,
    socialLinks: {
      github: github || null,
      linkedin: linkedin || null,
      twitter: twitter || null
    },
    skills: skills.split(',').map(s => s.trim()).filter(Boolean),
    projects: [
      {
        name: project.substring(0, 60) || 'Flagship Project',
        desc: project,
        tech: skills.split(',').slice(0, 3).join(' • ')
      }
    ]
  };
  saveDraftToStorage();

  const theme = document.getElementById('questionsThemeSelect')?.value || 'auto';
  await startGenerationPipeline({
    questionnaireData: clientState.sources.questions,
    imagesData: clientState.sources.images,
    photoData: clientState.sources.photo ? { url: clientState.sources.photo } : null,
    preferences: { theme }
  });
}

// C. Visual Material (Images) Upload Handler
function handleImagesSelected(event) {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) return;

  const currentCount = clientState.sources.images.length;
  if (currentCount + files.length > 3) {
    showToast('Limit Reached', 'Maximum 3 supporting images allowed.', 'error');
    return;
  }

  files.forEach(file => {
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image Too Large', `${file.name} exceeds 5 MB.`, 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target.result;
      try {
        const res = await fetch('/api/upload/photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Data, filename: file.name })
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Invalid image signature');

        clientState.sources.images.push({
          url: data.dataUrl,
          filename: file.name,
          caption: `Specimen #${clientState.sources.images.length + 1}`
        });
        saveDraftToStorage();
        renderImageThumbnails();
        showToast('Image Added', `${file.name} uploaded successfully.`, 'success');
      } catch (err) {
        showStructuredError(err);
      }
    };
    reader.readAsDataURL(file);
  });
}

function renderImageThumbnails() {
  const container = document.getElementById('imageThumbnailsContainer');
  if (!container) return;

  if (clientState.sources.images.length === 0) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  container.style.display = 'grid';
  container.innerHTML = clientState.sources.images.map((img, idx) => `
    <div class="image-thumb-card">
      <img src="${img.url}" alt="${img.caption}">
      <button type="button" class="image-remove-btn" onclick="removeImageByIndex(${idx})" title="Remove image">✕</button>
    </div>
  `).join('');
}

function removeImageByIndex(index) {
  clientState.sources.images.splice(index, 1);
  saveDraftToStorage();
  renderImageThumbnails();
}

// D. Combined Multi-Source wrapper (kept for compatibility)

// E. Combined Multi-Source Generation
async function generateFromCombinedSources() {
  const hasAny = clientState.sources.github || clientState.sources.resume || clientState.sources.questions || clientState.sources.images.length > 0;
  if (!hasAny) {
    showToast('Input Required', 'Please connect at least one source (GitHub, Resume, Questions, or Images).', 'info');
    return;
  }

  const payload = {
    githubData: clientState.sources.github ? { username: clientState.sources.github.username } : null,
    resumeData: clientState.sources.resume ? clientState.sources.resume.resumeData : null,
    questionnaireData: clientState.sources.questions || null,
    imagesData: clientState.sources.images,
    photoData: clientState.sources.images[0] ? { url: clientState.sources.images[0].url } : null
  };

  await startGenerationPipeline(payload);
}

// ==========================================================================
// 3. Truthful Progress & Generation Pipeline Execution
// ==========================================================================
function openProgressModal() {
  const modal = document.getElementById('githubProgressModal');
  const errCard = document.getElementById('githubErrorCard');
  const box = document.getElementById('githubProgressBox');
  const timerBadge = document.getElementById('generationTimerBadge');

  if (modal) modal.style.display = 'flex';
  if (errCard) errCard.style.display = 'none';
  if (box) box.style.display = 'flex';

  clientState.startTime = performance.now();
  if (clientState.timerInterval) clearInterval(clientState.timerInterval);
  clientState.timerInterval = setInterval(() => {
    const elapsed = ((performance.now() - clientState.startTime) / 1000).toFixed(1);
    if (timerBadge) timerBadge.textContent = `Elapsed: ${elapsed}s`;
  }, 100);

  for (let i = 1; i <= 7; i++) {
    const stageEl = document.getElementById(`stage-${i}`);
    if (stageEl) {
      stageEl.classList.remove('active', 'completed');
      const icon = stageEl.querySelector('.stage-icon');
      if (icon) icon.textContent = '';
    }
  }
}

function updateProgressStage(stageNum, status = 'active') {
  for (let i = 1; i < stageNum; i++) {
    const prev = document.getElementById(`stage-${i}`);
    if (prev) {
      prev.classList.remove('active');
      prev.classList.add('completed');
      const icon = prev.querySelector('.stage-icon');
      if (icon) icon.textContent = '✓';
    }
  }

  const current = document.getElementById(`stage-${stageNum}`);
  if (current) {
    current.classList.add('active');
    const icon = current.querySelector('.stage-icon');
    if (icon) icon.textContent = status === 'completed' ? '✓' : '···';
    if (status === 'completed') current.classList.add('completed');
  }
}

function closeGithubModal() {
  if (clientState.timerInterval) clearInterval(clientState.timerInterval);
  const modal = document.getElementById('githubProgressModal');
  if (modal) modal.style.display = 'none';
}

async function startGenerationPipeline(payload) {
  if (clientState.lifecycle === LIFECYCLE_STATES.GENERATING) {
    console.warn('[GENERATION] Already in progress, ignoring duplicate trigger.');
    return;
  }
  clientState.lifecycle = LIFECYCLE_STATES.GENERATING;
  openProgressModal();
  updateProgressStage(1, 'active');

  try {
    updateProgressStage(2, 'active');
    updateProgressStage(3, 'active');

    const res = await fetch('/api/generate/unified', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    updateProgressStage(4, 'active');
    updateProgressStage(5, 'active');

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw data;
    }

    updateProgressStage(6, 'active');
    updateProgressStage(7, 'completed');

    if (clientState.timerInterval) clearInterval(clientState.timerInterval);

    // Populate Studio & Transition
    clientState.lifecycle = LIFECYCLE_STATES.READY;
    clientState.siteId = data.siteId;
    clientState.previewUrl = data.previewUrl;
    clientState.profileData = data.profileData;
    clientState.designBlueprint = data.designBlueprint;

    saveSessionToStorage();
    setTimeout(() => {
      closeGithubModal();
      openStudioView(data);
      if (data?.previewUrl) {
        try {
          window.open(data.previewUrl, '_blank');
        } catch (e) {
          console.warn('Popup blocked or not allowed:', e);
        }
      }
      showToast('Portfolio Live!', 'Your bespoke portfolio has been synthesized and opened in a new tab.', 'success');
    }, 400);
  } catch (err) {
    if (clientState.timerInterval) clearInterval(clientState.timerInterval);
    clientState.lifecycle = LIFECYCLE_STATES.FAILED;
    showStructuredError(err);
  }
}

// ==========================================================================
// 4. Studio Fullscreen Canvas & Preview Controller
// ==========================================================================
function openStudioView(data = null) {
  const landing = document.getElementById('heroLanding');
  const studio = document.getElementById('studioWorkspace');
  const iframe = document.getElementById('portfolioIframe');
  const nameLabel = document.getElementById('studioPortfolioName');
  const openLink = document.getElementById('btnOpenNewTab');
  const loader = document.getElementById('previewLoader');

  if (landing) landing.style.display = 'none';
  if (studio) studio.style.display = 'flex';
  window.scrollTo({ top: 0, behavior: 'instant' });

  const previewUrl = data?.previewUrl || clientState.previewUrl;
  const name = data?.profileData?.identity?.name || data?.profileData?.name || clientState.profileData?.identity?.name || clientState.profileData?.name || 'Your Portfolio';

  if (nameLabel) nameLabel.textContent = `${name}'s Portfolio`;
  if (loader) loader.style.display = 'none';
  if (iframe && previewUrl) {
    iframe.src = previewUrl;
  }
  if (openLink && previewUrl) {
    openLink.href = previewUrl;
    openLink.style.display = 'inline-flex';
  }
}

function closeStudioView() {
  const landing = document.getElementById('heroLanding');
  const studio = document.getElementById('studioWorkspace');
  if (studio) studio.style.display = 'none';
  if (landing) landing.style.display = 'block';
}

function setDeviceMode(mode, btnEl) {
  const wrapper = document.getElementById('previewFrameWrapper');
  if (!wrapper) return;

  wrapper.className = `preview-frame-wrapper ${mode}-mode`;
  document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
}

async function regenerateStudioDesign() {
  if (!clientState.profileData) {
    showToast('No Active Data', 'Please configure your profile sources first.', 'error');
    return;
  }
  await startGenerationPipeline({
    questionnaireData: clientState.profileData,
    photoData: clientState.profileData.photoUrl ? { url: clientState.profileData.photoUrl } : null,
    imagesData: clientState.profileData.images || []
  });
}

// ==========================================================================
// 5. Humanized Customizer Controller
// ==========================================================================
function openCustomizerModal() {
  if (!clientState.siteId) {
    showToast('No Site Active', 'Please generate a portfolio first.', 'info');
    return;
  }
  const drawer = document.getElementById('customizerDrawer');
  if (drawer) drawer.style.display = 'flex';
  fetchCustomizerSections();
}

function closeCustomizerModal() {
  const drawer = document.getElementById('customizerDrawer');
  if (drawer) drawer.style.display = 'none';
}

async function applyHumanToken(category, value, btnEl) {
  if (!clientState.siteId) return;

  const parent = btnEl?.closest('.pill-options-group');
  if (parent) {
    parent.querySelectorAll('.pill-opt-btn').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
  }

  const tokenMap = {
    spacing: { compact: 'compact', balanced: 'balanced', spacious: 'spacious' },
    corners: { sharp: 'sharp', soft: 'soft', rounded: 'rounded' },
    typography: { quiet: 'quiet', editorial: 'editorial', bold: 'bold' },
    motion: { still: 'still', subtle: 'subtle', expressive: 'expressive' }
  };

  const chosen = tokenMap[category]?.[value] || value;
  try {
    const res = await fetch(`/api/portfolio/${clientState.siteId}/customizer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'modify_token',
        token: `--human-${category}`,
        value: chosen
      })
    });
    const data = await res.json();
    if (data.success && data.previewUrl) {
      refreshPreviewIframe();
    }
  } catch (e) {
    console.warn('Customizer token update notice:', e);
  }
}

async function fetchCustomizerSections() {
  if (!clientState.siteId) return;
  const container = document.getElementById('customizerSectionsList');
  if (!container) return;

  try {
    const res = await fetch(`/api/portfolio/${clientState.siteId}/customizer/state`);
    const data = await res.json();
    if (data.success && data.state?.sections) {
      container.innerHTML = data.state.sections.map((sec, idx) => `
        <div class="customizer-section-item">
          <div>
            <strong>${sec.title || sec.id}</strong>
          </div>
          <div style="display:flex; gap:6px;">
            <button type="button" class="btn-ghost-mini" onclick="handleMoveSection('${sec.id}', 'up')" ${idx === 0 ? 'disabled' : ''}>↑</button>
            <button type="button" class="btn-ghost-mini" onclick="handleMoveSection('${sec.id}', 'down')" ${idx === data.state.sections.length - 1 ? 'disabled' : ''}>↓</button>
            <button type="button" class="btn-ghost-mini" onclick="handleToggleSectionVisibility('${sec.id}')">${sec.visible !== false ? 'Hide' : 'Show'}</button>
          </div>
        </div>
      `).join('');
    }
  } catch (e) {
    console.warn('Section fetch notice:', e);
  }
}

async function handleMoveSection(sectionId, direction) {
  if (!clientState.siteId) return;
  try {
    await fetch(`/api/portfolio/${clientState.siteId}/customizer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reorder_section', sectionId, direction })
    });
    fetchCustomizerSections();
    refreshPreviewIframe();
  } catch (e) {}
}

async function handleToggleSectionVisibility(sectionId) {
  if (!clientState.siteId) return;
  try {
    await fetch(`/api/portfolio/${clientState.siteId}/customizer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_visibility', sectionId })
    });
    fetchCustomizerSections();
    refreshPreviewIframe();
  } catch (e) {}
}

async function handleCustomizerAction(action) {
  if (!clientState.siteId) return;
  try {
    await fetch(`/api/portfolio/${clientState.siteId}/customizer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    fetchCustomizerSections();
    refreshPreviewIframe();
    showToast('Customizer', `Action ${action} completed.`, 'info');
  } catch (e) {}
}

function refreshPreviewIframe() {
  const iframe = document.getElementById('portfolioIframe');
  if (iframe && clientState.previewUrl) {
    const url = new URL(clientState.previewUrl, window.location.origin);
    url.searchParams.set('t', Date.now().toString());
    iframe.src = url.toString();
  }
}

// ==========================================================================
// 6. Static ZIP Export & Samples
// ==========================================================================
function openExportModal() {
  if (!clientState.siteId) {
    showToast('No Site Active', 'Please generate your portfolio first.', 'info');
    return;
  }
  const modal = document.getElementById('exportModal');
  if (modal) modal.style.display = 'flex';
}

function closeExportModal() {
  const modal = document.getElementById('exportModal');
  if (modal) modal.style.display = 'none';
}

function downloadStaticZip() {
  if (!clientState.siteId) return;
  window.location.href = `/api/portfolio/${clientState.siteId}/export`;
  showToast('Packaging ZIP', 'Your offline website is downloading.', 'success');
  closeExportModal();
}

function openSamplesModal() {
  const modal = document.getElementById('samplesModal');
  if (modal) modal.style.display = 'flex';
  loadSamplesList();
}

function closeSamplesModal() {
  const modal = document.getElementById('samplesModal');
  if (modal) modal.style.display = 'none';
}

async function loadSamplesList() {
  const grid = document.getElementById('samplesGalleryGrid');
  if (!grid) return;

  try {
    const res = await fetch('/api/demo/samples');
    const data = await res.json();
    if (data.success && data.samples) {
      grid.innerHTML = data.samples.map(s => {
        const cleanRole = (s.role || s.badge || 'Creative 3D').replace(/\//g, ' • ');
        return `
        <div class="sample-card">
          <div class="sample-card-body">
            <span class="sample-category-tag">${cleanRole}</span>
            <h4 class="sample-title">${s.name}</h4>
            <p class="sample-description">${s.description || 'Immersive 3D portfolio environment with responsive physics and spatial lighting.'}</p>
          </div>
          <div class="sample-action-row">
            <a href="${s.previewUrl}" target="_blank" rel="noopener noreferrer" class="sample-btn-live">
              <span>Live preview</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
            <button type="button" class="sample-btn-studio" onclick="useTemplateInStudio('${s.id}')">Open in studio</button>
          </div>
        </div>
      `;
      }).join('');
    }
  } catch (e) {
    grid.innerHTML = '<p style="color: #9C97B8; text-align: center; padding: 20px;">Unable to load templates at this moment.</p>';
  }
}

function useTemplateInStudio(templateId) {
  closeSamplesModal();
  window.location.href = `/studio.html?template=${encodeURIComponent(templateId || '')}`;
}

function loadSampleProfile(sampleId) {
  useTemplateInStudio(sampleId);
}

// ==========================================================================
// 7. Structured Error Recovery Modal Controller
// ==========================================================================
function showStructuredError(err) {
  const errBox = document.getElementById('githubErrorCard');
  const progressBox = document.getElementById('githubProgressBox');
  const titleEl = document.getElementById('errorWhatHappenedTitle');
  const whyEl = document.getElementById('errorWhyText');
  const adviceEl = document.getElementById('errorWhatYouCanDoBox');
  const btnPrimary = document.getElementById('btnErrorPrimaryAction');
  const btnSecondary = document.getElementById('btnErrorSecondaryAction');

  if (progressBox) progressBox.style.display = 'none';
  if (errBox) errBox.style.display = 'block';

  const recovery = err?.recovery || {
    whatHappened: err?.whatHappened || err?.error || err?.message || 'Unable to complete request.',
    why: err?.why || 'An unexpected condition occurred during synthesis.',
    whatYouCanDo: err?.whatYouCanDo || 'Your data is safe. Click Try Again to retry.',
    primaryAction: 'Try Again',
    secondaryAction: 'Continue with Resume'
  };

  if (titleEl) titleEl.textContent = recovery.whatHappened;
  if (whyEl) whyEl.textContent = recovery.why;
  if (adviceEl) adviceEl.textContent = recovery.whatYouCanDo;
  if (btnPrimary) btnPrimary.textContent = recovery.primaryAction || 'Try Again';
  if (btnSecondary) btnSecondary.textContent = recovery.secondaryAction || 'Continue with Resume';
}

function handleErrorPrimaryAction() {
  closeGithubModal();
  if (clientState.activeTab === 'github') {
    handleGithubGenerate();
  } else if (clientState.activeTab === 'resume') {
    generateFromResume();
  } else if (clientState.activeTab === 'questions') {
    handleQuestionnaireSubmit();
  } else {
    generateFromCombinedSources();
  }
}

function handleErrorSecondaryAction() {
  closeGithubModal();
  switchInputTab('resume');
}

// ==========================================================================
// 8. Session & Draft Persistence
// ==========================================================================
function saveDraftToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify({
      sources: clientState.sources,
      activeTab: clientState.activeTab,
      timestamp: Date.now()
    }));
  } catch (e) {}
}

function saveSessionToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify({
      siteId: clientState.siteId,
      previewUrl: clientState.previewUrl,
      profileData: clientState.profileData,
      designBlueprint: clientState.designBlueprint,
      sources: clientState.sources,
      timestamp: Date.now()
    }));
    renderResumedBanner();
  } catch (e) {}
}

function restorePersistedDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DRAFT);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed.sources) {
      clientState.sources = parsed.sources;
      if (parsed.sources.github?.username) {
        const ghInput = document.getElementById('githubUsernameInput');
        if (ghInput) ghInput.value = parsed.sources.github.username;
      }
      renderImageThumbnails();
      updateCombinedSummaryChecklist();
    }
  } catch (e) {}
}

function restorePersistedSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed.siteId && parsed.previewUrl) {
      clientState.siteId = parsed.siteId;
      clientState.previewUrl = parsed.previewUrl;
      clientState.profileData = parsed.profileData;
      clientState.designBlueprint = parsed.designBlueprint;
      renderResumedBanner();
    }
  } catch (e) {}
}

function renderResumedBanner() {
  const banner = document.getElementById('resumedSessionBanner');
  const userSpan = document.getElementById('resumedUsername');
  if (!banner || !clientState.siteId) return;

  if (userSpan) {
    userSpan.textContent = clientState.profileData?.name || `@${clientState.sources.github?.username || 'developer'}`;
  }
  banner.style.display = 'flex';
}

function reopenPersistedPortfolio() {
  if (!clientState.siteId) return;
  openStudioView();
}

function clearPersistedPortfolio() {
  localStorage.removeItem(STORAGE_KEY_SESSION);
  localStorage.removeItem(STORAGE_KEY_DRAFT);
  clientState.siteId = null;
  clientState.previewUrl = null;
  const banner = document.getElementById('resumedSessionBanner');
  if (banner) banner.style.display = 'none';
  showToast('Session Cleared', 'Active portfolio session removed.', 'info');
}

// ==========================================================================
// 9. Toast Notification System
// ==========================================================================
function showToast(title, message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.innerHTML = `<strong>${title}</strong>: ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================================================
// 10. Global Window Exports & Init
// ==========================================================================
window.switchInputTab = switchInputTab;
window.handleGithubGenerate = handleGithubGenerate;
window.handleResumeFileSelected = handleResumeFileSelected;
window.removeUploadedResume = removeUploadedResume;
window.generateFromResume = generateFromResume;
window.handleImagesSelected = handleImagesSelected;
window.removeImageByIndex = removeImageByIndex;
window.handleQuestionnaireSubmit = handleQuestionnaireSubmit;
window.generateFromCombinedSources = generateFromCombinedSources;
window.openStudioView = openStudioView;
window.closeStudioView = closeStudioView;
window.setDeviceMode = setDeviceMode;
window.regenerateStudioDesign = regenerateStudioDesign;
window.openCustomizerModal = openCustomizerModal;
window.closeCustomizerModal = closeCustomizerModal;
window.applyHumanToken = applyHumanToken;
window.handleMoveSection = handleMoveSection;
window.handleToggleSectionVisibility = handleToggleSectionVisibility;
window.handleCustomizerAction = handleCustomizerAction;
window.openExportModal = openExportModal;
window.closeExportModal = closeExportModal;
window.downloadStaticZip = downloadStaticZip;
window.openSamplesModal = openSamplesModal;
window.closeSamplesModal = closeSamplesModal;
window.loadSampleProfile = loadSampleProfile;
window.closeGithubModal = closeGithubModal;
window.handleErrorPrimaryAction = handleErrorPrimaryAction;
window.handleErrorSecondaryAction = handleErrorSecondaryAction;
window.reopenPersistedPortfolio = reopenPersistedPortfolio;
window.clearPersistedPortfolio = clearPersistedPortfolio;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthModalTab = switchAuthModalTab;
window.handleModalSignup = handleModalSignup;
window.handleModalSignin = handleModalSignin;
window.togglePasswordVisibility = togglePasswordVisibility;
window.updatePasswordStrength = updatePasswordStrength;
window.handleSocialAuth = handleSocialAuth;
window.openForgotPasswordFlow = openForgotPasswordFlow;
window.handleStartGeneratingClick = handleStartGeneratingClick;
window.openStudioWithSample = openStudioWithSample;
window.checkUserAuth = checkUserAuth;
window.setupDragAndDropZones = setupDragAndDropZones;
window.processResumeFile = processResumeFile;
window.processOptionalPhoto = processOptionalPhoto;

async function syncDynamicUniverseCounts() {
  try {
    const res = await fetch('/api/web/templates');
    if (!res.ok) return;
    const data = await res.json();
    const count = data?.count || (Array.isArray(data?.templates) ? data.templates.length : null);
    if (typeof count === 'number' && count > 0) {
      document.querySelectorAll('.dynamic-universe-count').forEach(el => {
        el.textContent = count;
      });
      const heroBtn = document.getElementById('heroUniversesCountBtn');
      if (heroBtn) {
        heroBtn.innerHTML = `Explore <span class="dynamic-universe-count">${count}</span> living universes`;
      }
      const bentoBtn = document.getElementById('bentoUniversesCountBtn');
      if (bentoBtn) {
        bentoBtn.innerHTML = `Browse all <span class="dynamic-universe-count">${count}</span> living universes`;
      }
      const studioBadge = document.getElementById('studioUniverseBadgeCount');
      if (studioBadge) {
        studioBadge.textContent = `${count} Universes`;
      }
    }
  } catch (e) {
    // Keep initial fallback counts
  }
}

window.syncDynamicUniverseCounts = syncDynamicUniverseCounts;

// Hydrate on page load
window.addEventListener('DOMContentLoaded', () => {
  checkUserAuth();
  restorePersistedDraft();
  restorePersistedSession();
  setupDragAndDropZones();
  syncDynamicUniverseCounts();
});
