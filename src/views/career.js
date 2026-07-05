import { navigate } from '../router.js';
import { getState, updateCareerPaths, getApiKey } from '../store.js';
import { getCareerPaths } from '../agents/careerAgent.js';
import { showToast } from '../components/toast.js';
import { showApiKeyModal } from '../components/apiKeyModal.js';

export async function render(container) {
  const { profile, careerPaths } = getState();
  if (!profile) { navigate('landing'); return; }

  container.innerHTML = `
    <div class="view" style="padding:40px 0;min-height:100vh;">
      <div class="container">
        <div class="section-header">
          <div class="section-icon" style="background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.3);">🧭</div>
          <div>
            <h1 style="font-size:1.5rem;">Career Path Advisor</h1>
            <p style="color:var(--text-secondary);font-size:0.88rem;">Discover the best career paths for your skills and interests</p>
          </div>
          <button class="btn btn-primary" id="explore-btn" style="margin-left:auto;">
            ${careerPaths ? '🔄 Refresh Paths' : '🧭 Explore Paths'}
          </button>
        </div>

        <div id="career-content">
          ${careerPaths ? renderPaths(careerPaths, profile) : renderEmpty(profile)}
        </div>
      </div>
    </div>
  `;

  document.getElementById('explore-btn').onclick = loadPaths;
  document.getElementById('start-career-btn')?.addEventListener('click', loadPaths);
}

function renderEmpty(profile) {
  return `
    <div style="text-align:center;padding:90px 20px;">
      <div style="font-size:4.5rem;margin-bottom:24px;filter:drop-shadow(0 0 20px rgba(139,92,246,0.4));">🧭</div>
      <h2 style="font-size:1.6rem;margin-bottom:12px;">Discover Your Career Paths</h2>
      <p style="color:var(--text-secondary);max-width:500px;margin:0 auto 32px;line-height:1.8;">
        The Career Advisor will analyze your interests and skills to map out <strong>3 detailed career paths</strong>
        — with salary ranges, top companies, growth outlook, and personalized guidance.
      </p>
      <button class="btn btn-primary" id="start-career-btn" style="font-size:1rem;padding:14px 32px;">🧭 Map My Career Paths</button>
    </div>
  `;
}

