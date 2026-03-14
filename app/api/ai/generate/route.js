import { NextResponse } from 'next/server';
import { generateInshort } from '@/lib/gemini';

// POST /api/ai/generate — Generate inshort for a topic
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const inshort = await generateInshort(body.title, body.content);
    return NextResponse.json(inshort);
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate inshort' },
      { status: 500 }
    );
  }
}
