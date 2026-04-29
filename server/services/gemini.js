const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const getClient = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      throw new Error('GEMINI_API_KEY is not configured in .env');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

// Models available on this API key (from ListModels), ordered by free-tier quota
const MODELS = [
  'gemini-2.0-flash-lite',   // lightest, highest free RPM
  'gemini-2.0-flash',        // standard
  'gemini-2.5-flash',        // higher quality fallback
];

const getModel = (modelIndex = 0) => {
  const modelName = MODELS[modelIndex] || MODELS[0];
  return getClient().getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  });
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Generate content with automatic model fallback + 429 retry
const generateWithFallback = async (prompt) => {
  for (let i = 0; i < MODELS.length; i++) {
    try {
      const model = getModel(i);
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      const msg = err.message || '';
      const is429 = msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('quota');
      const is404 = msg.includes('404') || msg.includes('not found');

      if (is429) {
        // Extract retry delay from error if available, else use 5s
        const retryMatch = msg.match(/retry.{0,20}(\d+)s/i) || msg.match(/(\d+)\s*s\b/);
        const waitSec = retryMatch ? Math.min(parseInt(retryMatch[1], 10), 10) : 5;
        console.warn(`[Gemini] ${MODELS[i]} rate limited. Trying ${MODELS[i + 1] || 'no more models'} (waited ${waitSec}s)`);
        await sleep(waitSec * 1000);
        if (i < MODELS.length - 1) continue;
      }
      if (is404 && i < MODELS.length - 1) {
        console.warn(`[Gemini] ${MODELS[i]} not found, trying ${MODELS[i + 1]}`);
        continue;
      }
      throw err;
    }
  }
  throw new Error('All Gemini models exhausted');
};


// ─── Question Generation ──────────────────────────────────────────────────────

/**
 * Generate the next interview question based on conversation history.
 */
