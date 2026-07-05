// ── Global State Store ───────────────────────────
const STORAGE_KEY = 'pathpilot_v1';

const defaultState = {
  profile: null,
  analysis: null,
  skillGap: null,
  learningPath: null,
  projects: null,
  careerPaths: null,
  completedTopics: [],
  settings: { apiKey: '' }
};

let state = { ...defaultState };

export const getState = () => state;

export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) state = { ...defaultState, ...JSON.parse(saved) };
  } catch (e) {
    console.warn('State load failed:', e);
  }
  return state;
}

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (e) { console.warn('State save failed:', e); }
}

export function updateState(updates) {
  state = { ...state, ...updates };
  persist();
  return state;
}

export const updateProfile    = (profile)    => updateState({ profile });
export const updateAnalysis   = (analysis)   => updateState({ analysis });
export const updateSkillGap   = (skillGap)   => updateState({ skillGap });
export const updateLearningPath = (lp)       => updateState({ learningPath: lp });
export const updateProjects   = (projects)   => updateState({ projects });
export const updateCareerPaths= (cp)         => updateState({ careerPaths: cp });

export function toggleTopicComplete(topicId) {
  const list = [...(state.completedTopics || [])];
  const idx = list.indexOf(topicId);
  idx >= 0 ? list.splice(idx, 1) : list.push(topicId);
  return updateState({ completedTopics: list });
}

export const getApiKey = () => state.settings?.apiKey || '';
export const setApiKey = (key) => updateState({ settings: { ...state.settings, apiKey: key } });

export function resetApp() {
  state = { ...defaultState };
  localStorage.removeItem(STORAGE_KEY);
}
