import { navigate } from '../router.js';
import { getState, getApiKey } from '../store.js';
import { showApiKeyModal } from '../components/apiKeyModal.js';

const TILES = [
  { route:'skill-gap',     icon:'🎯', label:'Skill Gap Analysis',   desc:'Identify what you\'re missing for your target role', color:'#06B6D4', alpha:'rgba(6,182,212,0.12)' },
  { route:'learning-path', icon:'🗺️', label:'Learning Roadmap',      desc:'Week-by-week personalized plan with real resources', color:'#10B981', alpha:'rgba(16,185,129,0.12)' },
  { route:'projects',      icon:'💡', label:'Project Recommender',   desc:'6 portfolio projects matched to your skill level',  color:'#F59E0B', alpha:'rgba(245,158,11,0.12)' },
  { route:'interview',     icon:'🎤', label:'Interview Coach',       desc:'Mock DSA, System Design, HR & Behavioral rounds',  color:'#EC4899', alpha:'rgba(236,72,153,0.12)' },
  { route:'career',        icon:'🧭', label:'Career Path Advisor',   desc:'Career mapping with salary ranges & growth data',  color:'#8B5CF6', alpha:'rgba(139,92,246,0.12)' },
];

export async function render(container) {
  const { profile, analysis, skillGap, learningPath, completedTopics = [] } = getState();
  if (!profile) { navigate('landing'); return; }

  const score = analysis?.readinessScore || 0;
  const C = 2 * Math.PI * 52;
  const offset = C - (score / 100) * C;

  container.innerHTML = `
    <div class="view" style="padding:40px 0;min-height:100vh;">
      <div class="container">

        <!-- Welcome Header -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;flex-wrap:wrap;gap:16px;">
          <div>
            <p style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Welcome back 👋</p>
            <h1 style="font-size:2.2rem;margin-bottom:6px;">Hey, <span class="gradient-text">${profile.name}</span></h1>
            <p style="color:var(--text-secondary);">${profile.targetRole} candidate &nbsp;·&nbsp; ${profile.degree} &nbsp;·&nbsp; ${profile.year}</p>
          </div>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <button class="btn btn-secondary" id="edit-profile-btn" style="font-size:0.82rem;">✏️ Edit Profile</button>
            ${!getApiKey() ? `<button class="btn btn-primary" id="add-key-dash-btn" style="font-size:0.82rem;">🔑 Add API Key</button>` : ''}
          </div>
        </div>

        <!-- Stats Row -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:18px;margin-bottom:36px;">

          <!-- Readiness Ring -->
          <div class="glass-card stat-card">
            <p style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:14px;">Career Readiness</p>
            <div class="readiness-ring">
              <svg viewBox="0 0 120 120" width="128" height="128">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="9"/>
                <circle cx="60" cy="60" r="52" fill="none"
                  stroke="url(#rg)" stroke-width="9" stroke-linecap="round"
                  stroke-dasharray="${C}" stroke-dashoffset="${offset}"
                  id="ring-circle" style="transition:stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1);"/>
                <defs>
                  <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#7C3AED"/>
                    <stop offset="100%" stop-color="#06B6D4"/>
                  </linearGradient>
                </defs>
              </svg>
              <div class="ring-text">
                <span class="ring-score" id="ring-num">0</span>
                <span class="ring-label">readiness</span>
              </div>
            </div>
            <span class="badge badge-purple" style="margin-top:10px;">${analysis?.skillLevel || 'Getting Started'}</span>
          </div>

          <!-- Skills -->
          <div class="glass-card stat-card">
            <div class="stat-value">${profile.skills.length}</div>
            <div class="stat-label">Skills Logged</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:12px;">
              ${profile.skills.slice(0,4).map(s=>`<span class="badge badge-cyan" style="font-size:0.68rem;">${s}</span>`).join('')}
              ${profile.skills.length>4?`<span class="badge badge-purple" style="font-size:0.68rem;">+${profile.skills.length-4}</span>`:''}
            </div>
          </div>

          <!-- Progress -->
          <div class="glass-card stat-card">
            <div class="stat-value">${completedTopics.length}</div>
            <div class="stat-label">Topics Completed</div>
            <div style="margin-top:14px;">
              <div class="progress-bar-container" style="height:6px;">
                <div class="progress-bar-fill" style="width:${Math.min(completedTopics.length*8,100)}%;"></div>
              </div>
              <p style="font-size:0.7rem;color:var(--text-muted);margin-top:6px;">Keep the streak alive 🔥</p>
            </div>
          </div>

          <!-- Target Role -->
          <div class="glass-card stat-card">
            <div style="font-size:2.2rem;margin-bottom:8px;">🎯</div>
            <div style="font-size:1rem;font-weight:600;font-family:var(--font-heading);margin-bottom:4px;line-height:1.3;">${profile.targetRole}</div>
            <div class="stat-label">Target Role</div>
            <span class="badge badge-green" style="margin-top:10px;font-size:0.68rem;">Active Goal</span>
          </div>
        </div>

        <!-- AI Analysis Panel -->
        ${analysis ? `
          <div class="glass-card" style="padding:28px;margin-bottom:36px;border-color:rgba(124,58,237,0.2);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px;">
              <h2 style="font-family:var(--font-heading);font-size:1.05rem;">🤖 AI Profile Analysis</h2>
              <span class="badge badge-purple">Profile Agent ✓</span>
            </div>
            <p style="color:var(--text-secondary);line-height:1.8;margin-bottom:22px;">${analysis.summary}</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
              <div>
                <p style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">💪 Strengths</p>
                ${(analysis.strengths||[]).map(s=>`
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                    <span style="color:var(--green);font-size:0.9rem;">✓</span>
                    <span style="font-size:0.88rem;">${s}</span>
                  </div>`).join('')}
              </div>
              <div>
                <p style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px;">📈 Focus Areas</p>
                ${(analysis.improvementAreas||[]).map(a=>`
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                    <span style="color:var(--orange);font-size:0.9rem;">→</span>
                    <span style="font-size:0.88rem;">${a}</span>
                  </div>`).join('')}
              </div>
            </div>
          </div>
        ` : `
          <div class="glass-card" style="padding:28px;margin-bottom:36px;text-align:center;">
            <p style="font-size:1.5rem;margin-bottom:10px;">🔑</p>
            <p style="color:var(--text-secondary);margin-bottom:16px;">Add your Gemini API key to unlock AI-powered analysis & all agents</p>
            <button class="btn btn-primary" id="add-key-panel-btn">Add API Key →</button>
          </div>
        `}

        <!-- Agent Tiles -->
        <div style="margin-bottom:20px;">
          <h2 style="font-family:var(--font-heading);font-size:1.1rem;margin-bottom:6px;">Your AI Agents</h2>
          <p style="color:var(--text-secondary);font-size:0.85rem;">Click any agent to get personalized help</p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:18px;margin-bottom:40px;">
          ${TILES.map(t => `
            <div class="glass-card" style="padding:22px;cursor:pointer;position:relative;overflow:hidden;" data-route="${t.route}">
              <div style="position:absolute;top:0;right:0;width:80px;height:80px;background:radial-gradient(circle,${t.color}25,transparent);border-radius:0 0 0 80px;"></div>
              <div style="width:46px;height:46px;border-radius:12px;background:${t.alpha};border:1px solid ${t.color}35;display:flex;align-items:center;justify-content:center;font-size:1.2rem;margin-bottom:14px;">
                ${t.icon}
              </div>
              <h3 style="font-family:var(--font-heading);font-size:0.95rem;margin-bottom:5px;">${t.label}</h3>
              <p style="color:var(--text-secondary);font-size:0.82rem;line-height:1.6;margin-bottom:14px;">${t.desc}</p>
              <span style="font-size:0.78rem;color:${t.color};font-weight:600;">Open Agent →</span>
            </div>
          `).join('')}
        </div>

        <!-- Skills Chips -->
        <div class="glass-card" style="padding:24px;">
          <h3 style="font-family:var(--font-heading);font-size:0.95rem;margin-bottom:16px;">🛠️ Your Current Skills</h3>
          <div style="display:flex;flex-wrap:wrap;gap:9px;">
            ${profile.skills.map(sk=>`
              <span style="padding:6px 16px;border-radius:99px;font-size:0.82rem;background:var(--surface);border:1px solid var(--border);color:var(--text-secondary);transition:all 0.2s;">${sk}</span>
            `).join('')}
          </div>
        </div>

      </div>
    </div>
  `;

  // Animate score counter
  if (score > 0) {
    const el = document.getElementById('ring-num');
    let cur = 0;
    const step = Math.ceil(score / 60);
    const iv = setInterval(() => {
      cur = Math.min(cur + step, score);
      el.textContent = cur;
      if (cur >= score) clearInterval(iv);
    }, 25);
  }

  // Tile navigation
  container.querySelectorAll('[data-route]').forEach(t => {
    t.addEventListener('click', () => navigate(t.dataset.route));
  });

  document.getElementById('edit-profile-btn')?.addEventListener('click', () => navigate('onboarding'));
  document.getElementById('add-key-dash-btn')?.addEventListener('click', () => showApiKeyModal());
  document.getElementById('add-key-panel-btn')?.addEventListener('click', () => showApiKeyModal());
}