const generateQuestion = async ({ track, difficulty, jobRole, yearsExperience, exchanges, questionIndex }) => {

  const difficultyMap = {
    junior: '0–2 years experience, expect basic to intermediate knowledge',
    mid: '2–5 years experience, expect solid fundamentals and some design experience',
    senior: '5+ years experience, expect deep expertise, architecture decisions, and leadership',
  };

  const historyText = exchanges
    .map((e, i) => `Q${i + 1}: ${e.question}\nA${i + 1}: ${e.answer || '(no answer)'}`)
    .join('\n\n');

  const isFirst = questionIndex === 0;
  const isLast = questionIndex >= 7;

  // ─── Per-track question plans ──────────────────────────────────────────────
  const questionPlans = {
    software_engineering: [
      // Q0 — Icebreaker / background
      `Ask a warm opening question about the candidate's engineering background and what kind of projects they've been working on recently. Make it conversational and inviting. Type: opening.`,

      // Q1 — Data Structures & Algorithms
      {
        junior: `Ask a core data structures question appropriate for a junior engineer. Topics: arrays, linked lists, hash maps, stacks, queues, or basic sorting. Ask them to explain a concept OR describe how they'd solve a simple coding problem (e.g. find duplicates, reverse a string, implement a stack). Type: technical.`,
        mid:    `Ask a medium-difficulty algorithm question. Topics: binary search, BFS/DFS, dynamic programming basics, two-pointer, sliding window, or tree traversal. Ask them to walk through their approach (no need to write code — explain the logic). Type: technical.`,
        senior: `Ask a hard algorithm or optimization problem. Topics: graph algorithms (Dijkstra, topological sort), advanced DP, segment trees, or complexity trade-offs. Ask for both the approach and complexity analysis. Type: technical.`,
      },

      // Q2 — Coding / Problem Solving
      {
        junior: `Ask a simple coding/logic problem such as FizzBuzz, checking palindromes, finding the largest element, or counting character frequencies. Ask them to describe how they'd write the function (pseudocode is fine). Type: technical.`,
        mid:    `Ask a practical coding design question: e.g. design a rate limiter, implement an LRU cache, write a function to flatten a nested array, or explain how you'd parse and validate a config file. Ask for their approach and edge cases. Type: technical.`,
        senior: `Ask a systems-level coding question: e.g. implement a thread-safe singleton, design a pub/sub event emitter, write a retry-with-backoff utility, or explain how you'd build a task queue. Focus on correctness, thread safety, and scalability. Type: technical.`,
      },

      // Q3 — System Design
      {
        junior: `Ask a beginner system design question: e.g. "How would you design a simple URL shortener?" or "How does a REST API work?" or "What's the difference between SQL and NoSQL?" Focus on understanding of basic components. Type: technical.`,
        mid:    `Ask a mid-level system design question: e.g. design a notification system, a file upload service, or a simple caching layer. Ask them to walk through the key components, data flow, and one scaling consideration. Type: technical.`,
        senior: `Ask a senior-level system design question: e.g. design a distributed job scheduler, a real-time leaderboard, or a multi-region API gateway. Expect them to cover: data model, consistency trade-offs, failure modes, and horizontal scaling. Type: technical.`,
      },

      // Q4 — OOP / Architecture / Code Quality
      {
        junior: `Ask about basic OOP concepts: What are the four pillars of OOP? Can you give a real-world example of inheritance or polymorphism? What's the difference between an interface and an abstract class? Type: technical.`,
        mid:    `Ask about software design principles: Explain SOLID principles with an example from your own code. Or: When would you choose composition over inheritance? How do you decide when to refactor? Type: technical.`,
        senior: `Ask about architectural decisions: How do you decide between a monolith and microservices? What are the trade-offs of event-driven architecture? How do you enforce code quality standards across a team? Type: technical.`,
      },

      // Q5 — Behavioral / Situational (STAR)
      `Ask a behavioral question in STAR format relevant to a software engineer. Topics: debugging a production incident, working with a difficult teammate, missing a deadline, taking ownership of a failure, or learning a new technology quickly. Prompt them to use the STAR method (Situation, Task, Action, Result). Type: behavioral.`,

      // Q6 — Follow-up / Deep Dive (adaptive)
      `Based on the candidate's previous answers, ask a targeted follow-up that probes deeper into something interesting, unclear, or impressive they mentioned. If no clear follow-up exists, ask: "Tell me about the most technically challenging project you've worked on — what made it hard and how did you overcome it?" Type: followup.`,

      // Q7 — Closing
      `Ask a closing question that invites reflection or curiosity. Options: "What's an emerging technology or trend in software engineering you're most excited about?", "If you could learn one new skill or technology this year, what would it be and why?", or "Do you have any questions for us about the role or team?" Type: closing.`,
    ],

    product_management: [
      `Ask a warm opening question about the candidate's PM experience and what types of products they've worked on. Type: opening.`,
      { junior: `Ask how they'd prioritize features for a new mobile app given limited engineering resources. Type: technical.`, mid: `Ask them to walk through a product they improved — what metrics guided their decisions? Type: technical.`, senior: `Ask how they'd define and execute a 0-to-1 product strategy for an enterprise market. Type: technical.` },
      `Ask: "Walk me through how you'd define success metrics for a new feature launch." Type: technical.`,
      `Ask: "How do you balance user needs against business goals when they conflict?" Type: behavioral.`,
      `Ask about a product they admire and what they'd improve about it. Type: technical.`,
      `Ask a behavioral question: Tell me about a time a product decision you made turned out to be wrong. What happened? Type: behavioral.`,
      `Ask an adaptive follow-up based on previous answers, or: "How do you work with engineering teams who push back on your roadmap?" Type: followup.`,
      `Closing: "What's the most important quality a great PM must have, in your opinion?" Type: closing.`,
    ],

    behavioral: [
      `Ask an icebreaker: "Tell me about yourself and what brings you here today." Type: opening.`,
      `Ask: "Describe a situation where you had to work under significant pressure. How did you handle it?" (STAR method) Type: behavioral.`,
      `Ask: "Tell me about a time you disagreed with your manager or a colleague. What did you do?" Type: behavioral.`,
      `Ask: "Give me an example of a goal you set and how you achieved it." Type: behavioral.`,
      `Ask: "Describe a time you failed at something. What did you learn?" Type: behavioral.`,
      `Ask: "Tell me about a time you had to quickly learn something new to meet a deadline." Type: behavioral.`,
      `Ask an adaptive follow-up based on previous answers, or: "How do you typically handle feedback — positive and constructive?" Type: followup.`,
      `Closing: "Where do you see yourself in five years, and how does this role fit into that?" Type: closing.`,
    ],

    data_science: [
      `Ask a warm opener about the candidate's data science background and the types of models or analyses they work on. Type: opening.`,
      { junior: `Ask: "Explain the difference between supervised and unsupervised learning with an example." Type: technical.`, mid: `Ask: "Walk me through how you'd approach a binary classification problem end-to-end." Type: technical.`, senior: `Ask: "How do you detect and handle data leakage in a production ML pipeline?" Type: technical.` },
      { junior: `Ask: "What is overfitting and how do you prevent it?" Type: technical.`, mid: `Ask: "Compare L1 and L2 regularization — when would you use each?" Type: technical.`, senior: `Ask: "How would you design an A/B test for a recommendation algorithm change?" Type: technical.` },
      `Ask: "Write a SQL query to find the top 3 customers by revenue in the last 30 days — walk me through your approach." Type: technical.`,
      `Ask a system design question: "How would you build a real-time fraud detection system?" Type: technical.`,
      `Ask: "Tell me about a time your model underperformed in production. What did you do?" Type: behavioral.`,
      `Ask an adaptive follow-up or: "How do you communicate complex model results to non-technical stakeholders?" Type: followup.`,
      `Closing: "What's a recent development in ML/AI you find most exciting or concerning?" Type: closing.`,
    ],

    general: [
      `Ask a warm opener: "Tell me about your professional background and what you're looking for in your next role." Type: opening.`,
      `Ask: "What's a major accomplishment you're proud of from your recent work?" Type: behavioral.`,
      `Ask a domain-specific technical question appropriate to the candidate's apparent background. Type: technical.`,
      `Ask: "Describe a time you had to solve a problem with incomplete information. What was your process?" Type: behavioral.`,
      `Ask: "How do you stay current with developments in your field?" Type: behavioral.`,
      `Ask: "Walk me through how you approach learning a new tool, framework, or technology." Type: behavioral.`,
      `Ask an adaptive follow-up based on surprising or impressive things they mentioned. Type: followup.`,
      `Closing: "Is there anything about your background or skills you'd like to highlight that we haven't covered yet?" Type: closing.`,
    ],
  };

  // Resolve the question plan for this slot
  const plan = questionPlans[track] || questionPlans.general;
  const slot = plan[Math.min(questionIndex, plan.length - 1)];

  let typeInstruction;
  if (typeof slot === 'string') {
    typeInstruction = slot;
  } else if (typeof slot === 'object') {
    typeInstruction = slot[difficulty] || slot.mid || Object.values(slot)[0];
  } else {
    typeInstruction = `Ask a relevant interview question for a ${track} candidate. Type: technical.`;
  }

  const prompt = `You are a world-class technical interviewer at a top-tier tech company conducting a mock ${track.replace(/_/g, ' ')} interview.

Candidate level: ${difficultyMap[difficulty] || 'mid-level'}.
${jobRole ? `Target role: ${jobRole}.` : ''}
${yearsExperience ? `Candidate has ${yearsExperience} years of experience.` : ''}

${historyText ? `Previous conversation (use this to be adaptive and contextual):\n${historyText}\n` : ''}

Your task for question ${questionIndex + 1} of 8:
${typeInstruction}

Rules:
- Output ONLY the question text — no preamble, no "Sure!", no explanation, no label
- ONE question only (you may include a brief sub-question for clarification)
- Be specific and professional, not generic
- Make it feel like a real interview at a FAANG/top startup`;

  const question = await generateWithFallback(prompt);

  // Derive questionType from the plan's embedded "Type: X" tag
  const typeMatch = typeInstruction.match(/Type:\s*(opening|closing|technical|behavioral|followup)/i);
  const questionType = typeMatch ? typeMatch[1].toLowerCase() : (
    isFirst ? 'opening' : isLast ? 'closing' :
    questionIndex <= 4 ? 'technical' :
    questionIndex === 6 ? 'followup' : 'behavioral'
  );

  return { question, questionType };
};

