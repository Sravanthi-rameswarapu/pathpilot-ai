import { navigate } from '../router.js';
import { getState } from '../store.js';

const AGENTS = [
  { icon: '👤', name: 'Profile Analyzer',    desc: 'Builds a smart profile from your skills, education, and goals to assess your overall career readiness.', color: '#7C3AED' },
  { icon: '🎯', name: 'Skill Gap Detector',  desc: 'Pinpoints exactly which skills you\'re missing for your target role, ranked by severity.', color: '#06B6D4' },
  { icon: '🗺️', name: 'Learning Path Planner', desc: 'Generates a week-by-week personalized roadmap with real courses, docs, and practice resources.', color: '#10B981' },
  { icon: '💡', name: 'Project Recommender', desc: 'Suggests 6 portfolio projects matched to your level — Beginner, Intermediate, and Advanced.', color: '#F59E0B' },
  { icon: '🎤', name: 'Interview Coach',     desc: 'Conducts live mock DSA, System Design, HR & Behavioral interviews with detailed feedback.', color: '#EC4899' },
  { icon: '🧭', name: 'Career Path Advisor', desc: 'Maps your interests to 3 detailed career paths with salary ranges, top companies & growth outlook.', color: '#8B5CF6' },
];

const FEATURES = [
  'AI skill gap analysis against 50+ career roles',
  'Personalized week-by-week learning roadmaps',
  'Interactive mock interviews with real-time AI feedback',
  'Portfolio project ideas ranked by difficulty',
  'Career path mapping with salary ranges & growth data',
  'Progress tracking — mark topics as you learn',
];

export async function render(container) {
  const hasProfile = !!getState().profile;

  container.innerHTML = `
    <div class="view">
      <!-- ── Hero ──────────────────────────────── -->
      <section class="hero-section">
        <div class="hero-badge">✨ Powered by 6 Specialized Google Gemini Agents</div>

        <h1 class="hero-title">
          Your Personal<br><span class="gradient-text">AI Career Pilot</span>
        </h1>

        <p class="hero-subtitle">
          PathPilot AI analyzes your skills, finds your gaps, builds personalized roadmaps,
          recommends real projects, and coaches you to ace placements — all in one place.
        </p>

        <div class="hero-cta">
          <button class="btn btn-primary" id="hero-cta-btn" style="font-size:1rem;padding:16px 36px;">
            🚀 ${hasProfile ? 'Go to Dashboard' : 'Start Your Journey'}
          </button>
          <button class="btn btn-secondary" id="hero-scroll-btn" style="font-size:1rem;padding:16px 28px;">
            Meet the Agents ↓
          </button>
        </div>

        <!-- Hero Stats -->
        <div style="display:flex;gap:52px;margin-top:72px;justify-content:center;flex-wrap:wrap;">
          ${[['6','AI Agents'],['50+','Career Roles'],['100%','Free to Use'],['∞','Mock Interviews']].map(([v,l]) => `
            <div style="text-align:center;">
              <div class="gradient-text" style="font-family:var(--font-heading);font-size:2.2rem;font-weight:700;">${v}</div>
              <div style="color:var(--text-muted);font-size:0.78rem;margin-top:4px;text-transform:uppercase;letter-spacing:0.06em;">${l}</div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- ── Agents ─────────────────────────────── -->
      <section id="agents-section" style="padding:90px 0;background:var(--bg-secondary);">
        <div class="container">
          <div style="text-align:center;margin-bottom:52px;">
            <span class="badge badge-purple" style="margin-bottom:14px;display:inline-flex;">🤖 AI Agents</span>
            <h2 style="font-size:2.2rem;margin-bottom:12px;">Meet Your 6 AI Advisors</h2>
            <p style="color:var(--text-secondary);max-width:520px;margin:0 auto;">Each agent specializes in a critical aspect of your academic and career journey</p>
          </div>

          <div class="agents-grid">
            ${AGENTS.map((a, i) => `
              <div class="glass-card agent-card" style="animation-delay:${i*0.08}s">
                <div class="agent-icon" style="background:${a.color}1A;border:1px solid ${a.color}40;">
                  ${a.icon}
                </div>
                <h3 style="font-family:var(--font-heading);font-size:1rem;margin-bottom:8px;">${a.name}</h3>
                <p style="color:var(--text-secondary);font-size:0.85rem;line-height:1.7;">${a.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- ── Features ───────────────────────────── -->
      <section style="padding:90px 0;">
        <div class="container">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center;">
            <div>
              <span class="badge badge-cyan" style="margin-bottom:16px;display:inline-flex;">⚡ Features</span>
              <h2 style="font-size:2rem;margin-bottom:16px;line-height:1.2;">
                Everything You Need to<br><span class="gradient-text">Land Your Dream Job</span>
              </h2>
              <p style="color:var(--text-secondary);margin-bottom:32px;line-height:1.8;">
                PathPilot combines the expertise of career counselors, technical mentors,
                and interview coaches into one AI-powered platform.
              </p>
              <button class="btn btn-primary" id="features-cta-btn">Get Started Free →</button>
            </div>
            <div>
              ${FEATURES.map(f => `
                <div class="feature-item">
                  <div class="feature-check">✓</div>
                  <span style="font-size:0.9rem;">${f}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </section>

      <!-- ── CTA Banner ──────────────────────────── -->
      <section style="padding:90px 0;text-align:center;position:relative;overflow:hidden;">
        <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(124,58,237,0.08),rgba(6,182,212,0.04));pointer-events:none;"></div>
        <div class="container" style="position:relative;">
          <h2 style="font-size:2.5rem;margin-bottom:16px;">Ready to Chart Your Path?</h2>
          <p style="color:var(--text-secondary);margin-bottom:36px;font-size:1.05rem;max-width:480px;margin-left:auto;margin-right:auto;">
            Join students who've found clarity in their career direction with PathPilot AI.
          </p>
          <button class="btn btn-primary" id="bottom-cta-btn" style="font-size:1.05rem;padding:18px 44px;margin-bottom:36px;">
            🚀 ${hasProfile ? 'Continue to Dashboard' : 'Get Started — It\'s Free'}
          </button>
        </div>
      </section>
    </div>
  `;

  const dest = hasProfile ? 'dashboard' : 'onboarding';
  ['hero-cta-btn','features-cta-btn','bottom-cta-btn'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => navigate(dest));
  });
  document.getElementById('hero-scroll-btn')?.addEventListener('click', () => {
    document.getElementById('agents-section').scrollIntoView({ behavior: 'smooth' });
  });
}
