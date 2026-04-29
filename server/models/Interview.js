const mongoose = require('mongoose');

// Individual Q&A exchange
const exchangeSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  question: { type: String, required: true },
  questionType: {
    type: String,
    enum: ['opening', 'technical', 'behavioral', 'followup', 'closing'],
    default: 'technical',
  },
  answer: { type: String, default: '' },
  answerDuration: { type: Number, default: 0 }, // seconds
  scores: {
    content: { type: Number, min: 0, max: 100, default: null },
    communication: { type: Number, min: 0, max: 100, default: null },
    confidence: { type: Number, min: 0, max: 100, default: null },
    problemSolving: { type: Number, min: 0, max: 100, default: null },
    relevance: { type: Number, min: 0, max: 100, default: null },
  },
  feedback: { type: String, default: '' },
  strengths: [String],
  improvements: [String],
  analyzedAt: { type: Date, default: null },
});

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, default: 'Mock Interview' },
    track: {
      type: String,
      enum: ['software_engineering', 'product_management', 'behavioral', 'data_science', 'general'],
      default: 'general',
    },
    difficulty: {
      type: String,
      enum: ['junior', 'mid', 'senior'],
      default: 'mid',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
    },
    exchanges: [exchangeSchema],

    // Duration tracking
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    durationSeconds: { type: Number, default: 0 },

    // Final aggregate scores (0-100)
    finalScores: {
      content: { type: Number, default: null },
      communication: { type: Number, default: null },
      confidence: { type: Number, default: null },
      problemSolving: { type: Number, default: null },
      relevance: { type: Number, default: null },
      overall: { type: Number, default: null },
    },

    // AI-generated holistic feedback
    summary: { type: String, default: '' },
    overallFeedback: { type: String, default: '' },
    topStrengths: [String],
    topImprovements: [String],
    recommendedResources: [String],

    // Context passed to AI for adaptive questioning
    jobRole: { type: String, default: '' },
    yearsExperience: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compute final scores from exchanges
interviewSchema.methods.computeFinalScores = function () {
  const exchanges = this.exchanges.filter((e) => e.scores.content !== null);
  if (exchanges.length === 0) return;

  const dims = ['content', 'communication', 'confidence', 'problemSolving', 'relevance'];
  const totals = Object.fromEntries(dims.map((d) => [d, 0]));

  exchanges.forEach((e) => {
    dims.forEach((d) => {
      totals[d] += e.scores[d] || 0;
    });
  });

  dims.forEach((d) => {
    this.finalScores[d] = Math.round(totals[d] / exchanges.length);
  });

  // Weighted overall: content 30%, communication 25%, confidence 15%, problemSolving 20%, relevance 10%
  const weights = { content: 0.3, communication: 0.25, confidence: 0.15, problemSolving: 0.2, relevance: 0.1 };
  this.finalScores.overall = Math.round(
    dims.reduce((sum, d) => sum + this.finalScores[d] * weights[d], 0)
  );
};

module.exports = mongoose.model('Interview', interviewSchema);