// ─── Response Analysis ────────────────────────────────────────────────────────

/**
 * Analyze a single question-answer pair and return scores + feedback.
 */
const analyzeResponse = async ({ question, answer, track, difficulty, questionType }) => {
  if (!answer || answer.trim().length < 10) {
    return {
      scores: { content: 30, communication: 30, confidence: 30, problemSolving: 30, relevance: 30 },
      feedback: 'The answer was too brief or empty. Please provide a detailed response.',
      strengths: [],
      improvements: ['Provide a more complete answer', 'Address all parts of the question'],
    };
  }

  const prompt = `You are an expert interview coach scoring a candidate's answer.

Track: ${track}
Difficulty: ${difficulty}
Question type: ${questionType}
Question: "${question}"
Candidate's answer: "${answer}"

Score the answer on these 5 dimensions (0-100 integer each):
1. content - Accuracy, depth, correctness, and relevance of information
2. communication - Clarity, structure, conciseness, articulation
3. confidence - Assertiveness, certainty, decisiveness in the response
4. problemSolving - Logical thinking, structured approach, creativity
5. relevance - How directly and completely the question was addressed

Respond ONLY with valid JSON in this exact format:
{
  "scores": {
    "content": <number>,
    "communication": <number>,
    "confidence": <number>,
    "problemSolving": <number>,
    "relevance": <number>
  },
  "feedback": "<2-3 sentence constructive feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"]
}`;

  const text = await generateWithFallback(prompt);

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid AI response format');

  const parsed = JSON.parse(jsonMatch[0]);

  // Clamp scores to 0-100
  const dims = ['content', 'communication', 'confidence', 'problemSolving', 'relevance'];
  dims.forEach((d) => {
    parsed.scores[d] = Math.max(0, Math.min(100, Math.round(parsed.scores[d] || 50)));
  });

  return parsed;
};

