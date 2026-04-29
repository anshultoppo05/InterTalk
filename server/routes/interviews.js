const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// All routes require auth
router.use(protect);

// GET /api/interviews — list user's sessions
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, track } = req.query;
    const filter = { user: req.userId };
    if (status) filter.status = status;
    if (track) filter.track = track;

    const interviews = await Interview.find(filter)
      .select('-exchanges') // exclude full exchange data in list view
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Interview.countDocuments(filter);

    res.json({
      interviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
});

// POST /api/interviews — create new session
router.post('/', async (req, res) => {
  try {
    const { track = 'general', difficulty = 'mid', jobRole = '', yearsExperience = 0 } = req.body;

    const trackLabels = {
      software_engineering: 'Software Engineering',
      product_management: 'Product Management',
      behavioral: 'Behavioral',
      data_science: 'Data Science',
      general: 'General',
    };
    const title = `${trackLabels[track] || 'General'} Interview`;

    const interview = await Interview.create({
      user: req.userId,
      title,
      track,
      difficulty,
      jobRole,
      yearsExperience,
    });

    res.status(201).json({ interview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create interview' });
  }
});

// GET /api/interviews/:id — get full session with exchanges
router.get('/:id', async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.userId });
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    res.json({ interview });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch interview' });
  }
});

// PATCH /api/interviews/:id — update interview (add exchange, update status, etc.)
router.patch('/:id', async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.userId });
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    const { status, exchanges, finalScores, summary, overallFeedback, topStrengths, topImprovements, recommendedResources, durationSeconds } = req.body;

    if (status) interview.status = status;
    if (exchanges) interview.exchanges = exchanges;
    if (finalScores) interview.finalScores = { ...interview.finalScores, ...finalScores };
    if (summary) interview.summary = summary;
    if (overallFeedback) interview.overallFeedback = overallFeedback;
    if (topStrengths) interview.topStrengths = topStrengths;
    if (topImprovements) interview.topImprovements = topImprovements;
    if (recommendedResources) interview.recommendedResources = recommendedResources;
    if (durationSeconds) interview.durationSeconds = durationSeconds;

    if (status === 'completed') {
      interview.completedAt = new Date();
      interview.computeFinalScores();

      // Update user aggregated stats
      const user = await User.findById(req.userId);
      if (user) {
        const stats = user.stats;
        stats.totalInterviews += 1;
        stats.totalMinutes += Math.round(interview.durationSeconds / 60);
        stats.lastInterviewDate = new Date();

        if (interview.finalScores.overall !== null) {
          const prev = stats.averageScore * (stats.totalInterviews - 1);
          stats.averageScore = Math.round((prev + interview.finalScores.overall) / stats.totalInterviews);
          if (interview.finalScores.overall > stats.bestScore) {
            stats.bestScore = interview.finalScores.overall;
          }
        }
        user.stats = stats;
        await user.save();
      }
    }

    await interview.save();
    res.json({ interview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update interview' });
  }
});

// DELETE /api/interviews/:id
router.delete('/:id', async (req, res) => {
  try {
    const interview = await Interview.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    res.json({ message: 'Interview deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete interview' });
  }
});

module.exports = router;
