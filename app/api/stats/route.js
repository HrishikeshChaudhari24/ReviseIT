import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Topic from '@/lib/models/Topic';

// GET /api/stats — Get user learning statistics
export async function GET() {
  try {
    await connectDB();
    const topics = await Topic.find({});

    const now = new Date();
    const totalTopics = topics.length;
    const totalXP = topics.reduce((sum, t) => sum + (t.xpEarned || 0), 0);
    const totalReviews = topics.reduce((sum, t) => sum + (t.schedule?.reviewCount || 0), 0);

    const dueCount = topics.filter(t =>
      t.schedule?.nextReview && new Date(t.schedule.nextReview) <= now
    ).length;

    const strengthCounts = {
      strong: topics.filter(t => t.schedule?.strength === 'strong').length,
      medium: topics.filter(t => t.schedule?.strength === 'medium').length,
      weak: topics.filter(t => t.schedule?.strength === 'weak').length,
      new: topics.filter(t => t.schedule?.strength === 'new').length,
    };

    // Calculate level (every 100 XP = 1 level)
    const level = Math.floor(totalXP / 100) + 1;
    const xpInCurrentLevel = totalXP % 100;

    // Calculate streak (consecutive days with at least one review)
    let streak = 0;
    const reviewDates = topics
      .filter(t => t.lastReviewedAt)
      .map(t => {
        const d = new Date(t.lastReviewedAt);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      });

    const uniqueDates = [...new Set(reviewDates)].sort().reverse();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

    if (uniqueDates.length > 0) {
      let checkDate = new Date(today);
      // Check if today or yesterday has a review (allow for current day)
      const yesterdayStr = (() => {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        return `${y.getFullYear()}-${y.getMonth()}-${y.getDate()}`;
      })();

      if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
        for (let i = 0; i < 365; i++) {
          const dateStr = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
          if (uniqueDates.includes(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else if (i === 0) {
            // Today might not have a review yet, check yesterday
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    return NextResponse.json({
      totalTopics,
      totalXP,
      totalReviews,
      dueCount,
      strengthCounts,
      level,
      xpInCurrentLevel,
      streak,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
