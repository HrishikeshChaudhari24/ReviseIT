import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Topic from '@/lib/models/Topic';
import { calculateNextReview } from '@/lib/scheduler';

// GET /api/topics/:id
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const topic = await Topic.findById(id);

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    return NextResponse.json(topic);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/topics/:id — Update topic (mainly for difficulty rating after revision)
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    // If difficulty rating is provided, calculate next review
    if (body.difficulty) {
      const topic = await Topic.findById(id);
      if (!topic) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
      }

      const { schedule, xpEarned } = calculateNextReview(topic.schedule, body.difficulty);

      const updated = await Topic.findByIdAndUpdate(
        id,
        {
          'schedule.nextReview': schedule.nextReview,
          'schedule.interval': schedule.interval,
          'schedule.easeFactor': schedule.easeFactor,
          'schedule.reviewCount': schedule.reviewCount,
          'schedule.strength': schedule.strength,
          lastReviewedAt: new Date(),
          $inc: { xpEarned: xpEarned },
        },
        { new: true }
      );

      return NextResponse.json({ topic: updated, xpEarned });
    }

    // Regular update (edit title, content, tags, etc.)
    const updated = await Topic.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// DELETE /api/topics/:id
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const deleted = await Topic.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
