const mongoose = require('mongoose');

const userAchievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo',
    required: true
  },
  achievementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AchievementMongo',
    required: true
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true, name: 'user_achievement_unique' });

module.exports = mongoose.model('UserAchievementMongo', userAchievementSchema);
