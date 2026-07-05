import { generateJSON } from './gemini.js';
import { getApiKey } from '../store.js';
import { DEMO_CAREER_PATHS } from './demoData.js';

const SYSTEM = `You are the Career Path Advisor agent for PathPilot AI.
Map career paths for a student and return ONLY a JSON object:
{
  "personalityInsight": "<2 sentence career personality summary based on interests and skills>",
  "recommendedPath": "<id of best path>",
  "industryTrends": ["<trend1>","<trend2>","<trend3>"],
  "careerPaths": [
    {
      "id": "path_<number>",
      "role": "<job title>",
      "field": "<industry field>",
      "matchScore": <0-100>,
      "whyItFits": "<personalized explanation referencing their specific skills/interests>",
      "salaryRange": {
        "entry": "<e.g. $60,000 - $85,000>",
        "mid": "<e.g. $95,000 - $130,000>",
        "senior": "<e.g. $140,000 - $200,000>"
      },
      "growthOutlook": "<Excellent|Good|Moderate>",
      "topCompanies": ["<company1>","<company2>","<company3>","<company4>","<company5>"],
      "dayInLife": "<2 sentence description of typical day>",
      "requiredSkills": ["<skill1>","<skill2>","<skill3>","<skill4>"],
      "transitionSteps": ["<step1>","<step2>","<step3>"],
      "alternativeRoles": ["<related role 1>","<related role 2>"]
    }
  ]
}
Provide exactly 3 career paths. Include the target role as one path. 
Use realistic 2024 USD salary data. Make the analysis feel personalized and insightful.`;

export async function getCareerPaths(profile) {
  if (!getApiKey()) return DEMO_CAREER_PATHS;
  try {
    return await generateJSON(SYSTEM, `
Interests: ${profile.interests.join(', ')}
Current Skills: ${profile.skills.join(', ')}
Target Role: ${profile.targetRole}
Degree: ${profile.degree} | Year: ${profile.year}
`);
  } catch {
    return DEMO_CAREER_PATHS;
  }
}

