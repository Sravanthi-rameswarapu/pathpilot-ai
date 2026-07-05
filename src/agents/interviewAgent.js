import { generateText } from './gemini.js';
import { getApiKey } from '../store.js';

const SYSTEM_PROMPTS = {
  dsa: `You are a world-class technical interviewer from FAANG specializing in DSA.
Conduct a mock interview for the given student. Keep responses conversational but insightful.
When they answer: evaluate their approach, give specific feedback, point out edge cases, then ask a follow-up or new question.
Use **bold** for question titles. Format code hints in backticks. Be encouraging but realistic.`,

  'system-design': `You are a senior staff engineer conducting system design interviews.
Guide the student through designing a real-world system. Push them on scalability, trade-offs, databases, and APIs.
Provide hints if they get stuck. Evaluate their answers on requirements clarity, high-level design, and depth.
Use **bold** for key concepts. Be conversational.`,

  hr: `You are an experienced HR manager at a top tech company.
Conduct a mock HR interview. Ask behavioral, situational, and background questions.
Evaluate answers for communication skills, cultural fit, and professionalism.
Give structured feedback after each answer and ask follow-up questions naturally.`,

  behavioral: `You are an expert in behavioral interviews using the STAR method.
Ask behavioral questions and guide students to structure answers as Situation→Task→Action→Result.
After each response: rate the STAR structure, highlight what was strong, suggest improvements, then ask the next question.
Be supportive and educational.`,
};

const OPENING_MESSAGES = {
  dsa: (role) => `Welcome to your DSA mock interview for **${role}**! Let's get started.\n\n**Question 1: Two Sum**\nGiven an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers that add up to target. Each input has exactly one solution, and you may not use the same element twice.\n\nExample: \`nums = [2,7,11,15], target = 9\` → \`[0,1]\`\n\nTake your time. Walk me through your thought process first before writing any code. 💭`,

  'system-design': (role) => `Welcome to your System Design interview for **${role}**! I'll be your interviewer today.\n\n**Design Question: URL Shortener (like bit.ly)**\n\nBefore diving in — please ask me any clarifying questions about requirements, scale, and constraints. Good candidates always clarify before designing! 🏗️`,

  hr: (role) => `Hello! Welcome to your HR mock interview for the **${role}** position.\n\nLet's start with the classic opener:\n\n**"Tell me about yourself and why you're interested in this role."**\n\nRemember: keep it professional, relevant (education → skills → why this role), and under 2 minutes. Go ahead! 😊`,

  behavioral: (role) => `Hi! Let's practice behavioral interviews for your **${role}** application using the STAR method.\n\n**Question 1:**\n"Tell me about a time when you had to learn a new technology or skill quickly to complete a project. What was the situation, and how did you handle it?"\n\nRemember: **S**ituation → **T**ask → **A**ction → **R**esult. Take a breath and go ahead! ⭐`,
};

export function getInitialMessage(mode, targetRole) {
  const fn = OPENING_MESSAGES[mode] || OPENING_MESSAGES.dsa;
  return fn(targetRole);
}

export async function conductInterview(mode, userMessage, chatHistory) {
  if (!getApiKey()) {
    // Return a mock response in demo mode after a 1.5s delay to simulate API latency
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(`**(Demo Mode Response)**\n\nThat's a good approach! However, your time complexity is **O(n²)** because of the nested loop. Can we optimize this using a Hash Map to achieve **O(n)** time complexity?\n\nTake a minute to think about what we would store in the Hash Map.`);
      }, 1500);
    });
  }

  try {
    const system = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.dsa;
    return await generateText(system, userMessage, chatHistory);
  } catch (e) {
    return `**(Demo Mode Fallback)**\n\nThat's a good approach! However, your time complexity is **O(n²)** because of the nested loop. Can we optimize this using a Hash Map to achieve **O(n)** time complexity?\n\nTake a minute to think about what we would store in the Hash Map.`;
  }
}
