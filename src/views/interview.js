import { navigate } from '../router.js';
import { getState, getApiKey } from '../store.js';
import { conductInterview, getInitialMessage } from '../agents/interviewAgent.js';
import { showToast } from '../components/toast.js';
import { showApiKeyModal } from '../components/apiKeyModal.js';

const MODES = [
  { id:'dsa',           label:'📊 DSA',           desc:'Data Structures & Algorithms', color:'rgba(124,58,237,0.2)',  border:'rgba(124,58,237,0.5)',  text:'var(--purple-light)' },
  { id:'system-design', label:'🏗️ System Design',  desc:'Architecture & Scalability',   color:'rgba(6,182,212,0.2)',   border:'rgba(6,182,212,0.5)',   text:'var(--cyan-light)'   },
  { id:'hr',            label:'👔 HR Round',       desc:'Behavioral & Situational',      color:'rgba(16,185,129,0.2)', border:'rgba(16,185,129,0.5)', text:'#34D399'              },
  { id:'behavioral',    label:'⭐ Behavioral',     desc:'STAR Method Practice',          color:'rgba(245,158,11,0.2)', border:'rgba(245,158,11,0.5)', text:'#FCD34D'              },
];

let currentMode = 'dsa';
let chatHistory = [];   // [{role:'user'|'model', parts:[{text:'...'}]}]
let displayHistory = []; // [{role:'ai'|'user', content:'...'}]

export async function render(container) {
  const { profile } = getState();
  if (!profile) { navigate('landing'); return; }

  container.innerHTML = `
    <div class="view" style="padding:40px 0;min-height:100vh;">
      <div class="container" style="max-width:900px;">

        <div class="section-header">
          <div class="section-icon" style="background:rgba(236,72,153,0.12);border:1px solid rgba(236,72,153,0.3);">🎤</div>
          <div>
            <h1 style="font-size:1.5rem;">Interview Coach</h1>
            <p style="color:var(--text-secondary);font-size:0.88rem;">AI-powered mock interviews with real-time feedback</p>
          </div>
        </div>

        <!-- Mode Selector -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:28px;">
          ${MODES.map(m => `
            <button class="mode-btn" data-mode="${m.id}"
              style="padding:14px 16px;border-radius:14px;cursor:pointer;text-align:left;transition:all 0.2s;
                     background:${currentMode===m.id?m.color:'var(--surface)'};
                     border:1px solid ${currentMode===m.id?m.border:'var(--border)'};
                     outline:none;">
              <div style="font-size:1rem;font-weight:600;color:${currentMode===m.id?m.text:'var(--text-primary)'};margin-bottom:3px;">${m.label}</div>
              <div style="font-size:0.74rem;color:var(--text-muted);">${m.desc}</div>
            </button>
          `).join('')}
        </div>

        <!-- Chat Card -->
        <div class="glass-card" style="overflow:hidden;margin-bottom:24px;">
          <!-- Chat toolbar -->
          <div style="padding:14px 20px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green);"></div>
              <span style="font-size:0.83rem;color:var(--text-secondary);">AI Interviewer • ${MODES.find(m=>m.id===currentMode)?.label} Mode</span>
            </div>
            <button class="btn btn-ghost" id="reset-btn" style="font-size:0.75rem;padding:6px 12px;">🔄 New Session</button>
          </div>

          <!-- Messages -->
          <div class="chat-messages" id="chat-msgs"></div>

          <!-- Input -->
          <div class="chat-input-area">
            <input type="text" id="chat-input" placeholder="Type your answer here and press Enter…" />
            <button class="btn btn-primary" id="send-btn" style="padding:12px 22px;flex-shrink:0;">Send →</button>
          </div>
        </div>

        <!-- Tips Row -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;">
          ${[
            ['💡','Think out loud — explain your reasoning as you go'],
            ['❓','Ask clarifying questions before jumping to a solution'],
            ['⭐','Structure answers with STAR for behavioral questions'],
          ].map(([i,t])=>`
            <div class="glass-card" style="padding:14px;display:flex;gap:10px;align-items:flex-start;">
              <span style="font-size:1.1rem;">${i}</span>
              <p style="font-size:0.8rem;color:var(--text-secondary);line-height:1.5;">${t}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  initChat(profile);
  bindEvents(container);
}

function initChat(profile) {
  chatHistory = [];
  displayHistory = [];
  const initMsg = getInitialMessage(currentMode, profile.targetRole);
  appendMessage('ai', initMsg);
  // Don't add to chatHistory — first message is just a display message, AI starts fresh
}

function appendMessage(role, content) {
  const msgs = document.getElementById('chat-msgs');
  if (!msgs) return;

  const div = document.createElement('div');
  div.className = `message${role==='user'?' user':''}`;
  div.innerHTML = `
    <div class="message-avatar ${role==='ai'?'ai':'user'}">${role==='ai'?'🤖':'👤'}</div>
    <div class="message-content">${escapeHtml(content).replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/`(.*?)`/g,'<code style="background:rgba(124,58,237,0.15);padding:1px 6px;border-radius:4px;font-family:monospace;font-size:0.88em;">$1</code>')}</div>
  `;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  displayHistory.push({ role, content });
}

function showTyping() {
  const msgs = document.getElementById('chat-msgs');
  const div = document.createElement('div');
  div.className = 'message';
  div.id = 'typing-ind';
  div.innerHTML = `
    <div class="message-avatar ai">🤖</div>
    <div class="message-content" style="padding:16px 20px;display:flex;gap:5px;align-items:center;">
      ${[0,0.2,0.4].map(d=>`<span style="width:7px;height:7px;border-radius:50%;background:var(--purple);animation:pulseGlow 1s ease-in-out ${d}s infinite;display:inline-block;"></span>`).join('')}
    </div>
  `;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function bindEvents(container) {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentMode = btn.dataset.mode;
      render(container);
    });
  });

  document.getElementById('reset-btn').addEventListener('click', () => render(container));

  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');

  const send = async () => {
    if (!getApiKey()) { showApiKeyModal(); return; }
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    appendMessage('user', msg);
    input.disabled = true;
    sendBtn.disabled = true;
    showTyping();

    // Build Gemini chat history (alternate user/model)
    const history = displayHistory.slice(0, -1).map(m => ({
      role: m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    try {
      const reply = await conductInterview(currentMode, msg, history);
      document.getElementById('typing-ind')?.remove();
      appendMessage('ai', reply);
    } catch (e) {
      document.getElementById('typing-ind')?.remove();
      showToast(e.message || 'AI response failed. Check your API key.', 'error');
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      input.focus();
    }
  };

  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
}

function escapeHtml(str) {
  return str
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/\n/g,'<br>');
}
