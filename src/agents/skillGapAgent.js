import { generateJSON } from './gemini.js';
import { getApiKey } from '../store.js';
import { DEMO_SKILL_GAP } from './demoData.js';

const SYSTEM = `You are the Skill Gap Detector agent for PathPilot AI.
Analyze a student's skills vs. their target role and return ONLY a JSON object:
{
  "targetRoleRequirements": [
    {"skill":"<name>","importance":"<Critical|Important|Nice-to-have>","proficiencyNeeded":"<beginner|intermediate|expert>"}
  ],
  "gaps": [
    {"skill":"<name>","severity":"<Critical|Moderate|Minor>","description":"<why needed>","estimatedLearnTime":"<e.g. 2-3 weeks>"}
  ],
  "matchedSkills": ["<skill1>","<skill2>"],
  "overallGapScore": <0-100, 100=perfect match>,
  "estimatedTimeToClose": "<e.g. 3-4 months>",
  "topPrioritySkill": "<most important missing skill>",
  "quickWins": ["<skill that can be learned fast for high impact>","<skill2>","<skill3>"]
}
List 6-10 role requirements. Be specific about technologies and frameworks. Identify 3-5 quick wins.`;

export async function detectSkillGaps(profile) {
  if (!getApiKey()) return DEMO_SKILL_GAP;
  try {
    return await generateJSON(SYSTEM, `
Target Role: ${profile.targetRole}
Current Skills: ${profile.skills.join(', ')}
Degree: ${profile.degree} | Year: ${profile.year}
`);
  } catch {
    return DEMO_SKILL_GAP;
  }
}

