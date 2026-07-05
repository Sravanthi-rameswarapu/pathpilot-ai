import { generateJSON } from './gemini.js';
import { getApiKey } from '../store.js';
import { DEMO_ANALYSIS } from './demoData.js';

const SYSTEM = `You are the Profile Analyzer agent for PathPilot AI.
Analyze a student's profile and return ONLY a JSON object with this exact structure:
{
  "readinessScore": <number 0-100>,
  "skillLevel": "<Beginner|Intermediate|Advanced>",
  "strengths": ["<strength1>","<strength2>","<strength3>"],
  "improvementAreas": ["<area1>","<area2>","<area3>"],
  "summary": "<2-3 sentence personalized assessment that is encouraging>",
  "careerFit": [
    {"role":"<role>","matchPercentage":<number>,"reason":"<short reason>"},
    {"role":"<role>","matchPercentage":<number>,"reason":"<short reason>"},
    {"role":"<role>","matchPercentage":<number>,"reason":"<short reason>"}
  ],
  "nextSteps": ["<step1>","<step2>","<step3>"]
}
Be specific, encouraging, and base everything on their actual skills and target role.`;

export async function analyzeProfile(profile) {
  if (!getApiKey()) return DEMO_ANALYSIS;
  try {
    return await generateJSON(SYSTEM, `
Name: ${profile.name}
Degree: ${profile.degree} | Year: ${profile.year}
Target Role: ${profile.targetRole}
Skills: ${profile.skills.join(', ')}
Interests: ${profile.interests.join(', ')}
Experience: ${profile.experience || 'Student'}
`);
  } catch {
    return DEMO_ANALYSIS;
  }
}

