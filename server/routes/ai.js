const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateQuestion, analyzeResponse, generateFinalReport } = require('../services/gemini');

router.use(protect);

// POST /api/ai/question — generate next interview question
router.post('/question', async (req, res) => {
  try {
    const { track, difficulty, jobRole, yearsExperience, exchanges, questionIndex } = req.body;

    if (questionIndex === undefined) {
      return res.status(400).json({ error: 'questionIndex is required' });
    }

    const result = await generateQuestion({
      track: track || 'general',
      difficulty: difficulty || 'mid',
      jobRole: jobRole || '',
      yearsExperience: yearsExperience || 0,
      exchanges: exchanges || [],
      questionIndex,
    });

    res.json(result);
  } catch (err) {
    console.error('AI question generation error:', err.message);
    if (err.message.includes('GEMINI_API_KEY')) {
      return res.status(503).json({ error: 'AI service not configured. Please add your GEMINI_API_KEY.' });
    }
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

// POST /api/ai/analyze — analyze a single question-answer pair
router.post('/analyze', async (req, res) => {
  try {
    const { question, answer, track, difficulty, questionType } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'question is required' });
    }

    const result = await analyzeResponse({
      question,
      answer: answer || '',
      track: track || 'general',
      difficulty: difficulty || 'mid',
      questionType: questionType || 'technical',
    });

    res.json(result);
  } catch (err) {
    console.error('AI analysis error:', err.message);
    res.status(500).json({ error: 'Failed to analyze response' });
  }
});

// POST /api/ai/finalize — generate complete post-interview report
router.post('/finalize', async (req, res) => {
  try {
    const { track, difficulty, jobRole, exchanges, finalScores } = req.body;

    if (!exchanges || exchanges.length === 0) {
      return res.status(400).json({ error: 'No exchanges to analyze' });
    }

    const result = await generateFinalReport({
      track: track || 'general',
      difficulty: difficulty || 'mid',
      jobRole: jobRole || '',
      exchanges,
      finalScores: finalScores || {},
    });

    res.json(result);
  } catch (err) {
    console.error('AI finalize error:', err.message);
    res.status(500).json({ error: 'Failed to generate final report' });
  }
});

module.exports = router;
