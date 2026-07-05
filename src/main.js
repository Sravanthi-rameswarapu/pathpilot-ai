import './style.css';
import { loadState } from './store.js';
import { initRouter } from './router.js';
import { renderNavbar } from './components/navbar.js';
import { initToast } from './components/toast.js';

// Load persisted state
loadState();

// Mount shell
document.getElementById('app').innerHTML = `
  <div class="bg-orbs">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
  </div>
  <div id="navbar-container"></div>
  <main id="view" class="view"></main>
  <div id="toast-container" class="toast-container"></div>
  <div id="modal-container"></div>
`;

renderNavbar();
initToast();
initRouter();
