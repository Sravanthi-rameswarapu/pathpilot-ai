import { generateJSON } from './gemini.js';
import { getApiKey } from '../store.js';
import { DEMO_LEARNING_PATH } from './demoData.js';

const SYSTEM = `You are the Learning Path Planner agent for PathPilot AI.
Create a structured learning roadmap and return ONLY a JSON object:
{
  "title": "<personalized roadmap title>",
  "totalWeeks": <number>,
  "finalGoal": "<what student achieves>",
  "phases": [
    {
      "phase": <number>,
      "title": "<phase title>",
      "weeks": "<e.g. Week 1-3>",
      "focus": "<what this phase focuses on>",
      "milestone": "<what student can do after this phase>",
      "topics": [
        {
          "id": "topic_<unique_number>",
          "name": "<topic name>",
          "type": "<Course|Practice|Project|Reading>",
          "resource": "<specific resource name, e.g. 'CS50x on edX'>",
          "resourceUrl": "<real URL to resource>",
          "estimatedHours": <number>,
          "description": "<one line description>"
        }
      ]
    }
  ]
}
Create 3-4 phases with 4-5 topics each. Use real resources: freeCodeCamp, Coursera, YouTube channels like Traversy Media, CS Dojo, TechWithTim, official docs. Include a mix of types.`;

export async function createLearningPath(profile, skillGap) {
  if (!getApiKey()) return DEMO_LEARNING_PATH;
  const gaps = skillGap?.gaps?.map(g => g.skill).join(', ') || 'core fundamentals';
  try {
    return await generateJSON(SYSTEM, `
Student: ${profile.name} | Target: ${profile.targetRole}
Current Skills: ${profile.skills.join(', ')}
Key Gaps: ${gaps}
Year: ${profile.year}
`);
  } catch {
    return DEMO_LEARNING_PATH;
  }
}

