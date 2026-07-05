import { navigate } from '../router.js';
import { updateProfile, updateState, getApiKey } from '../store.js';
import { analyzeProfile } from '../agents/profileAgent.js';
import { showToast } from '../components/toast.js';
import { showApiKeyModal } from '../components/apiKeyModal.js';
import { refreshNavbar } from '../components/navbar.js';

const ROLES = ['Software Engineer','Full Stack Developer','Frontend Developer','Backend Developer',
  'Data Scientist','Machine Learning Engineer','AI/ML Researcher','Data Analyst',
  'Product Manager','DevOps Engineer','Cloud Engineer','Mobile Developer (Android/iOS)',
  'Cybersecurity Analyst','Blockchain Developer','Game Developer','QA Engineer',
  'UI/UX Designer','System Architect','Embedded Systems Engineer','Research Scientist'];

const DEGREES = ['B.Tech / B.E.','B.Sc Computer Science','B.Sc Information Technology',
  'MCA','M.Tech / M.E.','M.Sc','BCA','Diploma','PhD'];

const YEARS = ['1st Year','2nd Year','3rd Year','4th Year','Final Year','Graduate'];

const SKILLS_SUGGESTIONS = [
  'Python','JavaScript','Java','C++','C','TypeScript','Go','Rust','Kotlin','Swift',
  'React','Vue.js','Angular','Node.js','Django','Flask','Spring Boot','Express.js','FastAPI',
  'SQL','MongoDB','PostgreSQL','MySQL','Redis','Firebase',
  'Machine Learning','Deep Learning','TensorFlow','PyTorch','scikit-learn','Data Analysis','Pandas','NumPy',
  'Git','Docker','Kubernetes','AWS','Azure','Linux','CI/CD',
  'HTML/CSS','Data Structures','Algorithms','System Design','REST APIs','GraphQL',
];

const INTERESTS_SUGGESTIONS = [
  'Web Development','Mobile Apps','Artificial Intelligence','Machine Learning','Data Science',
  'Cloud Computing','Cybersecurity','Game Development','Open Source','Startups','Finance & Fintech',
  'Healthcare Tech','Research','DevOps','Blockchain','EdTech','Social Impact','Robotics',
];

let step = 1;
let form = { skills: [], interests: [] };
let container_ref = null;

export async function render(container) {
  container_ref = container;
  step = 1;
  form = { skills: [], interests: [] };
  
  container.innerHTML = `
    <div class="view" style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px 16px;">
      <div style="width:100%;max-width:700px;">
        <div style="text-align:center;margin-bottom:40px;">
          <span class="badge badge-purple" style="display:inline-flex;margin-bottom:14px;">👤 Profile Setup</span>
          <h1 style="font-size:2.2rem;margin-bottom:10px;">Tell Us About <span class="gradient-text">Yourself</span></h1>
          <p style="color:var(--text-secondary);">Our AI agents need your profile to personalize everything just for you</p>
        </div>

        <div class="step-indicator" id="step-indicator">
          <div class="step"><div class="step-circle active" id="sc1">1</div></div>
          <div class="step"><div class="step-line" id="sl1"></div></div>
          <div class="step"><div class="step-circle" id="sc2">2</div></div>
          <div class="step"><div class="step-line" id="sl2"></div></div>
          <div class="step"><div class="step-circle" id="sc3">3</div></div>
        </div>

        <div class="glass-card" style="padding:40px;" id="form-card">
          <div id="step-content">${getStep1Html()}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:32px;padding-top:24px;border-top:1px solid var(--border);">
            <button class="btn btn-secondary" id="back-btn" style="visibility:hidden;">← Back</button>
            <span style="color:var(--text-muted);font-size:0.8rem;" id="step-label">Step 1 of 3</span>
            <button class="btn btn-primary" id="next-btn">Continue →</button>
          </div>
        </div>
      </div>
    </div>
  `;

  bindButtons();
  bindStepListeners();
}

