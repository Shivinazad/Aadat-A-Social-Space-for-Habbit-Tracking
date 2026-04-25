const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '🏆'
  }
}, {
  timestamps: true
});

achievementSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('AchievementMongo', achievementSchema);
