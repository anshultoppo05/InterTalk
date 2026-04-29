const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // never returned in queries by default
    },
    avatar: {
      type: String,
      default: null,
    },
    // Aggregated stats (denormalized for fast dashboard loads)
    stats: {
      totalInterviews: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      bestScore: { type: Number, default: 0 },
      totalMinutes: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
      lastInterviewDate: { type: Date, default: null },
    },
    preferredTracks: {
      type: [String],
      enum: ['software_engineering', 'product_management', 'behavioral', 'data_science', 'general'],
      default: ['general'],
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe public representation
userSchema.methods.toPublic = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    stats: this.stats,
    preferredTracks: this.preferredTracks,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
