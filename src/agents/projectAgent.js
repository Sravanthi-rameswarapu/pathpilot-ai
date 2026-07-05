import { generateJSON } from './gemini.js';
import { getApiKey } from '../store.js';
import { DEMO_PROJECTS } from './demoData.js';

const SYSTEM = `You are the Project Recommender agent for PathPilot AI.
Recommend portfolio projects and return ONLY a JSON object:
{
  "projects": [
    {
      "id": "proj_<number>",
      "title": "<creative project name>",
      "difficulty": "<Beginner|Intermediate|Advanced>",
      "category": "<Web App|ML Project|CLI Tool|API|Mobile|Data Pipeline|Game>",
      "description": "<2-3 sentence description of what it does>",
      "techStack": ["<tech1>","<tech2>","<tech3>"],
      "estimatedHours": <number>,
      "skills": ["<skill demonstrated 1>","<skill2>","<skill3>"],
      "features": ["<feature1>","<feature2>","<feature3>","<feature4>"],
      "whyImpressive": "<one sentence on why recruiters love this>",
      "githubIdea": "<architecture hint or starter approach>"
    }
  ]
}
Recommend exactly 6 projects: 2 Beginner, 2 Intermediate, 2 Advanced.
Make them specific, creative, and buildable. Real-world problems are best.`;

export async function recommendProjects(profile, skillGap) {
  if (!getApiKey()) return DEMO_PROJECTS;
  try {
    return await generateJSON(SYSTEM, `
Target Role: ${profile.targetRole}
Current Skills: ${profile.skills.join(', ')}
Interests: ${profile.interests.join(', ')}
`);
  } catch {
    return DEMO_PROJECTS;
  }
}

