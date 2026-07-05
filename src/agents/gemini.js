import { GoogleGenerativeAI } from '@google/generative-ai';
import { getApiKey } from '../store.js';

// Models to try in order (fallback chain)
const MODEL_CHAIN = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash-8b',
];

function getClient() {
  const key = getApiKey();
  if (!key) throw new Error('No Gemini API key found. Click "🔑 API Key" in the navbar to add yours.');
  return new GoogleGenerativeAI(key);
}

function parseError(err) {
  const msg = err?.message || String(err);

  // 429 Quota exceeded
  if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
    const retryMatch = msg.match(/retry(?:Delay|in)[:\s"]*(\d+)/i) ||
                       msg.match(/"(\d+)s"/i) ||
                       msg.match(/(\d+)\.?\d*s/);
    const seconds = retryMatch ? parseInt(retryMatch[1]) : 60;

    if (msg.toLowerCase().includes('day') || msg.includes('limit: 0')) {
      throw new Error(
        `⚠️ Daily free-tier quota exhausted for this API key.\n\n` +
        `Solutions:\n` +
        `• Wait until tomorrow (quota resets at midnight UTC)\n` +
        `• Create a new API key at aistudio.google.com/apikey\n` +
        `• Enable billing on Google Cloud for higher limits`
      );
    }

    throw new Error(
      `⏳ Rate limit hit. Please wait ${seconds} seconds and try again.\n\n` +
      `Tip: The free tier allows ~15 requests/minute. Try again shortly.`
    );
  }

  // 404 Model not found
  if (msg.includes('404') || msg.includes('not found')) {
    throw new Error(`Model not available. The app will try an alternative model automatically.`);
  }

  // Invalid API key
  if (msg.includes('400') || msg.includes('API_KEY_INVALID') || msg.includes('invalid')) {
    throw new Error('❌ Invalid API key. Please check your key at aistudio.google.com/apikey');
  }

  throw new Error(msg.length > 200 ? msg.substring(0, 200) + '…' : msg);
}

async function tryWithFallback(buildModel, userMessage, chatHistory = []) {
  let lastErr;
  for (const modelName of MODEL_CHAIN) {
    try {
      const model = buildModel(modelName);
      if (chatHistory.length > 0) {
        const chat = model.startChat({ history: chatHistory });
        const r = await chat.sendMessage(userMessage);
        return r.response.text();
      }
      const r = await model.generateContent(userMessage);
      return r.response.text();
    } catch (err) {
      const msg = err?.message || '';
      // Only try next model on 404 (model not found), not on 429 (quota)
      if (msg.includes('404') || msg.includes('not found')) {
        lastErr = err;
        continue;
      }
      // For quota/auth errors, parse and throw immediately
      parseError(err);
    }
  }
  parseError(lastErr);
}

export async function generateJSON(systemPrompt, userMessage) {
  const client = getClient();

  const text = await tryWithFallback(
    (modelName) => client.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
      generationConfig: { responseMimeType: 'application/json' },
    }),
    userMessage
  );

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/({[\s\S]*})/);
    if (match) return JSON.parse(match[1]);
    throw new Error('AI returned an unexpected format. Please try again.');
  }
}

export async function generateText(systemPrompt, userMessage, chatHistory = []) {
  const client = getClient();

  return tryWithFallback(
    (modelName) => client.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
    }),
    userMessage,
    chatHistory
  );
}
