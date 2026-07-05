import { navigate } from '../router.js';
import { getState, resetApp } from '../store.js';
import { showApiKeyModal } from './apiKeyModal.js';

const NAV_ITEMS = [
  { route: 'dashboard',     label: 'Dashboard' },
  { route: 'skill-gap',     label: 'Skill Gap' },
  { route: 'learning-path', label: 'Roadmap' },
  { route: 'projects',      label: 'Projects' },
  { route: 'interview',     label: 'Interview' },
  { route: 'career',        label: 'Career' },
];

export function renderNavbar() {
  const container = document.getElementById('navbar-container');
  if (!container) return;

  const { profile } = getState();

  container.innerHTML = `
    <nav class="navbar">
      <div class="nav-inner">

        <div class="nav-logo" id="nav-home-btn" title="Home">
          <div class="nav-logo-icon">🧭</div>
          <span class="nav-logo-text">PathPilot AI</span>
        </div>

        ${profile ? `
          <div class="nav-links" id="nav-links">
            ${NAV_ITEMS.map(item => `
              <button class="nav-link" data-route="${item.route}">${item.label}</button>
            `).join('')}
          </div>
        ` : ''}

        <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
          <button class="btn btn-ghost" id="api-key-nav-btn" style="font-size:0.78rem;padding:8px 14px;">
            🔑 API Key
          </button>
          ${profile ? `
            <div style="display:flex;align-items:center;gap:8px;padding:6px 14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-full);">
              <div style="width:30px;height:30px;border-radius:50%;background:var(--gradient-brand);display:flex;align-items:center;justify-content:center;font-size:0.9rem;font-weight:700;color:white;">
                ${profile.name.charAt(0).toUpperCase()}
              </div>
              <span style="font-size:0.82rem;color:var(--text-secondary);max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                ${profile.name}
              </span>
            </div>
          ` : ''}
        </div>

      </div>
    </nav>
  `;

  // Bind events
  document.getElementById('nav-home-btn').onclick = () =>
    navigate(profile ? 'dashboard' : 'landing');

  document.getElementById('api-key-nav-btn').onclick = () => showApiKeyModal();

  if (profile) {
    document.querySelectorAll('.nav-link').forEach(btn => {
      btn.addEventListener('click', () => navigate(btn.dataset.route));
    });
  }
}

export function refreshNavbar() { renderNavbar(); }
