import { navigate } from '../router.js';
import { getState, updateLearningPath, toggleTopicComplete, getApiKey } from '../store.js';
import { createLearningPath } from '../agents/learningAgent.js';
import { showToast } from '../components/toast.js';
import { showApiKeyModal } from '../components/apiKeyModal.js';

export async function render(container) {
  const { profile, learningPath, completedTopics = [] } = getState();
  if (!profile) { navigate('landing'); return; }

  container.innerHTML = `
    <div class="view" style="padding:40px 0;min-height:100vh;">
      <div class="container" style="max-width:900px;">
        <div class="section-header">
          <div class="section-icon" style="background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3);">🗺️</div>
          <div>
            <h1 style="font-size:1.5rem;">Learning Roadmap</h1>
            <p style="color:var(--text-secondary);font-size:0.88rem;">Your personalized week-by-week learning plan</p>
          </div>
          <button class="btn btn-primary" id="gen-btn" style="margin-left:auto;">
            ${learningPath ? '🔄 Regenerate' : '⚡ Generate Plan'}
          </button>
        </div>
        <div id="roadmap-content">
          ${learningPath ? renderRoadmap(learningPath, completedTopics) : renderEmpty(profile)}
        </div>
      </div>
    </div>
  `;

  document.getElementById('gen-btn').onclick = generatePath;
  bindCheckboxes();
  document.getElementById('start-gen-btn')?.addEventListener('click', generatePath);
}

function renderEmpty(profile) {
  return `
    <div style="text-align:center;padding:90px 20px;">
      <div style="font-size:4.5rem;margin-bottom:24px;filter:drop-shadow(0 0 20px rgba(16,185,129,0.4));">🗺️</div>
      <h2 style="font-size:1.6rem;margin-bottom:12px;">Create Your Learning Roadmap</h2>
      <p style="color:var(--text-secondary);max-width:500px;margin:0 auto 32px;line-height:1.8;">
        The Learning Planner Agent will build a personalized week-by-week roadmap with real courses,
        YouTube channels, and practice resources to make you a <strong>${profile.targetRole}</strong>.
      </p>
      <button class="btn btn-primary" id="start-gen-btn" style="font-size:1rem;padding:14px 32px;">⚡ Generate My Roadmap</button>
    </div>
  `;
}

