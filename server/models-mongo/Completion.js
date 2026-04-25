const mongoose = require('mongoose');

const completionSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  notes: {
    type: String,
    default: null
  },
  HabitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HabitMongo',
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

completionSchema.index({ HabitId: 1, date: -1 });

module.exports = mongoose.model('CompletionMongo', completionSchema);
