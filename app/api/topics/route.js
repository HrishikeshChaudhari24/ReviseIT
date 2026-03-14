import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Topic from '@/lib/models/Topic';

// GET /api/topics — List all topics
export async function GET() {
  try {
    await connectDB();
    const topics = await Topic.find({}).sort({ createdAt: -1 });
    return NextResponse.json(topics);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/topics — Create a new topic
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const topic = await Topic.create({
      title: body.title,
      content: body.content,
      tags: body.tags || [],
      inshort: body.inshort || null,
    });

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
