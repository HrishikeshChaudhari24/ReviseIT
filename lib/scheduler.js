/**
 * SM-2 Inspired Spaced Repetition Scheduler
 * 
 * Calculates the next review date based on user's difficulty rating.
 * Intervals grow exponentially for easy items and shrink for hard ones.
 */

const BASE_INTERVALS = [1, 3, 7, 14, 30, 60, 120];

const DIFFICULTY_MULTIPLIERS = {
  easy: 1.5,
  medium: 1.0,
  hard: 0.5,
};

const XP_REWARDS = {
  easy: 10,
  medium: 20,
  hard: 30,
};

/**
 * Calculate next review schedule based on difficulty rating
 * @param {Object} currentSchedule - Current schedule state
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @returns {Object} Updated schedule + XP earned
 */
export function calculateNextReview(currentSchedule, difficulty) {
  const { interval, easeFactor, reviewCount } = currentSchedule;
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty];

  // Calculate new ease factor (SM-2 style)
  let newEaseFactor = easeFactor;
  if (difficulty === 'easy') {
    newEaseFactor = Math.min(3.0, easeFactor + 0.15);
  } else if (difficulty === 'hard') {
    newEaseFactor = Math.max(1.3, easeFactor - 0.2);
  }

  // Calculate new interval
  let newInterval;
  const newReviewCount = reviewCount + 1;

  if (newReviewCount <= BASE_INTERVALS.length) {
    // Use base intervals for early reviews, adjusted by difficulty
    newInterval = Math.max(1, Math.round(BASE_INTERVALS[newReviewCount - 1] * multiplier));
  } else {
    // After base intervals, grow by ease factor
    newInterval = Math.max(1, Math.round(interval * newEaseFactor * multiplier));
  }

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);
  nextReview.setHours(9, 0, 0, 0);

  // Determine strength
  let strength;
  if (newInterval >= 30) {
    strength = 'strong';
  } else if (newInterval >= 7) {
    strength = 'medium';
  } else {
    strength = 'weak';
  }

  // XP earned
  const xpEarned = XP_REWARDS[difficulty];

  return {
    schedule: {
      nextReview,
      interval: newInterval,
      easeFactor: newEaseFactor,
      reviewCount: newReviewCount,
      strength,
    },
    xpEarned,
  };
}

/**
 * Get human-readable time until next review
 * @param {Date} nextReview 
 * @returns {string}
 */
export function getTimeUntilReview(nextReview) {
  const now = new Date();
  const diff = new Date(nextReview) - now;

  if (diff <= 0) return 'Due now';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

/**
 * Get strength color for UI
 * @param {string} strength 
 * @returns {string} CSS color variable
 */
export function getStrengthColor(strength) {
  const colors = {
    strong: '#00d26a',
    medium: '#ffc107',
    weak: '#ff4757',
    new: '#7c4dff',
  };
  return colors[strength] || colors.new;
}