function renderPaths(data, profile) {
  const paths = data.careerPaths || [];
  const recommended = data.recommendedPath;

  const GC = {
    Excellent: { color:'#34D399', bg:'rgba(16,185,129,0.1)', bd:'rgba(16,185,129,0.3)' },
    Good:      { color:'#FCD34D', bg:'rgba(245,158,11,0.1)', bd:'rgba(245,158,11,0.3)' },
    Moderate:  { color:'#94A3B8', bg:'rgba(148,163,184,0.08)', bd:'rgba(148,163,184,0.2)' },
  };

  return `
    <div style="display:flex;flex-direction:column;gap:24px;">

      <!-- Personality Insight -->
      ${data.personalityInsight ? `
        <div class="glass-card" style="padding:24px;border-color:rgba(124,58,237,0.25);background:linear-gradient(135deg,rgba(124,58,237,0.07),rgba(6,182,212,0.04));">
          <div style="display:flex;gap:14px;align-items:flex-start;">
            <span style="font-size:1.8rem;">🧠</span>
            <div>
              <p style="font-size:0.72rem;color:var(--purple-light);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Career Personality Insight</p>
              <p style="color:var(--text-secondary);line-height:1.8;">${data.personalityInsight}</p>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Career Path Cards -->
      ${paths.map(path => {
        const isRec = path.id === recommended;
        const gc = GC[path.growthOutlook] || GC.Moderate;
        return `
          <div class="glass-card" style="overflow:hidden;${isRec?'border-color:rgba(124,58,237,0.45);box-shadow:0 0 40px rgba(124,58,237,0.15);':''}" id="path-${path.id}">

            ${isRec ? `
              <div style="background:var(--gradient-brand);padding:10px 24px;font-size:0.8rem;font-weight:600;color:white;letter-spacing:0.02em;">
                ⭐ Top Recommended Path For You
              </div>
            ` : ''}

            <div style="padding:28px;">
              <!-- Header row -->
              <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:18px;margin-bottom:20px;">
                <div>
                  <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap;">
                    <h2 style="font-family:var(--font-heading);font-size:1.35rem;">${path.role}</h2>
                    <span class="badge badge-purple" style="font-size:0.7rem;">${path.field}</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                    <span class="match-pill">${path.matchScore}% Match</span>
                    <span style="padding:4px 12px;border-radius:99px;font-size:0.8rem;background:${gc.bg};border:1px solid ${gc.bd};color:${gc.color};">
                      ${path.growthOutlook} Growth
                    </span>
                  </div>
                </div>

                <!-- Salary Box -->
                <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:16px 20px;min-width:180px;">
                  <p style="font-size:0.68rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px;">Annual Salary (USD)</p>
                  ${[['Entry',path.salaryRange?.entry,'var(--green)'],['Mid',path.salaryRange?.mid,'var(--cyan-light)'],['Senior',path.salaryRange?.senior,'var(--purple-light)']].map(([l,v,c])=>`
                    <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:5px;">
                      <span style="font-size:0.75rem;color:var(--text-muted);">${l}:</span>
                      <span style="font-size:0.8rem;color:${c};font-weight:500;">${v||'N/A'}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Why it fits -->
              <div style="padding:16px;background:rgba(124,58,237,0.06);border:1px solid rgba(124,58,237,0.14);border-radius:12px;margin-bottom:20px;">
                <p style="font-size:0.72rem;color:var(--purple-light);margin-bottom:5px;">🎯 Why this fits you</p>
                <p style="color:var(--text-secondary);font-size:0.88rem;line-height:1.75;">${path.whyItFits}</p>
              </div>

              <!-- 2-col grid -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
                <div>
                  <p style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px;">🏢 Top Companies</p>
                  <div style="display:flex;flex-wrap:wrap;gap:6px;">
                    ${(path.topCompanies||[]).map(c=>`<span class="tech-tag">${c}</span>`).join('')}
                  </div>
                </div>
                <div>
                  <p style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px;">☀️ Day in the Life</p>
                  <p style="font-size:0.83rem;color:var(--text-secondary);line-height:1.65;">${path.dayInLife}</p>
                </div>
              </div>

              <!-- Required Skills -->
              ${(path.requiredSkills||[]).length ? `
                <div style="margin-bottom:18px;">
                  <p style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px;">🛠️ Key Skills Required</p>
                  <div style="display:flex;flex-wrap:wrap;gap:7px;">
                    ${path.requiredSkills.map(s=>`<span class="badge badge-cyan" style="font-size:0.72rem;">${s}</span>`).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Transition Steps -->
              ${(path.transitionSteps||[]).length ? `
                <div style="margin-bottom:18px;">
                  <p style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:10px;">🚀 How to Get There</p>
                  <div style="display:flex;flex-direction:column;gap:9px;">
                    ${path.transitionSteps.map((s,i)=>`
                      <div style="display:flex;align-items:flex-start;gap:10px;">
                        <span style="width:26px;height:26px;border-radius:50%;background:var(--gradient-brand);display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:700;flex-shrink:0;margin-top:1px;color:white;">${i+1}</span>
                        <span style="font-size:0.86rem;color:var(--text-secondary);line-height:1.55;">${s}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- Alt Roles -->
              ${(path.alternativeRoles||[]).length ? `
                <div style="padding-top:16px;border-top:1px solid var(--border);">
                  <span style="font-size:0.76rem;color:var(--text-muted);">Also consider: </span>
                  ${path.alternativeRoles.map(r=>`<span class="badge badge-purple" style="font-size:0.7rem;margin-left:6px;">${r}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }).join('')}

      <!-- Industry Trends -->
      ${(data.industryTrends||[]).length ? `
        <div class="glass-card" style="padding:26px;">
          <h2 style="font-family:var(--font-heading);font-size:1rem;margin-bottom:16px;">📈 Relevant Industry Trends</h2>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${data.industryTrends.map(t=>`
              <div style="display:flex;align-items:flex-start;gap:12px;padding:12px;background:var(--surface);border-radius:10px;border:1px solid var(--border);">
                <span style="color:var(--cyan-light);font-size:1.1rem;margin-top:1px;">↗</span>
                <span style="font-size:0.87rem;color:var(--text-secondary);line-height:1.6;">${t}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

    </div>
  `;
}

async function loadPaths() {
  const state = getState();
  const btn = document.getElementById('explore-btn');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> Mapping…`;

  document.getElementById('career-content').innerHTML = `
    <div class="loading-orb">
      <div class="orb-spinner"></div>
      <p style="color:var(--text-secondary);">Career Advisor Agent is mapping your paths…</p>
      <p style="color:var(--text-muted);font-size:0.8rem;">Analyzing industry trends and matching to your profile</p>
    </div>
  `;

  try {
    const result = await getCareerPaths(state.profile);
    updateCareerPaths(result);
    document.getElementById('career-content').innerHTML = renderPaths(result, state.profile);
    showToast('Career paths mapped! 🧭', 'success');
  } catch (e) {
    showToast(e.message||'Career mapping failed. Check your API key.', 'error');
    document.getElementById('career-content').innerHTML = renderEmpty(state.profile);
    document.getElementById('start-career-btn')?.addEventListener('click', loadPaths);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '🔄 Refresh Paths';
  }
}