function renderRoadmap(roadmap, completedTopics) {
  const typeIcon  = { Course:'🎓', Practice:'💻', Project:'🔨', Reading:'📖' };
  const typeColor = {
    Course:  'rgba(124,58,237,0.15)',
    Practice:'rgba(6,182,212,0.15)',
    Project: 'rgba(245,158,11,0.15)',
    Reading: 'rgba(16,185,129,0.15)',
  };

  const allTopics = (roadmap.phases||[]).flatMap(p => p.topics||[]);
  const total = allTopics.length;
  const done  = completedTopics.length;
  const pct   = total > 0 ? Math.round((done/total)*100) : 0;

  return `
    <div>
      <!-- Progress Card -->
      <div class="glass-card" style="padding:24px;margin-bottom:32px;border-color:rgba(16,185,129,0.2);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
          <div>
            <h2 style="font-family:var(--font-heading);font-size:1rem;margin-bottom:4px;">${roadmap.title||'Your Learning Path'}</h2>
            <p style="color:var(--text-muted);font-size:0.8rem;">🎯 ${roadmap.finalGoal||''}</p>
          </div>
          <div style="text-align:right;">
            <span style="color:var(--purple-light);font-size:0.9rem;font-weight:600;">${done} / ${total} topics</span>
            <p style="color:var(--text-muted);font-size:0.75rem;margin-top:2px;">${roadmap.totalWeeks} weeks total</p>
          </div>
        </div>
        <div class="progress-bar-container" style="height:10px;">
          <div class="progress-bar-fill" style="width:${pct}%;"></div>
        </div>
        <p style="font-size:0.75rem;color:var(--text-muted);margin-top:8px;">${pct}% complete ${pct===100?'🎉 Roadmap finished!':pct>50?'— great momentum! 🔥':'— keep going!'}</p>
      </div>

      <!-- Timeline -->
      <div class="timeline">
        ${(roadmap.phases||[]).map((phase) => `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="glass-card" style="padding:24px;">
              <!-- Phase header -->
              <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:14px;margin-bottom:20px;">
                <div>
                  <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                    <span class="badge badge-purple">Phase ${phase.phase}</span>
                    <span style="color:var(--text-muted);font-size:0.78rem;">${phase.weeks}</span>
                  </div>
                  <h3 style="font-family:var(--font-heading);font-size:1.05rem;margin-bottom:4px;">${phase.title}</h3>
                  <p style="color:var(--text-secondary);font-size:0.83rem;">${phase.focus}</p>
                </div>
                <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:10px 14px;max-width:200px;">
                  <p style="font-size:0.68rem;color:#34D399;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.05em;">Milestone</p>
                  <p style="font-size:0.8rem;color:var(--text-secondary);line-height:1.5;">${phase.milestone}</p>
                </div>
              </div>

              <!-- Topics -->
              <div style="display:flex;flex-direction:column;gap:10px;">
                ${(phase.topics||[]).map(topic => {
                  const isComplete = completedTopics.includes(topic.id);
                  return `
                    <div style="display:flex;gap:12px;align-items:flex-start;padding:16px;border-radius:12px;
                                border:1px solid ${isComplete?'rgba(16,185,129,0.3)':'var(--border)'};
                                background:${isComplete?'rgba(16,185,129,0.04)':'var(--surface)'};
                                transition:all 0.3s;">
                      <!-- Checkbox -->
                      <button class="topic-cb" data-id="${topic.id}"
                        style="width:26px;height:26px;border-radius:7px;flex-shrink:0;cursor:pointer;
                               border:2px solid ${isComplete?'var(--green)':'var(--border)'};
                               background:${isComplete?'var(--green)':'transparent'};
                               color:white;font-size:0.7rem;font-weight:700;
                               display:flex;align-items:center;justify-content:center;
                               transition:all 0.25s;margin-top:2px;">
                        ${isComplete?'✓':''}
                      </button>
                      <!-- Type icon -->
                      <div style="width:36px;height:36px;border-radius:8px;flex-shrink:0;
                                  background:${typeColor[topic.type]||'var(--surface)'};
                                  display:flex;align-items:center;justify-content:center;font-size:1rem;">
                        ${typeIcon[topic.type]||'📚'}
                      </div>
                      <!-- Content -->
                      <div style="flex:1;min-width:0;">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;flex-wrap:wrap;">
                          <div>
                            <span class="badge badge-cyan" style="font-size:0.66rem;margin-bottom:5px;display:inline-flex;">${topic.type}</span>
                            <h4 style="font-weight:600;font-size:0.92rem;${isComplete?'text-decoration:line-through;opacity:0.5;':''}">${topic.name}</h4>
                            <p style="color:var(--text-secondary);font-size:0.8rem;margin-top:3px;line-height:1.5;">${topic.description}</p>
                          </div>
                          <span style="font-size:0.72rem;color:var(--text-muted);flex-shrink:0;">⏱️ ${topic.estimatedHours}h</span>
                        </div>
                        ${topic.resource && topic.resourceUrl ? `
                          <a href="${topic.resourceUrl}" target="_blank" rel="noopener"
                            style="display:inline-flex;align-items:center;gap:5px;margin-top:9px;font-size:0.78rem;
                                   color:var(--purple-light);text-decoration:none;padding:4px 10px;
                                   border-radius:6px;border:1px solid rgba(124,58,237,0.25);
                                   background:rgba(124,58,237,0.06);transition:all 0.2s;"
                            onmouseover="this.style.background='rgba(124,58,237,0.14)'"
                            onmouseout="this.style.background='rgba(124,58,237,0.06)'">
                            🔗 ${topic.resource} ↗
                          </a>
                        ` : ''}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function bindCheckboxes() {
  document.querySelectorAll('.topic-cb').forEach(cb => {
    cb.addEventListener('click', () => {
      const id = cb.dataset.id;
      const newState = toggleTopicComplete(id);
      const done = newState.completedTopics.includes(id);
      cb.style.background = done ? 'var(--green)' : 'transparent';
      cb.style.borderColor = done ? 'var(--green)' : 'var(--border)';
      cb.textContent = done ? '✓' : '';
      const row = cb.closest('[style*="flex-direction"]') || cb.closest('div[style]');
      if (row) {
        row.style.borderColor = done ? 'rgba(16,185,129,0.3)' : 'var(--border)';
        row.style.background  = done ? 'rgba(16,185,129,0.04)' : 'var(--surface)';
      }
    });
  });
}

async function generatePath() {
  const state = getState();
  const btn = document.getElementById('gen-btn');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Generating…`;

  document.getElementById('roadmap-content').innerHTML = `
    <div class="loading-orb">
      <div class="orb-spinner"></div>
      <p style="color:var(--text-secondary);">Learning Planner Agent is crafting your roadmap…</p>
      <p style="color:var(--text-muted);font-size:0.8rem;">Creating a personalized week-by-week plan with curated resources</p>
    </div>
  `;

  try {
    const result = await createLearningPath(state.profile, state.skillGap);
    updateLearningPath(result);
    document.getElementById('roadmap-content').innerHTML = renderRoadmap(result, state.completedTopics||[]);
    bindCheckboxes();
    showToast('Learning roadmap created! 🗺️', 'success');
  } catch (e) {
    showToast(e.message||'Generation failed. Check your API key.', 'error');
    document.getElementById('roadmap-content').innerHTML = renderEmpty(state.profile);
    document.getElementById('start-gen-btn')?.addEventListener('click', generatePath);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '🔄 Regenerate';
  }
}
