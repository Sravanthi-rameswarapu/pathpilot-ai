import { getApiKey, setApiKey } from '../store.js';
import { showToast } from './toast.js';

export function showApiKeyModal() {
  document.getElementById('api-key-modal')?.remove();
  const currentKey = getApiKey();

  const overlay = document.createElement('div');
  overlay.id = 'api-key-modal';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:28px;">
        <div style="width:48px;height:48px;background:var(--gradient-brand);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;box-shadow:0 0 20px rgba(124,58,237,0.4);">🔑</div>
        <div>
          <h3 style="font-family:var(--font-heading);font-size:1.2rem;margin-bottom:4px;">Gemini API Key</h3>
          <p style="color:var(--text-secondary);font-size:0.82rem;">Required for all AI agents to function</p>
        </div>
      </div>

      <div class="input-group" style="margin-bottom:8px;">
        <label>API Key</label>
        <input type="password" id="api-key-input" placeholder="AIzaSy..." value="${currentKey}" autocomplete="off" />
      </div>
      <p style="font-size:0.76rem;color:var(--text-muted);margin-bottom:28px;">
        Get your free key from
        <a href="https://aistudio.google.com/apikey" target="_blank" style="color:var(--purple-light);text-decoration:underline;">Google AI Studio</a>.
        Stored locally in your browser — never sent to any server.
      </p>

      <div style="display:flex;gap:12px;justify-content:flex-end;">
        <button class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
        <button class="btn btn-primary" id="modal-save-btn">💾 Save Key</button>
      </div>
    </div>
  `;

  document.getElementById('modal-container').appendChild(overlay);

  const input = document.getElementById('api-key-input');
  input.focus();

  document.getElementById('modal-cancel-btn').onclick = () => overlay.remove();
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  document.getElementById('modal-save-btn').onclick = () => {
    const key = input.value.trim();
    if (!key) { showToast('Please enter a valid API key', 'error'); return; }
    setApiKey(key);
    showToast('API key saved! AI agents are ready ✨', 'success');
    overlay.remove();
  };
}