// ─── Final Report Generation ──────────────────────────────────────────────────

/**
 * Generate holistic interview feedback after all questions are answered.
 */
const generateFinalReport = async ({ track, difficulty, jobRole, exchanges, finalScores }) => {
  const qaText = exchanges
    .map((e, i) =>
      `Q${i + 1} (${e.questionType}): ${e.question}\nAnswer: ${e.answer || '(no answer)'}\nScore: ${e.scores.content || 'N/A'}/100`
    )
    .join('\n\n');

  const prompt = `You are an expert interview coach generating a comprehensive post-interview report.

Track: ${track}
Difficulty: ${difficulty}
${jobRole ? `Target role: ${jobRole}` : ''}
Overall score: ${finalScores.overall}/100

Full interview transcript:
${qaText}

Generate a comprehensive but encouraging performance report. Respond ONLY with valid JSON:
{
  "summary": "<2-3 sentence executive summary of interview performance>",
  "overallFeedback": "<4-5 sentence detailed holistic feedback covering all dimensions>",
  "topStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "topImprovements": ["<area 1>", "<area 2>", "<area 3>"],
  "recommendedResources": ["<specific book/course/resource>", "<resource 2>", "<resource 3>"]
}`;

  const text = await generateWithFallback(prompt);

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid AI response format');

  return JSON.parse(jsonMatch[0]);
};

module.exports = { generateQuestion, analyzeResponse, generateFinalReport };
