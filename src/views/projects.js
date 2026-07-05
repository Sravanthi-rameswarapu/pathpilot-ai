import { navigate } from '../router.js';
import { getState, updateProjects, getApiKey } from '../store.js';
import { recommendProjects } from '../agents/projectAgent.js';
import { showToast } from '../components/toast.js';
import { showApiKeyModal } from '../components/apiKeyModal.js';

let activeFilter = 'All';

export async function render(container) {
  const { profile, projects } = getState();
  if (!profile) { navigate('landing'); return; }

  container.innerHTML = `
    <div class="view" style="padding:40px 0;min-height:100vh;">
      <div class="container">
        <div class="section-header">
          <div class="section-icon" style="background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);">💡</div>
          <div>
            <h1 style="font-size:1.5rem;">Project Recommender</h1>
            <p style="color:var(--text-secondary);font-size:0.88rem;">Portfolio projects that will impress recruiters at ${profile.targetRole} interviews</p>
          </div>
          <button class="btn btn-primary" id="get-projects-btn" style="margin-left:auto;">
            ${projects ? '🔄 New Ideas' : '⚡ Get Projects'}
          </button>
        </div>

        ${projects ? `
          <div style="display:flex;gap:10px;margin-bottom:28px;flex-wrap:wrap;">
            ${['All','Beginner','Intermediate','Advanced'].map(f=>`
              <button class="filter-btn" data-f="${f}"
                style="padding:8px 20px;border-radius:99px;font-size:0.83rem;cursor:pointer;transition:all 0.2s;
                       background:${activeFilter===f?'rgba(245,158,11,0.2)':'var(--surface)'};
                       border:1px solid ${activeFilter===f?'rgba(245,158,11,0.5)':'var(--border)'};
                       color:${activeFilter===f?'#FCD34D':'var(--text-secondary)'};">
                ${f} ${f!=='All'?`(${(projects.projects||[]).filter(p=>p.difficulty===f).length})`:''}
              </button>
            `).join('')}
          </div>
        ` : ''}

        <div id="projects-grid">
          ${projects ? renderProjects(projects) : renderEmpty(profile)}
        </div>
      </div>
    </div>
  `;

  document.getElementById('get-projects-btn').onclick = fetchProjects;
  document.getElementById('start-proj-btn')?.addEventListener('click', fetchProjects);

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.f;
      render(container);
    });
  });
}

function renderEmpty(profile) {
  return `
    <div style="text-align:center;padding:90px 20px;">
      <div style="font-size:4.5rem;margin-bottom:24px;filter:drop-shadow(0 0 20px rgba(245,158,11,0.4));">💡</div>
      <h2 style="font-size:1.6rem;margin-bottom:12px;">Get Project Recommendations</h2>
      <p style="color:var(--text-secondary);max-width:500px;margin:0 auto 32px;line-height:1.8;">
        The Project Recommender will suggest <strong>6 portfolio projects</strong> — 2 at each level —
        perfectly tailored for your skills and target role as <strong>${profile.targetRole}</strong>.
      </p>
      <button class="btn btn-primary" id="start-proj-btn" style="font-size:1rem;padding:14px 32px;">⚡ Generate Project Ideas</button>
    </div>
  `;
}

function renderProjects(data) {
  const all = data.projects || [];
  const list = activeFilter === 'All' ? all : all.filter(p => p.difficulty === activeFilter);

  const DC = {
    Beginner:     { bg:'rgba(16,185,129,0.1)',  bd:'rgba(16,185,129,0.3)',  tx:'#34D399',  badge:'badge-green'  },
    Intermediate: { bg:'rgba(245,158,11,0.1)',  bd:'rgba(245,158,11,0.3)',  tx:'#FCD34D',  badge:'badge-orange' },
    Advanced:     { bg:'rgba(239,68,68,0.1)',   bd:'rgba(239,68,68,0.3)',   tx:'#F87171',  badge:'badge-red'    },
  };

  if (!list.length) return `<div style="text-align:center;padding:60px 20px;color:var(--text-muted);">No projects match this filter.</div>`;

  return `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:20px;">
      ${list.map(p => {
        const d = DC[p.difficulty] || DC.Beginner;
        return `
          <div class="glass-card project-card" style="display:flex;flex-direction:column;">
            <!-- Header -->
            <div class="project-card-header">
              <div style="flex:1;min-width:0;">
                <span class="badge ${d.badge}" style="margin-bottom:10px;display:inline-flex;">${p.difficulty}</span>
                <span class="badge badge-purple" style="margin-left:6px;margin-bottom:10px;display:inline-flex;font-size:0.66rem;">${p.category}</span>
                <h3 style="font-family:var(--font-heading);font-size:1.02rem;line-height:1.3;margin-bottom:3px;">${p.title}</h3>
              </div>
              <div style="text-align:right;flex-shrink:0;padding-left:10px;">
                <div style="font-size:0.75rem;color:var(--text-muted);">⏱️ ${p.estimatedHours}h</div>
              </div>
            </div>

            <p style="color:var(--text-secondary);font-size:0.85rem;line-height:1.7;margin-bottom:14px;">${p.description}</p>

            <!-- Key Features -->
            <div style="margin-bottom:14px;">
              <p style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Key Features</p>
              ${(p.features||[]).slice(0,3).map(f=>`
                <div style="display:flex;align-items:center;gap:7px;margin-bottom:6px;">
                  <span style="color:var(--purple-light);font-size:0.8rem;">◆</span>
                  <span style="font-size:0.81rem;color:var(--text-secondary);">${f}</span>
                </div>
              `).join('')}
            </div>

            <!-- Tech Stack -->
            <div class="project-tech-tags" style="margin-bottom:14px;">
              ${(p.techStack||[]).map(t=>`<span class="tech-tag">${t}</span>`).join('')}
            </div>

            <!-- Why Impressive -->
            <div style="padding:12px;background:${d.bg};border:1px solid ${d.bd};border-radius:10px;margin-bottom:14px;flex:1;">
              <p style="font-size:0.78rem;color:${d.tx};line-height:1.55;">⭐ ${p.whyImpressive}</p>
            </div>

            <!-- Skills demonstrated -->
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
              ${(p.skills||[]).slice(0,5).map(s=>`
                <span style="padding:3px 10px;border-radius:99px;font-size:0.72rem;background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.2);color:var(--purple-light);">${s}</span>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

async function fetchProjects() {
  const state = getState();
  const btn = document.getElementById('get-projects-btn');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Thinking…`;

  document.getElementById('projects-grid').innerHTML = `
    <div class="loading-orb">
      <div class="orb-spinner"></div>
      <p style="color:var(--text-secondary);">Project Recommender Agent is crafting your ideas…</p>
      <p style="color:var(--text-muted);font-size:0.8rem;">Designing portfolio-worthy projects for ${state.profile.targetRole}</p>
    </div>
  `;

  try {
    const result = await recommendProjects(state.profile, state.skillGap);
    updateProjects(result);
    activeFilter = 'All';
    document.getElementById('projects-grid').innerHTML = renderProjects(result);
    showToast('6 projects recommended! 💡', 'success');
  } catch (e) {
    showToast(e.message||'Recommendation failed. Check your API key.', 'error');
    document.getElementById('projects-grid').innerHTML = renderEmpty(state.profile);
    document.getElementById('start-proj-btn')?.addEventListener('click', fetchProjects);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '🔄 New Ideas';
  }
}
