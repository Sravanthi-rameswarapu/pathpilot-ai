import { navigate } from '../router.js';
import { getState, updateSkillGap, getApiKey } from '../store.js';
import { detectSkillGaps } from '../agents/skillGapAgent.js';
import { showToast } from '../components/toast.js';
import { showApiKeyModal } from '../components/apiKeyModal.js';

export async function render(container) {
  const { profile, skillGap } = getState();
  if (!profile) { navigate('landing'); return; }

  container.innerHTML = `
    <div class="view" style="padding:40px 0;min-height:100vh;">
      <div class="container">
        <div class="section-header">
          <div class="section-icon" style="background:rgba(6,182,212,0.12);border:1px solid rgba(6,182,212,0.3);">🎯</div>
          <div>
            <h1 style="font-size:1.5rem;">Skill Gap Analysis</h1>
            <p style="color:var(--text-secondary);font-size:0.88rem;">Find exactly what skills you need for <strong>${profile.targetRole}</strong></p>
          </div>
          <button class="btn btn-primary" id="analyze-btn" style="margin-left:auto;">
            ${skillGap ? '🔄 Re-analyze' : '⚡ Analyze Now'}
          </button>
        </div>
        <div id="gap-content">
          ${skillGap ? renderResults(skillGap, profile) : renderEmpty(profile)}
        </div>
      </div>
    </div>
  `;

  document.getElementById('analyze-btn').onclick = runAnalysis;
  bindResultsListeners();
}

function renderEmpty(profile) {
  return `
    <div style="text-align:center;padding:90px 20px;">
      <div style="font-size:4.5rem;margin-bottom:24px;filter:drop-shadow(0 0 20px rgba(6,182,212,0.4));">🎯</div>
      <h2 style="font-size:1.6rem;margin-bottom:12px;">Ready to Find Your Gaps?</h2>
      <p style="color:var(--text-secondary);max-width:500px;margin:0 auto 32px;line-height:1.8;">
        The Skill Gap Agent will compare your current skills against what's required for
        <strong>${profile.targetRole}</strong> and identify exactly what you need to learn — ranked by severity.
      </p>
      <button class="btn btn-primary" id="start-analyze-btn" style="font-size:1rem;padding:14px 32px;">⚡ Start Gap Analysis</button>
    </div>
  `;
}

