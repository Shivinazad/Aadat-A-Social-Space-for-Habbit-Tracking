const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserMongo',
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostMongo',
    required: true
  }
}, {
  timestamps: true
});

likeSchema.index({ userId: 1, postId: 1 }, { unique: true, name: 'user_post_like_unique' });

module.exports = mongoose.model('LikeMongo', likeSchema);
