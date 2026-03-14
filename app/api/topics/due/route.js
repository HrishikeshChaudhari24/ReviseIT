import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Topic from '@/lib/models/Topic';

// GET /api/topics/due — Get topics due for revision today
export async function GET() {
  try {
    await connectDB();
    const now = new Date();

    const dueTopics = await Topic.find({
      'schedule.nextReview': { $lte: now },
    }).sort({ 'schedule.nextReview': 1 });

    return NextResponse.json(dueTopics);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