function renderResults(sg, profile) {
  const score = sg.overallGapScore || 0;
  const scoreColor = score > 70 ? '#10B981' : score > 45 ? '#F59E0B' : '#EF4444';
  const critical = (sg.gaps||[]).filter(g=>g.severity==='Critical').length;
  const moderate = (sg.gaps||[]).filter(g=>g.severity==='Moderate').length;
  const minor    = (sg.gaps||[]).filter(g=>g.severity==='Minor').length;

  return `
    <div style="display:grid;gap:22px;">

      <!-- Overview -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(185px,1fr));gap:16px;">
        <div class="glass-card stat-card">
          <div style="font-size:2.4rem;font-weight:700;font-family:var(--font-heading);color:${scoreColor};">${score}%</div>
          <div class="stat-label">Skill Match Score</div>
          <div class="progress-bar-container" style="margin-top:12px;height:6px;">
            <div class="progress-bar-fill" style="width:${score}%;background:${scoreColor};"></div>
          </div>
        </div>
        <div class="glass-card stat-card">
          <div class="stat-value">${(sg.gaps||[]).length}</div>
          <div class="stat-label">Gaps Found</div>
          <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:center;margin-top:10px;">
            ${critical?`<span class="badge badge-red" style="font-size:0.66rem;">${critical} Critical</span>`:''}
            ${moderate?`<span class="badge badge-orange" style="font-size:0.66rem;">${moderate} Moderate</span>`:''}
            ${minor?`<span class="badge badge-cyan" style="font-size:0.66rem;">${minor} Minor</span>`:''}
          </div>
        </div>
        <div class="glass-card stat-card">
          <div class="stat-value">${(sg.matchedSkills||[]).length}</div>
          <div class="stat-label">Skills You Have</div>
        </div>
        <div class="glass-card stat-card">
          <div style="font-size:1.1rem;font-weight:700;font-family:var(--font-heading);margin-bottom:4px;">${sg.estimatedTimeToClose||'N/A'}</div>
          <div class="stat-label">Est. Time to Close Gaps</div>
        </div>
      </div>

      <!-- Gaps -->
      <div class="glass-card" style="padding:28px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px;">
          <h2 style="font-family:var(--font-heading);font-size:1.05rem;">🚨 Skills You Need to Learn</h2>
          <span class="badge badge-red">${(sg.gaps||[]).length} gaps identified</span>
        </div>
        ${(sg.gaps||[]).map(g=>`
          <div style="display:flex;gap:14px;align-items:flex-start;padding:14px 0;border-bottom:1px solid var(--border);">
            <span class="badge ${g.severity==='Critical'?'badge-red':g.severity==='Moderate'?'badge-orange':'badge-cyan'}" style="flex-shrink:0;margin-top:2px;">${g.severity}</span>
            <div style="flex:1;">
              <div style="font-weight:600;margin-bottom:3px;">${g.skill}</div>
              <div style="color:var(--text-secondary);font-size:0.83rem;line-height:1.6;">${g.description}</div>
              ${g.estimatedLearnTime?`<div style="color:var(--cyan-light);font-size:0.75rem;margin-top:4px;">⏱️ ~${g.estimatedLearnTime} to learn</div>`:''}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Quick Wins -->
      ${sg.quickWins?.length ? `
        <div class="glass-card" style="padding:28px;">
          <h2 style="font-family:var(--font-heading);font-size:1.05rem;margin-bottom:18px;">⚡ Quick Wins — High Impact, Fast to Learn</h2>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${sg.quickWins.map((s,i)=>`
              <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(124,58,237,0.04);border:1px solid rgba(124,58,237,0.1);border-radius:10px;">
                <span style="width:28px;height:28px;border-radius:50%;background:var(--gradient-brand);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;color:white;">${i+1}</span>
                <span style="font-weight:500;">${s}</span>
                <span class="badge badge-green" style="margin-left:auto;font-size:0.66rem;">High Impact</span>
              </div>
            `).join('')}
          </div>
          <button class="btn btn-primary" id="goto-roadmap-btn" style="margin-top:20px;width:100%;">
            🗺️ Create Learning Path for These Gaps →
          </button>
        </div>
      ` : ''}

      <!-- Matched Skills -->
      ${(sg.matchedSkills||[]).length ? `
        <div class="glass-card" style="padding:28px;">
          <h2 style="font-family:var(--font-heading);font-size:1.05rem;margin-bottom:16px;">✅ Skills You Already Have</h2>
          <div style="display:flex;flex-wrap:wrap;gap:9px;">
            ${sg.matchedSkills.map(s=>`
              <span style="padding:5px 14px;border-radius:99px;font-size:0.83rem;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);color:#34D399;">${s}</span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Requirements Table -->
      ${(sg.targetRoleRequirements||[]).length ? `
        <div class="glass-card" style="padding:28px;">
          <h2 style="font-family:var(--font-heading);font-size:1.05rem;margin-bottom:20px;">📋 ${profile.targetRole} — Full Requirements</h2>
          ${sg.targetRoleRequirements.map(r=>`
            <div class="skill-level-bar">
              <span class="skill-name">${r.skill}</span>
              <div class="skill-bar-wrap">
                <div class="skill-bar-fill ${r.importance==='Critical'?'critical':r.importance==='Important'?'medium':'good'}"
                  style="width:${r.importance==='Critical'?95:r.importance==='Important'?70:40}%;"></div>
              </div>
              <span class="badge ${r.importance==='Critical'?'badge-red':r.importance==='Important'?'badge-orange':'badge-cyan'}" style="font-size:0.66rem;flex-shrink:0;">${r.importance}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

    </div>
  `;
}

function bindResultsListeners() {
  document.getElementById('start-analyze-btn')?.addEventListener('click', runAnalysis);
  document.getElementById('goto-roadmap-btn')?.addEventListener('click', () => navigate('learning-path'));
}

async function runAnalysis() {
  const state = getState();
  const btn = document.getElementById('analyze-btn');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Analyzing…`;

  document.getElementById('gap-content').innerHTML = `
    <div class="loading-orb">
      <div class="orb-spinner"></div>
      <p style="color:var(--text-secondary);">Skill Gap Agent is analyzing your profile…</p>
      <p style="color:var(--text-muted);font-size:0.8rem;">Comparing your skills with ${state.profile.targetRole} requirements</p>
    </div>
  `;

  try {
    const result = await detectSkillGaps(state.profile);
    updateSkillGap(result);
    document.getElementById('gap-content').innerHTML = renderResults(result, state.profile);
    bindResultsListeners();
    showToast('Skill gap analysis complete! ✅', 'success');
  } catch (e) {
    showToast(e.message || 'Analysis failed. Check your API key.', 'error');
    document.getElementById('gap-content').innerHTML = renderEmpty(state.profile);
    bindResultsListeners();
  } finally {
    btn.disabled = false;
    btn.innerHTML = '🔄 Re-analyze';
  }
}