function getStep1Html() {
  return `
    <p style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.07em;margin-bottom:20px;">Step 1 — Basic Info</p>
    <div style="display:grid;gap:18px;">
      <div class="input-group">
        <label>Your Full Name</label>
        <input type="text" id="f-name" placeholder="e.g. Arjun Sharma" value="${form.name||''}" />
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="input-group">
          <label>Degree Program</label>
          <select id="f-degree">
            <option value="">Select degree…</option>
            ${DEGREES.map(d=>`<option value="${d}"${form.degree===d?' selected':''}>${d}</option>`).join('')}
          </select>
        </div>
        <div class="input-group">
          <label>Current Year</label>
          <select id="f-year">
            <option value="">Select year…</option>
            ${YEARS.map(y=>`<option value="${y}"${form.year===y?' selected':''}>${y}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="input-group">
        <label>Target Role</label>
        <select id="f-role">
          <option value="">Select your dream role…</option>
          ${ROLES.map(r=>`<option value="${r}"${form.targetRole===r?' selected':''}>${r}</option>`).join('')}
        </select>
      </div>
    </div>
  `;
}

function getStep2Html() {
  return `
    <p style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.07em;margin-bottom:20px;">Step 2 — Your Skills</p>
    <div class="input-group" style="margin-bottom:16px;">
      <label>Current Skills <span style="color:var(--text-muted);font-weight:400;text-transform:none;">(type + Enter, or click suggestions)</span></label>
      <div class="tags-container" id="skills-box">
        ${form.skills.map(s=>`<span class="tag">${s}<button class="tag-remove" data-val="${s}" data-type="skills">×</button></span>`).join('')}
        <input type="text" class="tags-input" id="skills-input" placeholder="Add a skill…" />
      </div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:7px;margin-top:4px;">
      ${SKILLS_SUGGESTIONS.map(s=>`
        <button class="sug-btn" data-val="${s}" data-type="skills"
          style="padding:4px 12px;border-radius:99px;font-size:0.75rem;cursor:pointer;
            background:${form.skills.includes(s)?'rgba(124,58,237,0.25)':'var(--surface)'};
            border:1px solid ${form.skills.includes(s)?'rgba(124,58,237,0.5)':'var(--border)'};
            color:${form.skills.includes(s)?'var(--purple-light)':'var(--text-secondary)'};
            transition:all 0.2s;">${s}</button>
      `).join('')}
    </div>
  `;
}

function getStep3Html() {
  return `
    <p style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.07em;margin-bottom:20px;">Step 3 — Interests & Experience</p>
    <div class="input-group" style="margin-bottom:16px;">
      <label>Your Interests <span style="color:var(--text-muted);font-weight:400;text-transform:none;">(select all that apply)</span></label>
      <div class="tags-container" id="interests-box">
        ${form.interests.map(s=>`<span class="tag" style="background:rgba(6,182,212,0.15);border-color:rgba(6,182,212,0.4);color:var(--cyan-light);">${s}<button class="tag-remove" data-val="${s}" data-type="interests">×</button></span>`).join('')}
        <input type="text" class="tags-input" id="interests-input" placeholder="Add an interest…" />
      </div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:20px;">
      ${INTERESTS_SUGGESTIONS.map(s=>`
        <button class="sug-btn" data-val="${s}" data-type="interests"
          style="padding:4px 12px;border-radius:99px;font-size:0.75rem;cursor:pointer;
            background:${form.interests.includes(s)?'rgba(6,182,212,0.2)':'var(--surface)'};
            border:1px solid ${form.interests.includes(s)?'rgba(6,182,212,0.5)':'var(--border)'};
            color:${form.interests.includes(s)?'var(--cyan-light)':'var(--text-secondary)'};
            transition:all 0.2s;">${s}</button>
      `).join('')}
    </div>
    <div class="input-group" style="margin-bottom:${!getApiKey()?'0':'0'}">
      <label>Experience Level</label>
      <select id="f-experience">
        <option value="Student"${form.experience==='Student'?' selected':''}>Student (No work experience)</option>
        <option value="Intern"${form.experience==='Intern'?' selected':''}>Done internship(s)</option>
        <option value="Part-time"${form.experience==='Part-time'?' selected':''}>Part-time work experience</option>
        <option value="1+ years"${form.experience==='1+ years'?' selected':''}>1+ year work experience</option>
      </select>
    </div>
    ${!getApiKey() ? `
      <div style="margin-top:16px;padding:16px;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:12px;">
        <p style="color:#FCD34D;font-size:0.82rem;margin-bottom:8px;">⚠️ Demo Mode Active (No API Key)</p>
        <p style="color:var(--text-muted);font-size:0.78rem;margin-bottom:10px;">The app will use pre-built realistic demo data. Add a Gemini API key anytime to get personalized AI generations.</p>
        <button class="btn btn-secondary" id="add-key-btn" style="font-size:0.78rem;padding:8px 16px;">🔑 Add API Key</button>
      </div>
    ` : ''}
  `;
}

function bindButtons() {
  document.getElementById('next-btn').onclick = handleNext;
  document.getElementById('back-btn').onclick = handleBack;
}

function bindStepListeners() {
  if (step === 2) bindTagListeners('skills-input', 'skills-box', 'skills');
  if (step === 3) {
    bindTagListeners('interests-input', 'interests-box', 'interests');
    document.getElementById('add-key-btn')?.addEventListener('click', () => showApiKeyModal());
  }
  
  document.querySelectorAll('.sug-btn').forEach(btn => {
    btn.onclick = () => {
      const val = btn.dataset.val;
      const type = btn.dataset.type;
      if (form[type].includes(val)) {
        form[type] = form[type].filter(x => x !== val);
        const box = document.getElementById(type === 'skills' ? 'skills-box' : 'interests-box');
        box.querySelectorAll('.tag').forEach(t => {
          if (t.textContent.replace('×','').trim() === val) t.remove();
        });
      } else {
        const box = document.getElementById(type === 'skills' ? 'skills-box' : 'interests-box');
        const input = document.getElementById(type === 'skills' ? 'skills-input' : 'interests-input');
        addTag(type, val, box, input);
      }
      rerenderSuggestionBtn(btn, val, type);
    };
  });
}

function bindTagListeners(inputId, boxId, type) {
  const input = document.getElementById(inputId);
  const box   = document.getElementById(boxId);
  if (!input || !box) return;

  input.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) {
      e.preventDefault();
      addTag(type, input.value.trim(), box, input);
    }
  });
  box.addEventListener('click', e => {
    if (e.target.classList.contains('tag-remove')) {
      const val = e.target.dataset.val;
      form[type] = form[type].filter(x => x !== val);
      e.target.closest('.tag').remove();
      document.querySelectorAll(`.sug-btn[data-val="${val}"][data-type="${type}"]`).forEach(b => {
        rerenderSuggestionBtn(b, val, type);
      });
    }
  });
}

function addTag(type, val, box, input) {
  if (!val || form[type].includes(val)) return;
  form[type].push(val);
  const isCyan = type === 'interests';
  const tag = document.createElement('span');
  tag.className = 'tag';
  if (isCyan) tag.style.cssText = 'background:rgba(6,182,212,0.15);border-color:rgba(6,182,212,0.4);color:var(--cyan-light);';
  tag.innerHTML = `${val}<button class="tag-remove" data-val="${val}" data-type="${type}">×</button>`;
  box.insertBefore(tag, input);
  if (input) input.value = '';
  document.querySelectorAll(`.sug-btn[data-val="${val}"][data-type="${type}"]`).forEach(b => {
    rerenderSuggestionBtn(b, val, type);
  });
}

function rerenderSuggestionBtn(btn, val, type) {
  const selected = form[type].includes(val);
  const isCyan = type === 'interests';
  btn.style.background = selected ? (isCyan ? 'rgba(6,182,212,0.2)' : 'rgba(124,58,237,0.25)') : 'var(--surface)';
  btn.style.borderColor = selected ? (isCyan ? 'rgba(6,182,212,0.5)' : 'rgba(124,58,237,0.5)') : 'var(--border)';
  btn.style.color = selected ? (isCyan ? 'var(--cyan-light)' : 'var(--purple-light)') : 'var(--text-secondary)';
}

function goToStep(n) {
  step = n;
  const content = document.getElementById('step-content');
  content.style.opacity = '0';
  content.style.transform = 'translateX(16px)';
  content.style.transition = '0.25s ease';

  setTimeout(() => {
    content.innerHTML = n === 1 ? getStep1Html() : n === 2 ? getStep2Html() : getStep3Html();
    content.style.opacity = '1';
    content.style.transform = 'translateX(0)';

    // Update circles
    [1,2,3].forEach(i => {
      const c = document.getElementById(`sc${i}`);
      c.className = 'step-circle' + (i < n ? ' completed' : i === n ? ' active' : '');
      if (i < 3) document.getElementById(`sl${i}`).className = 'step-line' + (i < n ? ' completed' : '');
    });

    document.getElementById('step-label').textContent = `Step ${n} of 3`;
    document.getElementById('back-btn').style.visibility = n > 1 ? 'visible' : 'hidden';
    document.getElementById('next-btn').textContent = n === 3 ? '🚀 Launch PathPilot' : 'Continue →';
    document.getElementById('next-btn').disabled = false;

    bindStepListeners();
  }, 180);
}

function handleBack() { if (step > 1) goToStep(step - 1); }

function handleNext() {
  if (step === 1) {
    const name = document.getElementById('f-name')?.value.trim();
    const degree = document.getElementById('f-degree')?.value;
    const year = document.getElementById('f-year')?.value;
    const targetRole = document.getElementById('f-role')?.value;
    if (!name || !degree || !year || !targetRole) {
      showToast('Please fill in all fields to continue', 'error'); return;
    }
    form = { ...form, name, degree, year, targetRole };
    goToStep(2);
  } else if (step === 2) {
    if (form.skills.length < 1) { showToast('Add at least one skill', 'error'); return; }
    goToStep(3);
  } else {
    const experience = document.getElementById('f-experience')?.value || 'Student';
    if (form.interests.length < 1) { showToast('Add at least one interest', 'error'); return; }
    form = { ...form, experience };
    submitProfile();
  }
}

async function submitProfile() {
  const btn = document.getElementById('next-btn');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Setting up your profile…`;

  try {
    updateProfile(form);

    try {
      const analysis = await analyzeProfile(form);
      updateState({ analysis });
    } catch (e) {
      console.warn('Profile analysis skipped:', e.message);
    }

    refreshNavbar();
    showToast(`Welcome to PathPilot, ${form.name}! 🎉`, 'success');
    navigate('dashboard');
  } catch (err) {
    showToast(err.message || 'Something went wrong', 'error');
    btn.disabled = false;
    btn.textContent = '🚀 Launch PathPilot';
  }
}
