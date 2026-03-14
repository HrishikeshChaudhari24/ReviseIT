import mongoose from 'mongoose';

const TopicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for this topic'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters'],
  },
  content: {
    type: String,
    required: [true, 'Please provide the topic content'],
  },
  tags: [{
    type: String,
    trim: true,
  }],
  inshort: {
    bullets: [String],
    keyTakeaway: String,
    oneLiner: String,
  },
  schedule: {
    nextReview: {
      type: Date,
      default: () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        return tomorrow;
      },
    },
    interval: {
      type: Number,
      default: 1,
    },
    easeFactor: {
      type: Number,
      default: 2.5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    strength: {
      type: String,
      enum: ['strong', 'medium', 'weak', 'new'],
      default: 'new',
    },
  },
  xpEarned: {
    type: Number,
    default: 0,
  },
  lastReviewedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Topic || mongoose.model('Topic', TopicSchema);
