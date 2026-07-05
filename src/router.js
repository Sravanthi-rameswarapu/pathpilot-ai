// ── SPA Router ───────────────────────────────────
const routes = {
  landing:       () => import('./views/landing.js'),
  onboarding:    () => import('./views/onboarding.js'),
  dashboard:     () => import('./views/dashboard.js'),
  'skill-gap':   () => import('./views/skillGap.js'),
  'learning-path':() => import('./views/learningPath.js'),
  projects:      () => import('./views/projects.js'),
  interview:     () => import('./views/interview.js'),
  career:        () => import('./views/career.js'),
};

let currentRoute = null;

export function navigate(route) {
  window.location.hash = route;
}

export function getCurrentRoute() { return currentRoute; }

async function renderRoute(route) {
  const viewContainer = document.getElementById('view');
  if (!viewContainer) return;

  const loader = routes[route] || routes.landing;

  try {
    const module = await loader();
    viewContainer.innerHTML = '';
    await module.render(viewContainer);
    currentRoute = route;

    // Sync nav active state
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.route === route);
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    console.error('Route render failed:', err);
  }
}

export function initRouter() {
  const getHash = () => window.location.hash.slice(1) || 'landing';
  renderRoute(getHash());
  window.addEventListener('hashchange', () => renderRoute(getHash()));
}
